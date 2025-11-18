# 📚 Hướng dẫn: Hệ thống tự động lưu công thức AI

## 🎯 Tổng quan

Khi người dùng tạo công thức mới bằng AI, hệ thống sẽ **tự động lưu** công thức đó vào **localStorage** của trình duyệt và **merge** với dữ liệu mock có sẵn. Công thức AI sẽ xuất hiện ngay trong danh sách và được lưu vĩnh viễn (trừ khi user xóa cache trình duyệt).

---

## 🔄 Quy trình hoạt động chi tiết

### **Bước 1: User tạo công thức AI**
```
User nhập prompt → Click "Tạo công thức AI" → Gemini API xử lý
```

### **Bước 2: AI trả về dữ liệu**
Gemini API trả về object Recipe:
```typescript
{
  name: "Phở gà nấm",
  description: "Món phở thanh đạm...",
  ingredients: [
    { name: "Gà", quantity: "500g" },
    { name: "Nấm", quantity: "200g" }
  ],
  steps: [...],
  // ... các thuộc tính khác
}
```

### **Bước 3: Generate ID duy nhất**
```typescript
// Trong App.tsx - handleGenerateRecipe()

// Tạo ID từ 10000 trở đi để tránh trùng với mock data (ID 1-100)
const uniqueId = AiRecipesService.generateUniqueId(recipes);
// uniqueId = 10000 (lần đầu), 10001 (lần 2), 10002 (lần 3)...

const aiRecipe = {
  ...generatedRecipe,
  id: uniqueId  // Gán ID mới
};
```

**Logic generate ID:**
```typescript
// Trong aiRecipesService.ts
generateUniqueId(existingRecipes: Recipe[]): number {
  // Lấy tất cả ID đang dùng
  const existingIds = new Set([
    ...existingRecipes.map(r => r.id),      // Mock data IDs
    ...this.getAiRecipes().map(r => r.id)   // AI recipes IDs
  ]);
  
  // Bắt đầu từ 10000
  let newId = 10000;
  
  // Tăng dần cho đến khi tìm được ID chưa dùng
  while (existingIds.has(newId)) {
    newId++;
  }
  
  return newId; // 10000, 10001, 10002...
}
```

### **Bước 4: Lưu vào localStorage**
```typescript
// Trong App.tsx
const saved = AiRecipesService.addAiRecipe(aiRecipe);
```

**Trong AiRecipesService:**
```typescript
addAiRecipe(recipe: Recipe): boolean {
  // 1. Lấy danh sách AI recipes hiện tại
  const recipes = this.getAiRecipes(); // [] hoặc [...existing]
  
  // 2. Kiểm tra trùng ID
  const exists = recipes.some(r => r.id === recipe.id);
  if (exists) return false;
  
  // 3. Thêm recipe mới
  recipes.push(recipe);
  
  // 4. Lưu vào localStorage
  localStorage.setItem('ai_generated_recipes', JSON.stringify(recipes));
  
  // 5. Thông báo cho các component khác
  window.dispatchEvent(new CustomEvent('aiRecipesChanged'));
  
  return true;
}
```

**Dữ liệu trong localStorage:**
```json
// Key: "ai_generated_recipes"
[
  {
    "id": 10000,
    "name": "Phở gà nấm",
    "description": "...",
    "ingredients": [...],
    "steps": [...],
    "cookTime": 30,
    "prepTime": 15,
    "servings": 2
  },
  {
    "id": 10001,
    "name": "Bún bò Huế chay",
    "description": "...",
    "ingredients": [...],
    "steps": [...]
  }
]
```

### **Bước 5: Merge với Mock Data**
```typescript
// Trong App.tsx - khởi tạo state
const [recipes, setRecipes] = useState<Recipe[]>(() => {
  const merged = AiRecipesService.mergeWithMockData(RECIPES);
  return shuffleArray([...merged]);
});
```

**Logic merge:**
```typescript
// Trong aiRecipesService.ts
mergeWithMockData(mockRecipes: Recipe[]): Recipe[] {
  // 1. Lấy AI recipes từ localStorage
  const aiRecipes = this.getAiRecipes(); // [recipe 10000, 10001...]
  
  // 2. Lấy tất cả ID của mock data
  const mockIds = new Set(mockRecipes.map(r => r.id)); // Set {1, 2, 3...100}
  
  // 3. Lọc bỏ AI recipes có ID trùng (phòng trường hợp conflict)
  const uniqueAiRecipes = aiRecipes.filter(r => !mockIds.has(r.id));
  
  // 4. AI recipes ở TRƯỚC để hiển thị đầu tiên
  return [...uniqueAiRecipes, ...mockRecipes];
  //      [10000, 10001]  +  [1, 2, 3...100]
}
```

