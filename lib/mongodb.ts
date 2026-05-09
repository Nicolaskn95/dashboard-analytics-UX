import dns from "node:dns";
import { MongoClient, Db } from "mongodb";

const DNS_SERVERS = ["8.8.8.8", "1.1.1.1"];

let hasConfiguredDns = false;

function configureDnsResolver() {
  if (hasConfiguredDns) return;

  dns.setServers(DNS_SERVERS);
  hasConfiguredDns = true;
}

// teste depoly
// Connection string do MongoDB Atlas
const MONGODB_URI =
  "mongodb+srv://nicolasnagano:Cardboard8-Coastal0-Culture4-Unhappy2@fatecvotorantim.jw6r3zb.mongodb.net/ux-analytics";

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getClient(): Promise<MongoClient> {
  if (client && clientPromise) {
    return clientPromise;
  }

  configureDnsResolver();

  client = new MongoClient(MONGODB_URI, options);
  clientPromise = client.connect();

  return clientPromise;
}

export default async function getClientPromise(): Promise<MongoClient> {
  return getClient();
}

export async function getDatabase(): Promise<Db> {
  const mongoClient = await getClient();
  return mongoClient.db("ux-analytics");
}
