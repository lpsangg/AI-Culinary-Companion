
import React from 'react';
import type { Filters } from '../types';
import { REGIONS, MAIN_INGREDIENTS, COOKING_METHODS, TASTES, OCCASIONS, FilterCategory, SPICE_LEVELS, DIET_STYLES } from '../constants';

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (category: keyof Filters, value: string) => void;
}

const FilterSelect: React.FC<{
  label: string;
  value: string;
  options: readonly string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
    >
      <option value="all">Tất cả</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);


export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Bộ lọc chi tiết</h3>
      
      <FilterSelect
        label="Vùng miền"
        value={filters.region}
        options={REGIONS}
        onChange={(e) => onFilterChange(FilterCategory.REGION, e.target.value)}
      />
      <FilterSelect
        label="Nguyên liệu chính"
        value={filters.mainIngredient}
        options={MAIN_INGREDIENTS}
        onChange={(e) => onFilterChange(FilterCategory.INGREDIENT, e.target.value)}
      />
       <FilterSelect
        label="Phong cách ăn"
        value={filters.dietStyle}
        options={DIET_STYLES}
        onChange={(e) => onFilterChange(FilterCategory.DIET, e.target.value)}
      />
       <FilterSelect
        label="Mức độ cay"
        value={filters.spiceLevel}
        options={SPICE_LEVELS}
        onChange={(e) => onFilterChange(FilterCategory.SPICE, e.target.value)}
      />
      <FilterSelect
        label="Phương pháp"
        value={filters.method}
        options={COOKING_METHODS}
        onChange={(e) => onFilterChange(FilterCategory.METHOD, e.target.value)}
      />
       <FilterSelect
        label="Khẩu vị"
        value={filters.taste}
        options={TASTES}
        onChange={(e) => onFilterChange(FilterCategory.TASTE, e.target.value)}
      />
       <FilterSelect
        label="Dịp / Tình huống"
        value={filters.occasion}
        options={OCCASIONS}
        onChange={(e) => onFilterChange(FilterCategory.OCCASION, e.target.value)}
      />
    </div>
  );
};