import React, { useState, useRef, useEffect } from 'react';

const ShapeTool = ({
  isActive,
  pdfContainerRef,
  shapeType, // 'rectangle', 'circle', 'line', 'arrow'
  color = '#000000',
  lineWidth = 2,
  addNewShape
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [previewShape, setPreviewShape] = useState(null);
  
  // Reset state when tool becomes inactive
  useEffect(() => {
    if (!isActive) {
      setIsDrawing(false);
      setStartPoint(null);
      setEndPoint(null);
      setPreviewShape(null);
    }
  }, [isActive, shapeType]);
  
  const handleMouseDown = (e) => {
    if (!isActive || isDrawing) return;
    
    // Get mouse position relative to the PDF container
    if (pdfContainerRef.current) {
      const rect = pdfContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setStartPoint({ x, y });
      setIsDrawing(true);
      setEndPoint({ x, y }); // Initially, end point is same as start point
    }
  };
  
  const handleMouseMove = (e) => {
    if (!isActive || !isDrawing || !startPoint) return;
    
    // Get current mouse position
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setEndPoint({ x, y });
    
    // Create a preview of the shape
    const shapeData = createShapeData(startPoint, { x, y }, shapeType, color, lineWidth);
    setPreviewShape(shapeData);
  };
  
  const handleMouseUp = () => {
    if (!isActive || !isDrawing || !startPoint || !endPoint) return;
    
    // Check if shape has a minimum size (to avoid accidental clicks)
    const distance = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) + 
      Math.pow(endPoint.y - startPoint.y, 2)
    );
    
    if (distance > 5) {
      // Add the new shape to the PDF
      const shapeData = createShapeData(startPoint, endPoint, shapeType, color, lineWidth);
      addNewShape(shapeData);
    }
    
    // Reset state
    setIsDrawing(false);
    setStartPoint(null);
    setEndPoint(null);
    setPreviewShape(null);
  };
  
  // Attach mouse event handlers
  useEffect(() => {
    const container = pdfContainerRef.current;
    
    if (isActive && container) {
      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isActive, isDrawing, startPoint, shapeType, pdfContainerRef]);
  
  // Helper function to create shape data
  const createShapeData = (start, end, type, color, lineWidth) => {
    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    
    return {
      id: Date.now().toString(),
      type,
      x: minX,
      y: minY,
      width,
      height,
      startX: start.x,
      startY: start.y,
      endX: end.x,
      endY: end.y,
      color,
      lineWidth
    };
  };
  
  // Render preview shape while drawing
  const renderPreview = () => {
    if (!previewShape) return null;
    
    switch (previewShape.type) {
      case 'rectangle':
        return (
          <div
            style={{
              position: 'absolute',
              left: `${previewShape.x}px`,
              top: `${previewShape.y}px`,
              width: `${previewShape.width}px`,
              height: `${previewShape.height}px`,
              border: `${previewShape.lineWidth}px solid ${previewShape.color}`,
              pointerEvents: 'none',
              zIndex: 999,
            }}
          />
        );
      
      case 'circle':
        const diameter = Math.max(previewShape.width, previewShape.height);
        return (
          <div
            style={{
              position: 'absolute',
              left: `${previewShape.x}px`,
              top: `${previewShape.y}px`,
              width: `${diameter}px`,
              height: `${diameter}px`,
              border: `${previewShape.lineWidth}px solid ${previewShape.color}`,
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 999,
            }}
          />
        );
      
      case 'line':
      case 'arrow':
        // For line and arrow, draw an SVG
        const svgWidth = Math.abs(previewShape.endX - previewShape.startX) + previewShape.lineWidth * 2;
        const svgHeight = Math.abs(previewShape.endY - previewShape.startY) + previewShape.lineWidth * 2;
        const minX = Math.min(previewShape.startX, previewShape.endX) - previewShape.lineWidth;
        const minY = Math.min(previewShape.startY, previewShape.endY) - previewShape.lineWidth;
        
        return (
          <svg
            style={{
              position: 'absolute',
              left: `${minX}px`,
              top: `${minY}px`,
              width: `${svgWidth}px`,
              height: `${svgHeight}px`,
              pointerEvents: 'none',
              zIndex: 999,
            }}
          >
            <line
              x1={previewShape.startX - minX}
              y1={previewShape.startY - minY}
              x2={previewShape.endX - minX}
              y2={previewShape.endY - minY}
              stroke={previewShape.color}
              strokeWidth={previewShape.lineWidth}
            />
            {previewShape.type === 'arrow' && (
              <polygon
                points={calculateArrowhead(
                  previewShape.startX - minX,
                  previewShape.startY - minY,
                  previewShape.endX - minX,
                  previewShape.endY - minY
                )}
                fill={previewShape.color}
              />
            )}
          </svg>
        );
      
      default:
        return null;
    }
  };
  
  // Calculate arrowhead points for arrow shape
  const calculateArrowhead = (x1, y1, x2, y2) => {
    const arrowLength = 15;
    const arrowWidth = 7;
    
    // Calculate angle of the line
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    // Calculate the points of the arrowhead
    const x3 = x2 - arrowLength * Math.cos(angle - Math.PI/6);
    const y3 = y2 - arrowLength * Math.sin(angle - Math.PI/6);
    const x4 = x2 - arrowLength * Math.cos(angle + Math.PI/6);
    const y4 = y2 - arrowLength * Math.sin(angle + Math.PI/6);
    
    return `${x2},${y2} ${x3},${y3} ${x4},${y4}`;
  };
  
  return isActive ? renderPreview() : null;
};

export default ShapeTool; 