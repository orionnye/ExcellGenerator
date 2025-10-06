# ExcellGenerator

A React TypeScript web application that allows you to select a folder and count the files within it. This is the foundation for a larger Excel generation tool.

## Features

- 📁 Folder selection via File System Access API or manual path input
- 📊 File counting and display
- 📥 Download file count reports as text files
- 🎨 Clean, responsive UI
- ⚡ Real-time scanning status
- 🛡️ Error handling and validation

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── FolderSelector.tsx    # Folder selection interface
│   └── FolderResults.tsx     # Results display component
├── hooks/
│   └── useFolderScanner.ts   # Folder scanning logic
├── types/
│   ├── FolderData.ts         # TypeScript type definitions
│   └── FileSystemAccess.d.ts # File System Access API types
├── utils/
│   └── fileDownload.ts       # File download utilities
├── App.tsx                   # Main application component
├── App.css                   # Application styles
├── index.tsx                 # Application entry point
└── index.css                 # Global styles
```

## Current Functionality

- Select folders using browser's native folder picker (Chrome/Edge)
- Recursively scan directories and count all files
- Display file count and list of files found
- Download comprehensive file count reports as text files
- Responsive design for mobile and desktop

## Browser Support

- ✅ **Chrome/Edge/Opera**: Full File System Access API support
- ❌ **Firefox/Safari**: Shows helpful message about browser requirements

## Future Enhancements

- CSV file processing and Excel generation
- Support for additional file types
- Advanced filtering options
- Batch processing capabilities
