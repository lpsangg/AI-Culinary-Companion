import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 mt-16">
      <div className="container mx-auto px-4 md:px-8 py-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.382 13.344C21.118 12.517 20.323 12 19.5 12h-1.429c-.255 0-.49.12-.642.329l-1.139 1.518a2.5 2.5 0 01-4.28 0l-1.139-1.518A.75.75 0 0010.23 12H8.5a2.5 2.5 0 00-2.5 2.5V17h1.071a.75.75 0 00.642-.329l1.139-1.518a2.5 2.5 0 014.28 0l1.139 1.518a.75.75 0 00.642.329H18v-2.5a2.5 2.5 0 00-2.5-2.5h-1.429c-.255 0-.49.12-.642.329l-.693.924a.75.75 0 01-1.272 0l-.693-.924A.75.75 0 0010.23 12H8.5a2.5 2.5 0 00-2.5 2.5v4H5a1 1 0 00-1 1v1a1 1 0 001 1h14a1 1 0 001-1v-1a1 1 0 00-1-1h-1v-4c0-.463.125-.904.357-1.285L19.5 7h-1a1 1 0 100 2h.167l-1.758 4.688a1.001 1.001 0 001.564 1.176l.309-.231c.264-.827 1.059-1.344 1.9-1.344h.318zm-7.69-5.143a3.5 3.5 0 10-4.95 0 3.5 3.5 0 004.95 0z" />
          </svg>
          <h3 className="text-xl font-bold text-white tracking-tight">AI Culinary Companion</h3>
        </div>
        <p className="max-w-2xl mx-auto text-sm mb-6">
          Khám phá, sáng tạo và thưởng thức ẩm thực cùng Trí Tuệ Nhân Tạo.
        </p>
        <div className="border-t border-gray-700 pt-6 text-xs">
          <p>&copy; {new Date().getFullYear()} AI Culinary Companion. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
