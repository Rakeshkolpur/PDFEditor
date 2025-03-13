import React from 'react';
import { FaChevronLeft, FaChevronRight, FaTrash, FaClone, FaPlus } from 'react-icons/fa';

const PageNavigator = ({ currentPage, numPages, onPageChange }) => {
  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      onPageChange(pageNum);
    }
  };

  const handleFirstPage = () => {
    handlePageChange(1);
  };

  const handlePrevPage = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    handlePageChange(currentPage + 1);
  };

  const handleLastPage = () => {
    handlePageChange(numPages);
  };

  const handlePageInput = (e) => {
    const pageNum = parseInt(e.target.value, 10);
    if (!isNaN(pageNum)) {
      handlePageChange(pageNum);
    }
  };

  // Generate placeholder thumbnails for pages
  const renderPageThumbnails = () => {
    const thumbnails = [];
    
    for (let i = 1; i <= numPages; i++) {
      thumbnails.push(
        <div 
          key={i}
          className={`page-thumbnail relative mb-3 cursor-pointer border-2 rounded ${
            currentPage === i ? 'border-blue-500' : 'border-gray-200'
          }`}
          onClick={() => handlePageChange(i)}
        >
          <div className="bg-gray-100 h-32 flex items-center justify-center">
            <span className="text-gray-500 text-lg">Page {i}</span>
          </div>
          
          <div className="absolute top-1 right-1 flex space-x-1">
            <button 
              className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100"
              title="Duplicate page"
            >
              <FaClone className="text-gray-600 text-xs" />
            </button>
            
            <button 
              className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100"
              title="Delete page"
              disabled={numPages <= 1}
            >
              <FaTrash className={`text-xs ${numPages <= 1 ? 'text-gray-400' : 'text-red-500'}`} />
            </button>
          </div>
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full shadow text-xs font-medium">
            {i}
          </div>
        </div>
      );
    }
    
    return thumbnails;
  };

  // Page navigation controls
  const pageControls = (
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
      <div className="flex space-x-1">
        <button 
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className={`p-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          title="First page"
        >
          <FaChevronLeft className="mr-1" />
          <FaChevronLeft className="-ml-3" />
        </button>
        
        <button 
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`p-2 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          title="Previous page"
        >
          <FaChevronLeft />
        </button>
        
        <div className="flex items-center mx-1">
          <input
            type="number"
            min="1"
            max={numPages}
            value={currentPage}
            onChange={handlePageInput}
            className="w-12 text-center border rounded p-1"
          />
          <span className="mx-1 text-gray-600">/</span>
          <span className="text-gray-600">{numPages}</span>
        </div>
        
        <button 
          onClick={handleNextPage}
          disabled={currentPage === numPages}
          className={`p-2 rounded ${currentPage === numPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          title="Next page"
        >
          <FaChevronRight />
        </button>
        
        <button 
          onClick={handleLastPage}
          disabled={currentPage === numPages}
          className={`p-2 rounded ${currentPage === numPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          title="Last page"
        >
          <FaChevronRight className="mr-1" />
          <FaChevronRight className="-ml-3" />
        </button>
      </div>
      
      <button 
        className="flex items-center px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
        title="Add new page"
      >
        <FaPlus className="mr-1 text-xs" />
        <span className="text-sm">Add</span>
      </button>
    </div>
  );

  return (
    <div className="page-navigator">
      <h3 className="text-lg font-medium mb-3">Pages</h3>
      
      {/* Page navigation controls */}
      {pageControls}
      
      {/* Page thumbnails */}
      <div className="page-thumbnails overflow-y-auto">
        {renderPageThumbnails()}
      </div>
    </div>
  );
};

export default PageNavigator; 