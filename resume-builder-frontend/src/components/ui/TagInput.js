import React, { useState, useRef } from 'react';
import { X, GripVertical, ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * Modern Tag / Chip Input Component
 * Supports:
 * - Normal typing with spaces (e.g. "Machine Learning", "System Design", "AWS Cloud")
 * - Comma delimiter to create tags
 * - Enter key to create tags
 * - Backspace to remove last tag when input buffer is empty
 * - Duplicate prevention & trimming
 * - Optional drag-and-drop & keyboard reordering when allowReorder=true
 */
const TagInput = ({
  tags = [],
  onChange,
  placeholder = 'Type and press comma or enter...',
  className = '',
  maxTags = 30,
  allowReorder = false,
  projectId = '',
  reorderAriaLabelPrefix = 'item'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [activeDraggableIdx, setActiveDraggableIdx] = useState(null);
  const touchDragRef = useRef(null);
  const inputRef = useRef(null);

  const safeTags = Array.isArray(tags) ? tags : [];

  const addTag = (text) => {
    const trimmed = text.trim().replace(/^,+|,+$/g, '');
    if (!trimmed) return;

    // Check if comma-separated batch was entered (e.g. pasted or typed with multiple commas)
    if (trimmed.includes(',')) {
      const splitItems = trimmed.split(',').map(s => s.trim()).filter(Boolean);
      const uniqueNew = splitItems.filter(item => !safeTags.some(t => t.toLowerCase() === item.toLowerCase()));
      if (uniqueNew.length > 0) {
        onChange([...safeTags, ...uniqueNew].slice(0, maxTags));
      }
      setInputValue('');
      return;
    }

    // Single tag
    const isDuplicate = safeTags.some(t => t.toLowerCase() === trimmed.toLowerCase());
    if (!isDuplicate && safeTags.length < maxTags) {
      onChange([...safeTags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove) => {
    const updated = safeTags.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  // Reordering helpers
  const reorderTags = (sourceIndex, targetIndex) => {
    if (sourceIndex === targetIndex) return;
    if (sourceIndex < 0 || sourceIndex >= safeTags.length || targetIndex < 0 || targetIndex >= safeTags.length) return;
    const copy = [...safeTags];
    const [moved] = copy.splice(sourceIndex, 1);
    copy.splice(targetIndex, 0, moved);
    onChange(copy);
  };

  const moveTag = (index, direction) => {
    reorderTags(index, index + direction);
  };

  // Desktop HTML5 Drag Handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('application/json', JSON.stringify({ index, projectId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (index) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      reorderTags(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setActiveDraggableIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setActiveDraggableIdx(null);
  };

  // Mobile Touch Handlers
  const handleTouchStart = (e, index) => {
    const touch = e.touches[0];
    touchDragRef.current = {
      startIndex: index,
      startX: touch.clientX,
      startY: touch.clientY
    };
    setDraggedIndex(index);
  };

  const handleTouchMove = (e) => {
    if (!touchDragRef.current) return;
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const chip = elem?.closest('.tag-chip-item[data-tag-index]');
    if (chip && chip.dataset.tagIndex !== undefined) {
      const targetIdx = parseInt(chip.dataset.tagIndex, 10);
      if (!isNaN(targetIdx) && targetIdx !== touchDragRef.current.startIndex) {
        setDragOverIndex(targetIdx);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchDragRef.current) return;
    const { startIndex } = touchDragRef.current;
    if (dragOverIndex !== null && dragOverIndex !== startIndex) {
      reorderTags(startIndex, dragOverIndex);
    }
    touchDragRef.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
    setActiveDraggableIdx(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === ',' || e.key === 'Tab') {
      if (inputValue.trim()) {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === ',') {
        e.preventDefault();
      }
    } else if (e.key === 'Backspace' && !inputValue && safeTags.length > 0) {
      removeTag(safeTags.length - 1);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.includes(',')) {
      addTag(val);
    } else {
      setInputValue(val);
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData?.getData('text');
    if (pasteData && (pasteData.includes(',') || pasteData.includes('\n'))) {
      e.preventDefault();
      const splitItems = pasteData.split(/[\n,]/).map(s => s.trim().replace(/^,+|,+$/g, '')).filter(Boolean);
      const uniqueNew = splitItems.filter(item => !safeTags.some(t => t.toLowerCase() === item.toLowerCase()));
      if (uniqueNew.length > 0) {
        onChange([...safeTags, ...uniqueNew].slice(0, maxTags));
      }
      setInputValue('');
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        alignItems: 'center',
        padding: '6px 10px',
        backgroundColor: 'var(--bg-app)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        minHeight: '40px',
        cursor: 'text',
        transition: 'border-color 0.15s ease'
      }}
      className={`tag-input-container ${className}`}
    >
      {safeTags.map((tag, index) => {
        const isDragging = allowReorder && draggedIndex === index;
        const isOver = allowReorder && dragOverIndex === index;

        return (
          <span
            key={`${tag}-${index}`}
            data-tag-index={index}
            className={`tag-chip-item ${isDragging ? 'is-dragging' : ''} ${isOver ? 'is-drop-target' : ''}`}
            draggable={allowReorder && activeDraggableIdx === index}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={() => handleDragLeave(index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            {allowReorder && (
              <span
                className="tag-chip-drag-handle"
                title="Hold and drag to reorder"
                aria-label={`Hold and drag to reorder ${tag}`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setActiveDraggableIdx(index);
                }}
                onMouseUp={() => setActiveDraggableIdx(null)}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                <GripVertical size={12} />
              </span>
            )}

            <span className="tag-chip-text">{tag}</span>

            {allowReorder && (
              <span className="tag-chip-actions">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveTag(index, -1);
                  }}
                  disabled={index === 0}
                  className="tag-chip-move-btn"
                  title={`Move ${tag} earlier`}
                  aria-label={`Move ${tag} earlier in ${reorderAriaLabelPrefix}`}
                >
                  <ArrowLeft size={10} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveTag(index, 1);
                  }}
                  disabled={index === safeTags.length - 1}
                  className="tag-chip-move-btn"
                  title={`Move ${tag} later`}
                  aria-label={`Move ${tag} later in ${reorderAriaLabelPrefix}`}
                >
                  <ArrowRight size={10} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="tag-chip-remove-btn"
              title={`Remove ${tag}`}
              aria-label={`Remove ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        );
      })}

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        placeholder={safeTags.length === 0 ? placeholder : 'Add more...'}
        style={{
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          fontSize: '0.84rem',
          flex: 1,
          minWidth: '120px',
          padding: '2px 0'
        }}
      />
    </div>
  );
};

export default TagInput;

