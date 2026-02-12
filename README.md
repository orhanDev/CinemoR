# CinemoR - Cinema Ticket Booking Platform

A modern, full-stack cinema ticket booking application built with React and Spring Boot.

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
- Automatic deployments from GitHub
- Environment variables configured in Netlify dashboard
- SPA routing handled via `_redirects` file

### Backend (Render.com)
- Docker-based deployment
- PostgreSQL database on Render
- Environment variables for database connection

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

## 📄 License

This is a demo project for portfolio purposes.

## 👤 Author

Orhan Yilmaz

---

**Note**: This is a demonstration project. No real payments are processed, and content is for demonstration purposes only.
