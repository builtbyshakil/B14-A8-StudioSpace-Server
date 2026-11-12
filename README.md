# StudioSpace Server

Express.js and MongoDB API for StudioSpace.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the values
3. `npm run seed` adds sample studios and confirmed bookings
4. `npm run dev`

## Endpoints

- `GET /api/studios`, `GET /api/studios/featured`, `GET /api/studios/:id`
- `GET /api/studios/mine`, `POST /api/studios`, `PUT /api/studios/:id`, `DELETE /api/studios/:id` (JWT required)
- `POST /api/bookings`, `GET /api/bookings/mine`, `GET /api/bookings/requests`, `PATCH /api/bookings/:id/cancel`, `PATCH /api/bookings/:id/status` (JWT required)
- `GET /api/bookings/availability/:studioId?date=YYYY-MM-DD`
- `GET /api/wishlist/ids`, `POST /api/wishlist/:studioId` (JWT required)

Protected routes read the JWT from the `studio_token` HTTPOnly cookie and answer `401 Unauthorized` when it is missing or invalid.
