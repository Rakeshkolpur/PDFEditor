# PDF Editor

A powerful React-based PDF editor that allows direct text editing on PDF files, similar to editing a document in Word.

## Features

- **PDF Upload & Rendering**: Load and view PDF files directly in the browser
- **Editable Text**: Click on any text in the PDF to edit it directly
- **Text Formatting**: Apply bold, italic, underline, and change font size and color
- **Page Management**: Navigate, add, delete, and reorder pages
- **Export & Save**: Download the edited PDF with all changes applied

## Technologies Used

- React + Vite
- Tailwind CSS for styling
- pdf-lib for PDF manipulation
- PDF.js for PDF rendering
- React Icons for UI elements

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd pdf-editor
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. Click the "Open PDF" button to upload a PDF file
2. Once loaded, you can click on any text to edit it directly
3. Use the toolbar to format your text (bold, italic, font size, etc.)
4. Navigate between pages using the sidebar or navigation controls
5. When finished, click "Download" to save your edited PDF

## Project Structure

- `src/components/PDFEditor.jsx` - Main PDF editor component
- `src/components/TextEditor.jsx` - Component for editing text
- `src/components/Toolbar.jsx` - Toolbar with formatting options
- `src/components/PageNavigator.jsx` - Page navigation and management

## Limitations

- The editor works best with text-based PDFs
- Some complex PDF structures may not be fully editable
- PDF fonts may be substituted with web fonts if not available

## License

MIT
