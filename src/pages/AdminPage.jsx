import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
    import { useToast } from '@/components/ui/use-toast';
    import { PlusCircle, Edit3, Trash2, Users, ListChecks, DollarSign, BarChart2, Save, X } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useTranslation } from 'react-i18next';
    import { cn } from '@/lib/utils';

    const AdminPage = () => {
      const { t } = useTranslation();
      const { toast } = useToast();

      const [users, setUsers] = useState([]);
      const [tasks, setTasks] = useState([]);
      const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
      const [currentTask, setCurrentTask] = useState(null);
      const [taskForm, setTaskForm] = useState({
        title_key: '',
        description_key: '',
        reward_amount: '',
        task_type: 'social',
        action_url: '',
        is_active: true,
      });
      const [stats, setStats] = useState({
        totalUsers: 0,
        activeTasks: 0,
        totalRewardsDistributed: 0,
      });

      const fetchUsers = useCallback(async () => {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) {
          toast({ title: t('adminPage.toast.fetchUsersError'), description: error.message, variant: 'destructive' });
        } else {
          setUsers(data);
          setStats(prev => ({ ...prev, totalUsers: data.length }));
        }
      }, [toast, t]);

      const fetchTasks = useCallback(async () => {
        const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (error) {
          toast({ title: t('adminPage.toast.fetchTasksError'), description: error.message, variant: 'destructive' });
        } else {
          setTasks(data);
          setStats(prev => ({ ...prev, activeTasks: data.filter(task => task.is_active).length }));
        }
      }, [toast, t]);
      
      useEffect(() => {
        fetchUsers();
        fetchTasks();
      }, [fetchUsers, fetchTasks]);

      const handleTaskInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTaskForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
      };

      const handleSaveTask = async () => {
        if (!taskForm.title_key || !taskForm.description_key || !taskForm.reward_amount) {
          toast({ title: t('adminPage.toast.validationError'), description: t('adminPage.toast.fillAllFields'), variant: 'destructive' });
          return;
        }

        const taskData = {
          ...taskForm,
          reward_amount: parseFloat(taskForm.reward_amount)
        };

        let error;
        if (currentTask) {
          ({ error } = await supabase.from('tasks').update(taskData).eq('id', currentTask.id));
        } else {
          ({ error } = await supabase.from('tasks').insert(taskData));
        }

        if (error) {
          toast({ title: t('adminPage.toast.saveTaskError'), description: error.message, variant: 'destructive' });
        } else {
          toast({ title: currentTask ? t('adminPage.toast.taskUpdated') : t('adminPage.toast.taskCreated') });
          setIsTaskDialogOpen(false);
          fetchTasks();
          setCurrentTask(null);
          setTaskForm({ title_key: '', description_key: '', reward_amount: '', task_type: 'social', action_url: '', is_active: true });
        }
      };

      const handleEditTask = (task) => {
        setCurrentTask(task);
        setTaskForm({
          title_key: task.title_key,
          description_key: task.description_key,
          reward_amount: task.reward_amount.toString(),
          task_type: task.task_type,
          action_url: task.action_url || '',
          is_active: task.is_active,
        });
        setIsTaskDialogOpen(true);
      };

      const handleDeleteTask = async (taskId) => {
        if (!window.confirm(t('adminPage.confirmDeleteTask'))) return;
        
        const { error: userTasksError } = await supabase.from('user_tasks').delete().eq('task_id', taskId);
        if (userTasksError) {
          toast({ title: t('adminPage.toast.deleteUserTasksError'), description: userTasksError.message, variant: 'destructive'});
          return;
        }

        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) {
          toast({ title: t('adminPage.toast.deleteTaskError'), description: error.message, variant: 'destructive' });
        } else {
          toast({ title: t('adminPage.toast.taskDeleted') });
          fetchTasks();
        }
      };
      
      const statCards = [
        { id: 'users', titleKey: 'adminPage.totalUsers', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
        { id: 'tasks', titleKey: 'adminPage.activeTasks', value: stats.activeTasks, icon: ListChecks, color: 'text-green-400' },
        { id: 'rewards', titleKey: 'adminPage.rewardsDistributed', value: `${stats.totalRewardsDistributed.toFixed(2)} $BOLT`, icon: DollarSign, color: 'text-yellow-400' },
      ];

      return (
        <div className="container mx-auto p-4 sm:p-6 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white">
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 py-2">
              {t('adminPage.title')}
            </h1>
            <p className="text-center text-purple-300 text-sm sm:text-base">{t('adminPage.description')}</p>
          </motion.header>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          >
            {statCards.map((card, index) => (
              <motion.div key={card.id} initial={{ opacity:0, y: 20 }} animate={{ opacity: 1, y: 0}} transition={{ delay: index * 0.1 }}>
                <Card className="bg-gray-800/60 backdrop-blur-sm border-purple-500/50 shadow-lg hover:shadow-purple-500/40 transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-300">{t(card.titleKey)}</CardTitle>
                    <card.icon className={cn("h-5 w-5", card.color)} />
                  </CardHeader>
                  <CardContent>
                    <div className={cn("text-2xl font-bold", card.color)}>{card.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-purple-300">{t('adminPage.manageTasksTitle')}</h2>
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setCurrentTask(null); setTaskForm({ title_key: '', description_key: '', reward_amount: '', task_type: 'social', action_url: '', is_active: true }); setIsTaskDialogOpen(true); }} className="bg-green-500 hover:bg-green-600 text-white">
                    <PlusCircle className="mr-2 h-5 w-5" /> {t('adminPage.buttons.addTask')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-purple-600 text-white sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle className="text-purple-300">{currentTask ? t('adminPage.editTaskTitle') : t('adminPage.addTaskTitle')}</DialogTitle>
                    <DialogDescription className="text-purple-400">
                      {currentTask ? t('adminPage.editTaskDescription') : t('adminPage.addTaskDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title_key" className="text-right col-span-1 text-purple-300">{t('adminPage.taskForm.titleKey')}</Label>
                      <Input id="title_key" name="title_key" value={taskForm.title_key} onChange={handleTaskInputChange} className="col-span-3 bg-gray-700 border-purple-500 focus:ring-purple-500" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description_key" className="text-right col-span-1 text-purple-300">{t('adminPage.taskForm.descriptionKey')}</Label>
                      <Input id="description_key" name="description_key" value={taskForm.description_key} onChange={handleTaskInputChange} className="col-span-3 bg-gray-700 border-purple-500 focus:ring-purple-500" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="reward_amount" className="text-right col-span-1 text-purple-300">{t('adminPage.taskForm.rewardAmount')}</Label>
                      <Input id="reward_amount" name="reward_amount" type="number" value={taskForm.reward_amount} onChange={handleTaskInputChange} className="col-span-3 bg-gray-700 border-purple-500 focus:ring-purple-500" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="task_type" className="text-right col-span-1 text-purple-300">{t('adminPage.taskForm.taskType')}</Label>
                      <select id="task_type" name="task_type" value={taskForm.task_type} onChange={handleTaskInputChange} className="col-span-3 bg-gray-700 border-purple-500 text-white p-2 rounded-md focus:ring-purple-500 focus:border-purple-500">
                        <option value="social">{t('adminPage.taskTypes.social')}</option>
                        <option value="game">{t('adminPage.taskTypes.game')}</option>
                        <option value="community">{t('adminPage.taskTypes.community')}</option>
                        <option value="other">{t('adminPage.taskTypes.other')}</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="action_url" className="text-right col-span-1 text-purple-300">{t('adminPage.taskForm.actionUrl')}</Label>
                      <Input id="action_url" name="action_url" value={taskForm.action_url} onChange={handleTaskInputChange} className="col-span-3 bg-gray-700 border-purple-500 focus:ring-purple-500" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="is_active" className="text-right col-span-1 text-purple-300">{t('adminPage.taskForm.isActive')}</Label>
                      <input type="checkbox" id="is_active" name="is_active" checked={taskForm.is_active} onChange={handleTaskInputChange} className="col-span-3 h-5 w-5 rounded bg-gray-700 border-purple-500 text-purple-500 focus:ring-purple-500 accent-purple-500" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)} className="border-gray-500 text-gray-300 hover:bg-gray-700"><X className="mr-2 h-4 w-4" /> {t('adminPage.buttons.cancel')}</Button>
                    <Button onClick={handleSaveTask} className="bg-purple-600 hover:bg-purple-700 text-white"><Save className="mr-2 h-4 w-4" /> {t('adminPage.buttons.save')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto bg-gray-800/50 backdrop-blur-sm p-1 sm:p-2 rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">{t('adminPage.tasksTable.title')}</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">{t('adminPage.tasksTable.reward')}</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">{t('adminPage.tasksTable.type')}</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">{t('adminPage.tasksTable.status')}</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">{t('adminPage.tasksTable.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/70 divide-y divide-gray-700">
                  <AnimatePresence>
                    {tasks.map((task) => (
                      <motion.tr 
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                      >
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-300">{t(task.title_key)}</td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-yellow-400">{task.reward_amount} $BOLT</td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-400">{t(`adminPage.taskTypes.${task.task_type}`)}</td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.is_active ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'}`}>
                            {task.is_active ? t('adminPage.status.active') : t('adminPage.status.inactive')}
                          </span>
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)} className="text-blue-400 hover:text-blue-300 p-1">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="text-red-400 hover:text-red-300 p-1">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {tasks.length === 0 && <p className="text-center py-4 text-gray-400">{t('adminPage.noTasksFound')}</p>}
            </div>
          </section>

          <section>
             <h2 className="text-xl sm:text-2xl font-semibold text-purple-300 mb-4">{t('adminPage.usersListTitle')}</h2>
             <div className="overflow-x-auto bg-gray-800/50 backdrop-blur-sm p-1 sm:p-2 rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">{t('adminPage.usersTable.telegramId')}</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">{t('adminPage.usersTable.username')}</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">{t('adminPage.usersTable.balance')}</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">{t('adminPage.usersTable.joinedAt')}</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/70 divide-y divide-gray-700">
                  <AnimatePresence>
                    {users.map((user) => (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                      >
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-300">{user.telegram_id}</td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-300">{user.username || user.first_name || 'N/A'}</td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-yellow-400">{user.bolt_balance?.toFixed(2) || 0} $BOLT</td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {users.length === 0 && <p className="text-center py-4 text-gray-400">{t('adminPage.noUsersFound')}</p>}
            </div>
          </section>
        </div>
      );
    };

    export default AdminPage;