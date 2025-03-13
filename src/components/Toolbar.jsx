import React, { useState } from 'react';
import { 
  FaBold, FaItalic, FaUnderline, FaFont, FaPalette, 
  FaLink, FaAlignLeft, FaAlignCenter, FaAlignRight, 
  FaSearchPlus, FaSearchMinus, FaUndo, FaRedo, FaLayerGroup
} from 'react-icons/fa';

const Toolbar = ({ scale, onZoomChange, selectedText, onTextChange }) => {
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  
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

  const applyBold = () => {
    if (selectedText) {
      // In a real implementation, this would apply bold formatting to the selected text
      console.log('Applying bold to', selectedText.id);
    }
  };

  const applyItalic = () => {
    if (selectedText) {
      // In a real implementation, this would apply italic formatting to the selected text
      console.log('Applying italic to', selectedText.id);
    }
  };

  const applyUnderline = () => {
    if (selectedText) {
      // In a real implementation, this would apply underline formatting to the selected text
      console.log('Applying underline to', selectedText.id);
    }
  };

  const handleFontSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setFontSize(newSize);
    
    if (selectedText) {
      // In a real implementation, this would change the font size of the selected text
      console.log('Changing font size to', newSize, 'for', selectedText.id);
    }
  };

  const handleFontFamilyChange = (e) => {
    const newFont = e.target.value;
    setFontFamily(newFont);
    
    if (selectedText) {
      // In a real implementation, this would change the font family of the selected text
      console.log('Changing font to', newFont, 'for', selectedText.id);
    }
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setTextColor(newColor);
    
    if (selectedText) {
      // In a real implementation, this would change the color of the selected text
      console.log('Changing color to', newColor, 'for', selectedText.id);
    }
  };

  const handleZoom = (e) => {
    const newScale = parseFloat(e.target.value);
    onZoomChange(newScale);
  };

  // Main toolbar that's always visible
  const mainToolbar = (
    <div className="flex items-center space-x-2 mb-4 bg-white p-2 rounded-md shadow-sm">
      <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
        <button 
          onClick={() => onZoomChange(scale - 0.1)}
          className="p-2 hover:bg-gray-100 rounded"
          title="Zoom Out"
        >
          <FaSearchMinus />
        </button>
        
        <select 
          value={scale} 
          onChange={handleZoom}
          className="mx-2 border rounded p-1"
        >
          {zoomOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <button 
          onClick={() => onZoomChange(scale + 0.1)}
          className="p-2 hover:bg-gray-100 rounded"
          title="Zoom In"
        >
          <FaSearchPlus />
        </button>
      </div>
      
      <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
        <button 
          className="p-2 hover:bg-gray-100 rounded"
          title="Undo"
        >
          <FaUndo />
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded"
          title="Redo"
        >
          <FaRedo />
        </button>
      </div>
      
      <div className="flex items-center">
        <div className="text-sm text-gray-600">
          {selectedText ? 'Text selected' : 'Click on text to edit'}
        </div>
      </div>
    </div>
  );

  // Text editing toolbar that appears when text is selected
  const textEditingToolbar = selectedText && (
    <div className="flex flex-wrap items-center space-x-2 mb-4 bg-white p-2 rounded-md shadow-sm">
      <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
        <button 
          onClick={applyBold}
          className="p-2 hover:bg-gray-100 rounded"
          title="Bold"
        >
          <FaBold />
        </button>
        <button 
          onClick={applyItalic}
          className="p-2 hover:bg-gray-100 rounded"
          title="Italic"
        >
          <FaItalic />
        </button>
        <button 
          onClick={applyUnderline}
          className="p-2 hover:bg-gray-100 rounded"
          title="Underline"
        >
          <FaUnderline />
        </button>
      </div>
      
      <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
        <div className="flex items-center">
          <FaFont className="mr-1 text-gray-600" />
          <select 
            value={fontFamily} 
            onChange={handleFontFamilyChange}
            className="border rounded p-1"
          >
            {fontOptions.map(font => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center ml-2">
          <input 
            type="number" 
            value={fontSize} 
            onChange={handleFontSizeChange}
            min="8"
            max="72"
            className="border rounded w-14 p-1"
          />
          <span className="ml-1 text-sm text-gray-600">pt</span>
        </div>
      </div>
      
      <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
        <div className="flex items-center">
          <FaPalette className="mr-1 text-gray-600" />
          <input 
            type="color" 
            value={textColor} 
            onChange={handleColorChange}
            className="w-8 h-8 p-1"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <button 
          className="p-2 hover:bg-gray-100 rounded"
          title="Align Left"
        >
          <FaAlignLeft />
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded"
          title="Align Center"
        >
          <FaAlignCenter />
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded"
          title="Align Right"
        >
          <FaAlignRight />
        </button>
      </div>
    </div>
  );

  return (
    <div className="toolbar sticky top-0 z-10">
      {mainToolbar}
      {textEditingToolbar}
    </div>
  );
};

export default Toolbar; 