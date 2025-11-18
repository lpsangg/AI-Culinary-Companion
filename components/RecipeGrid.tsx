
import React from 'react';
import type { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';

interface RecipeGridProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  isLoggedIn?: boolean;
  onLoginRequired?: () => void;
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({ recipes, onSelectRecipe, isLoggedIn, onLoginRequired }) => {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="mt-4 text-lg text-gray-600">Không tìm thấy món ăn phù hợp.</p>
        <p className="text-sm text-gray-500">Hãy thử thay đổi bộ lọc hoặc dùng AI Chat để được gợi ý nhé!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          onSelectRecipe={onSelectRecipe}
          isLoggedIn={isLoggedIn}
          onLoginRequired={onLoginRequired}
        />
      ))}
    </div>
  );
};
