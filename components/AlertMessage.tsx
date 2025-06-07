
import React from 'react';

interface AlertMessageProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses = "p-4 rounded-md mb-4 text-sm shadow";
  const typeClasses = {
    success: "bg-green-100 border border-green-300 text-green-800",
    error: "bg-red-100 border border-red-300 text-red-800",
    info: "bg-blue-100 border border-blue-300 text-blue-800",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      <div className="flex justify-between items-center">
        <span>{message}</span>
        {onClose && (
          <button 
            onClick={onClose} 
            className={`ml-4 font-semibold p-1 rounded-full hover:bg-opacity-20 ${
              type === 'success' ? 'hover:bg-green-500' : 
              type === 'error' ? 'hover:bg-red-500' : 'hover:bg-blue-500'
            }`}
            aria-label="Close alert"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertMessage;
