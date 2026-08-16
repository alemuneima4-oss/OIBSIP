# Pizza Delivery Backend API

Express.js REST API server for the Pizza Delivery Application with MongoDB, JWT authentication, WebSocket real-time updates, and payment processing.

## Overview

This is the backend server that handles:
- User authentication and authorization
- Order management and processing
- Inventory tracking
- Real-time order updates via WebSocket
- Payment processing with Razorpay
- Email notifications for alerts and password resets
- Scheduled tasks for stock monitoring

## Technology Stack

- **Framework**: Express.js 5.2.1
- **Database**: MongoDB 9.9.2
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Security**: bcryptjs 3.0.3
- **Real-time Communication**: Socket.io 4.8.3
- **Email Service**: Nodemailer 9.0.5
- **Payment Gateway**: Razorpay 2.9.8
- **Scheduled Jobs**: node-cron 4.6.0
- **CORS**: Express CORS 2.8.6
- **Environment**: dotenv 17.4.2
- **Dev Tool**: Nodemon 3.1.14

## Project Structure

```
backend/
├── src/
│   ├── server.js                    # Main Express app setup
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── orderController.js       # Order operations
│   │   ├── pizzaController.js       # Pizza management
│   │   └── inventoryController.js   # Inventory operations
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Order.js                 # Order schema
│   │   ├── Pizza.js                 # Pizza schema
│   │   └── Inventory.js             # Inventory schema
│   ├── routes/
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── orderRoutes.js           # Order endpoints
│   │   ├── pizzaRoutes.js           # Pizza endpoints
│   │   ├── inventoryRoutes.js       # Inventory endpoints
│   │   └── devRoutes.js             # Development endpoints
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification
│   ├── services/                    # Business logic services
│   ├── jobs/
│   │   └── lowStockNotifier.js      # Scheduled stock alerts
│   ├── sockets/                     # WebSocket handlers
│   └── utils/
│       ├── mailer.js                # Email utility
│       ├── seedInventoryAndAdmin.js # Initial data seeder
│       └── seedPizzas.js            # Pizza data seeder
├── .env.example                     # Environment template
└── package.json                     # Dependencies
```

## Installation

### Prerequisites
- Node.js v14 or higher
- MongoDB (local instance or Atlas connection string)
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Seed initial data** (optional)
   ```bash
   npm run seed
   ```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/pizza_delivery_db

# Server
PORT=5000

# JWT
JWT_SECRET=replace_with_a_strong_secret_key_here

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_email@ethereal.email
EMAIL_PASS=your_ethereal_password
EMAIL_FROM=PizzaHub <no-reply@pizzahub.test>

# Admin Credentials (for seeding)
ADMIN_EMAIL=admin@pizzahub.test
ADMIN_PASSWORD=admin123

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:5173

# Debugging
DEBUG=true
```

### Configuration Notes
- **MONGODB_URI**: Local `mongodb://localhost:27017/pizza_delivery_db` or MongoDB Atlas connection string
- **JWT_SECRET**: Use a strong random string for production
- **EMAIL**: If not configured, Ethereal test emails are used
- **RAZORPAY**: Test mode (leave blank for mock payment processing)

## Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Database
```bash
npm run seed
```

The server runs on `http://localhost:5000` by default.

## API Endpoints

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| GET | `/auth/me` | Get current user info | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |

### Pizza Endpoints (`/api/pizzas`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/pizzas` | Get all pizzas | No |
| POST | `/pizzas` | Create new pizza | Yes (Admin) |
| GET | `/pizzas/:id` | Get pizza details | No |
| PUT | `/pizzas/:id` | Update pizza | Yes (Admin) |
| DELETE | `/pizzas/:id` | Delete pizza | Yes (Admin) |

### Order Endpoints (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/orders` | Get orders (user's orders or all if admin) | Yes |
| POST | `/orders` | Create new order | Yes |
| GET | `/orders/:id` | Get order details | Yes |
| PATCH | `/orders/:id/status` | Update order status | Yes (Admin) |

### Inventory Endpoints (`/api/inventory`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/inventory` | Get all inventory items | Yes (Admin) |
| POST | `/inventory` | Create inventory item | Yes (Admin) |
| PATCH | `/inventory/:id` | Update inventory item/quantity | Yes (Admin) |
| DELETE | `/inventory/:id` | Delete inventory item | Yes (Admin) |

## Data Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  user: ObjectId (ref: User),
  pizza: {
    base: String,
    sauce: String,
    cheese: String,
    vegetables: [String]
  },
  quantity: Number,
  totalPrice: Number,
  orderStatus: String,
  paymentStatus: String,
  deliveryAddress: {
    address: String (required),
    city: String (required),
    phoneNumber: String (required)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Pizza Schema
```javascript
{
  name: String,
  description: String,
  basePrice: Number,
  availableBases: [String],
  availableSauces: [String],
  availableCheeses: [String],
  availableVegetables: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Inventory Schema
```javascript
{
  name: String,
  category: String (base/sauce/cheese/vegetable),
  quantity: Number,
  unit: String (kg/pcs/liter),
  lowStockThreshold: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features

### Authentication
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes with authMiddleware
- Password reset via email
- Role-based access control (Admin vs User)

### Order Management
- Order creation with custom pizzas
- **Delivery address required** at order creation (address, city, phone number)
- Real-time order status updates
- Order history tracking
- Admin order status updates
- Delivery details stored with order

### Inventory System
- Track ingredient quantities
- Set low stock thresholds
- Automatic email alerts for low stock
- Admin inventory management

### Real-time Updates (WebSocket)
- Order status updates in real-time
- Bi-directional communication with frontend
- Event-based architecture

### Email Service
- Password reset emails
- Stock alert notifications
- Order confirmations
- Fallback to Ethereal for testing

### Payment Integration
- Razorpay payment gateway integration
- Test mode support
- Order payment status tracking

## Scheduled Jobs

### Low Stock Notifier
- File: `src/jobs/lowStockNotifier.js`
- Runs every hour
- Sends email alerts when inventory falls below threshold
- Admin receives notification

## Middleware

### authMiddleware
- Verifies JWT tokens
- Attaches user to request
- Checks user role (admin/user)
- Protects routes

## WebSocket Events

### Server Emits
- `order:status` - Order status update
- `order:update` - Order information update

### Server Listens
- `connection` - Client connection
- `disconnect` - Client disconnection

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running or check connection string

### JWT Token Expired
**Solution**: Frontend should refresh token or re-login

### Port Already in Use
```bash
# Change PORT in .env file to available port (e.g., 5001)
# Or kill the process using port 5000
```

### Email Not Sending
- Check email credentials in `.env`
- If not configured, logs preview URLs instead
- Ethereal credentials are for testing only

## Development Tips

1. **Use Nodemon** - Automatically restarts on file changes
   ```bash
   npm run dev
   ```

2. **Check Debug Logs** - Set `DEBUG=true` in `.env`

3. **Test Endpoints** - Use tools like:
   - Postman
   - VS Code REST Client
   - cURL

4. **Monitor WebSocket** - Open browser DevTools → Network → WS

5. **Database Inspection** - Use MongoDB Compass or Atlas UI

## Performance Considerations

- JWT tokens have expiration time
- Database indexes on frequently queried fields
- WebSocket for real-time instead of polling
- Scheduled cron jobs instead of manual processes
- Password hashing with bcryptjs (slow by design)

## Security Measures

- JWT authentication with secrets
- Password hashing with bcryptjs
- CORS configuration
- Environment variables for sensitive data
- Protected admin routes
- Input validation

## License

ISC

## Support

For issues or detailed setup information, see the main project README.md or contact support.
