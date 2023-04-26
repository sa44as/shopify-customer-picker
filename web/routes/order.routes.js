import express from "express";
import { orderController } from "../controllers/map.js";

const router = express.Router();

const orderRoutes = () => {
  router.get("/:shopify_customer_id", orderController.find);
  return router;
}

export { orderRoutes }
