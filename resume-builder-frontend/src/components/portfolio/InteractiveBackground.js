import React, { useEffect, useRef } from 'react';

const InteractiveBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reducedMotion) return;

    let rafId;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 40; // max 20px translation
      targetY = (e.clientY / innerHeight - 0.5) * 40;
    };

    const updatePosition = () => {
      // Smooth lerp
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      rafId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="portfolio-bg-container" aria-hidden="true">
      {/* Dynamic Ambient Gradient Orbs */}
      <div ref={containerRef} className="portfolio-ambient-mesh">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
        <div className="mesh-orb mesh-orb-3" />
      </div>

      {/* Modern Grid Blueprint Accent */}
      <div className="portfolio-grid-blueprint" />

      {/* Tactile Noise/Grain Overlay */}
      <div className="portfolio-grain-overlay" />
    </div>
  );
};

export default InteractiveBackground;
