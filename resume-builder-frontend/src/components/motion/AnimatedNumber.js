import React, { useEffect, useState } from 'react';
import { useSpring, useTransform } from 'framer-motion';

const AnimatedNumber = ({
  value = 0,
  prefix = '',
  suffix = '',
  className = '',
  style = {}
}) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const spring = useSpring(0, { stiffness: 90, damping: 20 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [currentText, setCurrentText] = useState(0);

  useEffect(() => {
    spring.set(numericValue);
  }, [spring, numericValue]);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setCurrentText(latest);
    });
    return () => unsubscribe();
  }, [display]);

  return (
    <span className={className} style={style}>
      {prefix}{currentText}{suffix}
    </span>
  );
};

export default AnimatedNumber;
