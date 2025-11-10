# Native Chat App

A real-time chat application with a React Native mobile frontend and Node.js backend. Built for learning and experimenting with WebSocket connections, JWT authentication, and mobile development.

## What's Inside

This repo contains two main parts:

- **`/server`** - Express.js backend with Socket.IO for real-time messaging
- **`/mobile`** - React Native app built with Expo

The app supports real-time messaging, online/offline status, typing indicators, and message read receipts. Pretty much what you'd expect from a modern chat app.

## Tech Stack

**Backend:**
- Node.js + Express
- Socket.IO for WebSockets
- MongoDB (with Mongoose)
- JWT for authentication
- bcrypt for password hashing

**Mobile:**
- React Native + Expo
- TypeScript
- React Navigation
- Socket.IO client
- Axios for API calls

## Prerequisites

Before you start, make sure you have:

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB database (I recommend MongoDB Atlas for the free tier)
- Expo Go app on your phone (optional, for testing on device)
- A code editor (VS Code recommended)

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/ZahidGazi/native-chat-app.git
cd native-chat-app
```

### 2. Set Up the Server

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here
PORT=4000
NODE_ENV=development
CLIENT_URL=*
```

**Environment Variables Explained:**

- `MONGO_URI` - Your MongoDB connection string. Get this from MongoDB Atlas after creating a cluster.
- `JWT_SECRET` - A random secret key for signing JWT tokens. Generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Set to `development` for local dev, `production` for deployment
- `CLIENT_URL` - CORS configuration. Use `*` for development, or specify your frontend URL for production

### 3. Seed the Database

The app comes with some test users. Run the seed script to populate your database:

```bash
npm run seed
```

This creates three users you can use for testing:

| Name   | Email              | Password |
|--------|-------------------|----------|
| zahid  | hello@zahid.cat   | test123  |
| arib   | arib@gmail.com    | test123  |
| ronak  | ronak@gmail.com   | test123  |

### 4. Start the Server

For development with auto-reload:

```bash
npm run dev
```

Or for production:

```bash
npm start
```

The server will be running at `http://localhost:4000`. You should see a message in the console confirming the MongoDB connection.

### 5. Set Up the Mobile App

Open a new terminal and navigate to the mobile directory:

```bash
cd mobile
npm install
```

Update the API URL in `mobile/constants/config.ts` to point to your local server:

```typescript
const DEV_MOBILE_URL = "http://192.168.1.36:4000"; // Replace with your local IP
```

**Finding Your Local IP:**
- **Windows:** Run `ipconfig` and look for IPv4 Address
- **Mac/Linux:** Run `ifconfig` or `ip addr`
- **Important:** Don't use `localhost` or `127.0.0.1` - use your actual local network IP so your phone can connect

### 6. Start the Mobile App

```bash
npm start
```

This will open the Expo developer tools. You can then:

- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan the QR code with Expo Go app on your phone

## Testing the App

1. Start the server first (`cd server && npm run dev`)
2. Start the mobile app (`cd mobile && npm start`)
3. Log in with one of the seeded users (e.g., zahid / test123)
4. Open another instance (different device/emulator) and log in with a different user
5. Start chatting!

You should see real-time messages, online status updates, and typing indicators working.

## Project Structure

```
native-chat-app/
├── server/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose models (User, Message, Conversation)
│   ├── routes/          # API routes
│   ├── utils/           # Utilities (seed script)
│   ├── index.js         # Main server file
│   └── package.json
│
└── mobile/
    ├── app/             # Expo Router pages
    │   ├── (auth)/      # Login/Register screens
    │   ├── (tabs)/      # Main app tabs
    │   └── chat/        # Chat screen
    ├── components/      # Reusable components
    ├── constants/       # Config and theme
    ├── hooks/           # Custom React hooks
    ├── utils/           # API and Socket utilities
    └── package.json
```

## Common Issues

**"Cannot connect to server" on mobile:**
- Make sure you're using your local IP address, not localhost
- Check that your phone and computer are on the same WiFi network
- Verify the server is actually running (check the terminal)
- Try disabling your firewall temporarily

**MongoDB connection errors:**
- Double-check your `MONGO_URI` in the `.env` file
- Make sure your IP is whitelisted in MongoDB Atlas (or use 0.0.0.0/0 for testing)
- Verify your database user has the correct permissions

**Expo app won't start:**
- Clear the cache: `npx expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Make sure you're using Node 18 or higher

## Deployment

The server is configured for deployment on Render. Check out `server/README.md` for detailed deployment instructions.

For the mobile app, you can build it using EAS Build:

```bash
cd mobile
npx eas build --platform android
# or
npx eas build --platform ios
```

## API Endpoints

Quick reference for the main endpoints:

- `POST /auth/register` - Create new account
- `POST /auth/login` - Login and get JWT token
- `GET /users` - Get all users
- `POST /conversations/between` - Create/get conversation between users
- `GET /conversations/:id/messages` - Get messages for a conversation

All endpoints except auth require the `Authorization: Bearer <token>` header.

## Socket Events

The app uses Socket.IO for real-time features:

**Emit (client → server):**
- `user:online` - Tell server you're online
- `message:send` - Send a message
- `typing:start` / `typing:stop` - Typing indicators
- `message:read` - Mark message as read

**Listen (server → client):**
- `presence:update` - Someone went online/offline
- `message:new` - New message received
- `typing:start` / `typing:stop` - Someone is typing
- `message:read` - Message was read

## Contributing

Feel free to fork this project and make it your own. If you find bugs or have suggestions, open an issue or submit a PR.

## License

MIT

---

Built with ☕ by Mnuvq
