import express from "express";
import { shopifyController } from "../controllers/map.js";

const router = express.Router();

const shopifyRoutes = () => {
  router.get("/customers/:first/:query/:after", shopifyController.getCustomers);
  return router;
}

export { shopifyRoutes }
