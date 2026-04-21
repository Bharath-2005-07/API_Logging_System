# Frontend Application

## Overview

React UI for authentication, logs, billing, and verification workflows.

## Current Features

- Login/register and protected navigation
- Dashboard stats
- Logs page with:
  - Log hash column
  - Previous hash column
  - On-chain tx hash column
  - Direct "View on Sepolia" explorer link
- Billing page with current pricing and payment modal
- Verification page using log hash input

## Start

```bash
npm install
npm start
```

App: http://localhost:3000

## Frontend Env (from root .env)

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_NETWORK=sepolia
REACT_APP_CHAIN_ID=11155111
```

## Current Logs UI Behavior

- Log Hash is used in Verify page.
- Transaction Hash is used for Sepolia explorer link.
- If blockchainHash is missing, UI shows:
  - On-chain anchoring pending or failed.

## Verification Notes

- Verify page input expects SHA-256 log hash.
- Pasting transaction hash there will fail.

## Common Issues

- Page load issues: ensure backend is running on 5000
- 401/403: logout and login again to refresh token
- 404 from stats: ensure backend has latest fixes and restarted
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
