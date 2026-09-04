import React from 'react';
import { motion } from 'framer-motion';
import { cardHover } from '../../utils/motion';

const AnimatedCard = ({
  children,
  className = '',
  style = {},
  onClick,
  hoverable = true,
  ...props
}) => {
  return (
    <motion.div
      variants={hoverable ? cardHover : undefined}
      initial="rest"
      whileHover={hoverable ? 'hover' : undefined}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      onClick={onClick}
      className={className}
      style={{
        transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
