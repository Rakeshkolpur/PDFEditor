import React, { useState, useRef, useEffect } from 'react';
import { 
  FaBold, FaItalic, FaUnderline, FaFont, FaPalette, 
  FaLink, FaAlignLeft, FaAlignCenter, FaAlignRight, 
  FaSearchPlus, FaSearchMinus, FaUndo, FaRedo, FaLayerGroup,
  FaRuler, FaCrop, FaHandPointer, FaMousePointer, FaMagic,
  FaGripLines, FaChevronLeft, FaChevronRight, FaTimes,
  FaPen, FaEraser, FaShapes, FaPaintBrush, FaEye, FaFillDrip
} from 'react-icons/fa';

const Toolbar = ({ scale, onZoomChange, selectedText, onTextChange }) => {
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 10, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef(null);
  
  const zoomOptions = [
    { value: 0.5, label: '50%' },
    { value: 0.75, label: '75%' },
    { value: 1, label: '100%' },
    { value: 1.25, label: '125%' },
    { value: 1.5, label: '150%' },
    { value: 2, label: '200%' },
  ];

  const fontOptions = [
    'Arial', 
    'Times New Roman', 
    'Courier New', 
    'Georgia', 
    'Verdana', 
    'Helvetica'
  ];

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset]);

  const startDrag = (e) => {
    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setDragging(true);
    }
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const applyBold = () => {
    if (selectedText) {
      console.log('Applying bold to', selectedText.id);
    }
  };

  const applyItalic = () => {
    if (selectedText) {
      console.log('Applying italic to', selectedText.id);
    }
  };

  const applyUnderline = () => {
    if (selectedText) {
      console.log('Applying underline to', selectedText.id);
    }
  };

  const handleFontSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setFontSize(newSize);
    
    if (selectedText) {
      console.log('Changing font size to', newSize, 'for', selectedText.id);
    }
  };

  const handleFontFamilyChange = (e) => {
    const newFont = e.target.value;
    setFontFamily(newFont);
    
    if (selectedText) {
      console.log('Changing font to', newFont, 'for', selectedText.id);
    }
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setTextColor(newColor);
    
    if (selectedText) {
      console.log('Changing color to', newColor, 'for', selectedText.id);
    }
  };

  const handleZoom = (e) => {
    const newScale = parseFloat(e.target.value);
    onZoomChange(newScale);
  };

  // Single tool button component
  const ToolButton = ({ icon, title, onClick, active = false, color }) => (
    <button
      onClick={onClick}
      className={`p-2 mb-1 rounded-md transition-all duration-200 relative group ${
        active 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-gray-100 hover:bg-gray-700 hover:text-white'
      }`}
      title={title}
    >
      <div className="flex justify-center items-center" style={color ? {color} : {}}>
        {icon}
      </div>
      <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
        {title}
      </span>
    </button>
  );

  // Photoshop-like icon-only toolbar when expanded
  const expandedToolbar = (
    <>
      <div 
        className="toolbar-header flex justify-between items-center p-1 mb-2 border-b border-gray-600 cursor-move"
        onMouseDown={startDrag}
      >
        <div className="text-xs text-gray-400">Tools</div>
        <button 
          onClick={toggleCollapse} 
          className="p-1 text-gray-400 hover:text-white"
          title="Collapse"
        >
          <FaChevronLeft size={12} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1">
        <ToolButton icon={<FaHandPointer />} title="Select Tool" />
        <ToolButton icon={<FaMousePointer />} title="Direct Selection" />
        <ToolButton icon={<FaFont />} title="Text Tool" active={true} />
        <ToolButton icon={<FaPen />} title="Pen Tool" />
        <ToolButton icon={<FaPaintBrush />} title="Brush Tool" color="#f97316" />
        <ToolButton icon={<FaEraser />} title="Eraser Tool" />
        <ToolButton icon={<FaRuler />} title="Measure Tool" />
        <ToolButton icon={<FaCrop />} title="Crop Tool" />
        <ToolButton icon={<FaShapes />} title="Shapes Tool" color="#3b82f6" />
        <ToolButton icon={<FaMagic />} title="Magic Wand" color="#8b5cf6" />
        <ToolButton icon={<FaFillDrip />} title="Fill Tool" color="#ec4899" />
        <ToolButton icon={<FaEye />} title="View Tool" />
      </div>

      {!selectedText ? (
        <div className="mt-4 border-t border-gray-600 pt-2">
          <div className="flex justify-between mb-2">
            <ToolButton 
              icon={<FaSearchMinus size={14} />} 
              title="Zoom Out" 
              onClick={() => onZoomChange(scale - 0.1)}
            />
            <div className="text-center text-gray-300 text-xs font-medium py-2">
              {Math.round(scale * 100)}%
            </div>
            <ToolButton 
              icon={<FaSearchPlus size={14} />} 
              title="Zoom In" 
              onClick={() => onZoomChange(scale + 0.1)}
            />
          </div>
          
          <div className="px-1">
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.1" 
              value={scale} 
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 border-t border-gray-600 pt-2">
          <div className="grid grid-cols-3 gap-1">
            <ToolButton icon={<FaBold size={14} />} title="Bold" onClick={applyBold} />
            <ToolButton icon={<FaItalic size={14} />} title="Italic" onClick={applyItalic} />
            <ToolButton icon={<FaUnderline size={14} />} title="Underline" onClick={applyUnderline} />
          </div>
          
          <div className="mt-2 px-1">
            <div className="flex items-center text-gray-400 text-xs mb-1">
              <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: textColor }}></div>
              <span>Color</span>
            </div>
            <input 
              type="color" 
              value={textColor} 
              onChange={handleColorChange}
              className="w-full h-6 bg-transparent cursor-pointer"
            />
          </div>
        </div>
      )}
    </>
  );

  // Collapsed version - just a single button
  const collapsedToolbar = (
    <div 
      className="toolbar-header flex justify-center items-center p-1 cursor-move"
      onMouseDown={startDrag}
    >
      <button 
        onClick={toggleCollapse} 
        className="p-2 text-gray-200 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md"
        title="Expand Toolbar"
      >
        <FaLayerGroup />
      </button>
    </div>
  );

  return (
    <div 
      ref={toolbarRef}
      className={`toolbar photoshop-toolbar ${collapsed ? 'collapsed' : 'expanded'}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
      }}
    >
      {collapsed ? collapsedToolbar : expandedToolbar}
    </div>
  );
};

export default Toolbar; 