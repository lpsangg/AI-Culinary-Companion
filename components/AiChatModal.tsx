import React from 'react';

interface AiChatModalProps {
    onClose: () => void;
    children: React.ReactNode;
}

export const AiChatModal: React.FC<AiChatModalProps> = ({ onClose, children }) => {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-end p-0 sm:items-center sm:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg h-[85vh] sm:h-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};
