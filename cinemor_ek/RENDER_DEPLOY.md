# Render Deployment Guide

## Environment Variables Required in Render

Aşağıdaki environment variables'ları Render Dashboard → Environment sekmesinde ekleyin:

### Database Configuration
```
SPRING_DATASOURCE_URL=jdbc:postgresql://[RENDER_POSTGRES_HOST]:5432/cinemor-api
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=[YOUR_POSTGRES_PASSWORD]
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
```

### Server Configuration
```
SERVER_PORT=8082
SPRING_PROFILES_ACTIVE=production
```

### JPA Configuration
```
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
SPRING_SQL_INIT_MODE=always
```

### Application Configuration
```
SPRING_APPLICATION_NAME=CinemoR
APP_FRONTEND_URL=https://enchanting-lolly-200ee6.netlify.app
APP_JWT_SECRET=daf66e01593f61a15b857cf433aae03a005812b31234e149036bcc8dee755dbb
APP_JWT_EXPIRATION_MILLISECONDS=604800000
```

### Mail Configuration (Optional)
```
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=cinemorapi@gmail.com
SPRING_MAIL_PASSWORD=[YOUR_GMAIL_APP_PASSWORD]
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
APP_MAIL_ENABLED=false
```

### Cloudinary Configuration (Optional)
```
CLOUDINARY_CLOUD_NAME=[YOUR_CLOUD_NAME]
CLOUDINARY_API_KEY=[YOUR_API_KEY]
CLOUDINARY_API_SECRET=[YOUR_API_SECRET]
```

## Render Service Settings

### Build & Deploy Settings
- **Build Command:** (Render Docker kullanıyorsa otomatik algılanır)
- **Start Command:** (Render Docker kullanıyorsa otomatik algılanır)
- **Dockerfile Path:** `Dockerfile` (veya boş bırakın, otomatik bulur)

### Health Check
- **Health Check Path:** `/`
- **Health Check Command:** (boş bırakın)

## Troubleshooting

### Deploy Çalışmıyorsa:
1. Render Dashboard → Logs → Build logs kontrol edin
2. GitHub webhook'unun çalıştığından emin olun
3. Manual Deploy → "Deploy specific commit" ile son commit'i deploy edin
4. Environment variables'ların doğru olduğundan emin olun

### Database Bağlantı Sorunu:
1. Render PostgreSQL servisinin çalıştığından emin olun
2. `SPRING_DATASOURCE_URL` içindeki host'un doğru olduğundan emin olun
3. Render PostgreSQL'in "Internal Database URL" kullanın (Render servisleri arası bağlantı için)

### Build Hatası:
1. Dockerfile'ın doğru olduğundan emin olun
2. `pom.xml` dosyasının doğru olduğundan emin olun
3. Build logs'da hata mesajlarını kontrol edin
