import express from "express";
import { productController } from "../controllers/map.js";

const router = express.Router();

const productRoutes = () => {
  router.get("/is_reward/:shopify_product_id", productController.isRewardProduct);
  return router;
}

export { productRoutes }
