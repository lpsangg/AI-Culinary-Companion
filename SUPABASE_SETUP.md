# Supabase Setup Guide

## ✅ Đã hoàn thành

Dự án đã được setup với Supabase authentication!

## 📋 Checklist Setup

### 1. Tạo Supabase Account
- [ ] Đăng ký tại https://supabase.com
- [ ] Tạo project mới
- [ ] Chọn region: Southeast Asia (Singapore)
- [ ] Copy Project URL và anon key

### 2. Setup Database
Chạy các SQL queries trong **SQL Editor** của Supabase:

#### Create user_profiles table:
```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### Create saved_recipes table:
```sql
CREATE TABLE public.saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id INTEGER NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_saved_recipes_user_id ON public.saved_recipes(user_id);
CREATE INDEX idx_saved_recipes_recipe_id ON public.saved_recipes(recipe_id);

ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved recipes"
  ON public.saved_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved recipes"
  ON public.saved_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved recipes"
  ON public.saved_recipes FOR DELETE
  USING (auth.uid() = user_id);
```

#### Create interactions table (optional):
```sql
CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'save', 'cook', 'rate')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interactions_user_id ON public.interactions(user_id);
CREATE INDEX idx_interactions_recipe_id ON public.interactions(recipe_id);

ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions"
  ON public.interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON public.interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 3. Configure Environment Variables
- [ ] Tạo file `.env.local` trong root folder
- [ ] Thêm credentials:
```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG....your_anon_key
```

### 4. Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 5. Configure Supabase Email Settings (Optional)
Trong Supabase Dashboard → Authentication → Email Templates:
- Customize email templates
- Enable email confirmations (hoặc disable cho dev)

**Disable Email Confirmation (cho development):**
1. Authentication → Providers → Email
2. Tắt "Enable email confirmations"

### 6. Test Authentication
```bash
npm run dev
```

Thử:
1. Click user icon
2. Đăng ký tài khoản mới
3. Đăng nhập
4. Đăng xuất

## 🔍 Troubleshooting

### Lỗi: "Missing Supabase environment variables"
- Kiểm tra file `.env.local` đã tạo chưa
- Kiểm tra tên biến: `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`
- Restart dev server: `npm run dev`

### Lỗi: "Failed to create profile"
- Check SQL queries đã chạy đúng chưa
- Check RLS policies đã enable chưa
- Xem logs trong Supabase Dashboard → Logs

### Lỗi: Email confirmation required
- Vào Authentication → Providers → Email
- Tắt "Enable email confirmations"

### Lỗi: Invalid JWT
- Check anon key copy đúng chưa (key rất dài)
- Key phải là "anon/public" key, không phải "service_role"

## 📚 Next Steps

### Features có thể thêm:
1. **Save Recipes** - Lưu món yêu thích
2. **Recipe Ratings** - Đánh giá món ăn
3. **Cooking History** - Lịch sử nấu ăn
4. **Personal Notes** - Ghi chú riêng
5. **Recommendations** - Gợi ý based on history

### Example: Save Recipe
```typescript
// services/recipeService.ts
import { supabase } from '../config/supabase';

export async function saveRecipe(recipeId: number) {
  const { data, error } = await supabase
    .from('saved_recipes')
    .insert({ recipe_id: recipeId });
  
  return { data, error };
}

export async function getSavedRecipes() {
  const { data, error } = await supabase
    .from('saved_recipes')
    .select('*');
  
  return { data, error };
}
```

## 🚀 Deploy

Khi deploy lên Vercel:
1. Add environment variables trong Vercel dashboard
2. `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`
3. Redeploy

## 🔒 Security Notes

✅ **SAFE:**
- anon/public key trong frontend (designed for this)
- Row Level Security (RLS) bảo vệ data

❌ **NEVER:**
- Đừng expose service_role key
- Đừng disable RLS trên production

## 📖 Resources

- Supabase Docs: https://supabase.com/docs
- Auth Guide: https://supabase.com/docs/guides/auth
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
