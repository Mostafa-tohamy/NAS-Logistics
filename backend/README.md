# NAS Logistics Backend API

## Omnichannel Customer Engagement System

### Installation

```bash
cd backend
npm install
```

### Configuration

1. Copy `.env.example` to `.env`
2. Fill in your environment variables:
   - Database credentials
   - Twilio API keys (SMS)
   - SendGrid API key (Email)
   - Firebase credentials (Push Notifications)
   - JWT secret

### Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Database Setup

```bash
# Run migrations
npm run migrate

# Seed sample data
npm run seed
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Customers
- `GET /api/customers` - Get all customers (with pagination & segmentation)
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `PUT /api/customers/:id/preferences` - Update customer notification preferences
- `DELETE /api/customers/:id` - Delete customer

#### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign details with notifications
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign
- `POST /api/campaigns/:id/send` - Send campaign to segment
- `DELETE /api/campaigns/:id` - Delete campaign

#### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/:id` - Get notification details
- `GET /api/notifications/customer/:customerId` - Get notifications for a customer
- `GET /api/notifications/campaign/:campaignId` - Get notifications for a campaign
- `PUT /api/notifications/:id/status` - Update notification status

#### Analytics
- `GET /api/analytics/campaigns/:campaignId` - Campaign performance metrics
- `GET /api/analytics/engagement/overview` - Overall engagement metrics (last 30 days)
- `GET /api/analytics/segments/engagement` - Engagement by customer segment

### Example Usage

#### Register & Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "name": "John Doe"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

#### Create Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ahmed",
    "last_name": "Hassan",
    "email": "ahmed@example.com",
    "phone": "+201001234567",
    "company_name": "Tech Corp",
    "segment": "premium",
    "preferences": {
      "email": true,
      "sms": true,
      "push": false
    }
  }'
```

#### Create Campaign
```bash
curl -X POST http://localhost:5000/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Promotion",
    "description": "Special summer shipping offer",
    "channels": ["email", "sms"],
    "segment": "standard",
    "content": {
      "subject": "Summer Sale!",
      "email_body": "<h1>Get 20% off</h1>",
      "sms_body": "Summer Sale! 20% off shipping"
    },
    "status": "draft"
  }'
```

#### Send Campaign
```bash
curl -X POST http://localhost:5000/api/campaigns/{campaignId}/send \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Technology Stack
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Email:** SendGrid
- **SMS:** Twilio
- **Push Notifications:** Firebase
- **Message Queue:** Redis/Bull
