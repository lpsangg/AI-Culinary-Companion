import React from 'react';

interface AiChatBubbleProps {
    onClick: () => void;
}

export const AiChatBubble: React.FC<AiChatBubbleProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform duration-200"
            aria-label="Open AI Chef Assistant"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 011.5 1.5v1.25a1 1 0 001 1h.25a1.5 1.5 0 011.5 1.5v.5a1 1 0 001 1h.5a1.5 1.5 0 010 3h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-1.5 1.5h-.25a1 1 0 00-1 1v1.25a1.5 1.5 0 01-1.5 1.5h-.5a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 01-1.5-1.5v-1.25a1 1 0 00-1-1h-.25a1.5 1.5 0 01-1.5-1.5v-.5a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3h.5a1 1 0 001-1v-.5a1.5 1.5 0 011.5-1.5h.25a1 1 0 001-1V3.5z" />
            </svg>
        </button>
    );
};