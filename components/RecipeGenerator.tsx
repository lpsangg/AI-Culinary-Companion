import React, { useState } from 'react';

interface RecipeGeneratorProps {
    onGenerate: (prompt: string) => void;
    isGenerating: boolean;
}

export const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({ onGenerate, isGenerating }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = () => {
        if (prompt.trim()) {
            onGenerate(prompt);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg mb-8 bg-gradient-to-br from-orange-50 to-red-50">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Tìm kiếm công thức bằng AI</h2>
            <p className="text-gray-600 mb-4">Bạn muốn nấu món gì hôm nay? Hãy cho tôi biết ý tưởng, tôi sẽ tạo ra công thức cho bạn!</p>
            <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ví dụ: gà xào sả ớt, món gì nhanh gọn với trứng và thịt bò, một món salad..."
                    className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out min-h-[50px] sm:min-h-0"
                    rows={2}
                    disabled={isGenerating}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isGenerating || !prompt.trim()}
                    className="flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-bold rounded-md shadow-md hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang tìm kiếm...
                        </>
                    ) : (
                        "Tìm kiếm công thức"
                    )}
                </button>
            </div>
        </div>
    );
};
