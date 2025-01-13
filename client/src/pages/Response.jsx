import React from 'react';

const FullScreenResponse = ({ text, onClose }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Text copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl"> {/* Adjusted width here */}
        <h2 className="text-xl font-semibold mb-4">Copy this text</h2>
        <p className="mb-4">{text}</p>
        <div className="flex justify-end">
          <button 
            onClick={copyToClipboard} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Copy Text
          </button>
          <button 
            onClick={onClose} 
            className="ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullScreenResponse;