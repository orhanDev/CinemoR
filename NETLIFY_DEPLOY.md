# 🚀 Netlify Deployment Rehberi

Bu projeyi Netlify'a deploy etmek için aşağıdaki adımları izleyin.

## 📋 Ön Gereksinimler

1. GitHub repository'niz hazır olmalı
2. Backend API'niz production'da çalışıyor olmalı
3. Netlify hesabınız olmalı

## 🔧 Adımlar

### 1. Netlify'da Yeni Site Oluşturma

1. [Netlify](https://app.netlify.com) hesabınıza giriş yapın
2. "Add new site" → "Import an existing project" seçin
3. GitHub repository'nizi seçin
4. Branch'i seçin (genellikle `main` veya `master`)

### 2. Build Ayarları

Netlify otomatik olarak `netlify.toml` dosyasını okuyacaktır. Eğer manuel ayar yapmak isterseniz:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** `18` (netlify.toml'da belirtildi)

### 3. Environment Variables Ayarlama

Netlify dashboard'da **Site settings** → **Environment variables** bölümüne gidin ve şunları ekleyin:

```
VITE_API_URL=https://your-api-domain.com/api
VITE_API_URL_WITHOUT_API=https://your-api-domain.com
```

**Önemli:** 
- `your-api-domain.com` yerine gerçek backend API URL'inizi yazın
- HTTPS kullanın (HTTP değil)
- Backend'iniz CORS ayarlarında Netlify domain'inizi izin verilen origin'lere ekleyin

### 4. Deploy

1. "Deploy site" butonuna tıklayın
2. Build tamamlandıktan sonra siteniz canlıya alınacak
3. Netlify size bir URL verecek (örn: `your-site.netlify.app`)

## 🔍 Kontrol Listesi

- [ ] Backend API production'da çalışıyor
- [ ] Backend CORS ayarları Netlify domain'ini içeriyor
- [ ] Environment variables doğru ayarlandı
- [ ] Build başarıyla tamamlandı
- [ ] Site canlı ve API bağlantıları çalışıyor

## 🐛 Sorun Giderme

### API Bağlantı Hatası

- Environment variables'ın doğru ayarlandığından emin olun
- Browser console'da network hatalarını kontrol edin
- Backend CORS ayarlarını kontrol edin

### Build Hatası

- Node.js versiyonunun 18 olduğundan emin olun
- `package.json` dosyasında tüm dependencies'in mevcut olduğunu kontrol edin
- Build loglarını Netlify dashboard'dan kontrol edin

### Demo Veriler Görünüyor

- `useApiShowtimes` state'i production API URL'i varsa otomatik olarak `true` olur
- Eğer hala demo veriler görünüyorsa, API bağlantısını kontrol edin
- Browser console'da API isteklerini kontrol edin

## 📝 Notlar

- `.env` dosyası Git'e commit edilmemeli (zaten `.gitignore`'da)
- Production'da API URL'leri environment variables üzerinden gelir
- Local development için `.env` dosyasını kullanın
- Production'da demo mod otomatik olarak kapanır (API URL localhost değilse)
