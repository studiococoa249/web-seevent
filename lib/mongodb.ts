import dns from 'dns';
import { MongoClient } from 'mongodb';

// Ensure DNS SRV query resolves correctly even on restrictive networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.error('Failed to set DNS servers in mongodb client:', e);
}

const uri = process.env.NEXT_PUBLIC_MONGODB_ATLAS || '';

if (!uri) {
  throw new Error('Please add your NEXT_PUBLIC_MONGODB_ATLAS URI to .env');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
