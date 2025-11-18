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
import { AuthModal } from './components/AuthModal';
import { generateRecipeFromPrompt } from './services/geminiService';
import { recipeGenerationLimiter } from './utils/rateLimiter';
import { SavedRecipesService } from './services/savedRecipesService';
import { SupabaseAuthService, type AuthUser } from './services/supabaseAuthService';
import { AiRecipesService } from './services/aiRecipesService';
import { SearchHistoryService } from './services/searchHistoryService';
import MealPlannerPage from './components/MealPlannerPage';
import SearchHistoryPage from './components/SearchHistoryPage';

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
  // Chỉ dùng mock data, không merge AI recipes
  const [recipes] = useState<Recipe[]>(() => shuffleArray([...RECIPES]));
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(recipes);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>('warning');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedRecipeIds, setSavedRecipeIds] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMealPlannerPage, setShowMealPlannerPage] = useState(false);
  const [showSearchHistoryPage, setShowSearchHistoryPage] = useState(false);
  
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
      
      // Filter by saved recipes first if showSavedOnly is true
      if (showSavedOnly) {
        tempRecipes = tempRecipes.filter(recipe => savedRecipeIds.includes(recipe.id));
      }
      
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
  }, [recipes, filters, showSavedOnly, savedRecipeIds]);

  useEffect(() => {
    filterRecipes();
  }, [filters, filterRecipes]);

  // Load saved recipes on mount and update periodically
  useEffect(() => {
    const updateSavedRecipes = () => {
      setSavedRecipeIds(SavedRecipesService.getSavedRecipes());
    };
    
    updateSavedRecipes();
    
    // Listen to storage changes from other tabs
    window.addEventListener('storage', updateSavedRecipes);
    // Listen to custom event from RecipeCard
    window.addEventListener('savedRecipesChanged', updateSavedRecipes);
    
    return () => {
      window.removeEventListener('storage', updateSavedRecipes);
      window.removeEventListener('savedRecipesChanged', updateSavedRecipes);
    };
  }, []);

  // Check authentication state
  useEffect(() => {
    SupabaseAuthService.getCurrentUser().then(user => {
      setCurrentUser(user);
    });

    const { data: { subscription } } = SupabaseAuthService.onAuthStateChange((user) => {
      setCurrentUser(user);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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

  const handleShowSaved = () => {
    // Require login to view saved recipes
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    // Đóng các page khác trước
    setShowMealPlannerPage(false);
    setShowSearchHistoryPage(false);
    
    setShowSavedOnly(!showSavedOnly);
    // Reset filters when showing saved
    if (!showSavedOnly) {
      setFilters({
        [FilterCategory.REGION]: 'all',
        [FilterCategory.INGREDIENT]: 'all',
        [FilterCategory.METHOD]: 'all',
        [FilterCategory.TASTE]: 'all',
        [FilterCategory.OCCASION]: 'all',
        [FilterCategory.SPICE]: 'all',
        [FilterCategory.DIET]: 'all',
      });
    }
  };

  const handleLoginRequired = () => {
    setShowAuthModal(true);
  };

  const handleShowMealPlanner = () => {
    // Require login to use meal planner
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    
    // Tắt các mode/page khác
    setShowSavedOnly(false);
    setShowSearchHistoryPage(false);
    
    setShowMealPlannerPage(true);
  };

  const handleShowSearchHistory = () => {
    // Require login to view search history
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    
    // Tắt các mode/page khác
    setShowSavedOnly(false);
    setShowMealPlannerPage(false);
    
    setShowSearchHistoryPage(true);
  };

  const handleBackHome = () => {
    // Về page home, không logout
    setShowSavedOnly(false);
    setShowMealPlannerPage(false);
    setShowSearchHistoryPage(false);
  };

  const handleSelectPromptFromHistory = (prompt: string) => {
    // Auto-fill prompt vào RecipeGenerator
    handleGenerateRecipe(prompt);
  };

  const handleGenerateRecipe = async (prompt: string) => {
    if (!prompt || isGenerating) return;
    
    // Kiểm tra rate limit
    const limitCheck = recipeGenerationLimiter.checkLimit();
    if (!limitCheck.allowed) {
      setAlertMessage(`Bạn đã tạo quá nhiều công thức. Vui lòng thử lại sau ${limitCheck.retryAfter} giây.`);
      setAlertType('warning');
      return;
    }
    
    setIsGenerating(true);
    try {
      const generatedRecipe = await generateRecipeFromPrompt(prompt);
      if (generatedRecipe.name === "Yêu cầu không hợp lệ") {
        setAlertMessage(generatedRecipe.description);
        setAlertType('warning');
      } else {
        // Chỉ lưu lịch sử tìm kiếm, không thêm vào danh sách
        if (currentUser) {
          SearchHistoryService.addSearch(
            prompt,
            currentUser.id,
            generatedRecipe
          );
        }
        
        // Hiển thị modal
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
        onShowSaved={handleShowSaved}
        savedCount={currentUser ? savedRecipeIds.length : 0}
        currentUser={currentUser}
        onShowAuthModal={() => setShowAuthModal(true)}
        onShowMealPlanner={handleShowMealPlanner}
        onShowSearchHistory={handleShowSearchHistory}
        onBackHome={handleBackHome}
      />
      
      {showSearchHistoryPage && currentUser ? (
        <>
          <SearchHistoryPage 
            userId={currentUser.id}
            onBack={() => setShowSearchHistoryPage(false)}
            onSelectRecipe={handleSelectRecipe}
          />
          <Footer />
        </>
      ) : showMealPlannerPage ? (
        <>
          <MealPlannerPage 
            recipes={recipes}
            onBack={() => setShowMealPlannerPage(false)}
          />
          <Footer />
        </>
      ) : (
      <>
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- Desktop Sidebar (Filters Only) --- */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-8">
              {showSavedOnly && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-red-700">Món đã lưu</span>
                    </div>
                    <span className="text-sm text-red-600">{savedRecipeIds.length} món</span>
                  </div>
                </div>
              )}
              <FilterBar filters={filters} onFilterChange={handleFilterChange} />
            </div>
          </div>
          {/* --- Main Content --- */}
          <div className="lg:col-span-9">
            {!showSavedOnly && (
              <RecipeGenerator onGenerate={handleGenerateRecipe} isGenerating={isGenerating} />
            )}
            
            <div className={showSavedOnly ? '' : 'mt-8'}>
                {/* --- Mobile Filter Button --- */}
                <div className="mb-4 lg:hidden flex items-center justify-between">
                    {showSavedOnly && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">Món đã lưu ({savedRecipeIds.length})</span>
                      </div>
                    )}
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
                
                {showSavedOnly && filteredRecipes.length === 0 ? (
                  <div className="text-center py-16">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có món nào được lưu</h3>
                    <p className="text-gray-500">Nhấn vào ❤️ trên món ăn để lưu vào danh sách yêu thích</p>
                  </div>
                ) : (
                  <RecipeGrid 
                    recipes={filteredRecipes} 
                    onSelectRecipe={handleSelectRecipe}
                    isLoggedIn={!!currentUser}
                    onLoginRequired={handleLoginRequired}
                  />
                )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      </>
      )}

      {/* --- Mobile Filter Modal --- */}
      {isFilterOpen && (
        <FilterModal onClose={() => setIsFilterOpen(false)}>
            <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        </FilterModal>
      )}

      {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={handleCloseModal} />}
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
          }}
        />
      )}
      
      {/* Alert Modal */}
      {alertMessage && (
        <AlertModal 
          message={alertMessage} 
          type={alertType}
          onClose={() => setAlertMessage(null)} 
        />
      )}
    </div>
  );
};

export default App;