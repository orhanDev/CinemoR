# CinemoR - Cinema Ticket Booking Platform

A modern, full-stack cinema ticket booking application built with React and Spring Boot.

🌐 **Live Demo**: [cinemor.netlify.app](https://cinemor.netlify.app)

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-green)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🚀 Features

- **Movie Listings**: Browse now showing and coming soon movies
- **Seat Selection**: Interactive seat map with real-time availability
- **Ticket Booking**: Complete booking flow with payment integration
- **User Authentication**: Secure login/register system with JWT
- **Multi-language Support**: German and English
- **Responsive Design**: Mobile-first approach with touch-optimized UI
- **Shopping Cart**: Add multiple tickets and snacks
- **User Profile**: Manage tickets, favorites, and booking history

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **SCSS** - Styling with BEM methodology
- **Moment.js** - Date manipulation
- **React Bootstrap** - UI components

### Backend
- **Spring Boot 3.2.5** - REST API
- **PostgreSQL** - Database
- **Spring Security** - Authentication & authorization
- **JWT** - Token-based auth
- **Spring Data JPA** - Data persistence

## 📦 Installation

### Prerequisites
- Node.js 18+
- Java 17+
- PostgreSQL 14+

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://your-api-url.com/api
VITE_API_URL_WITHOUT_API=https://your-api-url.com
```

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── services/        # API service layer
├── store/           # Zustand state stores
├── hooks/           # Custom React hooks
├── context/         # React context providers
├── helpers/         # Utility functions
└── styles/          # Global styles and SCSS variables
```

## 🎯 Key Features Implementation

### State Management
- **Zustand stores** for booking and cart state
- **React Context** for authentication and language
- **Local state** for component-specific data

### API Integration
- Centralized API service layer
- Error handling with fallback data
- Loading states and error boundaries

### Responsive Design
- Mobile-first CSS approach
- Touch-optimized interactions
- Adaptive layouts for different screen sizes

## 🚢 Deployment

### Frontend (Netlify)

The frontend is deployed on Netlify with automatic deployments from GitHub.

**Setup:**
1. Connect GitHub repository to Netlify
2. Configure build settings (automatically detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. Set environment variables in Netlify dashboard:
   ```
   VITE_API_URL=https://your-api-domain.com/api
   VITE_API_URL_WITHOUT_API=https://your-api-domain.com
   ```

4. Ensure backend CORS settings include Netlify domain

**Features:**
- Automatic deployments on push to main branch
- SPA routing handled via `_redirects` file
- Environment-based configuration

### Backend (Render.com)

The backend is deployed on Render.com using Docker.

**Setup:**
1. Create PostgreSQL database on Render
2. Create Web Service with Docker runtime
3. Configure environment variables:
   - `SPRING_PROFILES_ACTIVE=production`
   - `SPRING_DATASOURCE_URL=jdbc:postgresql://...`
   - `SPRING_DATASOURCE_USERNAME=...`
   - `SPRING_DATASOURCE_PASSWORD=...`
   - `PORT=8082`

**Features:**
- Docker-based deployment
- PostgreSQL database integration
- Environment-based configuration

## 📝 Development Notes

- Follow BEM naming convention for CSS classes
- Use custom hooks for reusable logic
- Implement proper error handling in all API calls
- Maintain consistent code style

## 🔒 Security

- JWT tokens stored in localStorage
- API endpoints protected with authentication
- CORS configured for production domains
- Input validation on forms

## 🌐 Live Demo

- **Frontend**: [cinemor.netlify.app](https://cinemor.netlify.app)
- **Backend API**: Deployed on Render.com

## 📸 Screenshots

_Add screenshots of your application here_

## 🤝 Contributing

This is a portfolio project. Contributions and feedback are welcome!

## 📄 License

This project is for portfolio/demonstration purposes.

## 👤 Author

**Orhan Yilmaz**

- GitHub: [@orhanDev](https://github.com/orhanDev)
- Portfolio: _Add your portfolio link_

---

**Note**: This is a demonstration project. No real payments are processed, and content is for demonstration purposes only.
