# Booking/Quote/Enquiry API Documentation

This document describes the API endpoints for the Jyoti Enterprises booking system, based on the Figma design analysis.

## Base URL
```
http://localhost:3000/api
```

## Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/services` | GET | Get all available services |
| `/events` | GET | Get all event types |
| `/bookings` | POST | Submit a new booking/enquiry |
| `/bookings` | GET | Get all bookings (admin) |
| `/bookings/:id` | GET | Get a single booking (admin) |

---

## 1. Get All Services

**Endpoint:** `GET /api/services`

**Description:** Retrieves all available services that customers can select from.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Luxury Toilets"
    },
    {
      "id": "uuid-2", 
      "name": "Bio Loo"
    },
    {
      "id": "uuid-3",
      "name": "Handwash Basins"
    },
    {
      "id": "uuid-4",
      "name": "Men's Urinals"
    },
    {
      "id": "uuid-5",
      "name": "Cooling Systems"
    },
    {
      "id": "uuid-6",
      "name": "Patio Heaters"
    }
  ]
}
```

---

## 2. Get All Event Types

**Endpoint:** `GET /api/events`

**Description:** Retrieves all available event types that customers can select from.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "VIP Events (Conferences & Rallys)"
    },
    {
      "id": "uuid-2",
      "name": "Festivals & Concerts"
    },
    {
      "id": "uuid-3",
      "name": "Social & Corporate Gatherings"
    },
    {
      "id": "uuid-4",
      "name": "Amusement Parks, Fairs & Carnivals"
    },
    {
      "id": "uuid-5",
      "name": "Sports"
    },
    {
      "id": "uuid-6",
      "name": "Weddings & Family Gatherings"
    }
  ]
}
```

---

## 3. Submit a New Booking

**Endpoint:** `POST /api/bookings`

**Description:** Submits a new booking/enquiry request. Sends email notification to admins.

**Request Body:**
```json
{
  "name": "John Doe",
  "mobile": "+91 98765 43210",
  "email": "john.doe@example.com",
  "gst": "22AAAAA0000A1Z5",
  "paxCount": 500,
  "attendants": 50,
  "toilets": 20,
  "location": "Bangalore Palace Grounds",
  "startDate": "2024-12-25",
  "endDate": "2024-12-26",
  "startTime": "10:00",
  "endTime": "22:00",
  "serviceIds": ["uuid-1", "uuid-3"],
  "eventTypeIds": ["uuid-2", "uuid-6"]
}
```

**Field Descriptions:**
- `name` (required): Customer's full name (2-50 characters)
- `mobile` (required): Indian mobile number with +91 prefix
- `email` (required): Valid email address
- `gst` (optional): 15-character GST number
- `paxCount` (required): Number of people attending (positive integer)
- `attendants` (optional): Number of attendants needed
- `toilets` (optional): Number of toilets needed
- `location` (optional): Event location (1-200 characters)
- `startDate` (required): Event start date (ISO 8601 format)
- `endDate` (required): Event end date (ISO 8601 format)
- `startTime` (optional): Event start time (HH:MM format)
- `endTime` (optional): Event end time (HH:MM format)
- `serviceIds` (required): Array of service UUIDs (at least 1)
- `eventTypeIds` (required): Array of event type UUIDs (at least 1)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Booking submitted successfully! We will contact you soon.",
  "data": {
    "bookingId": "booking-uuid",
    "submittedAt": "2024-08-06T12:00:00.000Z",
    "customerName": "John Doe"
  }
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Please enter a valid email address",
      "path": "email",
      "location": "body"
    }
  ]
}
```

---

## 4. Get All Bookings (Admin)

**Endpoint:** `GET /api/bookings`

**Description:** Retrieves all booking requests (admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "name": "John Doe",
      "mobile": "+91 98765 43210",
      "email": "john.doe@example.com",
      "gst": "22AAAAA0000A1Z5",
      "paxCount": 500,
      "attendants": 50,
      "toilets": 20,
      "location": "Bangalore Palace Grounds",
      "startDate": "2024-12-25T00:00:00.000Z",
      "endDate": "2024-12-26T00:00:00.000Z",
      "startTime": "10:00",
      "endTime": "22:00",
      "createdAt": "2024-08-06T12:00:00.000Z",
      "services": [
        {
          "service": {
            "id": "service-uuid",
            "name": "Luxury Toilets"
          }
        }
      ],
      "events": [
        {
          "eventType": {
            "id": "event-uuid",
            "name": "Weddings & Family Gatherings"
          }
        }
      ]
    }
  ]
}
```

---

## 5. Get Single Booking (Admin)

**Endpoint:** `GET /api/bookings/:id`

**Description:** Retrieves details of a specific booking (admin only).

**Parameters:**
- `id`: Booking UUID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "name": "John Doe",
    "mobile": "+91 98765 43210",
    "email": "john.doe@example.com",
    "gst": "22AAAAA0000A1Z5",
    "paxCount": 500,
    "attendants": 50,
    "toilets": 20,
    "location": "Bangalore Palace Grounds",
    "startDate": "2024-12-25T00:00:00.000Z",
    "endDate": "2024-12-26T00:00:00.000Z",
    "startTime": "10:00",
    "endTime": "22:00",
    "createdAt": "2024-08-06T12:00:00.000Z",
    "services": [
      {
        "service": {
          "id": "service-uuid",
          "name": "Luxury Toilets"
        }
      }
    ],
    "events": [
      {
        "eventType": {
          "id": "event-uuid",
          "name": "Weddings & Family Gatherings"
        }
      }
    ]
  }
}
```

**Not Found Response (404):**
```json
{
  "success": false,
  "message": "Booking not found"
}
```

---

## Email Notifications

When a booking is submitted:
1. **Admin Notification:** Email is sent to `gdhruv579@gmail.com` and `dhruvgupfa523@gmail.com`
2. **Email Content:** Includes all booking details, customer information, and event schedule
3. **Email Template:** Professional HTML template with Jyoti branding

---

## Error Responses

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to submit booking. Please try again later."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Booking not found"
}
```

---

## Testing the API

### 1. Get Services
```bash
curl -X GET http://localhost:3000/api/services
```

### 2. Get Event Types
```bash
curl -X GET http://localhost:3000/api/events
```

### 3. Submit a Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "mobile": "+91 98765 43210",
    "email": "test@example.com",
    "paxCount": 100,
    "startDate": "2024-12-25",
    "endDate": "2024-12-26",
    "serviceIds": ["service-uuid-1"],
    "eventTypeIds": ["event-uuid-1"]
  }'
```

---

## Database Schema

### Services Table
- `id` (UUID, Primary Key)
- `name` (String)

### EventTypes Table
- `id` (UUID, Primary Key)
- `name` (String)

### Bookings Table
- `id` (UUID, Primary Key)
- `name` (String)
- `mobile` (String)
- `email` (String)
- `gst` (String, Optional)
- `paxCount` (Integer)
- `attendants` (Integer, Optional)
- `toilets` (Integer, Optional)
- `location` (String, Optional)
- `startDate` (DateTime)
- `endDate` (DateTime)
- `startTime` (String, Optional)
- `endTime` (String, Optional)
- `createdAt` (DateTime)

### Relations
- `BookingService` (Many-to-Many between Booking and Service)
- `BookingEvent` (Many-to-Many between Booking and EventType) 