import React, { useState, useRef, useEffect } from 'react';

const FreeTextTool = ({ 
  isActive, 
  pdfContainerRef, 
  scale, 
  addNewTextElement,
  font = 'Arial',
  fontSize = 16,
  color = '#000000'
}) => {
  const [position, setPosition] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState('');
  const textInputRef = useRef(null);
  
  useEffect(() => {
    if (!isActive) {
      setIsEditing(false);
      setPosition(null);
    }
  }, [isActive]);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isEditing]);
  
  const handlePdfClick = (e) => {
    if (!isActive || isEditing) return;
    
    // Get click position relative to the PDF container
    if (pdfContainerRef.current) {
      const rect = pdfContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setPosition({ x, y });
      setIsEditing(true);
      setText('');
    }
  };
  
  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setPosition(null);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      finishEditing();
    }
  };
  
  const finishEditing = () => {
    if (text.trim() && position) {
      // Add new text element to the PDF
      addNewTextElement({
        text: text.trim(),
        x: position.x,
        y: position.y,
        fontFamily: font,
        fontSize: fontSize,
        color: color
      });
      
      // Reset state
      setIsEditing(false);
      setPosition(null);
      setText('');
    } else {
      setIsEditing(false);
      setPosition(null);
    }
  };
  
  // Attach click handler to PDF container
  useEffect(() => {
    const container = pdfContainerRef.current;
    
    if (isActive && container) {
      container.addEventListener('click', handlePdfClick);
      
      return () => {
        container.removeEventListener('click', handlePdfClick);
      };
    }
  }, [isActive, pdfContainerRef, handlePdfClick]);
  
  // If not active or no position is set, don't render anything
  if (!isActive || !position) return null;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
      }}
    >
      <textarea
        ref={textInputRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onBlur={finishEditing}
        style={{
          fontFamily: font,
          fontSize: `${fontSize}px`,
          color: color,
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid #3b82f6',
          padding: '4px',
          minWidth: '100px',
          minHeight: '30px',
          resize: 'both',
          outline: 'none',
          boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
        }}
        placeholder="Type here..."
      />
    </div>
  );
};

export default FreeTextTool; 