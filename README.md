# Jyothi Backend - Authentication System

A complete authentication system with role-based access control using Node.js, Express, Prisma, PostgreSQL, and Supabase.

## Features

- ✅ User registration and login
- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Role-based access control (ADMIN/USER)
- ✅ Input validation
- ✅ Admin user management
- ✅ PostgreSQL database with Prisma ORM

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory with your Supabase credentials:

```env
PORT=3000

# Transaction pooler (for regular queries)
DATABASE_URL="postgresql://postgres.ilxxwophmdybndvmagup:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

# Session pooler (for migrations and direct connections)
DIRECT_URL="postgresql://postgres.ilxxwophmdybndvmagup:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
NODE_ENV=development
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate
```

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER"
  },
  "token": "jwt_token_here"
}
```

#### GET `/api/auth/profile`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### Admin Endpoints

#### GET `/api/auth/users`
Get all users (ADMIN only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### PATCH `/api/auth/users/:userId/role`
Update user role (ADMIN only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

## Authentication Flow

1. **Signup**: User registers with email/password → Account created with USER role
2. **Login**: User logs in → JWT token generated with user info and role
3. **Protected Routes**: Include JWT token in Authorization header
4. **Role-based Access**: Admin routes check for ADMIN role

## Database Schema

```prisma
enum Role {
  ADMIN
  USER
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role     @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Security Features

- Password hashing with bcrypt (salt rounds: 10)
- JWT tokens with expiration
- Input validation and sanitization
- Role-based access control
- Secure password requirements (minimum 6 characters)

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

### Project Structure
```
src/
├── config/
│   └── database.js      # Prisma client configuration
├── controllers/
│   └── authController.js # Authentication logic
├── middleware/
│   └── auth.js          # JWT and role middleware
├── routes/
│   └── auth.js          # Authentication routes
└── server.js            # Main server file
```

## Testing the API

### Using curl

1. **Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","confirmPassword":"password123"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. **Get Profile (with token):**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | Supabase connection pooling URL | - |
| `DIRECT_URL` | Supabase direct connection URL | - |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRES_IN` | JWT token expiration | 7d |
| `NODE_ENV` | Environment mode | development |

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your Supabase credentials
   - Check if the database is accessible
   - Ensure migrations have been run

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure Authorization header format: `Bearer <token>`

3. **Role Access Denied**
   - Verify user has ADMIN role for admin endpoints
   - Check JWT token contains correct role information

## License

MIT 