import React, { useState, useRef } from 'react';
import { Upload, Download, Split } from 'lucide-react';
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
  const [compareFilter, setCompareFilter] = useState('normal');
  const canvasRef = useRef(null);

  // ... (handleImageUpload, handlePaste, and applyFilter functions remain the same)

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
    setCompareFilter(filter);
    setFilter('normal');
  };

  return (
    <div className="flex h-screen">
      <SVGFilters />

      <div className="w-64 bg-gray-100 p-4">
        {/* ... (sidebar content remains the same) ... */}
      </div>

      <div className="flex-1 p-4">
        <div
          className="border-dashed border-2 border-gray-300 rounded-lg p-12 text-center"
          onPaste={handlePaste}
        >
          {image ? (
            compareMode ? (
              <div className="flex flex-row space-x-4">
                <div className="w-1/2">
                  <h3 className="text-lg font-semibold mb-2">Normal View</h3>
                  <img
                    src={image}
                    alt="Original design"
                    className="max-w-full h-auto"
                    style={{ filter: colorBlindnessFilters['normal'] }}
                  />
                </div>
                <div className="w-1/2">
                  <h3 className="text-lg font-semibold mb-2">{compareFilter.charAt(0).toUpperCase() + compareFilter.slice(1)} Filter</h3>
                  <img
                    src={image}
                    alt="Filtered design"
                    className="max-w-full h-auto"
                    style={{ filter: colorBlindnessFilters[compareFilter] }}
                  />
                </div>
              </div>
            ) : (
              <img
                src={image}
                alt="Uploaded design"
                className="max-w-full max-h-full mx-auto"
                style={{ filter: colorBlindnessFilters[filter] }}
              />
            )
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
