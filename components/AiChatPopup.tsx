import React from 'react';

interface AiChatPopupProps {
    children: React.ReactNode;
}

export const AiChatPopup: React.FC<AiChatPopupProps> = ({ children }) => {
    return (
        <div
            className="hidden lg:block fixed bottom-6 right-6 z-50 w-96 h-[32rem] animate-fade-in-up"
            aria-modal="true"
            role="dialog"
        >
            <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
               {children}
            </div>
        </div>
    );
};
