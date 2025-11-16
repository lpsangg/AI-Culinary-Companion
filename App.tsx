import React, { useState, useEffect, useMemo } from 'react';
import { FilterBar } from './components/FilterBar';
import { RecipeGrid } from './components/RecipeGrid';
import { RecipeModal } from './components/RecipeModal';
import { RecipeGenerator } from './components/RecipeGenerator';
import { Navbar } from './components/Header';
import { Footer } from './components/Footer';
import { AlertModal } from './components/AlertModal';
import { RECIPES } from './data/mockData';
import type { Recipe, Filters } from './types';
import { FilterCategory } from './constants';
import { FilterModal } from './components/FilterModal';
import { generateRecipeFromPrompt } from './services/geminiService';

// Function to shuffle an array
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const App: React.FC = () => {
  const [recipes] = useState<Recipe[]>(() => shuffleArray([...RECIPES]));
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(recipes);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>('warning');
  
  const [filters, setFilters] = useState<Omit<Filters, 'searchQuery'>>({
    [FilterCategory.REGION]: 'all',
    [FilterCategory.INGREDIENT]: 'all',
    [FilterCategory.METHOD]: 'all',
    [FilterCategory.TASTE]: 'all',
    [FilterCategory.OCCASION]: 'all',
    [FilterCategory.SPICE]: 'all',
    [FilterCategory.DIET]: 'all',
  });

  const filterRecipes = useMemo(() => {
    return () => {
      let tempRecipes = recipes;
      
      // Filter by categories
      (Object.keys(filters) as (keyof typeof filters)[]).forEach(key => {
        if (filters[key] !== 'all') {
            tempRecipes = tempRecipes.filter(recipe => {
                const recipeValue = recipe[key as keyof Recipe];
                if (Array.isArray(recipeValue)) {
                    return recipeValue.includes(filters[key] as any);
                }
                return recipeValue === filters[key];
            });
        }
      });
      
      setFilteredRecipes(tempRecipes);
    };
  }, [recipes, filters]);

  useEffect(() => {
    filterRecipes();
  }, [filters, filterRecipes]);

  const handleFilterChange = (category: keyof Omit<Filters, 'searchQuery'>, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [category]: value,
    }));
  };
  
  const handleSuggestionClick = (category: keyof Omit<Filters, 'searchQuery'>, value: string) => {
    // Reset other filters and apply the suggestion
    setFilters({
      [FilterCategory.REGION]: 'all',
      [FilterCategory.INGREDIENT]: 'all',
      [FilterCategory.METHOD]: 'all',
      [FilterCategory.TASTE]: 'all',
      [FilterCategory.OCCASION]: 'all',
      [FilterCategory.SPICE]: 'all',
      [FilterCategory.DIET]: 'all',
      [category]: value,
    });
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseModal = () => {
    setSelectedRecipe(null);
  };

  const handleGenerateRecipe = async (prompt: string) => {
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    try {
      const generatedRecipe = await generateRecipeFromPrompt(prompt);
      if (generatedRecipe.name === "Yêu cầu không hợp lệ") {
        setAlertMessage(generatedRecipe.description);
        setAlertType('warning');
      } else {
        setSelectedRecipe(generatedRecipe);
      }
    } catch (error) {
      console.error("Failed to generate recipe:", error);
      setAlertMessage("Rất tiếc, đã có lỗi xảy ra khi tạo công thức. Vui lòng thử lại.");
      setAlertType('error');
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col">
      <Navbar 
        onSuggestionClick={handleSuggestionClick}
      />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- Desktop Sidebar (Filters Only) --- */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-8">
              {/* <h2 className="text-xl font-bold text-gray-800 mb-4">Gợi ý từ Bếp trưởng</h2> */}
              <FilterBar filters={filters} onFilterChange={handleFilterChange} />
            </div>
          </div>
          {/* --- Main Content --- */}
          <div className="lg:col-span-9">
            <RecipeGenerator onGenerate={handleGenerateRecipe} isGenerating={isGenerating} />
            
            <div className="mt-8">
                {/* --- Mobile Filter Button --- */}
                <div className="mb-4 lg:hidden flex items-center justify-between">
                    {/* <h2 className="text-xl font-bold text-gray-800">Gợi ý từ Bếp trưởng</h2> */}
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center justify-center p-2 px-4 bg-white rounded-lg shadow font-semibold text-gray-700 hover:bg-gray-100 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                        Lọc
                    </button>
                </div>
                <RecipeGrid recipes={filteredRecipes} onSelectRecipe={handleSelectRecipe} />
            </div>
          </div>
        </div>
      </main>

      {/* --- Mobile Filter Modal --- */}
      {isFilterOpen && (
        <FilterModal onClose={() => setIsFilterOpen(false)}>
            <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        </FilterModal>
      )}

      {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={handleCloseModal} />}
      
      {/* Alert Modal */}
      {alertMessage && (
        <AlertModal 
          message={alertMessage} 
          type={alertType}
          onClose={() => setAlertMessage(null)} 
        />
      )}
      
      <Footer />
    </div>
  );
};

export default App;