require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  await connectDB(process.env.MONGO_URI);
  await User.deleteMany({});
  const pass = await bcrypt.hash('test123', 10);
  const users = [
    { name: 'zahid', email: 'hello@zahid.cat', passwordHash: pass },
    { name: 'arib', email: 'arib@gmail.com', passwordHash: pass },
    { name: 'ronak', email: 'ronak@gmail.com', passwordHash: pass }
  ];
  await User.insertMany(users);
  console.log('Seeded users');
  process.exit();
})();
