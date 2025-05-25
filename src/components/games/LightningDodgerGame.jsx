import React, { useState, useEffect, useRef } from 'react';
    import { Button } from '@/components/ui/button';
    import { Zap, Bomb, ShieldCheck } from 'lucide-react';
    import { motion } from 'framer-motion';

    const PLAYER_SIZE_MOBILE = 32;
    const PLAYER_SIZE_DESKTOP = 40;
    const ITEM_SIZE_MOBILE = 24;
    const ITEM_SIZE_DESKTOP = 30;
    
    const INITIAL_ITEM_SPEED = 120; 
    const SPEED_INCREASE_INTERVAL = 5000; 
    const SPEED_INCREASE_AMOUNT = 20; 

    const ITEM_TYPES = {
      LIGHTNING: 'lightning',
      BOMB: 'bomb',
    };

    export const LightningDodgerGame = ({ t, onGameEnd }) => {
      const gameAreaRef = useRef(null);
      const [gameDimensions, setGameDimensions] = useState({ width: 300, height: 400 });
      const [playerSize, setPlayerSize] = useState(PLAYER_SIZE_DESKTOP);
      const [itemSize, setItemSize] = useState(ITEM_SIZE_DESKTOP);

      const [playerPosition, setPlayerPosition] = useState({ x: gameDimensions.width / 2 - playerSize / 2, y: gameDimensions.height - playerSize - 10 });
      const [items, setItems] = useState([]);
      const [score, setScore] = useState(0);
      const [gameActive, setGameActive] = useState(false);
      const [gameOver, setGameOver] = useState(false);
      
      const requestRef = useRef();
      const lastTimeRef = useRef();
      const itemSpawnTimerRef = useRef(0);
      const currentItemSpeedRef = useRef(INITIAL_ITEM_SPEED);
      const timeSinceLastSpeedIncreaseRef = useRef(0);
      const gameStartTimeRef = useRef(0);

      useEffect(() => {
        const updateDimensions = () => {
          if (gameAreaRef.current) {
            const newWidth = gameAreaRef.current.clientWidth;
            const newHeight = gameAreaRef.current.clientHeight;
            setGameDimensions({ width: newWidth, height: newHeight });

            if (newWidth < 480) { // Mobile breakpoint
              setPlayerSize(PLAYER_SIZE_MOBILE);
              setItemSize(ITEM_SIZE_MOBILE);
            } else {
              setPlayerSize(PLAYER_SIZE_DESKTOP);
              setItemSize(ITEM_SIZE_DESKTOP);
            }
            setPlayerPosition({ x: newWidth / 2 - (newWidth < 480 ? PLAYER_SIZE_MOBILE : PLAYER_SIZE_DESKTOP) / 2, y: newHeight - (newWidth < 480 ? PLAYER_SIZE_MOBILE : PLAYER_SIZE_DESKTOP) - 10 });
          }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
      }, [gameActive]);


      const movePlayer = (event) => {
        if (!gameActive || !gameAreaRef.current) return;
        const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
        let clientX;
        if (event.type === 'touchmove') {
            event.preventDefault(); // Prevent scrolling on touch devices
            clientX = event.touches[0].clientX;
        } else {
            clientX = event.clientX;
        }
        let newX = clientX - gameAreaRect.left - playerSize / 2;
        newX = Math.max(0, Math.min(newX, gameDimensions.width - playerSize));
        setPlayerPosition(prev => ({ ...prev, x: newX }));
      };
      
      useEffect(() => {
        const gameArea = gameAreaRef.current;
        if (gameArea && gameActive) {
          gameArea.addEventListener('mousemove', movePlayer);
          gameArea.addEventListener('touchmove', movePlayer, { passive: false });
        }
        return () => {
          if (gameArea) {
            gameArea.removeEventListener('mousemove', movePlayer);
            gameArea.removeEventListener('touchmove', movePlayer);
          }
        };
      }, [gameActive, gameDimensions, playerSize]);


      const gameLoop = (time) => {
        if (!lastTimeRef.current) {
          lastTimeRef.current = time;
          requestRef.current = requestAnimationFrame(gameLoop);
          return;
        }

        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;

        if (gameActive) {
          timeSinceLastSpeedIncreaseRef.current += deltaTime;

          if (timeSinceLastSpeedIncreaseRef.current >= SPEED_INCREASE_INTERVAL) {
            currentItemSpeedRef.current += SPEED_INCREASE_AMOUNT;
            timeSinceLastSpeedIncreaseRef.current = 0;
          }

          setItems(prevItems => 
            prevItems.map(item => ({ ...item, y: item.y + currentItemSpeedRef.current * (deltaTime / 1000) }))
                     .filter(item => item.y < gameDimensions.height)
          );
          
          itemSpawnTimerRef.current += deltaTime;
          const spawnInterval = Math.max(150, 800 - (currentItemSpeedRef.current - INITIAL_ITEM_SPEED) / 2.5);
          if (itemSpawnTimerRef.current > spawnInterval) {
            spawnItem();
            itemSpawnTimerRef.current = 0;
          }

          checkCollisions();
        }
        requestRef.current = requestAnimationFrame(gameLoop);
      };

      useEffect(() => {
        if (gameActive) {
          requestRef.current = requestAnimationFrame(gameLoop);
        }
        return () => cancelAnimationFrame(requestRef.current);
      }, [gameActive, gameDimensions]);


      const spawnItem = () => {
        const type = Math.random() < 0.7 ? ITEM_TYPES.LIGHTNING : ITEM_TYPES.BOMB;
        setItems(prevItems => [
          ...prevItems,
          {
            id: Math.random().toString(36).substr(2, 9),
            type,
            x: Math.random() * (gameDimensions.width - itemSize),
            y: -itemSize,
            icon: type === ITEM_TYPES.LIGHTNING 
                  ? <Zap className="w-full h-full text-yellow-400" /> 
                  : <Bomb className="w-full h-full text-red-500" />
          }
        ]);
      };

      const checkCollisions = () => {
        const playerRect = { x: playerPosition.x, y: playerPosition.y, width: playerSize, height: playerSize };
        items.forEach(item => {
          const itemRect = { x: item.x, y: item.y, width: itemSize, height: itemSize };
          if (
            playerRect.x < itemRect.x + itemRect.width &&
            playerRect.x + playerRect.width > itemRect.x &&
            playerRect.y < itemRect.y + itemRect.height &&
            playerRect.y + playerRect.height > itemRect.y
          ) {
            if (item.type === ITEM_TYPES.LIGHTNING) {
              setScore(prevScore => prevScore + 1);
              setItems(prevItems => prevItems.filter(i => i.id !== item.id));
            } else if (item.type === ITEM_TYPES.BOMB) {
              endGame();
            }
          }
        });
      };
      
      const startGame = () => {
        setScore(0);
        setItems([]);
        setPlayerPosition({ x: gameDimensions.width / 2 - playerSize / 2, y: gameDimensions.height - playerSize - 10 });
        setGameActive(true);
        setGameOver(false);
        currentItemSpeedRef.current = INITIAL_ITEM_SPEED;
        timeSinceLastSpeedIncreaseRef.current = 0;
        itemSpawnTimerRef.current = 0;
        lastTimeRef.current = null; 
        gameStartTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(gameLoop);
      };

      const endGame = () => {
        setGameActive(false);
        setGameOver(true);
        cancelAnimationFrame(requestRef.current);
        const duration = Math.floor((performance.now() - gameStartTimeRef.current) / 1000);
        if (onGameEnd) onGameEnd(score, { duration });
      };
      
      const getGameDuration = () => {
        if (!gameActive && !gameOver && gameStartTimeRef.current === 0) return 0;
        if (gameOver || !gameActive) return Math.floor((performance.now() - gameStartTimeRef.current) / 1000);
        return Math.floor((performance.now() - gameStartTimeRef.current) / 1000);
      };


      return (
        <div className="flex flex-col items-center justify-center p-2 sm:p-4 h-full w-full">
          {gameOver && (
            <div className="text-center mb-2 sm:mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-red-500">{t('gamesPage.lightningDodger.gameOver')}</h3>
              <p className="text-sm sm:text-lg text-purple-300">{t('gamesPage.lightningDodger.finalScore', { score, duration: getGameDuration() })}</p>
            </div>
          )}
          <div className="flex justify-between w-full mb-2 sm:mb-4 text-xs sm:text-base" style={{maxWidth: `${gameDimensions.width}px`}}>
            <span className="text-purple-300">{t('gamesPage.lightningDodger.score')}: <span className="font-bold text-yellow-400">{score}</span></span>
            <span className="text-purple-300">{t('gamesPage.lightningDodger.speed')}: <span className="font-bold text-orange-400">{currentItemSpeedRef.current.toFixed(0)}</span></span>
          </div>
          <div 
            ref={gameAreaRef}
            className="bg-gray-700/50 rounded-lg relative overflow-hidden border-2 border-purple-500/50 shadow-inner cursor-none w-full h-[280px] sm:h-[400px]"
            style={{ touchAction: 'none' }} 
          >
            {gameActive && (
              <motion.div
                className="absolute bg-blue-500 rounded flex items-center justify-center"
                style={{ 
                  width: playerSize, 
                  height: playerSize, 
                  top: playerPosition.y,
                }}
                animate={{ x: playerPosition.x }}
                transition={{ type: "spring", stiffness: 700, damping: 40 }}
              >
                <ShieldCheck className="w-3/4 h-3/4 text-white" />
              </motion.div>
            )}
            {items.map(item => (
              <motion.div
                key={item.id}
                className="absolute"
                style={{ 
                  width: itemSize, 
                  height: itemSize, 
                  left: item.x, 
                }}
                initial={{ y: item.y }}
                animate={{ y: item.y }}
                transition={{ type: "linear", duration: 0.05}} 
              >
                {item.icon}
              </motion.div>
            ))}
            {(!gameActive || gameOver) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button onClick={startGame} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg shadow-lg text-sm sm:text-base">
                  {gameOver ? t('gamesPage.lightningDodger.playAgain') : t('gamesPage.lightningDodger.startGame')}
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    };