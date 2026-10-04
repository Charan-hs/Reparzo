# Reparzo Edge REST API Reference

The Reparzo API is built on Cloudflare Workers using the native Hono framework, delivering sub-50ms latency across 300+ global edge locations.

## Base URL
- **Local Development**: `http://localhost:8787/api`
- **Frontend Reverse-Proxy**: `http://localhost:3000/api` (proxied by Vite)
- **Production Edge**: `https://reparzo.com/api` (internally routed via Cloudflare Service Bindings)

---

## 1. System Health Check

### `GET /api/health`
Returns live diagnostics regarding the edge worker isolate, Cloudflare D1 database connection, and storage bindings.

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "service": "reparzo-backend",
    "status": "healthy",
    "environment": "development",
    "edgeRuntime": "Cloudflare Workers (V8 Isolate)",
    "database": {
      "engine": "Cloudflare D1 (Distributed SQLite)",
      "status": "connected"
    },
    "cache": {
      "engine": "Cloudflare KV",
      "status": "configured"
    },
    "storage": {
      "engine": "Cloudflare R2",
      "status": "configured"
    }
  },
  "meta": {
    "timestamp": 1774982400000,
    "durationMs": 18
  }
}
```

---

## 2. Services Catalog

### `GET /api/services`
Retrieves all active repair services with estimated diagnostic pricing and duration.

#### Query Parameters
- None required.

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "srv_ac_repair",
      "slug": "ac-repair-and-service",
      "title": "AC Deep Clean & Repair",
      "description": "Comprehensive inspection, coil cleaning, gas charging, and filter sanitization.",
      "category": "Appliances",
      "priceEstimated": 699,
      "durationMinutes": 90,
      "icon": "Wind",
      "isPopular": true,
      "isActive": true
    }
  ],
  "meta": {
    "timestamp": 1774982400000,
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 10
    }
  }
}
```

---

## 3. Bookings

### `POST /api/bookings`
Creates a new on-demand service appointment.

#### Request Body
```json
{
  "serviceId": "srv_ac_repair",
  "customerName": "Charan Sharma",
  "customerPhone": "9876543210",
  "customerEmail": "charan@example.com",
  "address": "124, 4th Main, Indiranagar",
  "city": "Davangere",
  "pincode": "560038",
  "issueDescription": "Cooling not effective, compressor clicking sound",
  "scheduledAt": "2026-10-02T10:00:00Z"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "bkg_1774982400000_a8bc9",
      "serviceId": "srv_ac_repair",
      "customerName": "Charan Sharma",
      "status": "CONFIRMED",
      "scheduledAt": "2026-10-02T10:00:00.000Z"
    },
    "message": "Your service request has been confirmed! A technician will reach out shortly."
  },
  "meta": {
    "timestamp": 1774982400000
  }
}
```
