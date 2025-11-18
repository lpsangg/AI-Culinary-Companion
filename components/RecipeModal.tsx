import React from 'react';
import type { Recipe } from '../types';
import { PrintService } from '../services/printService';

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 text-orange-500 bg-orange-100 rounded-full p-2">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-bold text-gray-800 text-lg">{value}</p>
        </div>
    </div>
);


export const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img src={recipe.image} alt={recipe.name} className="w-full h-64 object-cover rounded-t-lg" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
              <p className="text-gray-600">{recipe.description}</p>
            </div>
            {/* Print Button */}
            <button
              onClick={() => PrintService.printRecipe(recipe)}
              className="ml-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-md"
              title="In công thức"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="font-semibold">In</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 justify-around text-sm text-gray-700 mb-8 border-t border-b py-4">
             <InfoItem 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>}
                label="Thời gian chuẩn bị"
                value={`${recipe.prepTime} phút`}
            />
            <InfoItem 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>}
                label="Thời gian nấu"
                value={`${recipe.cookTime} phút`}
            />
            <InfoItem 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0110 14.07a5 5 0 01-1.5-1.4a6.97 6.97 0 00-1.5 4.33c0 .34.024.673.07 1h5.86z" /></svg>}
                label="Khẩu phần"
                value={`${recipe.servings} người`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <h3 className="text-2xl font-semibold mb-4 text-orange-600 border-b-2 border-orange-200 pb-2">Nguyên liệu</h3>
              <ul className="space-y-2 text-gray-700">
                {recipe.ingredients.map((ing, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{ing.name}</span>
                    <span className="font-semibold">{ing.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-8">
              <h3 className="text-2xl font-semibold mb-4 text-orange-600 border-b-2 border-orange-200 pb-2">Cách làm</h3>
              <ol className="space-y-6">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 bg-orange-500 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center mr-4">{index + 1}</span>
                    <p className="text-gray-700 leading-relaxed">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          {recipe.tips.length > 0 && (
            <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4 text-orange-600 border-b-2 border-orange-200 pb-2">Mẹo nấu ngon</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 bg-orange-50 p-4 rounded-lg">
                    {recipe.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                    ))}
                </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
