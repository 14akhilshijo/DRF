# Asset Management System - React Frontend

A modern, responsive React frontend for the Asset Management System.

## Features

- 🔐 **JWT Authentication** with role-based access
- 📊 **Interactive Dashboard** with real-time statistics
- 💻 **Asset Management** with search and filtering
- 📦 **Inventory Tracking** with low stock alerts
- 👥 **Assignment Management** with status tracking
- 🎫 **Support Tickets** with priority management
- 📱 **Responsive Design** works on all devices
- 🎨 **Modern UI** with Bootstrap 5 and Font Awesome

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Django backend running on http://localhost:8000

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at http://localhost:3000

### Demo Credentials

- **Admin**: admin@example.com / admin123
- **Technician**: tech@example.com / tech123
- **User**: user@example.com / user123

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components
│   │   ├── Layout.js       # Main layout with sidebar
│   │   ├── Login.js        # Authentication form
│   │   ├── Dashboard.js    # Statistics dashboard
│   │   ├── Assets.js       # Asset management
│   │   ├── Inventory.js    # Inventory tracking
│   │   ├── Assignments.js  # Assignment management
│   │   └── Tickets.js      # Support tickets
│   ├── context/
│   │   └── AuthContext.js  # Authentication state
│   ├── services/
│   │   └── api.js          # API client with axios
│   ├── App.js              # Main app component
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## API Integration

The frontend connects to the Django REST API with:

- **Automatic token refresh** on 401 errors
- **Request/response interceptors** for authentication
- **Error handling** with user-friendly messages
- **Loading states** for better UX

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Features by Role

### Admin
- Full access to all features
- Dashboard with system statistics
- Complete CRUD operations
- User management capabilities

### Technician
- Asset and inventory management
- Assignment tracking
- Support ticket handling
- Limited user access

### User
- View assigned assets
- Create support tickets
- Limited read-only access
- Personal dashboard

## Responsive Design

The interface adapts to different screen sizes:
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Adding New Features

1. Create component in `src/components/`
2. Add API methods in `src/services/api.js`
3. Update navigation in `src/components/Layout.js`
4. Add route in `src/App.js`

### Styling

- Uses Bootstrap 5 for layout and components
- Custom CSS in `src/index.css`
- Font Awesome for icons
- Responsive design principles

## Production Build

```bash
npm run build
```

Creates optimized production build in `build/` folder.

## License

MIT License