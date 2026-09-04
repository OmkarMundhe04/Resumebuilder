/* ==========================================================================
   CENTRALIZED MOTION SYSTEM & FRAMER MOTION TOKENS
   Inspired by Portfolio Engine: Smooth, Cinematic, Accessible & Stable
   ========================================================================== */

// Timing & Easing Curves
export const TRANSITION_EASE = [0.16, 1, 0.3, 1]; // Premium cubic-bezier
export const TRANSITION_FAST = 0.18;
export const TRANSITION_NORMAL = 0.32;
export const TRANSITION_EMPHASIS = 0.5;
export const TRANSITION_SLOW = 0.7;

// Spring Configurations
export const SPRING_GENTLE = { type: 'spring', stiffness: 120, damping: 20 };
export const SPRING_SNAPPY = { type: 'spring', stiffness: 260, damping: 24 };
export const SPRING_BOUNCE = { type: 'spring', stiffness: 350, damping: 18 };

// Global Page Route Transitions
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TRANSITION_NORMAL,
      ease: TRANSITION_EASE
    }
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.18,
      ease: 'easeIn'
    }
  }
};

// Fade & Reveal Variants
export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: TRANSITION_NORMAL, ease: TRANSITION_EASE }
  }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: TRANSITION_NORMAL, ease: TRANSITION_EASE }
  }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: TRANSITION_NORMAL, ease: TRANSITION_EASE }
  }
};

// Staggered Container & Children
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: TRANSITION_NORMAL, ease: TRANSITION_EASE }
  }
};

// Card & Document Hover Interactions
export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -3,
    scale: 1.008,
    transition: { duration: 0.2, ease: TRANSITION_EASE }
  }
};

export const documentHover = {
  rest: { y: 0, scale: 1, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' },
  hover: {
    y: -5,
    scale: 1.015,
    boxShadow: '0 16px 36px rgba(0,0,0,0.35)',
    transition: { duration: 0.25, ease: TRANSITION_EASE }
  }
};

// Tactile Button Press
export const buttonPress = {
  rest: { scale: 1 },
  hover: { y: -1, scale: 1.01 },
  tap: { scale: 0.98 }
};

// Modals
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } }
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: TRANSITION_EASE }
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: 0.18 }
  }
};

// Accordion & Expandable Content
export const accordionVariants = {
  collapsed: { opacity: 0, height: 0, overflow: 'hidden' },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.28, ease: TRANSITION_EASE }
  }
};
