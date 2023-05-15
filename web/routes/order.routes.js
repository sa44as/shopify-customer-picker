import express from "express";
import { orderController } from "../controllers/map.js";

const router = express.Router();

const orderRoutes = () => {
  router.get("/:shopify_customer_id", orderController.find);
  router.get("/before_add_to_cart/:shopify_customer_id/:shopify_product_id", orderController.beforeAddToCart);
  return router;
}

export { orderRoutes }
