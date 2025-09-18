import { createClient } from "redis";

export const createRedisClient = async (password,port,url) => {
  if (
    !password ||
    !url ||
    !port
  ) {
    throw new Error("Missing Redis configuration in environment variables");
  }

  const client = createClient({
    username: "default",
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_URL,
      port: process.env.REDIS_PORT,
    },
  });

  client.on("error", (err) => console.error("Redis Client Error", err));

  await client
    .connect()
    .then(() => {
      console.log("Connected to Redis");
    })
    .catch((err) => {
      console.error("Redis connection error", err);
    });

  return client;
};