**Kết quả:**
```
Danh sách recipes cuối cùng = [
  { id: 10000, name: "Phở gà nấm" },      // AI recipe 1
  { id: 10001, name: "Bún bò Huế" },      // AI recipe 2
  { id: 1, name: "Phở bò" },               // Mock data
  { id: 2, name: "Bún chả" },              // Mock data
  ...
]
```

### **Bước 6: Auto Reload khi có recipe mới**
```typescript
// Trong App.tsx - useEffect
useEffect(() => {
  const updateAiRecipes = () => {
    // 1. Merge lại mock data với AI recipes mới nhất
    const merged = AiRecipesService.mergeWithMockData(RECIPES);
    
    // 2. Cập nhật state (KHÔNG shuffle để giữ AI recipes ở đầu)
    setRecipes([...merged]);
  };
  
  // 3. Lắng nghe event 'aiRecipesChanged'
  window.addEventListener('aiRecipesChanged', updateAiRecipes);
  
  return () => {
    window.removeEventListener('aiRecipesChanged', updateAiRecipes);
  };
}, []);
```

**Flow event:**
```
AiRecipesService.addAiRecipe()
  └─> localStorage.setItem()
      └─> window.dispatchEvent('aiRecipesChanged')
          └─> App.tsx lắng nghe event
              └─> updateAiRecipes() được gọi
                  └─> Merge lại data
                      └─> setRecipes() cập nhật UI
                          └─> RecipeGrid hiển thị recipe mới
```

---

## 📊 Ví dụ thực tế

### **Lần 1: User tạo "Phở gà nấm"**

1. **Trước khi tạo:**
   ```
   localStorage["ai_generated_recipes"] = undefined
   recipes = [mock data 1-100]
   ```

2. **AI generate:**
   ```typescript
   generatedRecipe = { name: "Phở gà nấm", ... }
   uniqueId = 10000
   aiRecipe = { id: 10000, name: "Phở gà nấm", ... }
   ```

3. **Sau khi lưu:**
   ```
   localStorage["ai_generated_recipes"] = [{ id: 10000, ... }]
   recipes = [AI recipe 10000, mock data 1-100]
   ```

4. **User thấy:**
   - Grid hiển thị recipe "Phở gà nấm" ở đầu danh sách
   - Có thể filter, save, print như recipe thường

---

### **Lần 2: User tạo "Bún bò Huế chay"**

1. **Trước khi tạo:**
   ```
   localStorage["ai_generated_recipes"] = [{ id: 10000, ... }]
   recipes = [10000, 1-100]
   ```

2. **AI generate:**
   ```typescript
   generatedRecipe = { name: "Bún bò Huế chay", ... }
   uniqueId = 10001 (vì 10000 đã dùng)
   aiRecipe = { id: 10001, name: "Bún bò Huế chay", ... }
   ```

3. **Sau khi lưu:**
   ```
   localStorage["ai_generated_recipes"] = [
     { id: 10000, ... },
     { id: 10001, ... }
   ]
   recipes = [10000, 10001, 1-100]
   ```

4. **User thấy:**
   - 2 AI recipes ở đầu
   - Mock data ở sau

---

## 🔍 Kiểm tra trong Developer Tools

### **Cách xem localStorage:**
```javascript
// Mở Chrome DevTools → Console
localStorage.getItem('ai_generated_recipes')

// Kết quả:
'[{"id":10000,"name":"Phở gà nấm",...},{"id":10001,...}]'

// Parse để đọc dễ hơn:
JSON.parse(localStorage.getItem('ai_generated_recipes'))
```

### **Xem số lượng AI recipes:**
```javascript
AiRecipesService.getCount()
// Output: 2
```

### **Kiểm tra recipe có phải AI không:**
```javascript
AiRecipesService.isAiRecipe(10000)  // true
AiRecipesService.isAiRecipe(1)      // false (mock data)
```

---

## 🛠️ Các API methods

### **AiRecipesService**

#### 1. **getAiRecipes()**
```typescript
const aiRecipes = AiRecipesService.getAiRecipes();
// Returns: Recipe[]
```
Lấy tất cả AI recipes từ localStorage.

#### 2. **addAiRecipe(recipe)**
```typescript
const success = AiRecipesService.addAiRecipe(recipe);
// Returns: boolean
```
Thêm recipe mới, dispatch event 'aiRecipesChanged'.

