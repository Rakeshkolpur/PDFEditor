import React from 'react';

const ApplyChangesButton = ({ onApplyChanges, disabled = false }) => {
  return (
    <button
      onClick={onApplyChanges}
      disabled={disabled}
      className={`flex items-center justify-center px-6 py-3 text-white rounded-md shadow-md transition-colors ${
        disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
      }`}
    >
      <span className="font-medium">Apply changes</span>
      <svg 
        className="w-5 h-5 ml-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 5l7 7-7 7" 
        />
      </svg>
    </button>
  );
};

export default ApplyChangesButton; 