# Jyoti Backend

Authentication system with role-based access control and contact form functionality.

## Features

- User authentication with JWT
- Role-based access control
- Contact form with email notifications
- PostgreSQL database with Prisma ORM
- TypeScript support

## Email Setup with Resend

This project uses **Resend** for sending email notifications when contact forms are submitted.

### What is Resend?

Resend is a modern email API service that offers:
- **3,000 emails/month free**
- High deliverability rates
- Simple developer-friendly API
- Great documentation and support

### Setup Instructions

#### 1. Get Resend API Key

1. Sign up at [https://resend.com](https://resend.com)
2. Go to your dashboard → API Keys
3. Create a new API key (starts with `re_`)
4. Copy the API key

#### 2. Configure Environment

Add your Resend API key to your `.env` file:

```env
RESEND_API_KEY="re_your_actual_api_key_here"
```

#### 3. Domain Verification (Optional)

For production, verify your domain:
1. In Resend dashboard → Domains
2. Add your domain (e.g., `jyotientp.com`)
3. Follow DNS setup instructions
4. Update the `from` email in `src/services/emailService.ts`

#### 4. Test Email Service

**Option 1: Using the API endpoint**
```bash
# Start the server
npm run dev

# Test email via API
curl -X POST http://localhost:3000/api/contact/test-email
```

**Option 2: Using the test script**
```bash
# Build the project
npm run build

# Run the test script
node test-email.js
```

### Email Configuration

The email service is configured in `src/services/emailService.ts`:

- **From Email**: `noreply@jyotientp.com` (change to your verified domain)
- **To Emails**: 
  - `gdhruv579@gmail.com`
  - `dhruvgupfa523@gmail.com`
- **Subject**: "New Quote Request - [Customer Name]"
- **Content**: Includes customer details and event information

### Email Templates

The service generates both plain text and HTML emails with:
- Professional styling
- Customer information
- Event details
- Contact information

### Troubleshooting

1. **API Key Not Found**: Make sure `RESEND_API_KEY` is in your `.env` file
2. **Domain Not Verified**: Use `onboarding@resend.dev` for testing
3. **Emails Not Sending**: Check the console logs for error messages
4. **Rate Limits**: Free tier allows 3,000 emails/month

## Installation

```bash
npm install
```

## Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Contact Form
- `POST /api/contact/submit` - Submit contact form
- `POST /api/contact/test-email` - Test email service
- `GET /api/contact/info` - Get contact information

## Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="your_database_url"
DIRECT_URL="your_direct_database_url"

# JWT
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# Email (Resend)
RESEND_API_KEY="re_your_resend_api_key"
``` 