// src/FileViewer.js
import React, { useState } from 'react';

const FileViewer = () => {
  const [fileContent, setFileContent] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Open and View File</h1>
      <input
        type="file"
        accept=".html,.js,.cpp"
        onChange={handleFileChange}
        className="mb-4 border border-gray-300 p-2 rounded"
      />
      <pre className="whitespace-pre-wrap border p-4 bg-gray-100 rounded">
        {fileContent}
      </pre>
    </div>
  );
};

export default FileViewer;
