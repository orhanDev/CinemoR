# CinemoR API

Backend fürs Kino-Ticket-Buchungssystem.

- Java 17, Spring Boot 3.2.5, PostgreSQL, Token-Auth, Swagger
- DB anlegen, Zugangsdaten in `application.properties`, dann: `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`)
- API: `http://localhost:8082` (Port in properties), Swagger: `/swagger-ui.html`
- Sensible Werte nicht committen; Produktion mit eigener Config/Secrets.
