import React, { useState, useEffect } from 'react';
import type { Recipe } from '../types';
import { SavedRecipesService } from '../services/savedRecipesService';

interface RecipeCardProps {
  recipe: Recipe;
  onSelectRecipe: (recipe: Recipe) => void;
  isLoggedIn?: boolean;
  onLoginRequired?: () => void;
}

// FIX: Changed JSX.Element to React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
const Tag: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
    <div className="flex items-center text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
        {icon}
        <span className="ml-1.5">{text}</span>
    </div>
);

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelectRecipe, isLoggedIn = false, onLoginRequired }) => {
  const [isSaved, setIsSaved] = useState(false);

  // Check if recipe is saved on mount
  useEffect(() => {
    if (isLoggedIn) {
      setIsSaved(SavedRecipesService.isRecipeSaved(recipe.id));
    }
  }, [recipe.id, isLoggedIn]);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening recipe modal
    
    // Check if user is logged in
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }
    
    const newSavedState = SavedRecipesService.toggleSaveRecipe(recipe.id);
    setIsSaved(newSavedState);
    
    // Dispatch custom event to notify App.tsx to update count
    window.dispatchEvent(new CustomEvent('savedRecipesChanged'));
  };

  return (
    <div 
        onClick={() => onSelectRecipe(recipe)}
        className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="relative">
        <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover"/>
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
        <div className="absolute top-2 left-2">
            <Tag 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>}
                text={recipe.region}
            />
        </div>
        {/* Save/Bookmark Button */}
        <button
          onClick={handleSaveClick}
          className="absolute top-2 right-2 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-md transition-all transform hover:scale-110"
          title={isSaved ? 'Bỏ lưu' : 'Lưu món này'}
        >
          {isSaved ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 truncate">{recipe.name}</h3>
        <p className="text-sm text-gray-600 mt-1 h-10 overflow-hidden">{recipe.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-3 border-t">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" />
            </svg>
            <span className="ml-1">{recipe.prepTime + recipe.cookTime} phút</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0110 14.07a5 5 0 01-1.5-1.4a6.97 6.97 0 00-1.5 4.33c0 .34.024.673.07 1h5.86z" />
            </svg>
            <span className="ml-1">{recipe.servings} người</span>
          </div>
        </div>
      </div>
    </div>
  );
};