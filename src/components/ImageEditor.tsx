import React, { useState, useCallback } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Sliders, Crop as CropIcon, FileText, BrainCircuit } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import type { ImageData } from '../types';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (imageData: ImageData) => void;
  onClose: () => void;
}

export function ImageEditor({ imageUrl, onSave, onClose }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>();
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100
  });
  const [recognizedText, setRecognizedText] = useState<string>();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((crop: Crop) => {
    // Handle crop completion
    console.log('Crop complete:', crop);
  }, []);

  const handleFilterChange = (filter: keyof typeof filters, value: number) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  const extractText = async () => {
    setIsProcessing(true);
    try {
      const worker = await createWorker('eng');
      const result = await worker.recognize(imageUrl);
      setRecognizedText(result.data.text);
      await worker.terminate();
    } catch (error) {
      console.error('OCR failed:', error);
    }
    setIsProcessing(false);
  };

  const handleSave = () => {
    const imageData: ImageData = {
      url: imageUrl,
      metadata: {
        width: 0, // This would come from the actual image
        height: 0,
        type: 'image/jpeg'
      },
      filters,
      recognizedText
    };
    onSave(imageData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#262626] rounded-2xl w-full max-w-4xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-[#FE6902]">Edit Image</h3>
            <button
              onClick={onClose}
              className="text-[#E5E5E5] hover:text-[#FE6902]"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={handleCropComplete}
              >
                <img
                  src={imageUrl}
                  alt="Edit"
                  style={{
                    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`
                  }}
                  className="max-w-full rounded-lg"
                />
              </ReactCrop>
            </div>

            <div className="space-y-4">
              <div className="bg-[#393737]/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-[#FE6902] mb-3">
                  <Sliders size={16} />
                  <span className="font-medium">Adjustments</span>
                </div>
                <div className="space-y-3">
                  {Object.entries(filters).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-sm text-[#E5E5E5] block mb-1 capitalize">
                        {key}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={value}
                        onChange={e => handleFilterChange(key as keyof typeof filters, Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#393737]/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-[#FE6902] mb-3">
                  <CropIcon size={16} />
                  <span className="font-medium">Crop</span>
                </div>
                <p className="text-sm text-[#E5E5E5]">
                  Click and drag on the image to crop
                </p>
              </div>

              <button
                onClick={extractText}
                disabled={isProcessing}
                className="w-full p-3 rounded-lg bg-[#393737] hover:bg-[#454545] transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={16} className="text-[#FE6902]" />
                <span>{isProcessing ? 'Extracting Text...' : 'Extract Text'}</span>
              </button>

              {recognizedText && (
                <div className="bg-[#393737]/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-[#FE6902] mb-3">
                    <BrainCircuit size={16} />
                    <span className="font-medium">Extracted Text</span>
                  </div>
                  <p className="text-sm text-[#E5E5E5] whitespace-pre-line">
                    {recognizedText}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#393737] text-[#E5E5E5] hover:bg-[#454545] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#FE6902] text-white hover:bg-[#ff7b1d] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}