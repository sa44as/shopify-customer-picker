require("dotenv").config();

const {
  NODE_ENV,
  PORT,
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SCOPES,
} = process.env;

module.exports = {
  apps: [
    {
      name: "API",
      script: "./index.js",
      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      args: "one two",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      ["env_" + NODE_ENV]: {
        NODE_ENV,
        PORT,
        SHOPIFY_API_KEY,
        SHOPIFY_API_SECRET,
        SCOPES,
      },
    },
  ],
};