#### 3. **removeAiRecipe(id)**
```typescript
const success = AiRecipesService.removeAiRecipe(10000);
// Returns: boolean
```
Xóa recipe theo ID, dispatch event.

#### 4. **mergeWithMockData(mockRecipes)**
```typescript
const allRecipes = AiRecipesService.mergeWithMockData(RECIPES);
// Returns: Recipe[] (AI recipes ở đầu)
```
Kết hợp AI recipes với mock data.

#### 5. **generateUniqueId(existingRecipes)**
```typescript
const newId = AiRecipesService.generateUniqueId(recipes);
// Returns: number (10000+)
```
Tạo ID duy nhất, bắt đầu từ 10000.

#### 6. **isAiRecipe(id)**
```typescript
const isAI = AiRecipesService.isAiRecipe(10000);
// Returns: boolean
```
Kiểm tra recipe có phải AI tạo không.

#### 7. **getCount()**
```typescript
const count = AiRecipesService.getCount();
// Returns: number
```
Đếm số lượng AI recipes.

#### 8. **clearAll()**
```typescript
AiRecipesService.clearAll();
```
Xóa tất cả AI recipes.

---

## 💡 Lợi ích

### ✅ **Cho User:**
- Không mất công thức đã tạo (lưu vĩnh viễn)
- Có thể tìm lại recipe cũ
- Bộ sưu tập tự động tăng
- Không cần tài khoản/database

### ✅ **Cho hệ thống:**
- Không cần backend để lưu trữ
- Giảm tải server
- Data sync real-time (custom events)
- Dễ scale (mỗi user có localStorage riêng)

### ✅ **Cho developer:**
- Code đơn giản, dễ maintain
- localStorage API native
- Type-safe với TypeScript
- Có thể mở rộng (sync Supabase sau)

---

## ⚠️ Lưu ý

### **Giới hạn localStorage:**
- **Dung lượng:** ~5-10MB tùy browser
- **Scope:** Per domain (khác domain = khác storage)
- **Bảo mật:** Không encrypt, có thể đọc được

### **Xóa data khi nào:**
- User xóa cache trình duyệt
- User xóa localStorage thủ công
- Dùng Incognito mode (không lưu)

### **Cải tiến tương lai:**
- Sync lên Supabase cho cross-device
- Compress data nếu quá nhiều recipes
- Backup/export AI recipes
- UI để quản lý AI recipes riêng

---

## 🎬 Demo Flow

```
1. User: "Tạo món chay cho người ăn kiêng"
   ↓
2. App.tsx → handleGenerateRecipe()
   ↓
3. Gemini API → generatedRecipe
   ↓
4. generateUniqueId() → 10000
   ↓
5. AiRecipesService.addAiRecipe({ id: 10000, ... })
   ↓
6. localStorage.setItem('ai_generated_recipes', '[{...}]')
   ↓
7. window.dispatchEvent('aiRecipesChanged')
   ↓
8. App.tsx useEffect → updateAiRecipes()
   ↓
9. mergeWithMockData() → [10000, 1-100]
   ↓
10. setRecipes() → RecipeGrid re-render
   ↓
11. User thấy recipe mới ở đầu danh sách ✨
```

---

## 📝 Code Example

```typescript
// User tạo recipe AI
const handleGenerateRecipe = async (prompt: string) => {
  const generatedRecipe = await generateRecipeFromPrompt(prompt);
  
  // Tạo ID duy nhất
  const uniqueId = AiRecipesService.generateUniqueId(recipes);
  
  // Thêm ID vào recipe
  const aiRecipe = { ...generatedRecipe, id: uniqueId };
  
  // Lưu vào localStorage + dispatch event
  AiRecipesService.addAiRecipe(aiRecipe);
  
  // Event listener tự động reload recipes
  // User thấy recipe mới ngay lập tức
};
```

---

## 🔮 Tương lai

Có thể mở rộng để:
- **Sync Supabase:** Lưu AI recipes vào database
- **Share recipes:** User chia sẻ AI recipes với nhau
- **Rate AI recipes:** Đánh giá chất lượng
- **Improve AI:** Học từ recipes được yêu thích
- **Export/Import:** Backup data
- **Analytics:** Thống kê món nào được tạo nhiều nhất

---

**Tóm lại:** Hệ thống hoạt động như một "túi đựng" tự động - mỗi khi AI tạo recipe mới, nó được bỏ vào túi (localStorage), và túi luôn được merge với kho chính (mock data) để hiển thị đầy đủ! 🎒✨
