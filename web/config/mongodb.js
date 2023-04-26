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

// to do, Move DB_CONNECTION_STRING and DB_NAME to .env before switching to the production mode. https://stax-development.atlassian.net/jira/software/projects/LP/boards/48?selectedIssue=LP-17
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || 'mongodb+srv://loyalty-user:346u1F59GLjr7f2X@loyalty-program-db-cluster-d5440995.mongo.ondigitalocean.com/loyalty-program-database?tls=true&authSource=admin&replicaSet=loyalty-program-db-cluster';

const mongoConnect = async () => {
  await mongoose.connect(DB_CONNECTION_STRING);
};

export { mongoConnect };
