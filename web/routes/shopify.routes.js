import express from "express";
import { shopifyController } from "../controllers/map.js";

const router = express.Router();

const shopifyRoutes = () => {
  router.get("/customers/:since_id/:limit", shopifyController.getCustomers);
  return router;
}

export { shopifyRoutes }
