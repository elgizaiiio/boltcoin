
    import React, { useState, useEffect, useRef } from 'react';
    import { Button } from '@/components/ui/button';
    import { Zap, Bomb } from 'lucide-react';
    import { motion } from 'framer-motion';

    const ITEM_TYPES = {
      LIGHTNING: 'lightning',
      BOMB: 'bomb',
    };
    const ITEM_SIZE_MOBILE = 32;
    const ITEM_SIZE_DESKTOP = 40;
    const LEVEL_UP_THRESHOLD = 10;

    export const ClickTheCoinGame = ({ t, onGameEnd, updateBoltBalance }) => {
      const [score, setScore] = useState(0);
      const [level, setLevel] = useState(1);
      const [timeLeft, setTimeLeft] = useState(60); 
      const [items, setItems] = useState([]);
      const [gameActive, setGameActive] = useState(false);
      const gameAreaRef = useRef(null);
      const [clicksForNextLevel, setClicksForNextLevel] = useState(LEVEL_UP_THRESHOLD);
      const [itemSize, setItemSize] = useState(ITEM_SIZE_DESKTOP);

      useEffect(() => {
        const updateSize = () => {
          if (window.innerWidth < 640) {
            setItemSize(ITEM_SIZE_MOBILE);
          } else {
            setItemSize(ITEM_SIZE_DESKTOP);
          }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
      }, []);

      const getGameSpeed = () => {
        return Math.max(250, 1200 - level * 120); 
      };

      const getNumItems = () => {
        return Math.min(window.innerWidth < 640 ? 6 : 8, 2 + level); 
      };
      
      const endGame = (finalScore, finalLevel) => {
        setGameActive(false);
        if (updateBoltBalance) {
          updateBoltBalance(finalScore); 
        }
        if (onGameEnd) onGameEnd(finalScore, { level: finalLevel });
      };

      useEffect(() => {
        let gameTimer;
        if (gameActive && timeLeft > 0) {
          gameTimer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
          }, 1000);
        } else if (timeLeft === 0 && gameActive) {
          endGame(score, level);
        }
        return () => clearInterval(gameTimer);
      }, [gameActive, timeLeft, score, level, onGameEnd]);

      useEffect(() => {
        let itemInterval;
        if (gameActive) {
          itemInterval = setInterval(() => {
            generateItems();
          }, getGameSpeed());
        }
        return () => clearInterval(itemInterval);
      }, [gameActive, level]);

      const generateItems = () => {
        if (!gameAreaRef.current || !gameActive) return;
        const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
        const newItems = [];
        const numTotalItems = getNumItems();
        
        let lightningPlaced = false;
        for (let i = 0; i < numTotalItems; i++) {
          let type;
          if (!lightningPlaced && (i === numTotalItems - 1 || Math.random() < 0.45)) { 
            type = ITEM_TYPES.LIGHTNING;
            lightningPlaced = true;
          } else {
            type = ITEM_TYPES.BOMB;
          }
          
          newItems.push({
            id: Math.random().toString(36).substr(2, 9) + i,
            type: type,
            top: Math.random() * (gameAreaRect.height - itemSize),
            left: Math.random() * (gameAreaRect.width - itemSize),
            icon: type === ITEM_TYPES.LIGHTNING ? <Zap className={`w-full h-full text-yellow-400 filter drop-shadow-lg`} /> : <Bomb className={`w-full h-full text-red-500 filter drop-shadow-lg`} />,
          });
        }
        if (!lightningPlaced && newItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * newItems.length);
            newItems[randomIndex].type = ITEM_TYPES.LIGHTNING;
            newItems[randomIndex].icon = <Zap className={`w-full h-full text-yellow-400 filter drop-shadow-lg`} />;
        } else if (!lightningPlaced && newItems.length === 0) {
             newItems.push({
                id: Math.random().toString(36).substr(2, 9) + "single",
                type: ITEM_TYPES.LIGHTNING,
                top: Math.random() * (gameAreaRect.height - itemSize),
                left: Math.random() * (gameAreaRect.width - itemSize),
                icon: <Zap className={`w-full h-full text-yellow-400 filter drop-shadow-lg`} />,
            });
        }

        setItems(newItems);
      };

      const handleItemClick = (item) => {
        if (!gameActive) return;

        if (item.type === ITEM_TYPES.LIGHTNING) {
          setScore((prevScore) => prevScore + 1);
          setClicksForNextLevel(prev => prev - 1);
          if (clicksForNextLevel -1 <= 0) {
            setLevel(prevLevel => prevLevel + 1);
            setClicksForNextLevel(LEVEL_UP_THRESHOLD);
            setTimeLeft(prevTime => prevTime + 5); 
          }
          generateItems(); 
        } else {
          endGame(score, level);
        }
      };

      const startGame = () => {
        setScore(0);
        setLevel(1);
        setTimeLeft(60);
        setClicksForNextLevel(LEVEL_UP_THRESHOLD);
        setGameActive(true);
        generateItems();
      };
      
      return (
        <div className="flex flex-col items-center justify-center p-2 sm:p-4 h-full">
          {!gameActive && (timeLeft === 0 || items.some(item => item.type === ITEM_TYPES.BOMB && item.clicked)) && (
            <div className="text-center mb-2 sm:mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-yellow-400">{t('clickTheCoin.gameOver', { ns: 'games' })}</h3>
              <p className="text-sm sm:text-lg text-purple-300">{t('clickTheCoin.finalScore', { ns: 'games', score, level, boltEarned: score })}</p>
            </div>
          )}
          <div className="flex justify-between w-full mb-1 sm:mb-2 text-xs sm:text-base">
            <span className="text-purple-300">{t('clickTheCoin.score', { ns: 'games' })}: <span className="font-bold text-yellow-400">{score}</span></span>
            <span className="text-purple-300">{t('clickTheCoin.level', { ns: 'games' })}: <span className="font-bold text-green-400">{level}</span></span>
            <span className="text-purple-300">{t('clickTheCoin.time', { ns: 'games' })}: <span className="font-bold text-yellow-400">{timeLeft}</span></span>
          </div>
           <div className="w-full mb-2 sm:mb-4 text-[10px] sm:text-sm text-center text-gray-400">
            {gameActive && t('clickTheCoin.nextLevelIn', { ns: 'games', count: clicksForNextLevel })}
          </div>
          <div 
            ref={gameAreaRef}
            className="w-full h-56 sm:h-72 bg-gray-700/50 rounded-lg relative overflow-hidden border-2 border-purple-500/50 shadow-inner"
          >
            {gameActive && items.map(item => (
              <motion.div
                key={item.id}
                style={{ position: 'absolute', top: item.top, left: item.left, width: itemSize, height: itemSize }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.15 }}
                onClick={() => handleItemClick(item)}
                className="cursor-pointer flex items-center justify-center"
              >
                {React.cloneElement(item.icon, { style: { width: `${itemSize}px`, height: `${itemSize}px` } })}
              </motion.div>
            ))}
            {!gameActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button onClick={startGame} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg shadow-lg text-sm sm:text-base">
                  {(timeLeft === 0 || items.some(item => item.type === ITEM_TYPES.BOMB && item.clicked)) ? t('clickTheCoin.playAgain', { ns: 'games' }) : t('clickTheCoin.startGame', { ns: 'games' })}
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    };
  