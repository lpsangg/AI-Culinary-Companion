// Rate limiter để chống spam API
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = { maxRequests: 5, windowMs: 60000 }) {
    this.config = config;
  }

  /**
   * Kiểm tra xem request có được phép không
   * @param key - Identifier (ví dụ: IP, session ID, hoặc 'global')
   * @returns true nếu được phép, false nếu đã vượt giới hạn
   */
  checkLimit(key: string = 'global'): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const record = this.requests.get(key);

    // Nếu chưa có record hoặc đã hết thời gian window
    if (!record || now >= record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return { allowed: true };
    }

    // Nếu còn trong window và chưa vượt giới hạn
    if (record.count < this.config.maxRequests) {
      record.count++;
      return { allowed: true };
    }

    // Đã vượt giới hạn
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  /**
   * Reset counter cho một key cụ thể
   */
  reset(key: string = 'global'): void {
    this.requests.delete(key);
  }

  /**
   * Cleanup các records đã hết hạn
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now >= record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Export singleton instance
// Cấu hình: 5 requests / phút cho recipe generation
export const recipeGenerationLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60000 // 1 phút
});

// Cấu hình: 10 requests / phút cho AI chat
export const chatLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60000 // 1 phút
});

// Cleanup mỗi 5 phút
setInterval(() => {
  recipeGenerationLimiter.cleanup();
  chatLimiter.cleanup();
}, 300000);
