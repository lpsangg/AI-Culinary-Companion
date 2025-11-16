# Google OAuth Setup Guide

## 🎯 Tổng quan

Feature này cho phép users đăng nhập bằng tài khoản Google của họ (không cần tạo password mới).

## ✅ Đã implement:

- ✅ Service function `signInWithGoogle()`
- ✅ Button "Đăng nhập với Google" trong AuthModal
- ✅ Auto-create user profile cho Google OAuth users
- ✅ Handle auth state changes

---

## 🚀 Setup Google OAuth - Chi tiết

### **BƯỚC 1: Google Cloud Console**

#### 1.1 Tạo/Chọn Project
```
1. Vào: https://console.cloud.google.com/
2. Click dropdown ở top left → "New Project"
3. Project name: "AI Culinary Companion" (hoặc tên khác)
4. Click "Create"
```

#### 1.2 Enable Google+ API (hoặc Google Identity)
```
1. Trong project, vào sidebar: "APIs & Services" → "Library"
2. Tìm "Google+ API" hoặc "Google Identity"
3. Click "Enable"
```

#### 1.3 Configure OAuth Consent Screen
```
1. "APIs & Services" → "OAuth consent screen"
2. User Type: "External" (cho public app)
3. Click "Create"

4. Điền thông tin:
   - App name: "AI Culinary Companion"
   - User support email: your.email@gmail.com
   - Developer contact: your.email@gmail.com
   
5. Scopes: Skip (default scopes are enough)
6. Test users: Thêm email của bạn (để test)
7. Click "Save and Continue"
```

#### 1.4 Create OAuth 2.0 Credentials
```
1. "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"

3. Application type: "Web application"

4. Name: "AI Culinary Companion Web Client"

5. Authorized JavaScript origins:
   Add these URLs:
   • http://localhost:5173
   • http://localhost:3000
   • https://your-vercel-app.vercel.app (nếu đã deploy)

6. Authorized redirect URIs:
   Add Supabase callback URL:
   • https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   
   Lấy callback URL:
   - Vào Supabase Dashboard
   - Settings → API → Project URL
   - Copy URL, thêm /auth/v1/callback
   
   Ví dụ: 
   https://abcdefgh.supabase.co/auth/v1/callback

7. Click "Create"

8. COPY 2 giá trị này (QUAN TRỌNG!):
   - Client ID: 123456789-abc...apps.googleusercontent.com
   - Client Secret: GOCSPX-abc...xyz
```

---

### **BƯỚC 2: Configure Supabase**

```
1. Vào Supabase Dashboard
2. Authentication → Providers
3. Scroll tìm "Google"
4. Toggle ON để enable

5. Paste credentials từ Google:
   - Google Client ID: (paste từ Google Cloud)
   - Google Client Secret: (paste từ Google Cloud)

6. Click "Save"
```

---

### **BƯỚC 3: Test**

```bash
# Run dev server
npm run dev
```

**Test flow:**
1. Click user icon → Open auth modal
2. Click "Đăng nhập với Google"
3. Google popup mở ra
4. Chọn Google account
5. Tự động redirect về app
6. User được login thành công!

**Check trong Supabase:**
- Vào Authentication → Users
- Sẽ thấy user mới với provider = "google"

---

## 🔍 Troubleshooting

### Lỗi: "Error 400: redirect_uri_mismatch"
**Nguyên nhân:** Redirect URI không match

**Fix:**
1. Check Supabase callback URL chính xác:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```
2. Vào Google Cloud Console → Credentials
3. Edit OAuth client
4. Kiểm tra "Authorized redirect URIs" có URL trên chưa
5. Save và thử lại (đợi vài phút để Google sync)

### Lỗi: "Access blocked: This app's request is invalid"
**Nguyên nhân:** Chưa config OAuth consent screen

**Fix:**
1. Google Cloud → OAuth consent screen
2. Hoàn thành tất cả required fields
3. Add test users (email của bạn)
4. Publish app (hoặc để "Testing" và add email vào test users)

### Lỗi: "The redirect URI in the request did not match"
**Nguyên nhân:** Localhost URL không match

**Fix:**
1. Thêm cả http://localhost:5173 vào "Authorized JavaScript origins"
2. Không cần thêm localhost vào redirect URIs (chỉ cần Supabase callback)

### Popup bị block
**Fix:**
- Allow popups cho localhost trong browser
- Hoặc user manually click "Allow popups"

---

## 📊 Data Flow

```
User clicks "Sign in with Google"
  ↓
supabase.auth.signInWithOAuth({ provider: 'google' })
  ↓
Redirect to Google login page
  ↓
User chooses Google account
  ↓
Google redirects to Supabase callback URL
  ↓
Supabase creates/updates auth.users
  ↓
App auto-creates user_profiles (if not exists)
  ↓
User logged in successfully!
  ↓
onAuthStateChange triggers → Update UI
```

---

## 🔒 Security Notes

### ✅ SAFE:
- Client ID public trong code (designed for this)
- Supabase anon key public
- Row Level Security protects data

### ❌ NEVER:
- Expose Client Secret trong frontend code
  (Chỉ paste vào Supabase Dashboard)
- Disable Row Level Security

---

## 🎨 Customization

### Thay đổi text button:
```tsx
// components/AuthModal.tsx
Đăng nhập với Google
→ Sign in with Google
→ Continue with Google
```

### Thay đổi redirect URL sau login:
```typescript
// services/supabaseAuthService.ts
static async signInWithGoogle(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://your-app.com/dashboard', // Custom URL
    }
  });
  return { error: error?.message || null };
}
```

### Request thêm scopes (email, profile, etc):
```typescript
options: {
  redirectTo: window.location.origin,
  scopes: 'email profile', // Request specific permissions
}
```

---

## 🚀 Deploy to Production

### Vercel deployment:
```
1. Deploy app lên Vercel
2. Copy production URL: https://your-app.vercel.app

3. Update Google Cloud Console:
   - Authorized JavaScript origins:
     • https://your-app.vercel.app
   
   - Redirect URIs: (không thay đổi, vẫn dùng Supabase callback)

4. No code changes needed!
```

### Environment variables:
```
Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
đã được add vào Vercel → Settings → Environment Variables
```

---

## 📱 Bonus: Thêm providers khác

Supabase support nhiều providers:
- GitHub
- Facebook  
- Twitter
- Discord
- ... và nhiều hơn

Setup tương tự:
1. Create OAuth app ở provider
2. Copy Client ID/Secret
3. Paste vào Supabase → Authentication → Providers
4. Add button trong AuthModal

---

## ✨ Next Features

Có thể thêm:
1. **Profile picture từ Google** - Avatar URL
2. **Email verification** - Check verified email
3. **Account linking** - Link Google với email/password account
4. **Multiple providers** - GitHub + Google cùng lúc

---

## 📚 Resources

- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2
- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- OAuth providers: https://supabase.com/docs/guides/auth/social-login
