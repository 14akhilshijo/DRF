# Asset Management System - Django REST API

A production-ready Django + Django REST Framework backend for an Asset Management System with React frontend integration.

## Features

- **Asset Management**: Track physical and digital assets with full lifecycle management
- **Inventory Management**: Monitor consumable items and supplies with stock level tracking
- **Assignment System**: Manage asset assignments to users with automatic status updates
- **Support Tickets**: Handle asset-related issues and maintenance requests
- **Role-Based Access Control**: Admin, Technician, and User roles with appropriate permissions
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Advanced Filtering**: Search, filter, and sort across all resources
- **Dashboard Analytics**: Real-time system statistics and insights
- **React Integration Ready**: CORS-enabled with proper JSON responses

## Tech Stack

- **Backend**: Python 3.11, Django 5.0, Django REST Framework
- **Authentication**: SimpleJWT (JWT tokens)
- **Database**: PostgreSQL (configurable)
- **Filtering**: django-filter
- **CORS**: django-cors-headers

## Project Structure

```
asset_management/
├── config/                 # Django project configuration
├── apps/                   # Django applications
│   ├── users/             # User management and authentication
│   ├── assets/            # Asset models and logic
│   ├── inventory/         # Inventory management
│   ├── assignments/       # Asset assignment tracking
│   ├── tickets/           # Support ticket system
│   └── core/              # Shared models and utilities
├── api/                   # REST API implementation
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API viewsets
│   ├── permissions.py     # Custom permissions
│   ├── filters.py         # Filtering logic
│   └── urls.py            # API routing
├── requirements.txt       # Python dependencies
└── manage.py             # Django management script
```

## Quick Start

### 1. Environment Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/asset_management
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Database Setup

```bash
# Create and apply migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 4. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/refresh/` - Refresh access token
- `POST /api/auth/logout/` - Logout and blacklist refresh token

### Resources (Full CRUD)
- `/api/assets/` - Asset management
- `/api/inventory/` - Inventory management  
- `/api/assignments/` - Assignment tracking
- `/api/tickets/` - Support tickets

### Dashboard
- `GET /api/dashboard/stats/` - System statistics

### Additional Endpoints
- `GET /api/inventory/low_stock/` - Items with low stock
- `GET /api/assignments/today/` - Today's assignments
- `GET /api/tickets/open/` - Open tickets

## Authentication

The API uses JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Login Example

```javascript
// Login request
const response = await fetch('/api/auth/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
// Returns: { access, refresh, user: {...} }
```

## Role-Based Permissions

### Admin
- Full CRUD access to all resources
- User management capabilities
- System configuration

### Technician  
- Manage assets and inventory
- View and update assignments
- Handle support tickets

### User
- View assets (read-only)
- Create support tickets
- View own assignments and tickets

## Filtering and Search

All list endpoints support filtering, searching, and ordering:

```javascript
// Search assets by name
GET /api/assets/?search=laptop

// Filter by status and category
GET /api/assets/?status=available&category=laptop

// Order by creation date
GET /api/assets/?ordering=-created_at

// Pagination
GET /api/assets/?page=2
```

## React Integration

The API is designed for seamless React integration:

```javascript
// Example React service
class AssetService {
  static async getAssets(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`/api/assets/?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      }
    });
    return response.json();
  }

  static async createAsset(assetData) {
    const response = await fetch('/api/assets/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assetData)
    });
    return response.json();
  }
}
```

## Production Deployment

### Environment Variables
Set these in production:
- `DEBUG=False`
- `SECRET_KEY=<strong-secret-key>`
- `DATABASE_URL=<production-database-url>`
- `ALLOWED_HOSTS=<your-domain>`

### Security Considerations
- Use HTTPS in production
- Set strong SECRET_KEY
- Configure proper CORS origins
- Use environment variables for sensitive data
- Regular security updates

## Development

### Adding New Features
1. Create models in appropriate app
2. Create serializers in `api/serializers.py`
3. Add viewsets in `api/views.py`
4. Register routes in `api/urls.py`
5. Add permissions if needed
6. Create migrations and migrate

### Testing
```bash
# Run tests
python manage.py test

# Check code coverage
coverage run --source='.' manage.py test
coverage report
```

## License

This project is licensed under the MIT License.