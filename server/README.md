# Native Chat App Server

A real-time chat application server built with Express.js, Socket.IO, and MongoDB.

## Features

- Real-time messaging with Socket.IO
- User authentication with JWT
- Online/offline presence tracking
- Message read receipts
- Typing indicators
- RESTful API endpoints

## Prerequisites

- Node.js >= 18.0.0
- MongoDB database (MongoDB Atlas recommended)
- npm >= 9.0.0

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=4000
NODE_ENV=development
CLIENT_URL=*
```

See `.env.example` for a template.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (copy `.env.example` to `.env` and fill in values)

3. Start the development server:
```bash
npm run dev
```

4. The server will run on `http://localhost:4000`

## Production Deployment on Render

### Step 1: Prepare Your Repository

1. Ensure all changes are committed to your Git repository
2. Push to GitHub, GitLab, or Bitbucket

### Step 2: Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your repository
4. Configure the service:
   - **Name**: `native-chat-app-server` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables

In the Render dashboard, add the following environment variables:

1. **MONGO_URI**: Your MongoDB connection string
   - Get this from MongoDB Atlas: Database → Connect → Connect your application
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

2. **JWT_SECRET**: A secure random string
   - Generate one using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

3. **NODE_ENV**: Set to `production`

4. **CLIENT_URL**: Your mobile app URL or frontend URL
   - For development/testing: Use `*` to allow all origins
   - For production: Use your actual frontend URL (e.g., `https://yourapp.com`)
   - For multiple origins: Use comma-separated values (e.g., `https://app1.com,https://app2.com`)

5. **PORT**: Leave empty (Render sets this automatically)

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically deploy your application
3. Wait for the deployment to complete (usually 2-5 minutes)
4. Your server will be available at: `https://your-service-name.onrender.com`

### Step 5: Verify Deployment

1. Visit `https://your-service-name.onrender.com/health` to check if the server is running
2. You should see a JSON response:
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Step 6: Update Mobile App Configuration

Update your mobile app's configuration to use the production URL:

In `mobile/constants/config.ts`:
```typescript
const PRODUCTION_URL = "https://chat-app.zahid.cat";

export const API_URL = __DEV__
  ? Platform.OS === "web"
    ? "http://localhost:4000"
    : "http://192.168.1.36:4000"
  : PRODUCTION_URL;

export const SOCKET_URL = API_URL;
```

This configuration automatically uses:
- Production URL (`https://chat-app.zahid.cat`) when app is built for production
- Development URLs when running in development mode

## API Endpoints

### Health Check
- `GET /` - Server status
- `GET /health` - Health check with uptime

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users` - Get all users (authenticated)
- `GET /users/:id` - Get user by ID (authenticated)
- `PUT /users/:id` - Update user profile (authenticated)

### Conversations
- `POST /conversations/between` - Create or get conversation (authenticated)
- `GET /conversations/:id/messages` - Get messages for conversation (authenticated)

## Socket.IO Events

### Client → Server
- `user:online` - Mark user as online
- `message:send` - Send a message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `message:read` - Mark message as read

### Server → Client
- `presence:update` - User online/offline status update
- `message:new` - New message received
- `message:sent` - Message sent confirmation
- `message:error` - Message sending error
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `message:read` - Message read by user


## Support

For issues or questions, please open an issue in the repository.
