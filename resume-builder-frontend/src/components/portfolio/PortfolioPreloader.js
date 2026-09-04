import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PortfolioPreloader = ({ fullName = 'CREATIVE DEVELOPER', onComplete }) => {
  const [percent, setPercent] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // If reduced motion is preferred or preloaded in this session, skip immediately
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasPreloaded = sessionStorage.getItem('portfolio_preloaded');

    if (reducedMotion || hasPreloaded) {
      setIsFinished(true);
      if (onComplete) onComplete();
      return;
    }

    const duration = 750; // fast 750ms
    const intervalTime = 25;
    const step = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
      setPercent((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFinished(true);
            sessionStorage.setItem('portfolio_preloaded', 'true');
            if (onComplete) onComplete();
          }, 150);
          return 100;
        }
        return Math.floor(next);
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          className="portfolio-preloader"
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          <div className="preloader-content">
            <motion.div
              className="preloader-label"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              PORTFOLIO ARCHITECTURE // {new Date().getFullYear()}
            </motion.div>

            <motion.h2
              className="preloader-name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {fullName.toUpperCase()}
            </motion.h2>

            <div className="preloader-progress-track">
              <motion.div
                className="preloader-progress-bar"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="preloader-counter">{percent}%</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PortfolioPreloader;
