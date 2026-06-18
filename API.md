# LocalSite AI - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/forgot-password` | Send reset email | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| POST | `/api/auth/refresh-token` | Refresh JWT | No |
| POST | `/api/auth/verify-email` | Verify email | No |
| GET | `/api/auth/google` | Google OAuth | No |
| GET | `/api/auth/me` | Get current user | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/user/profile` | Get user profile | Yes |
| PUT | `/api/user/profile` | Update profile | Yes |
| PUT | `/api/user/password` | Change password | Yes |
| DELETE | `/api/user/account` | Delete account | Yes |
| GET | `/api/user/notifications` | Get notifications | Yes |
| PUT | `/api/user/notifications/:id/read` | Mark read | Yes |

### Website Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/websites/generate` | Generate website with AI | Yes |
| GET | `/api/websites` | List user's websites | Yes |
| GET | `/api/websites/:id` | Get website details | Yes |
| PUT | `/api/websites/:id` | Update website | Yes |
| DELETE | `/api/websites/:id` | Delete website | Yes |
| POST | `/api/websites/:id/publish` | Publish website | Yes |
| POST | `/api/websites/:id/regenerate` | Regenerate section | Yes |
| GET | `/api/websites/:id/analytics` | Get website analytics | Yes |

### Payment Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/create-order` | Create payment order | Yes |
| POST | `/api/payments/verify` | Verify payment | Yes |
| GET | `/api/payments/plans` | Get subscription plans | No |
| POST | `/api/payments/subscribe` | Create subscription | Yes |
| POST | `/api/payments/cancel-subscription` | Cancel subscription | Yes |
| GET | `/api/payments/invoices` | Get user invoices | Yes |
| POST | `/api/payments/stripe-webhook` | Stripe webhook | No |
| POST | `/api/payments/razorpay-webhook` | Razorpay webhook | No |

### Contact Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/contact/send` | Submit contact form | No |
| GET | `/api/contact/leads` | Get leads | Yes |
| PUT | `/api/contact/leads/:id` | Update lead status | Yes |
| GET | `/api/contact/forms` | Get contact forms | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Dashboard stats | Admin |
| GET | `/api/admin/users` | List all users | Admin |
| GET | `/api/admin/users/:id` | Get user details | Admin |
| PUT | `/api/admin/users/:id` | Update user role | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |
| GET | `/api/admin/revenue` | Revenue analytics | Admin |
| GET | `/api/admin/subscriptions` | Subscription overview | Admin |
| GET | `/api/admin/ai-usage` | AI usage stats | Admin |
| POST | `/api/admin/templates` | Create template | Admin |
| PUT | `/api/admin/templates/:id` | Update template | Admin |
| DELETE | `/api/admin/templates/:id` | Delete template | Admin |

### Analytics Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/analytics/track` | Track page view | Yes |
| GET | `/api/analytics/website/:id` | Get website analytics | Yes |
| GET | `/api/analytics/traffic-sources` | Traffic sources | Yes |
| GET | `/api/analytics/conversions` | Conversion rates | Yes |

## Response Format

### Success
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "errors": {}
}
```

### Pagination
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'Bearer <jwt_token>' }
});
```

### Client Events
| Event | Payload | Description |
|-------|---------|-------------|
| `join:website` | `{ websiteId }` | Join website room |
| `leave:website` | `{ websiteId }` | Leave website room |

### Server Events
| Event | Payload | Description |
|-------|---------|-------------|
| `generation:progress` | `{ percentage, status }` | AI generation progress |
| `generation:complete` | `{ websiteId }` | Generation complete |
| `deployment:status` | `{ websiteId, status }` | Deployment update |
| `notification` | `{ type, title, message }` | User notification |
| `live:visitor` | `{ count, page }` | Live visitor count |

## Error Codes
| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
