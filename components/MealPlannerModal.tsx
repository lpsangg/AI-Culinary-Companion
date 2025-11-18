import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { MealPlannerService, MealPlan, ShoppingListItem } from '../services/mealPlannerService';

interface MealPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
}

type ViewMode = 'planner' | 'shopping';

const MealPlannerModal: React.FC<MealPlannerModalProps> = ({ isOpen, onClose, recipes }) => {
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
    if (isOpen) {
      loadWeekPlans();
    }
  }, [isOpen, currentWeekStart]);

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

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid #eee',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              📅 Kế hoạch ăn tuần
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              ✕
            </button>
          </div>

          {/* View Mode Tabs */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => setViewMode('planner')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'planner' 
                  ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' 
                  : '#f5f5f5',
                color: viewMode === 'planner' ? '#fff' : '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              📋 Lịch tuần
            </button>
            <button
              onClick={() => {
                const items = MealPlannerService.getShoppingList();
                setShoppingList(items);
                setViewMode('shopping');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'shopping' 
                  ? 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)' 
                  : '#f5f5f5',
                color: viewMode === 'shopping' ? '#fff' : '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🛒 Danh sách mua
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {viewMode === 'planner' ? (
            <>
              {/* Week Navigation */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px',
              }}>
                <button
                  onClick={handlePreviousWeek}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  ← Tuần trước
                </button>
                <button
                  onClick={handleThisWeek}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Tuần này
                </button>
                <button
                  onClick={handleNextWeek}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Tuần sau →
                </button>
              </div>

              {/* Week Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '12px',
                marginBottom: '24px',
              }}>
                {weekDates.map((date) => {
                  const dateStr = MealPlannerService.getISODate(date);
                  const dayPlans = weekPlans.get(dateStr) || [];
                  const isToday = dateStr === MealPlannerService.getISODate(new Date());

                  return (
                    <div
                      key={dateStr}
                      style={{
                        border: isToday ? '2px solid #FF6B6B' : '1px solid #ddd',
                        borderRadius: '12px',
                        padding: '12px',
                        backgroundColor: isToday ? '#FFF5F5' : '#fff',
                        minHeight: '200px',
                      }}
                    >
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        textAlign: 'center',
                      }}>
                        {MealPlannerService.formatDate(date)}
                      </div>

                      {/* Meals for this day */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {dayPlans.map((plan) => (
                          <div
                            key={plan.id}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: '#f9f9f9',
                              borderLeft: `4px solid ${getMealTypeColor(plan.mealType)}`,
                              fontSize: '12px',
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '4px',
                            }}>
                              <span style={{ 
                                fontWeight: 'bold',
                                color: getMealTypeColor(plan.mealType),
                              }}>
                                {getMealTypeLabel(plan.mealType)}
                              </span>
                              <button
                                onClick={() => handleRemoveMeal(plan.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '16px',
                                  padding: '0',
                                  lineHeight: '1',
                                }}
                              >
                                ✕
                              </button>
                            </div>
                            <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                              {plan.recipeName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#666' }}>
                              {plan.servings} phần
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Meal Button */}
                      <button
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setShowAddMealForm(true);
                        }}
                        style={{
                          width: '100%',
                          marginTop: '8px',
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px dashed #ddd',
                          background: '#fff',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#666',
                        }}
                      >
                        + Thêm món
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Meal Form */}
              {showAddMealForm && (
                <div style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: '#fff',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  zIndex: 1001,
                  minWidth: '400px',
                }}>
                  <h3 style={{ marginTop: 0 }}>Thêm món vào lịch</h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Bữa ăn:
                    </label>
                    <select
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                      }}
                    >
                      <option value="breakfast">Sáng</option>
                      <option value="lunch">Trưa</option>
                      <option value="dinner">Tối</option>
                      <option value="snack">Phụ</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Món ăn:
                    </label>
                    <select
                      value={selectedRecipeId || ''}
                      onChange={(e) => setSelectedRecipeId(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                      }}
                    >
                      <option value="">Chọn món</option>
                      {recipes.map((recipe) => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Số phần:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={servings}
                      onChange={(e) => setServings(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleAddMeal}
                      disabled={!selectedRecipeId}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: selectedRecipeId 
                          ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' 
                          : '#ccc',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: selectedRecipeId ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Thêm
                    </button>
                    <button
                      onClick={() => {
                        setShowAddMealForm(false);
                        setSelectedRecipeId(null);
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        background: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* Generate Shopping List Button */}
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  onClick={handleGenerateShoppingList}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  🛒 Tạo danh sách mua sắm
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Shopping List View */}
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px',
                }}>
                  <h3 style={{ margin: 0 }}>Danh sách mua sắm</h3>
                  <button
                    onClick={handleClearChecked}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Xóa mục đã mua
                  </button>
                </div>

                {shoppingList.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#666',
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
                    <p>Chưa có nguyên liệu nào</p>
                    <p style={{ fontSize: '14px' }}>
                      Thêm món vào lịch tuần và tạo danh sách mua sắm
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {shoppingList.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '16px',
                          borderRadius: '12px',
                          backgroundColor: item.checked ? '#f9f9f9' : '#fff',
                          border: '1px solid #eee',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggleItem(item.ingredient)}
                          style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontWeight: 'bold',
                            textDecoration: item.checked ? 'line-through' : 'none',
                            color: item.checked ? '#999' : '#333',
                          }}>
                            {item.ingredient}
                          </div>
                          {item.quantity && (
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#666',
                              marginTop: '4px',
                            }}>
                              {item.quantity}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlannerModal;
