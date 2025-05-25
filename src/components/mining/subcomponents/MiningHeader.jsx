import React from 'react';
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import { User } from 'lucide-react';
    import { motion } from 'framer-motion';

    const MiningHeader = ({ t, userProfile, currentMotivationalText }) => {
      return (
        <>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
          >
            <Avatar className="w-20 h-20 sm:w-28 sm:h-28 mb-3 sm:mb-5 rounded-full shadow-2xl border-4 border-yellow-400">
                <AvatarImage src={userProfile?.avatar} alt={userProfile?.name || t('layout.guest')} />
                <AvatarFallback className="bg-purple-600 text-white text-4xl sm:text-5xl">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-10 h-10 sm:w-12 sm:h-12"/>}
                </AvatarFallback>
            </Avatar>
          </motion.div>

          <motion.h1 
            className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 animate-pulse px-2 min-h-[2.5em] sm:min-h-[2em] flex items-center justify-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            key={currentMotivationalText} 
          >
            {currentMotivationalText}
          </motion.h1>
        </>
      );
    };

    export default MiningHeader;