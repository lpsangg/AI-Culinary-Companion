/**
 * Meal Planner Service - Lên kế hoạch ăn tuần
 * Data stored in localStorage, can be synced to Supabase later
 */

export interface MealPlan {
  id: string;
  userId?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: number;
  recipeName: string;
  servings: number;
  createdAt: string;
}

export interface ShoppingListItem {
  ingredient: string;
  quantity: string;
  checked: boolean;
  recipeIds: number[]; // Track which recipes need this ingredient
}

const MEAL_PLAN_KEY = 'meal_plans';
const SHOPPING_LIST_KEY = 'shopping_list';

export class MealPlannerService {
  /**
   * Get all meal plans
   */
  static getMealPlans(): MealPlan[] {
    try {
      const data = localStorage.getItem(MEAL_PLAN_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting meal plans:', error);
      return [];
    }
  }

  /**
   * Get meal plans for a specific date
   */
  static getMealPlansForDate(date: string): MealPlan[] {
    const allPlans = this.getMealPlans();
    return allPlans.filter(plan => plan.date === date);
  }

  /**
   * Get meal plans for a week (7 days from startDate)
   */
  static getMealPlansForWeek(startDate: Date): Map<string, MealPlan[]> {
    const weekPlans = new Map<string, MealPlan[]>();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      weekPlans.set(dateStr, this.getMealPlansForDate(dateStr));
    }
    
    return weekPlans;
  }

  /**
   * Add a meal to plan
   */
  static addMealPlan(plan: Omit<MealPlan, 'id' | 'createdAt'>): MealPlan {
    const plans = this.getMealPlans();
    
    const newPlan: MealPlan = {
      ...plan,
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    plans.push(newPlan);
    localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plans));
    
    return newPlan;
  }

  /**
   * Remove a meal from plan
   */
  static removeMealPlan(planId: string): boolean {
    try {
      const plans = this.getMealPlans();
      const filtered = plans.filter(p => p.id !== planId);
      localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing meal plan:', error);
      return false;
    }
  }

  /**
   * Update meal plan servings
   */
  static updateMealPlanServings(planId: string, servings: number): boolean {
    try {
      const plans = this.getMealPlans();
      const plan = plans.find(p => p.id === planId);
      
      if (plan) {
        plan.servings = servings;
        localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plans));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating meal plan:', error);
      return false;
    }
  }

  /**
   * Generate shopping list from meal plans
   */
  static generateShoppingList(recipes: any[]): ShoppingListItem[] {
    const plans = this.getMealPlans();
    const ingredientMap = new Map<string, ShoppingListItem>();

    plans.forEach(plan => {
      const recipe = recipes.find(r => r.id === plan.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach((ing: any) => {
        const ingredientName = typeof ing === 'string' ? ing : ing.name;
        const quantity = typeof ing === 'string' ? '' : ing.quantity || '';

        const key = ingredientName.toLowerCase();
        
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          if (!existing.recipeIds.includes(plan.recipeId)) {
            existing.recipeIds.push(plan.recipeId);
          }
          // TODO: Smart quantity aggregation (e.g., 200g + 300g = 500g)
          if (quantity && !existing.quantity.includes(quantity)) {
            existing.quantity += `, ${quantity}`;
          }
        } else {
          ingredientMap.set(key, {
            ingredient: ingredientName,
            quantity: quantity,
            checked: false,
            recipeIds: [plan.recipeId],
          });
        }
      });
    });

    return Array.from(ingredientMap.values());
  }

  /**
   * Get saved shopping list
   */
  static getShoppingList(): ShoppingListItem[] {
    try {
      const data = localStorage.getItem(SHOPPING_LIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting shopping list:', error);
      return [];
    }
  }

  /**
   * Save shopping list
   */
  static saveShoppingList(items: ShoppingListItem[]): void {
    localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(items));
  }

  /**
   * Toggle shopping list item checked status
   */
  static toggleShoppingListItem(ingredient: string): boolean {
    const items = this.getShoppingList();
    const item = items.find(i => i.ingredient === ingredient);
    
    if (item) {
      item.checked = !item.checked;
      this.saveShoppingList(items);
      return item.checked;
    }
    return false;
  }

  /**
   * Clear all checked items from shopping list
   */
  static clearCheckedItems(): void {
    const items = this.getShoppingList();
    const unchecked = items.filter(i => !i.checked);
    this.saveShoppingList(unchecked);
  }

  /**
   * Clear all data
   */
  static clearAll(): void {
    localStorage.removeItem(MEAL_PLAN_KEY);
    localStorage.removeItem(SHOPPING_LIST_KEY);
  }

  /**
   * Get week date range
   */
  static getWeekDates(startDate: Date): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'short', 
      month: 'numeric', 
      day: 'numeric' 
    });
  }

  /**
   * Get ISO date string (YYYY-MM-DD)
   */
  static getISODate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get start of week (Monday)
   */
  static getStartOfWeek(date: Date = new Date()): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  }
}
