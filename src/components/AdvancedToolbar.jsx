import React from 'react';
import {
  FaFont,
  FaLink,
  FaWpforms,
  FaImage,
  FaSignature,
  FaEraser,
  FaPen,
  FaShapes,
  FaUndo,
  FaPlus,
  FaTrash,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight
} from 'react-icons/fa';
import { BsFillPencilFill } from 'react-icons/bs';

const AdvancedToolbar = ({ currentTool, setCurrentTool, onAddPage }) => {
  // Tool options from the image
  const tools = [
    { id: 'text', icon: <FaFont />, label: 'Text' },
    { id: 'links', icon: <FaLink />, label: 'Links' },
    { id: 'forms', icon: <FaWpforms />, label: 'Forms' },
    { id: 'images', icon: <FaImage />, label: 'Images' },
    { id: 'sign', icon: <FaSignature />, label: 'Sign' },
    { id: 'whiteout', icon: <FaEraser />, label: 'Whiteout' },
    { id: 'annotate', icon: <FaPen />, label: 'Annotate' },
    { id: 'shapes', icon: <FaShapes />, label: 'Shapes' },
    { id: 'undo', icon: <FaUndo />, label: 'Undo' }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Main toolbar */}
      <div className="flex items-center bg-white border rounded-md shadow-sm">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`flex items-center justify-center px-4 py-2 text-sm border-r ${
              currentTool === tool.id ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setCurrentTool(tool.id)}
            title={tool.label}
          >
            <span className="mr-2">{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Secondary toolbar based on selected tool */}
      {currentTool === 'text' && (
        <div className="flex items-center bg-white border-t-0 border rounded-b-md p-2 shadow-sm">
          <select className="mr-2 px-2 py-1 border rounded">
            <option>Arial</option>
            <option>Times New Roman</option>
            <option>Courier New</option>
            <option>Georgia</option>
            <option>Verdana</option>
          </select>
          <select className="mr-2 px-2 py-1 border rounded w-16">
            <option>12</option>
            <option>14</option>
            <option>16</option>
            <option>18</option>
            <option>20</option>
            <option>24</option>
            <option>28</option>
            <option>32</option>
          </select>
          <span className="text-gray-400 mr-2">pt</span>
          
          <div className="flex space-x-1 mr-2">
            <button className="p-1 border rounded hover:bg-gray-100">
              <FaAlignLeft />
            </button>
            <button className="p-1 border rounded hover:bg-gray-100">
              <FaAlignCenter />
            </button>
            <button className="p-1 border rounded hover:bg-gray-100">
              <FaAlignRight />
            </button>
          </div>

          <input 
            type="color" 
            className="p-1 border rounded cursor-pointer" 
            defaultValue="#000000" 
          />
        </div>
      )}

      {currentTool === 'shapes' && (
        <div className="flex items-center bg-white border-t-0 border rounded-b-md p-2 shadow-sm">
          <button className="mr-2 p-1 border rounded hover:bg-gray-100">
            □ Rectangle
          </button>
          <button className="mr-2 p-1 border rounded hover:bg-gray-100">
            ○ Circle
          </button>
          <button className="mr-2 p-1 border rounded hover:bg-gray-100">
            ↗ Line
          </button>
          <button className="mr-2 p-1 border rounded hover:bg-gray-100">
            ↔ Arrow
          </button>
          <input 
            type="color" 
            className="p-1 border rounded cursor-pointer" 
            defaultValue="#000000" 
          />
        </div>
      )}

      {/* Page management */}
      <div className="flex items-center justify-center my-2">
        <button 
          className="flex items-center px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
          onClick={onAddPage}
        >
          <FaPlus className="mr-1" /> Insert page here
        </button>
      </div>
    </div>
  );
};

export default AdvancedToolbar; 