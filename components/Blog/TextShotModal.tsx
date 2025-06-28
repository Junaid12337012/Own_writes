

import React from 'react';
import { GeneratedImage } from '../../types';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface TextShotModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: GeneratedImage | null;
  isLoading: boolean;
  originalText: string;
}

const TextShotModal: React.FC<TextShotModalProps> = ({
  isOpen,
  onClose,
  imageData,
  isLoading,
  originalText,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (imageData?.base64Image) {
      const link = document.createElement('a');
      link.href = imageData.base64Image;
      link.download = `text_shot_${originalText.substring(0,20).replace(/\s+/g, '_') || 'image'}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4 backdrop-blur-sm text-shot-modal" role="dialog" aria-modal="true" aria-labelledby="textshot-modal-title">
      <div className="bg-white dark:bg-primary-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg relative transform transition-all duration-300 ease-out">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-secondary-400 dark:text-primary-400 hover:text-secondary-600 dark:hover:text-primary-200 transition-colors"
          aria-label="Close Text Shot modal"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>

        <h2 id="textshot-modal-title" className="text-2xl font-bold text-secondary-800 dark:text-primary-100 mb-4 text-center">
          AI Generated Text Shot
        </h2>

        {isLoading && (
          <div className="py-10">
            <LoadingSpinner message="Generating your Text Shot..." size="md" />
            <p className="text-sm text-secondary-500 dark:text-primary-400 text-center mt-2">Original text: "{originalText.substring(0, 50)}..."</p>
          </div>
        )}

        {!isLoading && imageData?.base64Image && (
          <div className="space-y-4">
            <div className="bg-secondary-100 dark:bg-primary-700 p-2 rounded-lg flex justify-center items-center max-h-[60vh] overflow-hidden">
                <img
                    src={imageData.base64Image}
                    alt={`AI generated image for text: ${imageData.promptUsed.substring(0, 50)}...`}
                    className="max-w-full max-h-[55vh] object-contain rounded-md shadow-md"
                />
            </div>
            <p className="text-xs text-secondary-500 dark:text-primary-400 text-center">Prompt based on: "{imageData.promptUsed.substring(0, 70)}..."</p>
            <div className="flex justify-center space-x-3 mt-4">
              <Button onClick={handleDownload} variant="primary" leftIcon={<ArrowDownTrayIcon className="h-5 w-5"/>}>
                Download Image
              </Button>
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        )}
        
        {!isLoading && !imageData?.base64Image && (
            <div className="text-center py-8">
                <p className="text-secondary-600 dark:text-primary-300 text-lg">Could not generate image for this text.</p>
                <p className="text-sm text-secondary-500 dark:text-primary-400 mt-1">Please try different text or try again later.</p>
                 <Button onClick={onClose} variant="secondary" className="mt-4">
                    Close
                </Button>
            </div>
        )}

      </div>
    </div>
  );
};

export default TextShotModal;