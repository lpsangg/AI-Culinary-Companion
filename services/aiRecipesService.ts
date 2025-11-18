/**
 * AI Recipes Service - Quản lý công thức do AI tạo
 * Lưu vào localStorage và merge với mock data
 */

import type { Recipe } from '../types';

const AI_RECIPES_KEY = 'ai_generated_recipes';

export class AiRecipesService {
  /**
   * Lấy tất cả công thức AI đã lưu
   */
  static getAiRecipes(): Recipe[] {
    try {
      const data = localStorage.getItem(AI_RECIPES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting AI recipes:', error);
      return [];
    }
  }

  /**
   * Thêm công thức AI mới
   */
  static addAiRecipe(recipe: Recipe): boolean {
    try {
      const recipes = this.getAiRecipes();
      
      // Kiểm tra trùng lặp theo ID
      const exists = recipes.some(r => r.id === recipe.id);
      if (exists) {
        console.warn('Recipe with this ID already exists');
        return false;
      }

      recipes.push(recipe);
      localStorage.setItem(AI_RECIPES_KEY, JSON.stringify(recipes));
      
      // Dispatch event để các component khác cập nhật
      window.dispatchEvent(new CustomEvent('aiRecipesChanged'));
      
      return true;
    } catch (error) {
      console.error('Error adding AI recipe:', error);
      return false;
    }
  }

  /**
   * Xóa công thức AI
   */
  static removeAiRecipe(recipeId: number): boolean {
    try {
      const recipes = this.getAiRecipes();
      const filtered = recipes.filter(r => r.id !== recipeId);
      
      localStorage.setItem(AI_RECIPES_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('aiRecipesChanged'));
      
      return true;
    } catch (error) {
      console.error('Error removing AI recipe:', error);
      return false;
    }
  }

  /**
   * Kiểm tra xem recipe có phải do AI tạo không
   */
  static isAiRecipe(recipeId: number): boolean {
    const recipes = this.getAiRecipes();
    return recipes.some(r => r.id === recipeId);
  }

  /**
   * Lấy số lượng công thức AI
   */
  static getCount(): number {
    return this.getAiRecipes().length;
  }

  /**
   * Xóa tất cả công thức AI
   */
  static clearAll(): void {
    localStorage.removeItem(AI_RECIPES_KEY);
    window.dispatchEvent(new CustomEvent('aiRecipesChanged'));
  }

  /**
   * Merge AI recipes với mock data
   */
  static mergeWithMockData(mockRecipes: Recipe[]): Recipe[] {
    const aiRecipes = this.getAiRecipes();
    
    // Đảm bảo không trùng ID
    const mockIds = new Set(mockRecipes.map(r => r.id));
    const uniqueAiRecipes = aiRecipes.filter(r => !mockIds.has(r.id));
    
    // AI recipes ở đầu để hiển thị trước
    return [...uniqueAiRecipes, ...mockRecipes];
  }

  /**
   * Generate unique ID for AI recipe
   */
  static generateUniqueId(existingRecipes: Recipe[]): number {
    const existingIds = new Set([
      ...existingRecipes.map(r => r.id),
      ...this.getAiRecipes().map(r => r.id)
    ]);
    
    // Bắt đầu từ ID cao để tránh conflict với mock data
    let newId = 10000;
    while (existingIds.has(newId)) {
      newId++;
    }
    
    return newId;
  }
}
