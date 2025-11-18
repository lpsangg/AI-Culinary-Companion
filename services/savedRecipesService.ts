/**
 * Service to manage saved/bookmarked recipes
 * Uses localStorage for now, can be synced with Supabase later
 */

const SAVED_RECIPES_KEY = 'saved_recipes';

export interface SavedRecipe {
  recipeId: number;
  savedAt: string;
}

export class SavedRecipesService {
  /**
   * Get all saved recipe IDs for current user
   */
  static getSavedRecipes(): number[] {
    try {
      const saved = localStorage.getItem(SAVED_RECIPES_KEY);
      if (!saved) return [];
      
      const recipes: SavedRecipe[] = JSON.parse(saved);
      return recipes.map(r => r.recipeId);
    } catch (error) {
      console.error('Error getting saved recipes:', error);
      return [];
    }
  }

  /**
   * Check if a recipe is saved
   */
  static isRecipeSaved(recipeId: number): boolean {
    const savedIds = this.getSavedRecipes();
    return savedIds.includes(recipeId);
  }

  /**
   * Toggle save/unsave a recipe
   */
  static toggleSaveRecipe(recipeId: number): boolean {
    try {
      const saved = localStorage.getItem(SAVED_RECIPES_KEY);
      let recipes: SavedRecipe[] = saved ? JSON.parse(saved) : [];

      const index = recipes.findIndex(r => r.recipeId === recipeId);
      
      if (index >= 0) {
        // Already saved, remove it
        recipes.splice(index, 1);
        localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(recipes));
        return false; // Not saved anymore
      } else {
        // Not saved, add it
        recipes.push({
          recipeId,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(recipes));
        return true; // Now saved
      }
    } catch (error) {
      console.error('Error toggling saved recipe:', error);
      return false;
    }
  }

  /**
   * Save a recipe
   */
  static saveRecipe(recipeId: number): void {
    if (!this.isRecipeSaved(recipeId)) {
      this.toggleSaveRecipe(recipeId);
    }
  }

  /**
   * Unsave a recipe
   */
  static unsaveRecipe(recipeId: number): void {
    if (this.isRecipeSaved(recipeId)) {
      this.toggleSaveRecipe(recipeId);
    }
  }

  /**
   * Get all saved recipes with full details
   */
  static getSavedRecipesWithDetails(): SavedRecipe[] {
    try {
      const saved = localStorage.getItem(SAVED_RECIPES_KEY);
      if (!saved) return [];
      
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error getting saved recipes details:', error);
      return [];
    }
  }

  /**
   * Clear all saved recipes
   */
  static clearAll(): void {
    localStorage.removeItem(SAVED_RECIPES_KEY);
  }
}
