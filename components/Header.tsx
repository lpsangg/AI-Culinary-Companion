import React, { useState, useEffect } from 'react';
import type { Filters } from '../types';
import { FilterCategory } from '../constants';
import { SuggestionTag } from './SuggestionTag';
import { AuthModal } from './AuthModal';
import { SupabaseAuthService, type AuthUser } from '../services/supabaseAuthService';

interface NavbarProps {
    onSuggestionClick: (category: keyof Omit<Filters, 'searchQuery'>, value: string) => void;
    onShowSaved?: () => void;
    savedCount?: number;
    currentUser?: AuthUser | null;
    onShowAuthModal?: () => void;
    onShowMealPlanner?: () => void;
    onShowSearchHistory?: () => void;
    onBackHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onSuggestionClick, 
  onShowSaved, 
  savedCount = 0,
  currentUser: externalUser,
  onShowAuthModal: externalShowAuthModal,
  onShowMealPlanner,
  onShowSearchHistory,
  onBackHome
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(externalUser || null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check if user is logged in on mount and listen to auth changes
  useEffect(() => {
    // Use external user if provided
    if (externalUser !== undefined) {
      setCurrentUser(externalUser);
      return;
    }

    // Get current session
    SupabaseAuthService.getCurrentUser().then(user => {
      setCurrentUser(user);
    });

    // Listen to auth state changes
    const { data: { subscription } } = SupabaseAuthService.onAuthStateChange((user) => {
      setCurrentUser(user);
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, [externalUser]);

  const handleUserClick = () => {
    if (currentUser) {
      setShowUserMenu(!showUserMenu);
    } else {
      if (externalShowAuthModal) {
        externalShowAuthModal();
      } else {
        setShowAuthModal(true);
      }
    }
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await SupabaseAuthService.signOut();
    setCurrentUser(null);
    setShowUserMenu(false);
  };

  const handleShowSaved = () => {
    if (!currentUser) {
      // Require login to view saved recipes
      if (externalShowAuthModal) {
        externalShowAuthModal();
      } else {
        setShowAuthModal(true);
      }
      return;
    }
    onShowSaved?.();
  };

  const handleShowMealPlanner = () => {
    if (!currentUser) {
      // Require login to use meal planner
      if (externalShowAuthModal) {
        externalShowAuthModal();
      } else {
        setShowAuthModal(true);
      }
      return;
    }
    onShowMealPlanner?.();
  };

  const handleLogoClick = () => {
    if (onBackHome) {
      onBackHome();
    }
  };

  return (
    <>
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
            {/* Left Side: Logo and Title */}
            <div 
                className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition"
                onClick={handleLogoClick}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.382 13.344C21.118 12.517 20.323 12 19.5 12h-1.429c-.255 0-.49.12-.642.329l-1.139 1.518a2.5 2.5 0 01-4.28 0l-1.139-1.518A.75.75 0 0010.23 12H8.5a2.5 2.5 0 00-2.5 2.5V17h1.071a.75.75 0 00.642-.329l1.139-1.518a2.5 2.5 0 014.28 0l1.139 1.518a.75.75 0 00.642.329H18v-2.5a2.5 2.5 0 00-2.5-2.5h-1.429c-.255 0-.49.12-.642.329l-.693.924a.75.75 0 01-1.272 0l-.693-.924A.75.75 0 0010.23 12H8.5a2.5 2.5 0 00-2.5 2.5v4H5a1 1 0 00-1 1v1a1 1 0 001 1h14a1 1 0 001-1v-1a1 1 0 00-1-1h-1v-4c0-.463.125-.904.357-1.285L19.5 7h-1a1 1 0 100 2h.167l-1.758 4.688a1.001 1.001 0 001.564 1.176l.309-.231c.264-.827 1.059-1.344 1.9-1.344h.318zm-7.69-5.143a3.5 3.5 0 10-4.95 0 3.5 3.5 0 004.95 0z" />
                </svg>
                <h1 className="hidden sm:block text-2xl font-bold text-gray-800 tracking-tight">Nấu ăn mỗi ngày</h1>
            </div>

            {/* Center: Suggestions */}
            <div className="hidden md:flex items-center justify-center space-x-3 text-sm flex-1">
                <span className="text-gray-600 font-semibold">Thử ngay:</span>
                <SuggestionTag text="Tiết kiệm thời gian" onClick={() => onSuggestionClick(FilterCategory.OCCASION, 'Tiết kiệm thời gian')} />
                <SuggestionTag text="Ăn healthy" onClick={() => onSuggestionClick(FilterCategory.OCCASION, 'Ăn healthy')} />
                <SuggestionTag text="Món Miền Nam" onClick={() => onSuggestionClick(FilterCategory.REGION, 'Miền Nam')} />
                <SuggestionTag text="Món nướng" onClick={() => onSuggestionClick(FilterCategory.METHOD, 'Nướng')} />
            </div>

            {/* Right Side: User Profile */}
            <div className="flex-shrink-0 flex items-center space-x-3 relative">
                {/* Meal Planner Button */}
                {onShowMealPlanner && (
                  <button
                    onClick={handleShowMealPlanner}
                    className="relative p-2 hover:bg-gray-100 rounded-full transition"
                    title={currentUser ? "Lên kế hoạch ăn tuần" : "Đăng nhập để lập kế hoạch"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
                
                {/* Saved Recipes Button */}
                {onShowSaved && (
                  <button
                    onClick={handleShowSaved}
                    className="relative p-2 hover:bg-gray-100 rounded-full transition"
                    title={currentUser ? "Món đã lưu" : "Đăng nhập để xem món đã lưu"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {currentUser && savedCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {savedCount > 99 ? '99+' : savedCount}
                      </span>
                    )}
                  </button>
                )}
                
                {/* User Profile Button */}
                <button 
                    onClick={handleUserClick}
                    className="flex items-center space-x-2 h-10 px-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-full text-white hover:from-orange-500 hover:to-red-600 transition shadow-md"
                >
                    <div className="h-7 w-7 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        {currentUser ? (
                            <span className="font-bold text-sm">{currentUser.name.charAt(0).toUpperCase()}</span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                    {currentUser && (
                        <span className="font-semibold text-sm pr-1 hidden sm:block">{currentUser.name}</span>
                    )}
                </button>

                {/* User Menu Dropdown */}
                {currentUser && showUserMenu && (
                    <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-56 z-50 animate-fade-in-up">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowUserMenu(false);
                                onShowSearchHistory?.();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                            Lịch sử tìm kiếm AI
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </header>
    </>
  );
};