
import type { REGIONS, MAIN_INGREDIENTS, COOKING_METHODS, TASTES, OCCASIONS, SPICE_LEVELS, DIET_STYLES } from './constants';
import { FilterCategory } from './constants';

export type Region = typeof REGIONS[number];
export type MainIngredient = typeof MAIN_INGREDIENTS[number];
export type CookingMethod = typeof COOKING_METHODS[number];
export type Taste = typeof TASTES[number];
export type Occasion = typeof OCCASIONS[number];
export type SpiceLevel = typeof SPICE_LEVELS[number];
export type DietStyle = typeof DIET_STYLES[number];

export interface IngredientItem {
  name: string;
  quantity: string;
}

export interface RecipeStep {
  description: string;
  image?: string;
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  image: string;
  servings: number;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  region: Region;
  mainIngredient: MainIngredient;
  method: CookingMethod;
  taste: Taste;
  occasion: Occasion[];
  spiceLevel: SpiceLevel;
  dietStyle: DietStyle;
  ingredients: IngredientItem[];
  steps: RecipeStep[];
  tips: string[];
}

export interface Filters {
  [FilterCategory.REGION]: Region | 'all';
  [FilterCategory.INGREDIENT]: MainIngredient | 'all';
  [FilterCategory.METHOD]: CookingMethod | 'all';
  [FilterCategory.TASTE]: Taste | 'all';
  [FilterCategory.OCCASION]: Occasion | 'all';
  [FilterCategory.SPICE]: SpiceLevel | 'all';
  [FilterCategory.DIET]: DietStyle | 'all';
}
// FIX: Add ChatMessage interface to be used in AiChat.tsx
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}