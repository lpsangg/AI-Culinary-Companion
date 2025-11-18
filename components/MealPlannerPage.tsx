import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { MealPlannerService, MealPlan, ShoppingListItem } from '../services/mealPlannerService';

interface MealPlannerPageProps {
  recipes: Recipe[];
  onBack: () => void;
}

type ViewMode = 'planner' | 'shopping';

const MealPlannerPage: React.FC<MealPlannerPageProps> = ({ recipes, onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('planner');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    MealPlannerService.getStartOfWeek()
  );
  const [weekPlans, setWeekPlans] = useState<Map<string, MealPlan[]>>(new Map());
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [servings, setServings] = useState<number>(2);
  const [showAddMealForm, setShowAddMealForm] = useState(false);

  const weekDates = MealPlannerService.getWeekDates(currentWeekStart);

  useEffect(() => {
    loadWeekPlans();
  }, [currentWeekStart]);

  const loadWeekPlans = () => {
    const plans = MealPlannerService.getMealPlansForWeek(currentWeekStart);
    setWeekPlans(plans);
  };

  const handleAddMeal = () => {
    if (!selectedRecipeId || !selectedDate) return;

    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) return;

    MealPlannerService.addMealPlan({
      date: selectedDate,
      mealType: selectedMealType,
      recipeId: recipe.id,
      recipeName: recipe.name,
      servings: servings,
    });

    loadWeekPlans();
    setShowAddMealForm(false);
    setSelectedRecipeId(null);
  };

  const handleRemoveMeal = (planId: string) => {
    MealPlannerService.removeMealPlan(planId);
    loadWeekPlans();
  };

  const handleGenerateShoppingList = () => {
    const items = MealPlannerService.generateShoppingList(recipes);
    MealPlannerService.saveShoppingList(items);
    setShoppingList(items);
    setViewMode('shopping');
  };

  const handleToggleItem = (ingredient: string) => {
    MealPlannerService.toggleShoppingListItem(ingredient);
    setShoppingList(MealPlannerService.getShoppingList());
  };

  const handleClearChecked = () => {
    MealPlannerService.clearCheckedItems();
    setShoppingList(MealPlannerService.getShoppingList());
  };

  const handlePreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const handleThisWeek = () => {
    setCurrentWeekStart(MealPlannerService.getStartOfWeek());
  };

  const getMealTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      breakfast: 'Sáng',
      lunch: 'Trưa',
      dinner: 'Tối',
      snack: 'Phụ',
    };
    return labels[type] || type;
  };

  const getMealTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      breakfast: '#FFD700',
      lunch: '#FF6B6B',
      dinner: '#4ECDC4',
      snack: '#95E1D3',
    };
    return colors[type] || '#ccc';
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
            Kế hoạch ăn tuần
          </h1>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode('planner')}
            className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-bold transition ${
              viewMode === 'planner'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            Lịch tuần
          </button>
          <button
            onClick={() => {
              const items = MealPlannerService.getShoppingList();
              setShoppingList(items);
              setViewMode('shopping');
            }}
            className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-bold transition ${
              viewMode === 'shopping'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            Danh sách mua
          </button>
        </div>
      </div>
        {viewMode === 'planner' ? (
          <>
            {/* Week Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow">
              <button
                onClick={handlePreviousWeek}
                className="w-full sm:w-auto px-6 py-2 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 font-semibold transition"
              >
                ← Tuần trước
              </button>
              <button
                onClick={handleThisWeek}
                className="w-full sm:w-auto px-6 py-2 rounded-lg border-2 border-orange-500 bg-white hover:bg-orange-50 font-bold text-orange-600 transition"
              >
                Tuần này
              </button>
              <button
                onClick={handleNextWeek}
                className="w-full sm:w-auto px-6 py-2 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 font-semibold transition"
              >
                Tuần sau →
              </button>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
              {weekDates.map((date) => {
                const dateStr = MealPlannerService.getISODate(date);
                const dayPlans = weekPlans.get(dateStr) || [];
                const isToday = dateStr === MealPlannerService.getISODate(new Date());

                return (
                  <div
                    key={dateStr}
                    className={`bg-white rounded-xl shadow-md hover:shadow-lg transition min-h-[300px] ${
                      isToday ? 'ring-2 ring-orange-500' : ''
                    }`}
                  >
                    <div className={`p-4 rounded-t-xl ${isToday ? 'bg-orange-50' : 'bg-gray-50'}`}>
                      <div className="text-center font-bold text-gray-800">
                        {MealPlannerService.formatDate(date)}
                      </div>
                      {isToday && (
                        <div className="text-center text-xs text-orange-600 font-semibold mt-1">
                          Hôm nay
                        </div>
                      )}
                    </div>

                    <div className="p-3 space-y-2">
                      {/* Meals for this day */}
                      {dayPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className="group relative p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                          style={{ borderLeft: `4px solid ${getMealTypeColor(plan.mealType)}` }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span
                              className="text-xs font-bold uppercase"
                              style={{ color: getMealTypeColor(plan.mealType) }}
                            >
                              {getMealTypeLabel(plan.mealType)}
                            </span>
                            <button
                              onClick={() => handleRemoveMeal(plan.id)}
                              className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700"
                              title="Xóa"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-sm font-semibold text-gray-800 mb-1">
                            {plan.recipeName}
                          </div>
                          <div className="text-xs text-gray-600">
                            {plan.servings} phần
                          </div>
                        </div>
                      ))}

                      {/* Add Meal Button */}
                      <button
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setShowAddMealForm(true);
                        }}
                        className="w-full py-2 px-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-600 hover:text-orange-600 text-sm font-semibold transition"
                      >
                        + Thêm món
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Generate Shopping List Button */}
            <div className="text-center">
              <button
                onClick={handleGenerateShoppingList}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition"
              >
                Tạo danh sách mua sắm
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Shopping List View */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-800">Danh sách mua sắm</h2>
                  <button
                    onClick={handleClearChecked}
                    className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-700 hover:text-red-600 font-semibold transition"
                  >
                    Xóa mục đã mua
                  </button>
                </div>
              </div>

              {shoppingList.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Chưa có nguyên liệu nào
                  </h3>
                  <p className="text-gray-500">
                    Thêm món vào lịch tuần và tạo danh sách mua sắm
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shoppingList.map((item, index) => (
                    <div
                      key={index}
                      className={`bg-white rounded-lg shadow-md p-4 transition hover:shadow-lg ${
                        item.checked ? 'opacity-60' : ''
                      }`}
                    >
                      <label className="flex items-center gap-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggleItem(item.ingredient)}
                          className="w-6 h-6 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div
                            className={`font-bold text-lg ${
                              item.checked ? 'line-through text-gray-500' : 'text-gray-800'
                            }`}
                          >
                            {item.ingredient}
                          </div>
                          {item.quantity && (
                            <div className="text-sm text-gray-600 mt-1">
                              {item.quantity}
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      {/* Add Meal Form Modal */}
      {showAddMealForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAddMealForm(false);
            setSelectedRecipeId(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Thêm món vào lịch</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Bữa ăn:
                </label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                >
                  <option value="breakfast">Sáng</option>
                  <option value="lunch">Trưa</option>
                  <option value="dinner">Tối</option>
                  <option value="snack">Phụ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Món ăn:
                </label>
                <select
                  value={selectedRecipeId || ''}
                  onChange={(e) => setSelectedRecipeId(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                >
                  <option value="">Chọn món</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Số phần:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddMeal}
                disabled={!selectedRecipeId}
                className={`flex-1 py-3 rounded-lg font-bold text-white transition ${
                  selectedRecipeId
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg transform hover:scale-105'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Thêm
              </button>
              <button
                onClick={() => {
                  setShowAddMealForm(false);
                  setSelectedRecipeId(null);
                }}
                className="flex-1 py-3 rounded-lg border-2 border-gray-300 hover:bg-gray-50 font-bold text-gray-700 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MealPlannerPage;
