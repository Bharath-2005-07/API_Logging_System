# Frontend Application

## Overview

React-based frontend dashboard for the API logging system. Provides user interface for authentication, log viewing, billing management, and log verification.

## Features

- ✅ User authentication (login/register)
- ✅ Dashboard with statistics
- ✅ Log viewing and filtering
- ✅ Billing history and current period
- ✅ Log verification
- ✅ Responsive design
- ✅ Blockchain integration

## Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   └── PrivateRoute.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── DashboardPage.js
│   │   ├── LogsPage.js
│   │   ├── BillingPage.js
│   │   └── VerificationPage.js
│   ├── styles/
│   │   ├── Navbar.css
│   │   ├── Auth.css
│   │   ├── Dashboard.css
│   │   ├── Logs.css
│   │   ├── Billing.css
│   │   └── Verification.css
│   ├── utils/
│   │   ├── api.js
│   │   └── blockchain.js
│   ├── App.js
│   └── index.js
├── public/
│   └── index.html
├── package.json
└── README.md
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file in the frontend folder:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_NETWORK=sepolia
REACT_APP_CHAIN_ID=11155111
```

### 3. Start Development Server

```bash
npm start
```

Application opens on `http://localhost:3000`

## Pages

### Login Page (`/login`)
- Email and password authentication
- Registration link
- Error handling

### Register Page (`/register`)
- User ID, email, name, password
- Validation
- Account creation

### Dashboard (`/dashboard`)
- User statistics
- Total requests and cost
- Quick action buttons
- User information

### Logs Page (`/logs`)
- Paginated log listing
- Endpoint, method, status display
- IPFS hash links
- Verification status

### Billing Page (`/billing`)
- Current billing period
- Requests count
- Total cost
- Billing history table
- Payment status

### Verification Page (`/verification`)
- Log hash input
- Verification results
- Log details display
- Blockchain confirmation

## Components

### Navbar
- Navigation links
- User menu
- Logout functionality
- Responsive design

### PrivateRoute
- Route protection
- Authentication check
- Redirect to login

## Services

### api.js
Axios instance with:
- Base URL configuration
- JWT token injection
- Error handling
- 401 response handling

### blockchain.js
Blockchain utilities:
- Provider initialization
- Wallet connection
- Network switching
- Address/hash formatting

## Styling

All styles are modular and component-specific:
- Gradient backgrounds
- Responsive design
- Accessible colors
- Mobile-friendly

## Authentication Flow

1. User registers/logs in
2. Token stored in localStorage
3. Token sent with all API requests
4. Token verification on routes
5. Automatic logout on 401

## API Integration

### Request Example
```javascript
import api from '../utils/api';

const response = await api.get('/logs');
```

### Error Handling
```javascript
try {
  const response = await api.post('/logs/create', logData);
} catch (error) {
  console.error(error.response?.data?.message);
}
```

## Building for Production

```bash
npm run build
```

Creates optimized build in `build/` folder.

### Deploy to IPFS

```bash
npm run build
ipfs add -r build
```

## Testing

```bash
npm test
```

## Development Tips

### Enable Debug Mode
```javascript
localStorage.setItem('debug', 'true');
```

### Mock API Responses
Update `api.js` to return mock data during development.

### Hot Reload
Frontend automatically reloads on file changes.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Code splitting with React.lazy()
- Image optimization
- Minification in production
- Caching strategies

## Security Measures

- ✅ Secure token storage
- ✅ HTTPS only in production
- ✅ CSRF protection
- ✅ Input validation
- ✅ XSS prevention

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend not responding | Check REACT_APP_BACKEND_URL |
| Token expires immediately | Check JWT_EXPIRATION in backend |
| CORS errors | Verify CORS settings in backend |
| Page blank after login | Check localStorage permissions |

## Environment Variables

Required:
```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

Optional:
```env
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_NETWORK=sepolia
REACT_APP_CHAIN_ID=11155111
```

## File Size Optimization

Build output typically:
- Main bundle: ~200KB
- CSS: ~50KB
- Total gzipped: ~100KB

## Mobile Responsiveness

- Breakpoint at 768px
- Flexible grid layouts
- Touch-friendly buttons
- Responsive navigation

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance

## Future Enhancements

- [ ] Dark mode
- [ ] Multi-language support
- [ ] Advanced filtering
- [ ] Export functionality
- [ ] Real-time notifications
- [ ] Web3 wallet integration

## License

MIT
