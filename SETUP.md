# LegalConnect - Setup Instructions

## Quick Start Guide

### Step 1: Database Setup (XAMPP)
1. Start XAMPP Control Panel
2. Start Apache and MySQL services
3. Open phpMyAdmin (http://localhost/phpmyadmin)
4. Create a new database named `legalconnect`

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd d:\ProjectInvice\legalconnect

# Install PHP dependencies
composer install

# Copy environment file and configure
copy .env.example .env

# Edit .env file with your database credentials:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=legalconnect
DB_USERNAME=root
DB_PASSWORD=

# Generate application key
php artisan key:generate

# Run migrations (creates all 19 tables)
php artisan migrate

# Seed the database with test data
php artisan db:seed

# Create storage link for document uploads
php artisan storage:link

# Start Laravel server
php artisan serve
```

Backend API will be available at: `http://localhost:8000`

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd d:\ProjectInvice\legalconnect\frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Step 4: Access the Application

Open your browser and go to: `http://localhost:5173`

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@legalconnect.com | password |
| Client | client@test.com | password |
| Lawyer | lawyer1@test.com | password |
| Lawyer | lawyer2@test.com | password |

## Testing with Postman

Import the following endpoints into Postman:

### Authentication
- POST http://localhost:8000/api/auth/register
- POST http://localhost:8000/api/auth/login
- POST http://localhost:8000/api/auth/logout (with Bearer token)
- GET http://localhost:8000/api/auth/me (with Bearer token)

### Public Endpoints (No Auth Required)
- GET http://localhost:8000/api/lawyers
- GET http://localhost:8000/api/lawyers/1
- GET http://localhost:8000/api/lawyers/1/availability

## Troubleshooting

### Issue: CORS errors
**Solution**: The CORS configuration is already set in `config/cors.php`. Make sure the frontend URL (localhost:5173) is whitelisted.

### Issue: Database connection failed
**Solution**: 
1. Check if MySQL is running in XAMPP
2. Verify database credentials in `.env` file
3. Ensure the database `legalconnect` exists

### Issue: Storage link not working
**Solution**: Run `php artisan storage:link` as administrator

### Issue: PDF generation fails
**Solution**: Make sure the directory `storage/app/public/documents` exists and is writable

## Project Structure Summary

### Backend (Laravel)
- **Models**: 12 models with relationships
- **Controllers**: 8 controllers with full CRUD
- **Middleware**: Role-based access control
- **Migrations**: 19 tables with proper foreign keys
- **Seeders**: Test data for all entities

### Frontend (React)
- **Pages**: 20+ pages (Landing, Auth, Dashboards, etc.)
- **Components**: Reusable UI components
- **Hooks**: Custom React Query hooks
- **Store**: Zustand for state management
- **Animations**: Framer Motion & GSAP

## API Documentation

All API responses follow this format:
```json
{
  "data": { ... },
  "message": "Success message"
}
```

Error responses:
```json
{
  "message": "Error description",
  "errors": { ... }  // Validation errors
}
```

## Features Checklist

- [x] Multi-role registration (Client, Lawyer, Admin)
- [x] Lawyer verification by Admin
- [x] Lawyer profiles with specializations, regions, ratings
- [x] Search/filter lawyers by specialization, region, rating, fee
- [x] Book consultations with time slot selection
- [x] Real-time chat (polling-based)
- [x] Document generation wizard (6 templates)
- [x] PDF generation with DomPDF
- [x] Mock payment flow
- [x] Reviews and ratings
- [x] Admin dashboard with verifications
- [x] User management
- [x] Admin activity logs
- [x] Dark/Light mode toggle
- [x] Responsive design
- [x] Framer Motion animations
- [x] Magnetic buttons
- [x] Glassmorphism UI
- [x] Skeleton loaders
- [x] Toast notifications

## Next Steps

1. Configure email notifications (optional)
2. Set up queue workers for background jobs (optional)
3. Configure SSL certificate for production
4. Set up proper error logging
5. Configure backup strategy for database

## Support

For any issues, check the Laravel logs in `storage/logs/laravel.log`

For frontend issues, check the browser console for errors.
