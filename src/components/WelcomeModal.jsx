import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { motion } from 'framer-motion';
    import { Sparkles, Zap, Users, Gamepad2, Languages } from 'lucide-react';
    import { useTranslation } from 'react-i18next';

    const WelcomeModal = ({ isOpen, setIsOpen }) => {
      const { t } = useTranslation(['modals', 'common']);

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-lg bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 border-purple-700 text-white shadow-2xl rounded-xl p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
            >
              <DialogHeader className="p-6 sm:p-8 text-center bg-purple-800/30 rounded-t-xl">
                <Sparkles className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-yellow-400 animate-pulse mb-3 sm:mb-4" />
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500">
                  {t('welcomeModal.title')}
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-purple-300 mt-1 sm:mt-2">
                  {t('welcomeModal.description')}
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 sm:p-8 space-y-4 sm:space-y-5 text-sm sm:text-base">
                <motion.div 
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-gray-300">{t('welcomeModal.feature1')}</p>
                </motion.div>
                <motion.div 
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-gray-300">{t('welcomeModal.feature2')}</p>
                </motion.div>
                <motion.div 
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mt-0.5 shrink-0" />
                  <p className="text-gray-300">{t('welcomeModal.feature3')}</p>
                </motion.div>
                 <motion.div 
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <Languages className="h-5 w-5 sm:h-6 sm:w-6 text-pink-400 mt-0.5 shrink-0" />
                  <p className="text-gray-300">{t('welcomeModal.languageNote')}</p>
                </motion.div>
              </div>

              <DialogFooter className="p-6 sm:p-8 bg-gray-800/50 rounded-b-xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="w-full"
                >
                  <Button 
                    onClick={() => setIsOpen(false)} 
                    className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white font-semibold text-base sm:text-lg py-2.5 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {t('welcomeModal.ctaButton')}
                  </Button>
                </motion.div>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      );
    };

    export default WelcomeModal;