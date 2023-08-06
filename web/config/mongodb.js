import mongoose from "mongoose";

mongoose.Promise = Promise;

mongoose.connection.on("connected", () => {
  console.log("MongoDB Connection Established");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB Connection Reestablished");
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB Connection Disconnected");
});

mongoose.connection.on("close", () => {
  console.log("MongoDB Connection Closed");
});

mongoose.connection.on("error", error => {
  console.log("MongoDB ERROR: " + error);

  process.exit(1);
});

const toBoolean = (dataStr) => {
  return !!(dataStr?.toLowerCase?.() === 'true' || dataStr === true);
};

mongoose.set("debug", toBoolean(process.env.mongoDebugMode) || true);

const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

const mongoConnect = async () => {
  await mongoose.connect(DB_CONNECTION_STRING);
};

export { mongoConnect };
