import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Toolbar from './Toolbar';
import PageNavigator from './PageNavigator';
import TextEditor from './TextEditor';
import AdvancedToolbar from './AdvancedToolbar';
import ApplyChangesButton from './ApplyChangesButton';
import FreeTextTool from './FreeTextTool';
import ShapeTool from './ShapeTool';
import { FaPlus, FaDownload, FaUndo, FaEye, FaEyeSlash } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

// Set worker path to the copy in the public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.mjs';

// Constants for editor dimensions
const EDITOR_WIDTH = 1000;
const A4_ASPECT_RATIO = 297 / 210; // Height / Width for A4

const PDFEditor = () => {
  const [file, setFile] = useState(null);
  const [pdfJsDoc, setPdfJsDoc] = useState(null);
  const [pdfLibDoc, setPdfLibDoc] = useState(null);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [textElements, setTextElements] = useState([]);
  const [textMasks, setTextMasks] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [showOriginalText, setShowOriginalText] = useState(false);
  const [editorDimensions, setEditorDimensions] = useState({ width: EDITOR_WIDTH, height: EDITOR_WIDTH * A4_ASPECT_RATIO });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const editableDivRef = useRef(null);
  const textLayerRef = useRef(null);
  const textMaskLayerRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const [processingMessage, setProcessingMessage] = useState("Starting PDF processing...");
  const [renderTask, setRenderTask] = useState(null);
  const [showEditTip, setShowEditTip] = useState(false);
  
  // New states for advanced tools
  const [currentTool, setCurrentTool] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [customTextElements, setCustomTextElements] = useState([]);
  const [shapeType, setShapeType] = useState('rectangle');
  const [fontOptions, setFontOptions] = useState({
    fontFamily: 'Arial',
    fontSize: 16,
    color: '#000000'
  });
  const [shapeOptions, setShapeOptions] = useState({
    color: '#000000',
    lineWidth: 2
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [documentReady, setDocumentReady] = useState(false);
  const initialRenderRef = useRef(false);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setLoading(true);
    setProcessing(true);
    setFile(uploadedFile);
    setProcessingMessage("Starting PDF processing...");
    // Reset the document ready flag
    setDocumentReady(false);
    initialRenderRef.current = false;
    
    // Reset tool states
    setCurrentTool(null);
    setShapes([]);
    setCustomTextElements([]);
    setHasUnsavedChanges(false);

    // Clear previous state
    setPdfJsDoc(null);
    setPdfLibDoc(null);
    setTextElements([]);
    setTextMasks([]);
    setSelectedText(null);
    
    // Cancel any pending render task
    if (renderTask) {
      renderTask.cancel();
      setRenderTask(null);
    }

    try {
      setProcessingMessage("Reading file data...");
      // Create two separate array buffers to avoid detachment issues
      const arrayBuffer1 = await uploadedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer1);
      const arrayBuffer2 = uint8Array.buffer.slice(0);
      
      setPdfBytes(uint8Array);
      
      // Simulate processing time with progressive messages
      setProcessingMessage("Initializing PDF.js engine...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load with PDF.js for rendering
      setProcessingMessage("Loading document with PDF.js...");
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer1,
        // These settings may help prevent text rendering issues
        disableAutoFetch: true,
        disableStream: true,
        // This is an important setting to try - force disable text rendering
        disableCreateObjectURL: true
      });
      
      const pdfDocument = await loadingTask.promise;
      
      setProcessingMessage("Analyzing document structure...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNumPages(pdfDocument.numPages);
      
      setProcessingMessage("Processing text layers...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Load with pdf-lib for editing
      setProcessingMessage("Preparing document for editing...");
      const pdfLibDocument = await PDFDocument.load(arrayBuffer2);
      
      // Set current page first since it might trigger renders
      setCurrentPage(1);
      
      // Set the document objects
      setPdfJsDoc(pdfDocument);
      setPdfLibDoc(pdfLibDocument);
      
      // Add a final delay to ensure everything is ready
      setProcessingMessage("Finalizing document preparation...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mark document as ready for rendering
      setDocumentReady(true);
      
      // Reset selected text when loading a new file
      setSelectedText(null);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF. Please try a different file.');
      setDocumentReady(false);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const renderPage = async () => {
    if (!pdfJsDoc || !canvasRef.current) return;

    try {
      // Cancel any pending render task
      if (renderTask) {
        renderTask.cancel();
      }

      const page = await pdfJsDoc.getPage(currentPage);
      
      // Calculate scale to fit width
      const viewport = page.getViewport({ scale: 1.0 });
      const targetWidth = EDITOR_WIDTH;
      const scaleFactor = targetWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale: scaleFactor });
      
      // Update editor dimensions based on the viewport
      setEditorDimensions({
        width: scaledViewport.width,
        height: scaledViewport.height
      });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Clear the canvas before rendering
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      // Force white background to hide any potential text
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Custom render parameters - COMPLETELY DISABLE TEXT RENDERING
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
        renderInteractiveForms: false,
        // Force disable ALL text-related rendering
        textLayer: null,
        renderTextLayer: false,
        // Additional settings to try
        intent: 'display',
        includeAnnotations: false,
        // Set the background to opaque white
        background: 'white'
      };
      
      // Store the render task so we can cancel it if needed
      const task = page.render(renderContext);
      setRenderTask(task);
      
      // Wait for rendering to complete
      await task.promise;
      
      console.log("Render complete for page", currentPage);
      
      // Extract text content for our editable overlay
      const textContent = await page.getTextContent();
      
      // Process text both for editing and for masking
      processTextContent(textContent, scaledViewport);
      
      initialRenderRef.current = true;
      
    } catch (error) {
      if (error.name !== 'RenderingCancelled') {
        console.error('Error rendering page:', error);
      }
    }
  };

  // Process text content with error handling
  const processTextContent = (textContent, viewport) => {
    try {
      // Create text elements for editing
      const textItems = textContent.items.map((item, index) => {
        // Use the PDF.js transform to get the exact position matching the PDF
        const transform = pdfjsLib.Util.transform(
          viewport.transform,
          item.transform
        );
        
        const x = transform[4];
        const y = transform[5];
        const width = item.width * viewport.scale;
        const height = item.height * viewport.scale;
        const angle = Math.atan2(transform[1], transform[0]);
        const fontHeight = Math.sqrt(transform[2] * transform[2] + transform[3] * transform[3]);
        
        return {
          id: `text-${index}`,
          text: item.str,
          x,
          y,
          width,
          height,
          transform: {
            rotation: angle * (180 / Math.PI), // Convert to degrees
            scaleX: Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]),
            scaleY: Math.sqrt(transform[2] * transform[2] + transform[3] * transform[3])
          },
          fontSize: fontHeight,
          fontFamily: item.fontName || 'sans-serif',
          fontWeight: item.fontWeight || 'normal',
          style: item.fontStyle || 'normal',
        };
      });
      
      // Also create mask elements to cover the original text
      const masks = textContent.items.map((item, index) => {
        const transform = pdfjsLib.Util.transform(
          viewport.transform,
          item.transform
        );
        
        return {
          id: `mask-${index}`,
          x: transform[4],
          y: transform[5] - (item.height * viewport.scale * 0.9), // Adjust to cover text better
          width: item.width * viewport.scale * 1.05, // Slightly wider to ensure coverage
          height: item.height * viewport.scale * 1.5, // Taller to ensure full coverage
          rotation: Math.atan2(transform[1], transform[0]) * (180 / Math.PI)
        };
      });
      
      setTextElements(textItems);
      setTextMasks(masks);
    } catch (err) {
      console.error("Error processing text content:", err);
      // Set empty arrays to avoid undefined errors
      setTextElements([]);
      setTextMasks([]);
    }
  };

  const handleTextSelection = (textId) => {
    const selected = textElements.find(item => item.id === textId);
    setSelectedText(selected);
  };

  const handleTextEdit = (textId, newText) => {
    setTextElements(prev => 
      prev.map(item => 
        item.id === textId ? { ...item, text: newText } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  // Handle position change for text elements
  const handleTextPositionChange = (textId, newX, newY) => {
    setTextElements(prev => 
      prev.map(item => 
        item.id === textId ? { ...item, x: newX, y: newY } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  // Handle position change for custom text elements
  const handleCustomTextPositionChange = (textId, newX, newY) => {
    setCustomTextElements(prev => 
      prev.map(item => 
        item.id === textId ? { ...item, x: newX, y: newY } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const toggleOriginalText = () => {
    setShowOriginalText(!showOriginalText);
  };

  // Handler for adding a new text element
  const addNewTextElement = (textData) => {
    const newTextElement = {
      id: `custom-text-${Date.now()}`,
      ...textData,
      isCustom: true
    };
    
    setCustomTextElements(prev => [...prev, newTextElement]);
    setHasUnsavedChanges(true);
  };
  
  // Handler for adding a new shape
  const addNewShape = (shapeData) => {
    setShapes(prev => [...prev, shapeData]);
    setHasUnsavedChanges(true);
  };
  
  // Handler for applying changes to the PDF
  const applyChanges = async () => {
    if (!pdfLibDoc) return;
    
    try {
      // In a real implementation, we would modify the PDF here
      // using pdf-lib to add text elements, shapes, etc.
      
      console.log("Applying changes to PDF...");
      console.log("Text edits:", textElements);
      console.log("Custom text:", customTextElements);
      console.log("Shapes:", shapes);
      
      // For now, just indicate that changes were saved
      setHasUnsavedChanges(false);
      alert("Changes applied successfully! (Note: This is a demo, actual PDF modification is not implemented yet)");
    } catch (error) {
      console.error("Error applying changes:", error);
      alert("Failed to apply changes.");
    }
  };
  
  // Handler for adding a new page
  const addNewPage = async () => {
    if (!pdfLibDoc) return;
    
    try {
      console.log("Adding new page after page", currentPage);
      // In a real implementation, we would use pdf-lib to add a new page
      
      // For demonstration purposes, just show a notification
      alert("New page would be added after current page. (This feature is not fully implemented yet)");
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error adding page:", error);
      alert("Failed to add page.");
    }
  };

  const downloadPDF = async () => {
    if (!pdfLibDoc) return;
    
    try {
      // Apply changes before downloading if there are unsaved changes
      if (hasUnsavedChanges) {
        await applyChanges();
      }
      
      console.log('Saving PDF with edited text - not fully implemented');
      const pdfBytes = await pdfLibDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = file ? file.name.replace('.pdf', '-edited.pdf') : 'edited-document.pdf';
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Failed to save PDF');
    }
  };

  const changePage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
      setSelectedText(null);
    }
  };

  const handleZoom = (newScale) => {
    setScale(newScale);
  };

  // Effect to watch for document ready state
  useEffect(() => {
    if (documentReady && pdfJsDoc && !initialRenderRef.current) {
      console.log("Document ready, rendering page...");
      
      // Staggered rendering attempts to ensure the PDF displays
      const renderWithRetry = () => {
        renderPage();
        
        // Make multiple rendering attempts at staggered intervals
        setTimeout(() => renderPage(), 100);
        setTimeout(() => renderPage(), 500);
        setTimeout(() => renderPage(), 1000);
      };
      
      renderWithRetry();
    }
  }, [documentReady, pdfJsDoc]);

  // Regular effect to render page when changing pages or zoom
  useEffect(() => {
    if (pdfJsDoc && documentReady) {
      renderPage();
    }
    
    // Clean up function to cancel any pending render tasks
    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [currentPage, scale]);

  // Add an effect to show a tooltip after PDF is loaded
  useEffect(() => {
    if (pdfJsDoc && textElements.length > 0 && !showEditTip) {
      setShowEditTip(true);
      // Hide the tip after 5 seconds
      setTimeout(() => {
        setShowEditTip(false);
      }, 5000);
    }
  }, [pdfJsDoc, textElements.length]);

  // Add keyboard event listeners for handling Delete key on selected text
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Delete key is pressed and there's a selected text
      if (e.key === 'Delete' && selectedText && !processing) {
        // If we're editing text in another way, don't interfere
        const activeElement = document.activeElement;
        const isEditingText = activeElement && 
          (activeElement.isContentEditable || 
           activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA');
           
        if (!isEditingText) {
          // Clear the text by setting it to an empty string
          handleTextEdit(selectedText.id, '');
          setHasUnsavedChanges(true);
        }
      }
    };
    
    // Add the event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedText, processing]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200">
      {/* Header/Toolbar */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-md">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-100">PDF editor <span className="text-sm bg-blue-900 text-blue-200 px-2 py-0.5 rounded">BETA</span></h1>
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center transition-colors"
                disabled={processing}
              >
                <FaPlus className="mr-2" /> Open PDF
              </button>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              {pdfJsDoc && (
                <button
                  onClick={toggleOriginalText}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center transition-colors"
                  title={showOriginalText ? "Hide original text" : "Show original text"}
                >
                  {showOriginalText ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
                  {showOriginalText ? "Hide Original" : "Show Original"}
                </button>
              )}
              <button
                onClick={downloadPDF}
                disabled={!pdfLibDoc || processing}
                className={`px-4 py-2 rounded flex items-center transition-colors ${
                  pdfLibDoc && !processing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Advanced toolbar - only show when PDF is loaded */}
      {pdfJsDoc && (
        <div className="bg-gray-800 border-b border-gray-700 py-2 px-4">
          <div className="container mx-auto">
            <AdvancedToolbar 
              currentTool={currentTool}
              setCurrentTool={setCurrentTool}
              onAddPage={addNewPage}
            />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner />
            {processing && (
              <div className="mt-4 text-lg text-gray-300">
                <p>{processingMessage}</p>
                <div className="w-64 h-2 bg-gray-700 rounded-full mt-2">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '80%' }}></div>
                </div>
              </div>
            )}
          </div>
        ) : !pdfJsDoc ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-xl text-gray-400 mb-4">Upload a PDF to get started</p>
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
            >
              <FaPlus className="mr-2" /> Open PDF
            </button>
          </div>
        ) : (
          <div className="flex h-full">
            {/* Toolbar is now positioned absolutely via its own internal styling */}
            <Toolbar 
              scale={scale} 
              onZoomChange={handleZoom} 
              selectedText={selectedText}
              onTextChange={handleTextEdit}
            />
            
            {/* Document viewer - no longer needs the editor-with-vertical-toolbar class */}
            <div className="flex-1 overflow-auto p-4 relative">
              <div className="pdf-editor-container">
                <div 
                  ref={pdfContainerRef}
                  className="pdf-canvas-container relative"
                  style={{ 
                    width: editorDimensions.width, 
                    height: editorDimensions.height
                  }}
                >
                  {/* Canvas for rendering the PDF (without text) */}
                  <canvas 
                    ref={canvasRef} 
                    className="pdf-canvas-no-text border border-gray-600 shadow-xl" 
                  />
                  
                  {/* Edit tip tooltip */}
                  {showEditTip && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-700 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-bounce">
                      <p className="text-sm font-medium">Click on any text to edit it!</p>
                    </div>
                  )}
                  
                  {/* White rectangles to mask out the original text */}
                  <div 
                    className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
                    ref={textMaskLayerRef}
                    style={{ zIndex: 2 }}
                  >
                    {textMasks.map((mask) => (
                      <div
                        key={mask.id}
                        style={{
                          position: 'absolute',
                          left: `${mask.x}px`,
                          top: `${mask.y}px`,
                          width: `${mask.width}px`,
                          height: `${mask.height}px`,
                          backgroundColor: 'white',
                          transform: mask.rotation ? `rotate(${mask.rotation}deg)` : 'none',
                          transformOrigin: 'left top',
                          // Only show masks when we want to hide original text
                          display: showOriginalText ? 'none' : 'block',
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Original text layer */}
                  <div 
                    className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
                    ref={textLayerRef}
                    style={{ zIndex: 3 }}
                  >
                    {textElements.map((item) => (
                      <TextEditor
                        key={item.id}
                        item={item}
                        onSelect={() => handleTextSelection(item.id)}
                        onTextChange={(newText) => handleTextEdit(item.id, newText)}
                        onPositionChange={handleTextPositionChange}
                        isSelected={selectedText?.id === item.id}
                        hidden={false} // Always show our text editors
                      />
                    ))}
                  </div>
                  
                  {/* Custom text elements added by the text tool */}
                  <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none" style={{ zIndex: 4 }}>
                    {customTextElements.map((item) => (
                      <TextEditor
                        key={item.id}
                        item={item}
                        onSelect={() => handleTextSelection(item.id)}
                        onTextChange={(newText) => handleTextEdit(item.id, newText)}
                        onPositionChange={handleCustomTextPositionChange}
                        isSelected={selectedText?.id === item.id}
                        hidden={false}
                      />
                    ))}
                  </div>
                  
                  {/* Shapes layer */}
                  <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none" style={{ zIndex: 4 }}>
                    {shapes.map((shape) => {
                      switch (shape.type) {
                        case 'rectangle':
                          return (
                            <div
                              key={shape.id}
                              style={{
                                position: 'absolute',
                                left: `${shape.x}px`,
                                top: `${shape.y}px`,
                                width: `${shape.width}px`,
                                height: `${shape.height}px`,
                                border: `${shape.lineWidth}px solid ${shape.color}`,
                                pointerEvents: 'none',
                              }}
                            />
                          );
                        case 'circle':
                          const diameter = Math.max(shape.width, shape.height);
                          return (
                            <div
                              key={shape.id}
                              style={{
                                position: 'absolute',
                                left: `${shape.x}px`,
                                top: `${shape.y}px`,
                                width: `${diameter}px`,
                                height: `${diameter}px`,
                                border: `${shape.lineWidth}px solid ${shape.color}`,
                                borderRadius: '50%',
                                pointerEvents: 'none',
                              }}
                            />
                          );
                        case 'line':
                        case 'arrow':
                          const svgWidth = Math.abs(shape.endX - shape.startX) + shape.lineWidth * 2;
                          const svgHeight = Math.abs(shape.endY - shape.startY) + shape.lineWidth * 2;
                          const minX = Math.min(shape.startX, shape.endX) - shape.lineWidth;
                          const minY = Math.min(shape.startY, shape.endY) - shape.lineWidth;
                          
                          return (
                            <svg
                              key={shape.id}
                              style={{
                                position: 'absolute',
                                left: `${minX}px`,
                                top: `${minY}px`,
                                width: `${svgWidth}px`,
                                height: `${svgHeight}px`,
                                pointerEvents: 'none',
                              }}
                            >
                              <line
                                x1={shape.startX - minX}
                                y1={shape.startY - minY}
                                x2={shape.endX - minX}
                                y2={shape.endY - minY}
                                stroke={shape.color}
                                strokeWidth={shape.lineWidth}
                              />
                              {shape.type === 'arrow' && (
                                <polygon
                                  points={`${shape.endX - minX},${shape.endY - minY} ${shape.endX - minX - 15},${shape.endY - minY - 5} ${shape.endX - minX - 15},${shape.endY - minY + 5}`}
                                  fill={shape.color}
                                />
                              )}
                            </svg>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                  
                  {/* Free Text Tool */}
                  <FreeTextTool 
                    isActive={currentTool === 'text'}
                    pdfContainerRef={pdfContainerRef}
                    scale={scale}
                    addNewTextElement={addNewTextElement}
                    font={fontOptions.fontFamily}
                    fontSize={fontOptions.fontSize}
                    color={fontOptions.color}
                  />
                  
                  {/* Shape Tool */}
                  <ShapeTool 
                    isActive={currentTool === 'shapes'}
                    pdfContainerRef={pdfContainerRef}
                    shapeType={shapeType}
                    color={shapeOptions.color}
                    lineWidth={shapeOptions.lineWidth}
                    addNewShape={addNewShape}
                  />
                </div>
              </div>
              
              {/* Apply Changes Button - only show when changes are made */}
              {hasUnsavedChanges && (
                <div className="fixed bottom-8 right-8 z-50">
                  <ApplyChangesButton 
                    onApplyChanges={applyChanges}
                    disabled={processing}
                  />
                </div>
              )}
            </div>
            
            {/* Sidebar for thumbnails/navigation */}
            <div className="w-64 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto pdf-sidebar">
              <PageNavigator
                currentPage={currentPage}
                numPages={numPages}
                onPageChange={changePage}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Status bar */}
      <footer className="bg-gray-800 border-t border-gray-700 py-2 px-4 status-bar">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div>
            {pdfJsDoc && `Page ${currentPage} of ${numPages}`}
            {pdfJsDoc && 
              <span className="a4-indicator text-blue-300">
                <span className="mr-1">Editor:</span> 
                <span className="font-medium">{Math.round(editorDimensions.width)}px</span> 
                <span className="mx-1">×</span> 
                <span className="font-medium">{Math.round(editorDimensions.height)}px</span>
                <span className="ml-2 text-xs">(Downloads as A4)</span>
              </span>
            }
          </div>
          <div className="flex items-center">
            {file && `File: ${file.name}`}
            {hasUnsavedChanges && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-900 text-yellow-200 rounded-md text-xs font-medium">
                Unsaved changes
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PDFEditor; 