import React from 'react';
import { motion } from 'framer-motion';
import { TRANSITION_EASE, TRANSITION_NORMAL } from '../../utils/motion';

const Reveal = ({
  children,
  delay = 0,
  yOffset = 16,
  className = '',
  style = {},
  once = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-20px' }}
      transition={{
        duration: TRANSITION_NORMAL,
        delay,
        ease: TRANSITION_EASE
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
