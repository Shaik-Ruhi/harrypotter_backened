import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Optional admin seeding for convenience in development/testing.
    // Enable by setting SEED_ADMIN=true and optionally ADMIN_EMAIL, ADMIN_PASSWORD
    try {
      if (process.env.SEED_ADMIN === 'true') {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@hp.local';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
        const existing = await User.findOne({ email: adminEmail });
        if (!existing) {
          const salt = await bcrypt.genSalt(10);
          const hashed = await bcrypt.hash(adminPassword, salt);
          const u = await User.create({ name: 'Admin', email: adminEmail, password: hashed });
          console.log(`Seeded admin user: ${adminEmail}`);
        }
      }
    } catch (seedErr) {
      console.warn('Admin seed failed:', seedErr.message);
    }

  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};
