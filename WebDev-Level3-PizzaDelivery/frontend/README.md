# Pizza Delivery Frontend

A React + Vite application for a pizza delivery ordering system with user authentication, custom pizza configuration, real-time order tracking, and admin dashboard.

## Overview

This is the frontend client for the Pizza Delivery Application built with modern React and Vite, featuring:
- User authentication with JWT tokens
- Browse and customize pizzas
- Real-time order status updates
- Order history and tracking
- Admin dashboard for order and inventory management
- WebSocket integration for live updates
- Responsive design with inline CSS styling

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router v7
- **HTTP Client**: Axios 1.19.0
- **Real-time**: Socket.io-client 4.8.3
- **Styling**: CSS + Inline styles
- **Development Server**: Vite dev server with HMR

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # Global styles
│   ├── index.css                # CSS reset/base styles
│   ├── pages/
│   │   ├── Login.jsx            # User login page
│   │   ├── Register.jsx         # User registration page
│   │   ├── Dashboard.jsx        # User dashboard
│   │   ├── AdminLogin.jsx       # Admin login page
│   │   ├── AdminDashboard.jsx   # Admin management page
│   │   ├── CustomPizza.jsx      # Pizza customization
│   │   ├── OrderSummary.jsx     # Order review
│   │   ├── ForgotPassword.jsx   # Password reset request
│   │   └── ResetPassword.jsx    # Password reset form
│   ├── components/
│   │   ├── ProtectedRoute.jsx   # Route guard for users
│   │   └── AdminProtectedRoute.jsx # Route guard for admins
│   ├── context/
│   │   └── AuthContext.jsx      # Global auth state
│   ├── api/
│   │   └── axios.js             # Axios configuration
│   └── assets/                  # Images, icons, etc.
├── public/                       # Static assets
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies
└── index.html                   # HTML template
```

## Installation

### Prerequisites
- Node.js v14 or higher
- npm or yarn
- Backend server running on `http://localhost:5000`

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configuration**
   - Backend API URL is configured in `src/api/axios.js`
   - Default: `http://localhost:5000`
   - Modify if backend runs on different address

## Running the Application

### Development Mode
```bash
npm run dev
```
- Opens at `http://localhost:5173`
- Hot Module Reload (HMR) enabled
- Auto-refresh on file changes

### Build for Production
```bash
npm run build
```
- Optimized bundle in `dist/` folder
- Ready for deployment

### Preview Production Build
```bash
npm run preview
```
- Serves the production build locally

## Project Features

### User Features
- **Authentication**
  - Register new account
  - Login with email/password
  - Password reset via email
  - JWT token management

- **Dashboard**
  - View order history
  - Real-time order status updates
  - Order details and pricing
  - WebSocket notifications

- **Pizza Customization**
  - Select pizza base (thin crust, regular, thick)
  - Choose sauce (tomato, white, bbq)
  - Select cheese type and amount
  - Add vegetables
  - Real-time price calculation
  - Order quantity selection

- **Order Management**
  - Review order before checkout
  - **Enter delivery address** (address, city, phone number)
  - Address validation before payment
  - Razorpay payment integration
  - Order confirmation
  - Track delivery status and view delivery address in real-time

### Admin Features
- **Admin Login** - Separate authentication for admins
- **Order Management Dashboard**
  - View all customer orders
  - Update order status
    - Order Received
    - In Kitchen
    - Sent to Delivery
    - Delivered
    - Cancelled
  - Cancel orders
  - Real-time order updates

- **Inventory Management**
  - View all inventory items by category
    - Bases
    - Sauces
    - Cheeses
    - Vegetables
  - Update item quantities
  - Set low stock thresholds
  - View stock status indicators
  - Manage stock warnings

- **Logout** - Secure logout from admin dashboard

## Page Components

### Login.jsx
- Email and password input
- Login form with validation
- Error handling
- Redirect to dashboard on success

### Register.jsx
- Name, email, password input
- Form validation
- Error messages
- Auto-login after registration

### Dashboard.jsx
- Display user's order history with delivery addresses
- Real-time status updates
- Order details card layout
- **Delivery address display** on each order (address, city, phone)
- Order progress tracking with visual indicators
- WebSocket listener for order updates

