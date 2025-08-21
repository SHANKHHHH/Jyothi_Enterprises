# Complete API Documentation for Jyoti Enterprises

## Base URL
```
http://localhost:3000/api
```

## API Overview
This API provides complete functionality for Jyoti Enterprises event booking system, including:
- User authentication and management
- Service and event type management
- Booking and quote submission
- Shopping cart functionality
- Contact form handling

---

## 🔐 Authentication Endpoints

### POST /api/auth/login
**Description:** User login authentication
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET /api/auth/profile
**Description:** Get authenticated user profile
**Headers:** `Authorization: Bearer <token>`

---

## 🛠️ Services Endpoints

### GET /api/services
**Description:** Get all available services
**Response:**
```json
{
  "success": true,
  "message": "Services fetched successfully",
  "count": 6,
  "services": [
    {
      "id": "uuid-1",
      "name": "Luxury Toilets"
    },
    {
      "id": "uuid-2",
      "name": "Bio Loos"
    }
  ]
}
```

### GET /api/services/:id
**Description:** Get specific service by ID

### POST /api/services
**Description:** Create new service (protected)
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "name": "New Service Name"
}
```

### PUT /api/services/:id
**Description:** Update service (protected)
**Headers:** `Authorization: Bearer <token>`

### DELETE /api/services/:id
**Description:** Delete service (protected)
**Headers:** `Authorization: Bearer <token>`

### GET /api/services/popular
**Description:** Get most popular services

---

## 🎉 Events Endpoints

### GET /api/events
**Description:** Get all event types
**Response:**
```json
{
  "success": true,
  "message": "Events fetched successfully",
  "count": 6,
  "events": [
    {
      "id": "uuid-1",
      "name": "VIP Events (Conferences & Rallys)"
    },
    {
      "id": "uuid-2",
      "name": "Festivals & Concerts"
    }
  ]
}
```

### GET /api/events/:id
**Description:** Get specific event type by ID

### POST /api/events
**Description:** Create new event type (protected)
**Headers:** `Authorization: Bearer <token>`

### PUT /api/events/:id
**Description:** Update event type (protected)
**Headers:** `Authorization: Bearer <token>`

### DELETE /api/events/:id
**Description:** Delete event type (protected)
**Headers:** `Authorization: Bearer <token>`

### GET /api/events/popular
**Description:** Get most popular event types

### GET /api/events/search?q=query
**Description:** Search events by name

---

## 📅 Booking Endpoints

### POST /api/booking
**Description:** Submit new booking/enquiry
**Body:**
```json
{
  "name": "Customer Name",
  "mobile": "+91 9876543210",
  "email": "customer@example.com",
  "gst": "GST123456789",
  "paxCount": 500,
  "attendants": 50,
  "toilets": 25,
  "location": "Event Location",
  "startDate": "2025-02-01T00:00:00Z",
  "endDate": "2025-02-03T00:00:00Z",
  "startTime": "09:00",
  "endTime": "18:00",
  "serviceIds": ["service-uuid-1", "service-uuid-2"],
  "eventTypeIds": ["event-uuid-1"]
}
```

### GET /api/booking
**Description:** Get all bookings (admin)
**Headers:** `Authorization: Bearer <token>`

### GET /api/booking/:id
**Description:** Get specific booking
**Headers:** `Authorization: Bearer <token>`

---

## 🛒 Cart Endpoints

### GET /api/cart
**Description:** Get cart contents
**Headers:** `session-id: <session-id>`

### POST /api/cart/items
**Description:** Add item to cart
**Headers:** `session-id: <session-id>`
**Body:**
```json
{
  "productId": "product-uuid",
  "quantity": 2
}
```

### PUT /api/cart/items/:id
**Description:** Update cart item quantity
**Headers:** `session-id: <session-id>`

### DELETE /api/cart/items/:id
**Description:** Remove item from cart
**Headers:** `session-id: <session-id>`

### POST /api/cart/checkout
**Description:** Process checkout
**Headers:** `session-id: <session-id>`
**Body:**
```json
{
  "customerName": "Customer Name",
  "customerEmail": "customer@example.com",
  "customerPhone": "+91 9876543210"
}
```

---

## 📞 Contact Endpoints

### POST /api/contact/submit
**Description:** Submit contact form (Get a Quote)
**Body:**
```json
{
  "name": "Customer Name",
  "mobileNumber": "+91 9876543210",
  "productType": "Portable Toilets",
  "eventType": "Wedding",
  "paxCount": "500",
  "startDate": "2025-02-01",
  "startTime": "09:00",
  "startTimePeriod": "AM",
  "endDate": "2025-02-03",
  "endTime": "18:00",
  "endTimePeriod": "PM"
}
```

### POST /api/contact/introduce-yourself
**Description:** Introduce yourself form with file upload
**Body:** `multipart/form-data`
**Fields:**
- `name`: Customer name
- `mobileNumber`: Mobile number
- `email`: Email address
- `gst`: GST number (optional)
- `additionalDocument`: File upload (optional)

---

## 🚀 Quick Start Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment
```bash
cp env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup
```bash
npm run db:push
npm run seed:all
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Build and Start Production
```bash
npm run build
npm start
```

---

## 📊 Database Schema

The API uses the following main models:
- **User**: Authentication and user management
- **Service**: Available services (toilets, cooling systems, etc.)
- **EventType**: Types of events (weddings, corporate, etc.)
- **Booking**: Customer booking requests
- **Product**: Products for shopping cart
- **Cart/CartItem**: Shopping cart functionality
- **Order/OrderItem**: Order management

---

## 🔧 Testing Endpoints

### Health Check
- `GET /api/health` - API health status
- `GET /` - API documentation and endpoint list

### Database Health
- `GET /health/db` - Database connection status

---

## 📝 Notes

- All protected routes require `Authorization: Bearer <token>` header
- Cart operations require `session-id` header for anonymous users
- File uploads are supported for contact forms
- Email notifications are sent for bookings and contact submissions
- Database operations include retry logic for reliability

---

## 🆘 Support

For API support or questions, contact your technical team.

