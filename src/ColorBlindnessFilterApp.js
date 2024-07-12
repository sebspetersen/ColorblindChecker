import React, { useState, useRef, useEffect } from 'react';
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

const ColorBlindnessIcons = {
  normal: <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">👁️</span>,
  protanopia: <span className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center">🔴</span>,
  deuteranopia: <span className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center">🟢</span>,
  tritanopia: <span className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">🔵</span>,
  achromatopsia: <span className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">⚪</span>,
};

const colorBlindnessFilters = {
  normal: 'none',
  protanopia: 'url(#protanopia)',
  deuteranopia: 'url(#deuteranopia)',
  tritanopia: 'url(#tritanopia)',
  achromatopsia: 'url(#achromatopsia)',
};

const Favicon = ({ darkMode }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
      <circle cx="50" cy="50" r="45" fill={darkMode ? "#818CF8" : "#4F46E5"} />
      <ellipse cx="50" cy="50" rx="20" ry="30" fill={darkMode ? "#1F2937" : "white"} />
      <circle cx="50" cy="50" r="10" fill={darkMode ? "white" : "#1F2937"} />
    </svg>
  );
};

const ColorBlindnessFilterApp = () => {
  const [image, setImage] = useState(null);
  const [filter, setFilter] = useState('normal');
  const [compareMode, setCompareMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const favicon = document.getElementById('favicon');
    const svgElement = document.querySelector('.favicon-svg');
    if (svgElement) {
      const svg = new Blob([svgElement.outerHTML], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svg);
      favicon.href = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [darkMode]);

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
      
      const imgWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgHeight = (imgWidth * 9) / 16;

      pdf.setFontSize(16);
      pdf.text(`${filters[i].charAt(0).toUpperCase() + filters[i].slice(1)} Filter`, 10, 10);
      pdf.addImage(filteredImage, 'JPEG', 10, 20, imgWidth, imgHeight);
    }

    pdf.save('color_blindness_filters.pdf');
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 text-gray-800'}`}>
      <SVGFilters />
      <div className="hidden">
        <Favicon darkMode={darkMode} className="favicon-svg" />
      </div>
      <link id="favicon" rel="icon" type="image/svg+xml" href="" />

      {/* Sidebar */}
      <div className={`w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl z-10`}>
        <div className="p-6">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8">
            Vision<span className="text-indigo-600">Sim</span>
          </h1>
          
          <h2 className="text-lg font-bold mb-4">Color Vision Filters</h2>
          <div className="space-y-3">
            {Object.keys(colorBlindnessFilters).map((key) => (
              <button
                key={key}
                className={`w-full text-left p-3 rounded-xl flex items-center transition-all duration-300 ${
                  filter === key 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : darkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-indigo-50'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                onMouseDown={() => compareMode && setFilter(key)}
                onMouseUp={() => compareMode && setFilter('normal')}
                onClick={() => !compareMode && setFilter(key)}
              >
                {ColorBlindnessIcons[key]}
                <span className="ml-3 text-sm font-medium">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
              </button>
            ))}
          </div>
          
          {image && (
            <div className="mt-8 space-y-3">
              <button
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-sm"
                onClick={downloadFilteredImages}
              >
                <Download className="inline mr-2" size={16} />
                Download All Filters
              </button>
              <button
                className={`w-full ${
                  compareMode 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                } text-white font-bold py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-sm`}
                onClick={toggleCompareMode}
              >
                <Split className="inline mr-2" size={16} />
                {compareMode ? 'Exit Compare' : 'Compare Filters'}
              </button>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-4 left-4">
          <button
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow-md hover:shadow-lg transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 flex flex-col">
        <div 
          className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl flex items-center justify-center`}
          onPaste={handlePaste}
        >
          {image ? (
            <img
              src={image}
              alt="Uploaded design"
              className="max-w-full max-h-full object-contain"
              style={{ filter: colorBlindnessFilters[filter] }}
            />
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto">
                <Upload className="w-12 h-12 text-white" />
              </div>
              <p className="mb-6 text-xl text-gray-600">Upload or paste your image here</p>
              <label
                htmlFor="fileInput"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
              >
                Select Image
              </label>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ColorBlindnessFilterApp;
