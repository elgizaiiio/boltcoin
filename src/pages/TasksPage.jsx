import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { CheckCircle, Twitter, Send, Youtube, UserPlus, UserCheck, ListChecks, ExternalLink } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useTranslation } from 'react-i18next';

    const iconMap = {
      Twitter: Twitter,
      Send: Send,
      Youtube: Youtube,
      UserPlus: UserPlus,
      UserCheck: UserCheck,
      Default: ListChecks 
    };
    
    const TasksPage = ({ updateBoltBalance, userMembership }) => {
      const { t } = useTranslation(['tasks', 'common']);
      const { toast } = useToast();
      const [taskList, setTaskList] = useState([]);
      const [completedTasks, setCompletedTasks] = useState(new Set());

      useEffect(() => {
        const storedTasks = JSON.parse(localStorage.getItem('boltCoinTasks')) || [];
        const initialTasks = storedTasks.map(task => ({
          ...task,
          title: task.titleKey.startsWith('tasks:') || task.titleKey.startsWith('admin:') ? t(task.titleKey) : task.titleKey,
          IconComponent: iconMap[task.icon] || ListChecks
        }));
        setTaskList(initialTasks);

        const storedCompletedTasks = JSON.parse(localStorage.getItem('boltCoinCompletedTasks')) || [];
        setCompletedTasks(new Set(storedCompletedTasks));
      }, [t]);
      
      const saveCompletedTasksToLocalStorage = (updatedCompletedTasks) => {
        localStorage.setItem('boltCoinCompletedTasks', JSON.stringify(Array.from(updatedCompletedTasks)));
      };

      const handleCompleteTask = (taskId, points, actionLink) => {
        if (actionLink) {
          window.open(actionLink, '_blank');
        }

        toast({
          title: t('common:toast.verifying'),
          description: t('tasks:verifyingDescription'),
        });

        setTimeout(() => {
          if (completedTasks.has(taskId)) {
            toast({
              title: t('common:toast.alert'),
              description: t('tasks:taskAlreadyCompleted'),
              variant: "destructive"
            });
            return;
          }

          const newCompletedTasks = new Set(completedTasks);
          newCompletedTasks.add(taskId);
          setCompletedTasks(newCompletedTasks);
          saveCompletedTasksToLocalStorage(newCompletedTasks);
          
          let reward = points;
          if (userMembership && userMembership.taskBonusMultiplier) {
            reward = points * userMembership.taskBonusMultiplier;
          }
          updateBoltBalance(reward);

          toast({
            title: t('tasks:taskCompletedToast.title'),
            description: t('tasks:taskCompletedToast.descriptionWithPoints', { points: reward }),
            variant: "default"
          });
        }, 2000);
      };

      return (
        <div className="py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-10"
          >
            <CheckCircle className="mx-auto h-10 w-10 sm:h-14 sm:w-14 text-yellow-400 mb-2 sm:mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-500 to-blue-500 px-2">
              {t('tasks:mainTitle')}
            </h1>
            <p className="text-sm sm:text-base text-purple-300 mt-1 px-2">
              {t('tasks:mainDescription')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {taskList.map((task, index) => {
              const isCompleted = completedTasks.has(task.id);
              const Icon = task.IconComponent;
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className={`shadow-lg hover:shadow-purple-500/30 transition-all duration-300 ${isCompleted ? 'bg-green-900/30 border-green-500/50' : 'bg-gray-800/30 border-purple-500/30'}`}>
                    <CardHeader className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <Icon className={`h-7 w-7 sm:h-8 sm:w-8 ${isCompleted ? 'text-green-400' : 'text-purple-400'}`} />
                        {isCompleted && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />}
                      </div>
                      <CardTitle className={`mt-1 sm:mt-1.5 text-sm sm:text-base ${isCompleted ? 'text-green-300' : 'text-purple-300'}`}>{task.title}</CardTitle>
                      <CardDescription className={`text-xs sm:text-sm ${isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                        {t('tasks:rewardLabel')}: {task.points} $BOLT 
                        {userMembership && userMembership.taskBonusMultiplier && userMembership.taskBonusMultiplier > 1 && !isCompleted && (
                          <span className="text-teal-400"> (+{((userMembership.taskBonusMultiplier - 1) * task.points).toFixed(0)} {t('tasks:bonus')})</span>
                        )}
                      </CardDescription>
                       {task.actionLink && (
                        <a href={task.actionLink} target="_blank" rel="noopener noreferrer" className="text-[10px] sm:text-xs text-cyan-400 hover:underline flex items-center mt-0.5 sm:mt-1">
                          <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1"/>{t('tasks:visitLink')}
                        </a>
                      )}
                    </CardHeader>
                    <CardFooter className="p-3 sm:p-4 pt-0">
                      <Button 
                        onClick={() => handleCompleteTask(task.id, task.points, task.actionLink)} 
                        disabled={isCompleted}
                        className={`w-full font-semibold text-xs sm:text-sm py-1.5 sm:py-2 ${isCompleted ? 'bg-green-600 hover:bg-green-700 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'}`}
                      >
                        {isCompleted ? t('tasks:completedButton') : t('tasks:completeTaskButton')}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          {taskList.length === 0 && (
            <p className="text-center text-purple-400 mt-6 sm:mt-8 text-sm sm:text-base">{t('tasks:noTasksAvailable')}</p>
          )}
        </div>
      );
    };

    export default TasksPage;