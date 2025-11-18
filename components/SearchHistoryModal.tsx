import React, { useState, useEffect } from 'react';
import { SearchHistoryService, SearchHistoryItem } from '../services/searchHistoryService';

interface SearchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSelectPrompt?: (prompt: string) => void;
}

const SearchHistoryModal: React.FC<SearchHistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  userId,
  onSelectPrompt 
}) => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    const handleHistoryChange = () => {
      loadHistory();
    };

    window.addEventListener('searchHistoryChanged', handleHistoryChange);
    return () => {
      window.removeEventListener('searchHistoryChanged', handleHistoryChange);
    };
  }, [userId]);

  const loadHistory = () => {
    const userHistory = SearchHistoryService.getHistory(userId);
    setHistory(userHistory);
  };

  const handleDelete = (itemId: string) => {
    SearchHistoryService.removeItem(itemId);
  };

  const handleClearAll = () => {
    if (window.confirm('Xóa toàn bộ lịch sử tìm kiếm?')) {
      SearchHistoryService.clearUserHistory(userId);
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '24px',
          borderBottom: '1px solid #eee',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              Lịch sử tìm kiếm AI
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px',
                color: '#666',
              }}
            >
              ✕
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #ef4444',
                background: '#fff',
                color: '#ef4444',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
        }}>
          {history.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#666',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p style={{ fontSize: '16px', margin: 0 }}>
                Chưa có lịch sử tìm kiếm
              </p>
              <p style={{ fontSize: '14px', marginTop: '8px', color: '#999' }}>
                Tìm kiếm món ăn bằng AI để lưu lại lịch sử
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #e5e5e5',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                    e.currentTarget.style.borderColor = '#d0d0d0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                    e.currentTarget.style.borderColor = '#e5e5e5';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      {/* Prompt */}
                      <div
                        onClick={() => handleSelectPrompt(item.prompt)}
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '8px',
                          cursor: onSelectPrompt ? 'pointer' : 'default',
                        }}
                        onMouseEnter={(e) => {
                          if (onSelectPrompt) {
                            e.currentTarget.style.color = '#FF6B6B';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#333';
                        }}
                      >
                        "{item.prompt}"
                      </div>

                      {/* Recipe Name nếu có */}
                      {item.recipeName && (
                        <div style={{
                          fontSize: '14px',
                          color: '#10b981',
                          marginBottom: '4px',
                          fontWeight: '500',
                        }}>
                          → {item.recipeName}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {SearchHistoryService.formatTimestamp(item.timestamp)}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#999',
                        fontSize: '18px',
                        marginLeft: '12px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#999';
                      }}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchHistoryModal;
