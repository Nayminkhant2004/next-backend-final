import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let globalClientPromise;

export async function getClientPromise() {
  if (!uri) {
    throw new Error("Please add your Mongo URI to .env.local");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global.globalClientPromise) {
      client = new MongoClient(uri, options);
      global.globalClientPromise = client.connect();
    }
    return global.globalClientPromise;
  } else {
    client = new MongoClient(uri, options);
    return client.connect();
  }
}