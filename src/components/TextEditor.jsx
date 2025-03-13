import React, { useState, useRef, useEffect } from 'react';

const TextEditor = ({ 
  item, 
  onSelect, 
  onTextChange, 
  isSelected = false,
  hidden = false,
  onPositionChange // New prop for position changes
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(item.text);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const editorRef = useRef(null);
  
  // When item text changes externally, update local state
  useEffect(() => {
    setLocalText(item.text);
  }, [item.text]);
  
  // When entering edit mode, focus and select the text
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus();
      
      // Position cursor at the end of text content
      const range = document.createRange();
      const selection = window.getSelection();
      
      // Clear existing content and ensure proper text direction
      if (!editorRef.current.textContent) {
        editorRef.current.textContent = localText;
      }
      
      const textNode = editorRef.current.firstChild || editorRef.current;
      
      try {
        if (textNode.nodeType === Node.TEXT_NODE) {
          range.setStart(textNode, textNode.length);
          range.setEnd(textNode, textNode.length);
        } else {
          range.selectNodeContents(editorRef.current);
          range.collapse(false); // Collapse to end
        }
        
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (err) {
        console.log("Error positioning cursor:", err);
      }
    }
  }, [isEditing, localText]);
  
  // Set up dragging event listeners
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && !isEditing && editorRef.current && editorRef.current.offsetParent) {
        // Get the parent container's position
        const parentRect = editorRef.current.offsetParent.getBoundingClientRect();
        
        // Calculate new position relative to the parent container
        const newX = e.clientX - parentRect.left - dragOffset.x;
        const newY = e.clientY - parentRect.top - dragOffset.y;
        
        // Update the element's position
        editorRef.current.style.left = `${newX}px`;
        editorRef.current.style.top = `${newY}px`;
      }
    };
    
    const handleMouseUp = (e) => {
      if (isDragging && !isEditing && editorRef.current) {
        const rect = editorRef.current.getBoundingClientRect();
        const parentRect = editorRef.current.offsetParent.getBoundingClientRect();
        
        // Calculate the new position relative to the parent
        const newX = rect.left - parentRect.left;
        const newY = rect.top - parentRect.top;
        
        // Update item position through callback
        if (onPositionChange) {
          onPositionChange(item.id, newX, newY);
        }
        
        setIsDragging(false);
      }
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isEditing, item.id, onPositionChange]);
  
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect();
    if (!isSelected) {
      // First click just selects the text
      return;
    }
    setIsEditing(true);
  };
  
  const handleMouseDown = (e) => {
    if (isSelected && !isEditing) {
      e.stopPropagation();
      e.preventDefault();
      
      // Get more accurate position information
      const rect = editorRef.current.getBoundingClientRect();
      
      // Calculate cursor position within the element
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      setIsDragging(true);
    }
  };
  
  const handleBlur = () => {
    if (localText !== item.text) {
      onTextChange(localText);
    }
    setIsEditing(false);
  };
  
  const handleInput = (e) => {
    setLocalText(e.target.innerText);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      editorRef.current.blur();
    }
    
    // For Delete key, let the parent component handle it
    // This prevents conflicts with the global Delete key handler
    if (e.key === 'Delete' && !isEditing) {
      e.preventDefault();
    }
  };
  
  // Apply transformations from the PDF (rotation, scaling)
  const getTransformStyle = () => {
    if (!item.transform) return {};
    
    const transformString = item.transform.rotation !== 0 
      ? `rotate(${item.transform.rotation}deg)`
      : '';
      
    return {
      transform: transformString,
    };
  };
  
  // Determine cursor based on state
  const getCursor = () => {
    if (isEditing) return 'text';
    if (isDragging) return 'grabbing';
    if (isSelected) return 'grab';
    return 'pointer';
  };
  
  const style = {
    position: 'absolute',
    left: `${item.x}px`,
    top: `${item.y}px`,
    // Slightly increase width to accommodate possible edits
    minWidth: `${Math.max(item.width, 20)}px`,
    minHeight: `${Math.max(item.height, 16)}px`, 
    fontSize: `${item.fontSize}px`,
    fontFamily: item.fontFamily || 'sans-serif',
    fontWeight: item.fontWeight || 'normal',
    fontStyle: item.style || 'normal',
    lineHeight: '1.2',
    whiteSpace: 'pre',
    cursor: getCursor(),
    background: isSelected ? 'rgba(173, 216, 230, 0.2)' : 'transparent',
    zIndex: isEditing ? 100 : (isSelected ? 50 : 2),
    display: hidden ? 'none' : 'block',
    padding: '2px',
    userSelect: isEditing ? 'text' : 'none', // Enable selection during editing
    boxSizing: 'border-box',
    pointerEvents: 'auto', // Enable pointer events for interaction
    border: isSelected ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
    ...getTransformStyle(),
    // Force left-to-right text direction
    direction: 'ltr',
    textAlign: 'left',
    unicodeBidi: 'embed', // Enforce the direction property
    writingMode: 'horizontal-tb', // Horizontal, top-to-bottom writing mode,
    touchAction: 'none', // Prevent default touch actions for better dragging
  };
  
  return (
    <div
      ref={editorRef}
      className={`pdf-text-editor ${isEditing ? 'editing' : ''} ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
      style={style}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onBlur={handleBlur}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      data-text-id={item.id}
      dir="ltr" // Explicit HTML direction attribute
    >
      {localText}
    </div>
  );
};

export default TextEditor;