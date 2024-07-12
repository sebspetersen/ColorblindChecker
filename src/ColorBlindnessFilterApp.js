import React, { useState, useRef } from 'react';
import { Upload, Download, Split, Eye, EyeOff } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

const ColorBlindnessFilterApp = () => {
  // ... existing state and functions ...

  return (
    <div className="flex h-screen bg-gray-100">
      <SVGFilters />
      
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="w-64 bg-white p-4 shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Color Blindness Filters</h2>
        {Object.keys(colorBlindnessFilters).map((key) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`block w-full text-left p-3 mb-3 rounded-lg transition-colors duration-200 ${
              (compareMode ? compareFilter : filter) === key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            onClick={() => compareMode ? setCompareFilter(key) : setFilter(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </motion.button>
        ))}
        <AnimatePresence>
          {image && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="block w-full bg-green-500 text-white p-3 mb-3 rounded-lg"
                onClick={downloadFilteredImages}
              >
                <Download className="inline mr-2" size={16} />
                Download All Filters
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`block w-full ${compareMode ? 'bg-red-500' : 'bg-blue-500'} text-white p-3 mb-3 rounded-lg`}
                onClick={toggleCompareMode}
              >
                {compareMode ? <EyeOff className="inline mr-2" size={16} /> : <Eye className="inline mr-2" size={16} />}
                {compareMode ? 'Exit Compare' : 'Compare Filters'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-2xl p-8"
        >
          <div
            className="border-dashed border-2 border-gray-300 rounded-lg p-12 text-center"
            onPaste={handlePaste}
          >
            {image ? (
              compareMode ? (
                <div className="flex flex-row space-x-8">
                  <motion.div className="w-1/2" initial={{ x: -50 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Normal View</h3>
                    <img
                      src={image}
                      alt="Original design"
                      className="max-w-full h-auto rounded-lg shadow-md"
                      style={{ filter: colorBlindnessFilters['normal'] }}
                    />
                  </motion.div>
                  <motion.div className="w-1/2" initial={{ x: 50 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                      {compareFilter.charAt(0).toUpperCase() + compareFilter.slice(1)} Filter
                    </h3>
                    <img
                      src={image}
                      alt="Filtered design"
                      className="max-w-full h-auto rounded-lg shadow-md"
                      style={{ filter: colorBlindnessFilters[compareFilter] }}
                    />
                  </motion.div>
                </div>
              ) : (
                <motion.img
                  key={filter}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={image}
                  alt="Uploaded design"
                  className="max-w-full max-h-full mx-auto rounded-lg shadow-lg"
                  style={{ filter: colorBlindnessFilters[filter] }}
                />
              )
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Upload className="mx-auto mb-6 text-gray-400" size={64} />
                <p className="mb-6 text-xl text-gray-600">Upload or paste your screenshot here</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="fileInput"
                />
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  htmlFor="fileInput"
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer text-lg font-semibold shadow-md hover:bg-blue-600 transition-colors duration-200"
                >
                  Select File
                </motion.label>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ColorBlindnessFilterApp;
