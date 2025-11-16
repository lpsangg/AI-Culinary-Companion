import React from 'react';

interface AlertModalProps {
  message: string;
  onClose: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const AlertModal: React.FC<AlertModalProps> = ({ message, onClose, type = 'warning' }) => {
  const iconColors = {
    error: 'bg-red-100 text-red-600',
    warning: 'bg-yellow-100 text-yellow-600',
    info: 'bg-blue-100 text-blue-600',
  };

  const buttonColors = {
    error: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    info: 'bg-blue-500 hover:bg-blue-600',
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          {/* Icon */}
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${iconColors[type]} mb-4`}>
            {type === 'error' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {type === 'warning' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {type === 'info' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {type === 'error' ? 'Lỗi' : type === 'warning' ? 'Thông báo' : 'Thông tin'}
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 mb-6 whitespace-pre-line">
            {message}
          </p>
          
          {/* Button */}
          <button
            onClick={onClose}
            className={`w-full ${buttonColors[type]} text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105`}
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
