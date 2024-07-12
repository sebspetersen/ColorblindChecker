import React, { useState, useRef } from 'react';
import { Upload, Download, Split, Sun, Moon } from 'lucide-react';
import { jsPDF } from 'jspdf';

const SVGFilters = () => (
  <svg style={{ position: 'absolute', height: 0 }}>
    <defs>
      <filter id="protanopia">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0.567, 0.433, 0,     0, 0
                  0.558, 0.442, 0,     0, 0
                  0,     0.242, 0.758, 0, 0
                  0,     0,     0,     1, 0"
        />
      </filter>
      <filter id="deuteranopia">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0.625, 0.375, 0,   0, 0
                  0.7,   0.3,   0,   0, 0
                  0,     0.3,   0.7, 0, 0
                  0,     0,     0,   1, 0"
        />
      </filter>
      <filter id="tritanopia">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0.95, 0.05,  0,     0, 0
                  0,    0.433, 0.567, 0, 0
                  0,    0.475, 0.525, 0, 0
                  0,    0,     0,     1, 0"
        />
      </filter>
      <filter id="achromatopsia">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0.299, 0.587, 0.114, 0, 0
                  0.299, 0.587, 0.114, 0, 0
                  0.299, 0.587, 0.114, 0, 0
                  0,     0,     0,     1, 0"
        />
      </filter>
    </defs>
  </svg>
);

const colorBlindnessFilters = {
  normal: 'none',
  protanopia: 'url(#protanopia)',
  deuteranopia: 'url(#deuteranopia)',
  tritanopia: 'url(#tritanopia)',
  achromatopsia: 'url(#achromatopsia)',
};

const ColorBlindnessFilterApp = () => {
  const [image, setImage] = useState(null);
  const [filter, setFilter] = useState('normal');
  const [compareMode, setCompareMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const canvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (e) => setImage(e.target.result);
        reader.readAsDataURL(blob);
      }
    }
  };

  const applyFilter = (imageData, filterType) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageData;
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.filter = colorBlindnessFilters[filterType];
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL());
      };
    });
  };

  const downloadFilteredImages = async () => {
    if (!image) return;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const filters = Object.keys(colorBlindnessFilters);

    for (let i = 0; i < filters.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      const filteredImage = await applyFilter(image, filters[i]);
      
      const imgWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm margin on each side
      const imgHeight = (imgWidth * 9) / 16; // Assuming 16:9 aspect ratio, adjust if needed

      pdf.setFontSize(16);
      pdf.text(`${filters[i].charAt(0).toUpperCase() + filters[i].slice(1)} Filter`, 10, 10);
      pdf.addImage(filteredImage, 'JPEG', 10, 20, imgWidth, imgHeight);
    }

    pdf.save('color_blindness_filters.pdf');
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  };

  const handleMouseDown = (key) => {
    if (compareMode) {
      setFilter(key);
    }
  };

  const handleMouseUp = () => {
    if (compareMode) {
      setFilter('normal');
    }
  };

  const handleFilterClick = (key) => {
    if (!compareMode) {
      setFilter(key);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <SVGFilters />

      <div className={`w-64 p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <h2 className="text-xl font-bold mb-4">Color Blindness Filters</h2>
        <button
          className="block w-full bg-yellow-500 text-white p-2 mb-2 rounded"
          onClick={toggleDarkMode}
        >
          {darkMode ? <Sun className="inline mr-2" size={16} /> : <Moon className="inline mr-2" size={16} />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        {Object.keys(colorBlindnessFilters).map((key) => (
          <button
            key={key}
            className={`block w-full text-left p-2 mb-2 rounded ${
              (compareMode ? compareFilter : filter) === key ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-700 text-white' : 'bg-white'
            }`}
            onMouseDown={() => handleMouseDown(key)}
            onMouseUp={handleMouseUp}
            onClick={() => handleFilterClick(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
        {image && (
          <>
            <button
              className="block w-full bg-green-500 text-white p-2 mb-2 rounded"
              onClick={downloadFilteredImages}
            >
              <Download className="inline mr-2" size={16} />
              Download All Filters
            </button>
            <button
              className={`block w-full ${compareMode ? 'bg-red-500' : 'bg-blue-500'} text-white p-2 mb-2 rounded`}
              onClick={toggleCompareMode}
            >
              <Split className="inline mr-2" size={16} />
              {compareMode ? 'Exit Compare' : 'Compare Filters'}
            </button>
          </>
        )}
      </div>

      <div className="flex-1 p-4">
        <div
          className={`border-dashed border-2 rounded-lg p-12 text-center ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}
          onPaste={handlePaste}
        >
          {image ? (
            <img
              src={image}
              alt="Uploaded design"
              className="max-w-full max-h-full mx-auto"
              style={{ filter: colorBlindnessFilters[filter] }}
            />
          ) : (
            <div>
              <Upload className="mx-auto mb-4" size={48} />
              <p className="mb-2">Upload or paste your screenshot here</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
              >
                Select File
              </label>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ColorBlindnessFilterApp;
