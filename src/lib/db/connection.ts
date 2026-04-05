import mongoose from 'mongoose';

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }
  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache connection in global scope for serverless (Vercel) reuse
const globalWithMongoose = global as typeof globalThis & {
  mongoose: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose.mongoose || { conn: null, promise: null };

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
