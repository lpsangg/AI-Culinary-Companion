
import React from 'react';

interface SuggestionTagProps {
    text: string;
    onClick: () => void;
}

export const SuggestionTag: React.FC<SuggestionTagProps> = ({ text, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="px-3 py-1 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-700 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
            {text}
        </button>
    );
};
