# 🔒 Güvenlik Kontrol Listesi

## ✅ Tamamlanan İşlemler

1. ✅ `application.properties` dosyası Git'ten kaldırıldı
2. ✅ `.gitignore` dosyasına `application.properties` eklendi
3. ✅ Git geçmişi temizlendi (tüm commit'lerden hassas bilgiler kaldırıldı)
4. ✅ Şifreler güncellendi:
   - Veritabanı şifresi: `Vekil402300.`
   - Admin şifresi: `Vekil402300.`
   - User şifresi: `Vekil402300.`
   - JWT Secret: `b28b93f654e2afcb49d792ef1655af3e4f416b5e8d5700fd868670f60087493b`

## ⚠️ Yapılması Gerekenler

### 1. Render.com Environment Variables Ayarları

Render Dashboard → `cinemor-api` → Environment → Environment Variables bölümüne şu değişkenleri ekleyin:

```bash
# Database (Render PostgreSQL'den otomatik gelir, kontrol edin)
SPRING_DATASOURCE_URL=jdbc:postgresql://your-render-postgres-host:5432/cinemor-api
SPRING_DATASOURCE_USERNAME=your-postgres-username
SPRING_DATASOURCE_PASSWORD=Vekil402300.

# Server
SERVER_PORT=8082
SPRING_PROFILES_ACTIVE=production

# JWT
APP_JWT_SECRET=b28b93f654e2afcb49d792ef1655af3e4f416b5e8d5700fd868670f60087493b
APP_JWT_EXPIRATION_MILLISECONDS=604800000

# Frontend
APP_FRONTEND_URL=https://cinemor.netlify.app

# Email (opsiyonel)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=cinemorapi@gmail.com
SPRING_MAIL_PASSWORD=your-gmail-app-password-here
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
APP_MAIL_ENABLED=false

# Admin (opsiyonel - ilk başlangıçta oluşturulur)
ADMIN_EMAIL=orhancodes@gmail.com
ADMIN_PASSWORD=Vekil402300.
ADMIN_PHONENUMBER=(111) 111-1111

# User (opsiyonel - ilk başlangıçta oluşturulur)
USER_EMAIL=orhancodes@gmail.com
USER_PASSWORD=Vekil402300.
USER_PHONENUMBER=(111) 111-1111
```

### 2. Veritabanı Şifresini Değiştirin

**Yerel PostgreSQL:**
```sql
ALTER USER postgres WITH PASSWORD 'Vekil402300.';
```

**Render PostgreSQL:**
- Render Dashboard → PostgreSQL → Settings → Reset Password
- Yeni şifre: `Vekil402300.`
- Environment variable'ı güncelleyin

### 3. Admin ve User Şifrelerini Veritabanında Güncelleyin

Eğer veritabanında zaten admin/user kayıtları varsa, şifreleri güncelleyin:

```sql
-- Admin şifresini güncelle (BCrypt hash gerekir)
UPDATE users SET password = '$2a$10$...' WHERE email = 'orhancodes@gmail.com' AND role = 'ADMIN';

-- User şifresini güncelle
UPDATE users SET password = '$2a$10$...' WHERE email = 'orhancodes@gmail.com' AND role = 'USER';
```

**Not:** BCrypt hash'i oluşturmak için Spring Boot uygulamasını çalıştırıp yeni bir kullanıcı kaydedin veya BCrypt online generator kullanın.

### 4. Gmail App Password (Opsiyonel)

Eğer email göndermek istiyorsanız:
1. Google Account → Security → 2-Step Verification → App Passwords
2. Yeni app password oluşturun
3. Render environment variable'ına ekleyin: `SPRING_MAIL_PASSWORD`

### 5. Cloudinary (Opsiyonel)

Eğer image upload kullanıyorsanız:
1. Cloudinary Dashboard'dan API credentials alın
2. Render environment variables'a ekleyin:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## 🔐 Güvenlik Best Practices

1. ✅ **Hassas bilgiler Git'te değil** - Environment variables kullanılıyor
2. ✅ **Git geçmişi temizlendi** - Eski commit'lerde hassas bilgiler yok
3. ⚠️ **Şifreleri düzenli değiştirin** - En az 3 ayda bir
4. ⚠️ **JWT secret'ı production'da farklı olmalı** - Her environment için farklı
5. ⚠️ **Database backup'ları şifreleyin**
6. ⚠️ **HTTPS kullanın** - Render ve Netlify otomatik sağlıyor

## 📝 Notlar

- `application.properties` dosyası artık Git'te değil, sadece local'de
- `application.properties.example` dosyası örnek değerlerle Git'te
- Render.com'da environment variables kullanılıyor
- Tüm hassas bilgiler environment variables'da

## 🚨 Acil Durum

Eğer şifrelerin sızdığını düşünüyorsanız:
1. Tüm şifreleri hemen değiştirin
2. JWT secret'ı değiştirin (tüm kullanıcılar logout olur)
3. Veritabanı şifresini değiştirin
4. Render environment variables'ı güncelleyin
