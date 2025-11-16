import React, { useState } from 'react';
import type { Filters } from '../types';
import { FilterCategory } from '../constants';
import { SuggestionTag } from './SuggestionTag';

interface NavbarProps {
    onSuggestionClick: (category: keyof Omit<Filters, 'searchQuery'>, value: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSuggestionClick }) => {
  const [showUserPopup, setShowUserPopup] = useState(false);

  const handleUserClick = () => {
    setShowUserPopup(true);
  };

  const closePopup = () => {
    setShowUserPopup(false);
  };

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <>
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
            {/* Left Side: Logo and Title */}
            <div 
                className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition"
                onClick={handleLogoClick}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.382 13.344C21.118 12.517 20.323 12 19.5 12h-1.429c-.255 0-.49.12-.642.329l-1.139 1.518a2.5 2.5 0 01-4.28 0l-1.139-1.518A.75.75 0 0010.23 12H8.5a2.5 2.5 0 00-2.5 2.5V17h1.071a.75.75 0 00.642-.329l1.139-1.518a2.5 2.5 0 014.28 0l1.139 1.518a.75.75 0 00.642.329H18v-2.5a2.5 2.5 0 00-2.5-2.5h-1.429c-.255 0-.49.12-.642.329l-.693.924a.75.75 0 01-1.272 0l-.693-.924A.75.75 0 0010.23 12H8.5a2.5 2.5 0 00-2.5 2.5v4H5a1 1 0 00-1 1v1a1 1 0 001 1h14a1 1 0 001-1v-1a1 1 0 00-1-1h-1v-4c0-.463.125-.904.357-1.285L19.5 7h-1a1 1 0 100 2h.167l-1.758 4.688a1.001 1.001 0 001.564 1.176l.309-.231c.264-.827 1.059-1.344 1.9-1.344h.318zm-7.69-5.143a3.5 3.5 0 10-4.95 0 3.5 3.5 0 004.95 0z" />
                </svg>
                <h1 className="hidden sm:block text-2xl font-bold text-gray-800 tracking-tight">Nấu ăn mỗi ngày</h1>
            </div>

            {/* Center: Suggestions */}
            <div className="hidden md:flex items-center justify-center space-x-3 text-sm flex-1">
                <span className="text-gray-600 font-semibold">Thử ngay:</span>
                <SuggestionTag text="Tiết kiệm thời gian" onClick={() => onSuggestionClick(FilterCategory.OCCASION, 'Tiết kiệm thời gian')} />
                <SuggestionTag text="Ăn healthy" onClick={() => onSuggestionClick(FilterCategory.OCCASION, 'Ăn healthy')} />
                <SuggestionTag text="Món Miền Nam" onClick={() => onSuggestionClick(FilterCategory.REGION, 'Miền Nam')} />
                <SuggestionTag text="Món nướng" onClick={() => onSuggestionClick(FilterCategory.METHOD, 'Nướng')} />
            </div>

            {/* Right Side: User Profile */}
            <div className="flex-shrink-0 flex items-center space-x-2">
                {/* User Profile Button */}
                <button 
                    onClick={handleUserClick}
                    className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 transition"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
      </div>

      {/* User Popup */}
      {showUserPopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
          onClick={closePopup}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Chức năng đang phát triển
              </h3>
              
              {/* Message */}
              <p className="text-gray-600 mb-6">
                Tính năng đăng nhập và quản lý tài khoản đang được phát triển. 
                Vui lòng quay lại sau nhé! 
              </p>
              
              {/* Button */}
              <button
                onClick={closePopup}
                className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-105"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
};