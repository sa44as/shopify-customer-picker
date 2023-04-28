// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import cors from "cors";
import serveStatic from "serve-static";

import { shopify, shopifySessionService, configurationService } from "./services/map.js";
import productCreator from "./product-creator.js";
import { GDPRWebhookHandlers, OrdersWebhookHandlers } from "./services/shopify.service/webhookHandlers/map.js";
import { mongoConnect } from "./config/map.js";
import { orderRoutes } from "./routes/map.js";

const mongoConnection = await mongoConnect();
configurationService.watchNewShopExistenceAndSetupConfiguration();
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
      ...OrdersWebhookHandlers,
    }
  })
);

const corsOptions = async (req, callback) => {
  const shopifySessions = await shopifySessionService.find(
    {
      shop: origin.replace(/(^\w+:|^)\/\//, '')
    },
    'shop'
  );
  
  if (shopifySessions.length < 1) {
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

app.use('/api/external/v1/order', cors(corsOptions), orderRoutes());

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js
app.use("/api/*", shopify.validateAuthenticatedSession()); // to do, commented out temporary for test api
  
app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});
// debugger
console.log('PORT: ', PORT);
app.listen(PORT);
