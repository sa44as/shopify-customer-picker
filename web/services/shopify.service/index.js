import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
// to do, Move DB_CONNECTION_STRING and DB_NAME to .env before switching to the production mode. https://stax-development.atlassian.net/jira/software/projects/LP/boards/48?selectedIssue=LP-17
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || 'mongodb+srv://loyalty-user:346u1F59GLjr7f2X@loyalty-program-db-cluster-d5440995.mongo.ondigitalocean.com/loyalty-program-database?tls=true&authSource=admin&replicaSet=loyalty-program-db-cluster';

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "My Shopify One-Time Charge": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};
// debugger
console.log("LATEST_API_VERSION: ", LATEST_API_VERSION);
const shopify = shopifyApp(
  {
    api: {
      apiVersion: LATEST_API_VERSION,
      restResources,
      billing: undefined, // or replace with billingConfig above to enable example billing
    },
    auth: {
      path: "/api/auth",
      callbackPath: "/api/auth/callback",
    },
    webhooks: {
      path: "/api/webhooks",
    },
    sessionStorage: new MongoDBSessionStorage(
      new URL(DB_CONNECTION_STRING),
    ),
  }
);

export { shopify }
