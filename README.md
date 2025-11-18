# Cricket Auction Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cricket-auction
JWT_SECRET=your-secret-key
UPLOAD_PATH=./uploads
```

3. Start MongoDB server

4. Run the server:
```bash
npm run dev
```

## API Endpoints

### Events
- POST `/api/events` - Create new event
- GET `/api/events` - Get all events
- GET `/api/events/:id` - Get event by ID
- GET `/api/events/link/:link` - Get event by shareable link
- PATCH `/api/events/:id/status` - Update event status
- DELETE `/api/events/:id` - Delete event

### Players
- POST `/api/players` - Register player (multipart/form-data with image)
- GET `/api/players/event/:eventId` - Get all players for event
- GET `/api/players/event/:eventId/type/:type` - Get players by type
- GET `/api/players/:id` - Get player by ID
- PATCH `/api/players/:id/auctioned` - Mark player as auctioned
- DELETE `/api/players/:id` - Delete player

### Auction
- GET `/api/auction/event/:eventId/players` - Get all players grouped by type (randomized)
- GET `/api/auction/event/:eventId/type/:type` - Get players by type (randomized)
- GET `/api/auction/event/:eventId/next?type=Type` - Get next random player
- GET `/api/auction/event/:eventId/stats` - Get auction statistics

