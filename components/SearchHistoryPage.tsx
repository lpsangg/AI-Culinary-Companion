import React, { useState, useEffect } from 'react';
import { SearchHistoryService, SearchHistoryItem } from '../services/searchHistoryService';
import type { Recipe } from '../types';

interface SearchHistoryPageProps {
  userId: string;
  onBack: () => void;
  onSelectRecipe?: (recipe: Recipe) => void;
}

const SearchHistoryPage: React.FC<SearchHistoryPageProps> = ({ 
  userId,
  onBack,
  onSelectRecipe
}) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  useEffect(() => {
    const handleHistoryChange = () => {
      loadHistory();
    };

    window.addEventListener('searchHistoryChanged', handleHistoryChange);
    return () => {
      window.removeEventListener('searchHistoryChanged', handleHistoryChange);
    };
  }, [userId]);

  const loadHistory = () => {
    const userHistory = SearchHistoryService.getHistory(userId);
    // Lọc bỏ những item không có recipe object (dữ liệu cũ)
    const validHistory = userHistory.filter(item => item.recipe && item.recipe.name);
    setHistory(validHistory);
  };

  const handleDelete = (itemId: string) => {
    SearchHistoryService.removeItem(itemId);
  };

  const handleClearAll = () => {
    if (window.confirm('Xóa toàn bộ lịch sử tìm kiếm?')) {
      SearchHistoryService.clearUserHistory(userId);
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    if (onSelectRecipe) {
      onSelectRecipe(recipe);
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8 flex-grow">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="Quay lại"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Lịch sử tìm kiếm AI
          </h1>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-lg border-2 border-red-500 bg-white hover:bg-red-50 text-red-600 font-bold transition"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Content */}
      <div>
        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Chưa có lịch sử tìm kiếm
            </h3>
            <p className="text-gray-500">
              Tìm kiếm món ăn bằng AI để lưu lại lịch sử
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleViewRecipe(item.recipe)}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group cursor-pointer relative"
              >
                {/* Delete Button - Top Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="absolute top-2 right-2 z-10 p-2 bg-white bg-opacity-90 hover:bg-red-500 hover:bg-opacity-100 rounded-full shadow-md transition-all group-hover:opacity-100 opacity-0"
                  title="Xóa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 group-hover:text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Recipe Image */}
                <div className="relative h-48">
                  <img 
                    src={item.recipe.image} 
                    alt={item.recipe.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  
                  {/* Timestamp Badge */}
                  <div className="absolute bottom-2 left-2">
                    <div className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-semibold text-gray-700">
                      {SearchHistoryService.formatTimestamp(item.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {/* Recipe Name */}
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
                    {item.recipe.name}
                  </h3>

                  {/* Prompt */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    Đã tìm: "{item.prompt}"
                  </p>

                  {/* Recipe Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-1">{item.recipe.prepTime + item.recipe.cookTime} phút</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0110 14.07a5 5 0 01-1.5-1.4a6.97 6.97 0 00-1.5 4.33c0 .34.024.673.07 1h5.86z" />
                      </svg>
                      <span className="ml-1">{item.recipe.servings} người</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default SearchHistoryPage;
