/**
 * AI Search History Service - Quản lý lịch sử tìm kiếm AI
 * Lưu theo user ID để mỗi user có lịch sử riêng
 */

import type { Recipe } from '../types';

export interface SearchHistoryItem {
  id: string;
  prompt: string;
  timestamp: string;
  userId?: string;
  recipe: Recipe; // Lưu toàn bộ recipe object
}

const SEARCH_HISTORY_KEY = 'ai_search_history';
const MAX_HISTORY_ITEMS = 50; // Giới hạn số lượng

export class SearchHistoryService {
  /**
   * Lấy lịch sử tìm kiếm của user
   */
  static getHistory(userId?: string): SearchHistoryItem[] {
    try {
      const data = localStorage.getItem(SEARCH_HISTORY_KEY);
      const allHistory: SearchHistoryItem[] = data ? JSON.parse(data) : [];
      
      // Lọc theo userId nếu có
      if (userId) {
        return allHistory.filter(item => item.userId === userId);
      }
      
      return allHistory;
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  /**
   * Thêm một tìm kiếm mới vào lịch sử
   */
  static addSearch(
    prompt: string, 
    userId: string,
    recipe: Recipe
  ): boolean {
    try {
      const allHistory = this.getAllHistory();
      
      const newItem: SearchHistoryItem = {
        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        prompt,
        timestamp: new Date().toISOString(),
        userId,
        recipe,
      };
      
      // Thêm vào đầu array (mới nhất ở đầu)
      allHistory.unshift(newItem);
      
      // Giới hạn số lượng
      if (allHistory.length > MAX_HISTORY_ITEMS) {
        allHistory.splice(MAX_HISTORY_ITEMS);
      }
      
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(allHistory));
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('searchHistoryChanged'));
      
      return true;
    } catch (error) {
      console.error('Error adding search history:', error);
      return false;
    }
  }

  /**
   * Xóa một item khỏi lịch sử
   */
  static removeItem(itemId: string): boolean {
    try {
      const allHistory = this.getAllHistory();
      const filtered = allHistory.filter(item => item.id !== itemId);
      
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('searchHistoryChanged'));
      
      return true;
    } catch (error) {
      console.error('Error removing search history item:', error);
      return false;
    }
  }

  /**
   * Xóa toàn bộ lịch sử của user
   */
  static clearUserHistory(userId: string): boolean {
    try {
      const allHistory = this.getAllHistory();
      const filtered = allHistory.filter(item => item.userId !== userId);
      
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('searchHistoryChanged'));
      
      return true;
    } catch (error) {
      console.error('Error clearing user history:', error);
      return false;
    }
  }

  /**
   * Xóa tất cả lịch sử
   */
  static clearAll(): void {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    window.dispatchEvent(new CustomEvent('searchHistoryChanged'));
  }

  /**
   * Lấy toàn bộ lịch sử (private helper)
   */
  private static getAllHistory(): SearchHistoryItem[] {
    try {
      const data = localStorage.getItem(SEARCH_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all history:', error);
      return [];
    }
  }

  /**
   * Format timestamp để hiển thị
   */
  static formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Lấy số lượng lịch sử của user
   */
  static getCount(userId?: string): number {
    return this.getHistory(userId).length;
  }
}
