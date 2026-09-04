import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Columns } from 'lucide-react';
import './ResizableSplitPane.css';

const DEFAULT_LEFT_WIDTH = 440;
const MIN_LEFT_WIDTH = 320;
const MIN_RIGHT_WIDTH = 380;
const DEFAULT_STORAGE_KEY = 'resumebuilder_editor_split_width';

const ResizableSplitPane = ({
  leftPane,
  rightPane,
  defaultWidth = DEFAULT_LEFT_WIDTH,
  minWidth = MIN_LEFT_WIDTH,
  minRightWidth = MIN_RIGHT_WIDTH,
  storageKey = DEFAULT_STORAGE_KEY,
  className = '',
  mobileActiveTab = 'editor' // 'editor' | 'preview'
}) => {
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startDragInfoRef = useRef({ startX: 0, startWidth: 0 });

  // Hydrate persisted width or default
  const [leftWidth, setLeftWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= minWidth) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return defaultWidth;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [collapsedPane, setCollapsedPane] = useState(null); // null | 'left' | 'right'

  // Persist width changes
  const persistWidth = useCallback((width) => {
    try {
      localStorage.setItem(storageKey, width.toString());
    } catch {
      // Ignore quota errors
    }
  }, [storageKey]);

  // Clamp width to container bounds
  const clampWidth = useCallback((targetWidth) => {
    if (!containerRef.current) return targetWidth;
    const containerWidth = containerRef.current.offsetWidth || 1200;
    const effectiveMinWidth = minWidth;
    const effectiveMaxWidth = Math.max(effectiveMinWidth, containerWidth - minRightWidth);
    return Math.min(Math.max(targetWidth, effectiveMinWidth), effectiveMaxWidth);
  }, [minWidth, minRightWidth]);

  // Handle Drag Start
  const handlePointerDown = (e) => {
    // Only primary mouse button
    if (e.button !== 0) return;
    e.preventDefault();

    isDraggingRef.current = true;
    startDragInfoRef.current = {
      startX: e.clientX,
      startWidth: leftWidth
    };
    setIsDragging(true);

    if (collapsedPane) {
      setCollapsedPane(null);
    }
  };

  // Drag Movement
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - startDragInfoRef.current.startX;
      const newWidth = clampWidth(startDragInfoRef.current.startWidth + deltaX);
      setLeftWidth(newWidth);
    };

    const handlePointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        setLeftWidth(currentWidth => {
          persistWidth(currentWidth);
          return currentWidth;
        });
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
    };
  }, [isDragging, clampWidth, persistWidth]);

  // Double-Click to Reset
  const handleDoubleClick = () => {
    const resetWidth = clampWidth(defaultWidth);
    setLeftWidth(resetWidth);
    setCollapsedPane(null);
    persistWidth(resetWidth);
  };

  // Keyboard accessibility on separator
  const handleKeyDown = (e) => {
    const step = e.shiftKey ? 50 : 20;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setLeftWidth(curr => {
        const next = clampWidth(curr - step);
        persistWidth(next);
        return next;
      });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setLeftWidth(curr => {
        const next = clampWidth(curr + step);
        persistWidth(next);
        return next;
      });
    } else if (e.key === 'Home') {
      e.preventDefault();
      setLeftWidth(minWidth);
      persistWidth(minWidth);
    } else if (e.key === 'End') {
      e.preventDefault();
      if (containerRef.current) {
        const maxW = containerRef.current.offsetWidth - minRightWidth;
        setLeftWidth(maxW);
        persistWidth(maxW);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDoubleClick();
    }
  };

  // Collapse / Expand handlers
  const toggleCollapseLeft = () => {
    setCollapsedPane(curr => (curr === 'left' ? null : 'left'));
  };

  const toggleCollapseRight = () => {
    setCollapsedPane(curr => (curr === 'right' ? null : 'right'));
  };

  const restoreAll = () => {
    setCollapsedPane(null);
  };

  return (
    <div
      ref={containerRef}
      className={`split-pane-workspace ${isDragging ? 'is-dragging' : ''} ${className}`}
    >
      {/* Left Pane (Editor) */}
      <div
        className={`split-pane-left ${collapsedPane === 'left' ? 'is-collapsed' : ''} ${mobileActiveTab === 'preview' ? 'mobile-hidden' : ''}`}
        style={{
          width: collapsedPane === 'left' ? 0 : `${leftWidth}px`
        }}
      >
        {leftPane}
      </div>

      {/* Gutter Divider (IDE Style) */}
      {collapsedPane === null && (
        <div
          role="separator"
          tabIndex={0}
          aria-label="Resize workspace editor and preview panels. Use arrow keys to adjust, double click to reset."
          aria-valuenow={Math.round(leftWidth)}
          aria-valuemin={minWidth}
          aria-valuemax={containerRef.current ? containerRef.current.offsetWidth - minRightWidth : 800}
          className="split-pane-gutter no-print"
          onPointerDown={handlePointerDown}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          title="Drag to resize • Double-click to reset"
        >
          {/* Tactile Grip Handle */}
          <div className="split-pane-grip">
            <div className="split-pane-dot" />
            <div className="split-pane-dot" />
            <div className="split-pane-dot" />
          </div>

          {/* Hover Action Controls */}
          <div className="split-pane-actions">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapseLeft();
              }}
              className="split-pane-btn"
              title="Collapse Editor (Focus on Live Preview)"
              aria-label="Collapse Editor"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDoubleClick();
              }}
              className="split-pane-btn"
              title="Reset to Default Split (Double-click)"
              aria-label="Reset Split"
            >
              <Columns size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapseRight();
              }}
              className="split-pane-btn"
              title="Collapse Live Preview (Focus on Editor)"
              aria-label="Collapse Live Preview"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Right Pane (Live Preview) */}
      <div
        className={`split-pane-right ${collapsedPane === 'right' ? 'is-collapsed' : ''} ${mobileActiveTab === 'editor' ? 'mobile-hidden' : ''}`}
      >
        {rightPane}
      </div>

      {/* Collapsed Left Rail Restore Button */}
      {collapsedPane === 'left' && (
        <button
          type="button"
          onClick={restoreAll}
          className="split-pane-restore-tab split-pane-restore-left no-print"
          title="Restore Editor Panel"
        >
          <ChevronRight size={14} />
          <span>Show Form Editor</span>
        </button>
      )}

      {/* Collapsed Right Rail Restore Button */}
      {collapsedPane === 'right' && (
        <button
          type="button"
          onClick={restoreAll}
          className="split-pane-restore-tab split-pane-restore-right no-print"
          title="Restore Live Preview Panel"
        >
          <ChevronLeft size={14} />
          <span>Show Live Preview</span>
        </button>
      )}
    </div>
  );
};

export default ResizableSplitPane;
