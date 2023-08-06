// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import cors from "cors";
import serveStatic from "serve-static";

import { shopify, shopifySessionService } from "./services/map.js";
import { GDPRWebhookHandlers } from "./services/shopify.service/webhookHandlers/map.js";
import { mongoConnect } from "./config/map.js";
import { shopifyRoutes } from "./routes/map.js";

const mongoConnection = await mongoConnect();
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({
    webhookHandlers: {
      ...GDPRWebhookHandlers,
    }
  })
);

const corsOptions = async (req, callback) => {
  const origin = req.get('origin');
  if (typeof origin != "string") {
    return callback(
      {
        err: 'CORS is disabled for request from origin: ' + origin
      },
      {
        origin: origin
      }
    );
  }

  let originWitoutHttpHttps = origin.replace(/(^\w+:|^)\/\//, '');
  // fix for using Domain names that different than origin
  if (originWitoutHttpHttps === "sub.example.com") {
    originWitoutHttpHttps = "sub.myshopify.com";
  }

  const shopifySessions = await shopifySessionService.find(
    {
      shop: originWitoutHttpHttps,
    },
  );

  if (shopifySessions.length < 1) {
    console.log("Request from origin " + origin + " has been blocked by CORS policy");
    return callback(
      {
        err: 'CORS is disabled for request from origin: ' + origin
      },
      {
        origin: origin
      }
    );
  }

  const shopifySession = shopifySessions[0];
  req.shopifySession = shopifySession;
  return callback(
    null,
    {
      origin: origin
    }
  );
}

app.use(express.json());

app.use('/api/external/*', cors(corsOptions));

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js
app.use("/api/internal/*", shopify.validateAuthenticatedSession());
app.use('/api/internal/v1/shopify', shopifyRoutes());

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*",
  [
    shopify.ensureInstalledOnShop(),
  ],
  async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
