import React from 'react';
    import { motion } from 'framer-motion';
    import { Ticket } from 'lucide-react';

    const SITE_LOGO_URL = "https://storage.googleapis.com/hostinger-horizons-assets-prod/e6b43cfc-9628-4583-8f76-dfd0720ad94d/1f9520601bfa94932cd0d24590e3f529.png";
    const TON_LOGO_URL = "https://ton.org/img/ton_symbol.svg";

    const Wheel = ({ segments, rotation, wheelRef }) => {
      return (
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-4 sm:mb-6" ref={wheelRef}>
          <motion.div
            className="absolute w-full h-full rounded-full border-4 border-purple-500 shadow-2xl bg-gray-700 overflow-hidden"
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 20, damping: 10, duration: 4.8 }}
          >
            {segments.map((segment, index) => (
              <div
                key={index}
                className="absolute w-1/2 h-1/2 origin-bottom-right flex items-center justify-start pl-3 sm:pl-4"
                style={{
                  transform: `rotate(${index * (360 / segments.length)}deg)`,
                  clipPath: `polygon(0 0, 100% 0, 100% ${Math.tan((360 / segments.length / 2) * (Math.PI / 180)) * 100}%, 0 0)`,
                  backgroundColor: segment.color,
                }}
              >
                <span className="text-xs sm:text-sm font-semibold text-white transform -rotate-45 whitespace-nowrap">
                  {segment.type === 'bolt' && <img src={SITE_LOGO_URL} alt="Bolt" className="inline-block h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
                  {segment.type === 'ton' && <img src={TON_LOGO_URL} alt="TON" className="inline-block h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
                  {segment.type === 'ticket' && <Ticket className="inline-block h-3 w-3 sm:h-4 sm:w-4 mr-1 text-green-900" />}
                  {segment.label}
                </span>
              </div>
            ))}
          </motion.div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-full border-4 border-yellow-400 flex items-center justify-center shadow-lg">
            <img src={SITE_LOGO_URL} alt="BoltCoin Logo" className="w-8 h-8 sm:w-10 sm:w-10" />
          </div>
          <div 
              className="absolute top-[-8px] left-1/2 transform -translate-x-1/2"
              style={{
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderTop: '20px solid #facc15', 
              }}
          />
        </div>
      );
    };

    export default Wheel;