# Utils - Anti-Spam Protection

Thư mục này chứa các utility functions để bảo vệ API khỏi spam và abuse.

## Rate Limiter

**File**: `rateLimiter.ts`

### Cách hoạt động:
- Giới hạn số lần gọi API trong một khoảng thời gian
- Sử dụng sliding window algorithm
- Tự động cleanup các records đã hết hạn

### Cấu hình hiện tại:
```typescript
// Recipe Generation: 5 requests / phút
recipeGenerationLimiter

// AI Chat: 10 requests / phút  
chatLimiter
```

### Sử dụng:
```typescript
import { recipeGenerationLimiter } from './utils/rateLimiter';

const limitCheck = recipeGenerationLimiter.checkLimit();
if (!limitCheck.allowed) {
  alert(`Vui lòng đợi ${limitCheck.retryAfter} giây`);
  return;
}
```

## Debounce & Throttle

**File**: `debounce.ts`

### Debounce
Delay thực thi cho đến khi user ngừng action.

```typescript
import { debounce } from './utils/debounce';

const debouncedSearch = debounce((query) => {
  // Search logic
}, 500);
```

### Throttle
Giới hạn thực thi không quá 1 lần trong khoảng thời gian.

```typescript
import { throttle } from './utils/debounce';

const throttledSubmit = throttle(() => {
  // Submit logic
}, 1000);
```

## Các biện pháp chống spam đã implement:

### ✅ 1. Rate Limiting
- Recipe Generation: tối đa 5 lần/phút
- AI Chat: tối đa 10 lần/phút
- Hiển thị thông báo cho user biết thời gian cần đợi

### ✅ 2. Throttle
- Nút "Gửi" trong chat chỉ hoạt động 1 lần/giây
- Tránh spam click liên tục

### ✅ 3. Disable State
- Disable input và button khi đang xử lý
- Visual feedback (spinner icon)
- Người dùng không thể submit nhiều lần

### ✅ 4. Validation
- Kiểm tra prompt không rỗng trước khi gọi API
- AI tự động từ chối yêu cầu không liên quan ẩm thực

### 📊 Giới hạn Gemini API:
- **Free tier**: 15 requests/phút, 1500 requests/ngày
- **Rate limit của app**: An toàn hơn để tránh vượt quota

## Tùy chỉnh giới hạn

Để thay đổi giới hạn, sửa trong `rateLimiter.ts`:

```typescript
export const recipeGenerationLimiter = new RateLimiter({
  maxRequests: 10,  // Tăng lên 10 requests
  windowMs: 120000  // Trong 2 phút
});
```
