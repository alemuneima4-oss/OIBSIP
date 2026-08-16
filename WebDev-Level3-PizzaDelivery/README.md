# Pizza Delivery Application

A full-stack pizza delivery ordering system built with React (Vite) and Express.js with MongoDB.

## Project Overview

This is a complete pizza delivery platform that allows users to:
- Register and authenticate with secure JWT tokens
- Browse available pizzas and customize orders
- Place orders with real-time status tracking
- Admin users can manage orders, inventory, and track stock levels
- Real-time updates via WebSockets
- Payment integration with Razorpay
- Email notifications for password reset and low stock alerts

## Project Structure

```
WebDev-Level3-PizzaDelivery/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── server.js
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Authentication & validation
│   │   ├── services/     # Business services
│   │   ├── jobs/         # Scheduled tasks
│   │   ├── sockets/      # WebSocket handlers
│   │   ├── utils/        # Utilities & seeders
│   ├── package.json
│   └── README.md
│
├── frontend/             # React + Vite application
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context (Auth)
│   │   ├── api/          # Axios configuration
│   ├── package.json
│   └── README.md
│
└── package.json          # Root workspace config
```

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Scheduled Tasks**: node-cron
- **Email**: Nodemailer
- **Payment**: Razorpay API
- **Security**: bcryptjs for password hashing

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas connection string)
- Razorpay account (optional, for payment testing)
- Email provider credentials (optional, for email notifications)

### Installation

1. **Clone or extract the project**
   ```bash
   cd WebDev-Level3-PizzaDelivery
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend setup**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration:
   # - MongoDB connection string
   # - JWT secret
   # - Razorpay keys (optional)
   # - Email provider credentials (optional)
   ```

2. **Frontend setup**
   - No additional configuration needed (uses default API at http://localhost:5000)

### Running the Application

**Terminal 1 - Start Backend Server**
```bash
cd backend
npm run dev          # Development mode with nodemon
# or
npm start            # Production mode
```

**Terminal 2 - Start Frontend Development Server**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Database Seeding

To populate the database with initial data (pizzas, inventory, admin user):

```bash
cd backend
npm run seed
```

This will create:
- Admin user (email: `admin@pizzahub.test`, password: `admin123`)
- Sample pizzas in the database
- Inventory items with stock levels

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires auth)

### Pizza Endpoints
- `GET /api/pizzas` - Get all available pizzas
- `POST /api/pizzas` - Create pizza (admin only)

### Order Endpoints
- `GET /api/orders` - Get user's orders (users) or all orders (admin)
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status (admin only)

### Inventory Endpoints
- `GET /api/inventory` - Get inventory items (admin only)
- `PATCH /api/inventory/:id` - Update inventory item (admin only)

## Features

### User Features
- ✅ User registration and login
- ✅ Browse available pizzas
- ✅ Customize pizza (select base, sauce, cheese, vegetables)
- ✅ Place orders with quantity selection
- ✅ **Delivery address required** at checkout (address, city, phone number)
- ✅ View order history and status
- ✅ View delivery address for each order
- ✅ Real-time order status updates via WebSocket
- ✅ Razorpay payment integration
- ✅ Password reset functionality

### Admin Features
- ✅ Admin login and dashboard
- ✅ View all customer orders with **delivery addresses**
- ✅ Update order status (Order Received → In Kitchen → Sent to Delivery → Delivered)
- ✅ Cancel orders
- ✅ View customer delivery details for order fulfillment
- ✅ Manage inventory (pizza ingredients)
- ✅ Set low stock thresholds
- ✅ Email alerts for low stock
- ✅ Real-time order notifications

## Environment Variables

See `backend/.env.example` for all required environment variables:

```
MONGODB_URI=mongodb://localhost:27017/pizza_delivery_db
PORT=5000
JWT_SECRET=your_secret_key_here
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=PizzaHub <no-reply@pizzahub.test>
ADMIN_EMAIL=admin@pizzahub.test
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:5173
DEBUG=true
```

## File Structure Overview

### Backend Key Files
- `server.js` - Express app setup and middleware
- `config/database.js` - MongoDB connection
- `controllers/` - Route handlers (authController, orderController, etc.)
- `models/` - MongoDB schemas (User, Order, Pizza, Inventory)
- `routes/` - API route definitions
- `middleware/authMiddleware.js` - JWT verification
- `utils/seeders` - Database initialization scripts

### Frontend Key Files
- `main.jsx` - React entry point
- `App.jsx` - Main app component
- `context/AuthContext.jsx` - Global auth state management
- `pages/` - Page components (Login, Register, Dashboard, AdminDashboard, etc.)
- `api/axios.js` - Axios instance with interceptors

## Common Commands

```bash
# Backend
npm run dev          # Start with nodemon (hot reload)
npm start            # Start production server
npm run seed         # Seed database with initial data

# Frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Troubleshooting

### Database Connection Issues
- Ensure MongoDB is running locally or check your connection string
- Verify `MONGODB_URI` in `.env` is correct

### Port Already in Use
- Backend default: 5000 (change `PORT` in `.env`)
- Frontend default: 5173 (Vite will use next available if 5173 is busy)

### Email/SMS Not Sending
- If not configured, the app logs preview URLs instead
- Configure proper SMTP credentials in `.env`

### WebSocket Connection Failed
- Ensure backend server is running
- Check browser console for connection errors

## License

ISC

## Support

For issues or questions, refer to the backend and frontend README.md files for more detailed information about each part of the application.
