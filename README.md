# LegalConnect - Online Legal Consultation & Document Generator

A complete, production-ready web application connecting clients with lawyers for online consultations and legal document generation.

## Tech Stack

### Backend
- **Laravel 11** (PHP 8.2+)
- **MySQL** Database
- **Laravel Sanctum** for API Authentication
- **barryvdh/laravel-dompdf** for PDF Generation

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for Styling
- **Framer Motion** & **GSAP** for Animations
- **Zustand** for State Management
- **TanStack Query** for Server State
- **Axios** for API Calls
- **React Hot Toast** for Notifications
- **React DatePicker**, **RC Slider**, **React Tilt**, **React CountUp**

## Features

### Multi-Role System
- **Clients**: Book consultations, generate documents, chat with lawyers
- **Lawyers**: Manage consultations, generate PDFs, chat with clients
- **Admins**: Verify lawyers, manage users, view system analytics

### Core Features
1. **Multi-role Registration** with lawyer verification
2. **Lawyer Profiles** with specializations, regions, ratings
3. **Advanced Search & Filtering** by specialization, region, rating, fee
4. **Consultation Booking** with time slot selection (30/60 min)
5. **Real-time Chat** (polling-based) between client and lawyer
6. **Document Generation Wizard** with PDF output (Will, Rental Agreement, NDA, etc.)
7. **Mock Payment Flow** for consultations and documents
8. **Reviews & Ratings** after consultations
9. **Admin Dashboard** with verifications, user management, logs

## Database Schema (19 Tables)

- users, lawyer_profiles, specializations, lawyer_specialization (pivot)
- regions, lawyer_region (pivot), document_types, lawyer_document_type (pivot)
- consultations, consultation_payments
- document_requests, document_payments
- reviews, admin_logs, messages

## Installation & Setup

### Prerequisites
- PHP 8.2+
- Composer
- MySQL (via XAMPP or standalone)
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to project directory
cd d:\ProjectInvice\legalconnect

# Install PHP dependencies
composer install

# Create database in MySQL (via phpMyAdmin or CLI)
CREATE DATABASE legalconnect;

# Copy environment file
copy .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Run seeders
php artisan db:seed

# Create storage link for documents
php artisan storage:link

# Start Laravel development server
php artisan serve
```

The backend will run at http://localhost:8000

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run at http://localhost:5173



## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (auth)
- `GET /api/auth/me` - Get current user (auth)

### Lawyers (Public)
- `GET /api/lawyers` - List lawyers with filters
- `GET /api/lawyers/{id}` - Get lawyer profile
- `GET /api/lawyers/{id}/availability` - Get available slots
- `GET /api/lawyers/{id}/reviews` - Get lawyer reviews

### Consultations (Auth)
- `GET /api/consultations` - List consultations
- `POST /api/consultations` - Book consultation
- `GET /api/consultations/{id}` - Get consultation
- `PUT /api/consultations/{id}/status` - Update status

### Documents (Auth)
- `GET /api/documents` - List documents
- `POST /api/documents` - Create document request
- `GET /api/documents/{id}` - Get document
- `POST /api/documents/{id}/generate` - Generate PDF (lawyer only)
- `PUT /api/documents/{id}/status` - Update status

### Payments (Auth)
- `POST /api/payments/consultation` - Process consultation payment
- `POST /api/payments/document` - Process document payment
- `GET /api/payments/{type}/{id}` - Get payment status

### Messages (Auth)
- `GET /api/messages?consultation_id={id}` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/{id}/read` - Mark as read
- `GET /api/messages/unread-count` - Get unread count
- `GET /api/messages/conversations` - Get conversations

### Reviews (Auth)
- `POST /api/reviews` - Create review
- `GET /api/reviews` - Get my reviews

### Admin (Auth + Admin Role)
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/pending-verifications` - Pending lawyer verifications
- `POST /api/admin/verify/{user}` - Verify lawyer
- `POST /api/admin/reject/{user}` - Reject lawyer
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{id}` - Get user details
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/logs` - Admin activity logs

## Frontend Routes

### Public
- `/` - Landing page
- `/login` - Login
- `/register` - Registration (with role selection)
- `/lawyers` - Lawyer listing with filters
- `/lawyer/:id` - Lawyer profile

### Client (Protected)
- `/client/dashboard` - Client dashboard
- `/client/consultations` - My consultations
- `/client/documents` - My documents
- `/client/settings` - Settings

### Lawyer (Protected)
- `/lawyer/dashboard` - Lawyer dashboard
- `/lawyer/consultations` - Manage consultations
- `/lawyer/documents` - Manage document requests
- `/lawyer/settings` - Settings

### Admin (Protected)
- `/admin/dashboard` - Admin dashboard
- `/admin/verifications` - Pending verifications
- `/admin/users` - User management

### Booking (Protected - Client only)
- `/book/:lawyerId` - Book consultation wizard

## Project Structure

```
legalconnect/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── LawyerController.php
│   │   │   ├── ConsultationController.php
│   │   │   ├── DocumentController.php
│   │   │   ├── PaymentController.php
│   │   │   ├── ReviewController.php
│   │   │   ├── MessageController.php
│   │   │   └── AdminController.php
│   │   └── Middleware/
│   │       └── RoleMiddleware.php
│   └── Models/
│       ├── User.php
│       ├── LawyerProfile.php
│       ├── Specialization.php
│       ├── Region.php
│       ├── DocumentType.php
│       ├── Consultation.php
│       ├── ConsultationPayment.php
│       ├── DocumentRequest.php
│       ├── DocumentPayment.php
│       ├── Review.php
│       ├── AdminLog.php
│       └── Message.php
├── database/
│   └── migrations/
├── routes/
│   └── api.php
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── store/
│   │   └── utils/
│   ├── public/
│   └── package.json
└── README.md
```

## Document Templates

The system includes pre-configured templates for:
1. **Last Will and Testament** - Estate planning document
2. **Rental Agreement** - Property lease contract
3. **Non-Disclosure Agreement (NDA)** - Confidentiality protection
4. **Employment Contract** - Job offer agreement
5. **Power of Attorney** - Legal authorization
6. **Partnership Deed** - Business partnership agreement

## Features & Animations

### Landing Page
- Hero section with typewriter effect
- Spline-like 3D visual with Framer Motion
- Animated background elements
- CountUp statistics
- Tilt cards for features
- Testimonials carousel
- Magnetic buttons throughout

### UI/UX
- Dark/Light mode toggle with persistence
- Glassmorphism cards
- Responsive design (mobile-first)
- Skeleton loaders for data fetching
- Toast notifications
- Page transitions with AnimatePresence
- Magnetic button effects
- Hover animations

## Testing

Use Postman to test the API endpoints. Default credentials:
- **Client**: client@test.com / password
- **Lawyer**: lawyer1@test.com / password (verified)
- **Admin**: admin@legalconnect.com / password

## License

This project is built for demonstration purposes.

## Support

For issues or questions, please refer to the code documentation or create an issue.
