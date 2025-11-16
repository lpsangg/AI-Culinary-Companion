
export const REGIONS = ['Miền Bắc', 'Miền Trung', 'Miền Nam', 'Nhật Bản', 'Hàn Quốc', 'Địa Trung Hải'] as const;
export const MAIN_INGREDIENTS = ['Thịt heo', 'Rau củ', 'Trứng', 'Nấm', 'Hải sản', 'Thịt bò', 'Gà'] as const;
export const COOKING_METHODS = ['Chiên', 'Xào', 'Hấp', 'Nướng', 'Om', 'Luộc'] as const;
export const TASTES = ['Mặn', 'Ngọt', 'Chua cay'] as const;
export const OCCASIONS = ['Tiệc gia đình', 'Ăn sáng', 'Tiết kiệm thời gian', 'Ăn healthy', 'Bữa tối'] as const;
export const SPICE_LEVELS = ['Không cay', 'Cay nhẹ', 'Cay nồng'] as const;
export const DIET_STYLES = ['Thông thường', 'Ít dầu mỡ / Healthy', 'Ăn chay'] as const;


export enum FilterCategory {
    REGION = 'region',
    INGREDIENT = 'mainIngredient',
    METHOD = 'method',
    TASTE = 'taste',
    OCCASION = 'occasion',
    SPICE = 'spiceLevel',
    DIET = 'dietStyle',
}