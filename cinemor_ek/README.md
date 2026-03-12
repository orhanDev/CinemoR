# CinemoR API

CinemoR – Kinoticket-Buchungssystem Backend API

## Technologies

- Java 17
- Spring Boot 3.2.5
- Spring Security
- Spring Data JPA
- PostgreSQL
- Token-based authentication (Bearer)
- Swagger/OpenAPI
- Cloudinary (Image Storage)
- Lombok

## Setup

1. **Database**
   - Create PostgreSQL database: `cinemor-api`
   - Set database credentials in `application.properties`

2. **Configuration**
   - In `application.properties` configure:
     - Database URL, username, password
     - Email (e.g. for password reset)
     - Cloudinary (if using image upload)
   - Do not commit real credentials; use env-specific config or secrets for production.

3. **Run**
   ```bash
   ./mvnw spring-boot:run
   ```
   Windows:
   ```bash
   mvnw.cmd spring-boot:run
   ```

4. **Access**
   - API base: `http://localhost:8081` (or port set in `server.port`)
   - Swagger UI: `http://localhost:8081/swagger-ui.html`

## Project Structure

```
src/
├── main/
│   ├── java/com/Cinemor/
│   │   ├── config/          # Security, CORS, TokenAuthFilter
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Request/response DTOs
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── service/         # Business logic
│   │   └── CinemorApplication.java
│   └── resources/
│       └── application.properties
└── test/
    └── java/com/Cinemor/
```

## Notes

- Set all sensitive values (DB, email, Cloudinary, etc.) in config; do not rely on default credentials in production.
- Database schema is updated on startup (ddl-auto=update). For production, consider validate or a migration tool.
