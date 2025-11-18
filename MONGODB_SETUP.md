# MongoDB Atlas Configuration

The project is configured to use MongoDB Atlas (cloud database).

## Connection String

Your MongoDB Atlas connection string is:
```
mongodb+srv://bsp7779:FNo92TAJCIj0Yfgv@cluster0.i4orfae.mongodb.net/cricket-auction?retryWrites=true&w=majority
```

## Setup Instructions

1. Create a `.env` file in the `backend` folder (if it doesn't exist)

2. Add the following content to `backend/.env`:
```
PORT=3000
MONGODB_URI=mongodb+srv://bsp7779:FNo92TAJCIj0Yfgv@cluster0.i4orfae.mongodb.net/cricket-auction?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-this-in-production
UPLOAD_PATH=./uploads
```

3. Make sure your MongoDB Atlas cluster:
   - Is running and accessible
   - Has network access configured (IP whitelist)
   - Database user has proper permissions

## Important Notes

- No local MongoDB installation needed!
- Requires internet connection to access MongoDB Atlas
- The database name will be: `cricket-auction`
- Collections will be created automatically when you first use the app

## Testing Connection

After starting the backend server, you should see:
```
MongoDB Connected
Server running on port 3000
```

If you see connection errors, check:
1. Internet connection
2. MongoDB Atlas cluster status
3. IP whitelist settings in MongoDB Atlas dashboard