### CustomPizza.jsx
- Base selection dropdown
- Sauce selection dropdown
- Cheese selection dropdown
- Vegetable multi-select
- Real-time price display
- Quantity selector
- Add to cart functionality

### OrderSummary.jsx
- Order review before payment
- **Delivery address form** with validation
  - Address input
  - City input
  - Phone number validation (minimum 10 digits)
- Price breakdown
- Payment method selection
- Razorpay integration
- Test payment mode support

### AdminDashboard.jsx
- All customer orders display with **delivery addresses**
- **Delivery details** shown for each order (full address and contact phone)
- Order status selector
- Cancel order button
- Inventory management section
- Inventory quantity editor
- Low stock threshold manager
- Logout button
- Real-time updates

### AdminLogin.jsx
- Admin-only authentication
- Separate from user login
- Redirect to admin dashboard

### ForgotPassword.jsx / ResetPassword.jsx
- Password recovery flow
- Email verification
- New password form
- Token validation

## Context & State Management

### AuthContext.jsx
Provides global authentication state:

```javascript
const {
  user,           // Current user object
  token,          // JWT authentication token
  loading,        // Auth loading state
  socket,         // Socket.io connection
  login(),        // Login function
  register(),     // Register function
  logout(),       // Logout function
  getCurrentUser() // Fetch current user
} = useAuth();
```

## API Integration

### Axios Configuration (`src/api/axios.js`)
- Base URL: `http://localhost:5000`
- JWT token in headers
- Request/response interceptors
- Error handling

### Example API Calls
```javascript
// Get orders
const res = await api.get("/orders", {
  headers: { Authorization: `Bearer ${token}` }
});

// Create order
await api.post("/orders", orderData, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## WebSocket Integration

Real-time updates using Socket.io-client:

```javascript
// Listen for order updates
socket.on("order:status", (payload) => {
  // Refresh orders or update UI
});

socket.on("order:update", (payload) => {
  // Handle order update
});
```

## Routing

Protected routes for authenticated users:

- `/` - Home / Dashboard (requires auth)
- `/login` - User login
- `/register` - User registration
- `/custom-pizza` - Pizza customization (requires auth)
- `/order-summary` - Order review (requires auth)
- `/forgot-password` - Password reset request
- `/reset-password` - Reset password form
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard (requires admin auth)

## Styling

- Global styles in `App.css` and `index.css`
- Inline CSS for component styling
- Color scheme:
  - Primary: Red (#c62828) for admin/destructive actions
  - Background: Light (#f5f5f5)
  - Text: Dark (#333)

## Development Tips

1. **Enable HMR** - Changes reflect instantly
   ```bash
   npm run dev
   ```

2. **Debug WebSocket** - Open DevTools → Network → WS tab

3. **Check API Calls** - DevTools → Network → XHR

4. **Auth Debugging** - Check localStorage for JWT token
   ```javascript
   localStorage.getItem("token")
   ```

5. **React DevTools** - Install React DevTools browser extension

## Build & Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- Vercel (recommended for Vite)
- Netlify
- GitHub Pages
- Any static hosting

### Build Output
- `dist/` folder contains optimized files
- Single-page app (SPA)
- Can be served from any static server

## Environment Setup

Backend API URL (modify in `src/api/axios.js` if needed):
```javascript
const instance = axios.create({
  baseURL: "http://localhost:5000",
  // ...
});
```

## Troubleshooting

### CORS Error
- Ensure backend is running and allows frontend origin
- Check CORS configuration in backend

### Token Expired
- User is logged out automatically
- Redirected to login page
- Re-login to continue

### WebSocket Connection Failed
- Backend server must be running
- Check browser console for errors

### API Calls Failing
- Verify backend is running on port 5000
- Check network tab in DevTools
- Ensure JWT token is valid

### Vite Not Starting
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

## Performance Optimizations

- Code splitting via Vite
- Lazy loading of routes
- WebSocket for real-time instead of polling
- Optimized image loading
- Minified production bundle

## Security

- JWT authentication
- Protected routes
- HTTPS recommended for production
- Secure token storage in localStorage
- CORS for API security

## License

ISC

## Support

For issues or questions about specific features, refer to:
- Main project README.md for overall architecture
- Backend README.md for API documentation
- Check the corresponding page/component file for implementation details
