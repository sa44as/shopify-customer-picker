import express from "express";
import { configurationController } from "../controllers/map.js";

const router = express.Router();

const configurationExternalRoutes = () => {
  router.get("/is_reward_product/:shopify_product_id", configurationController.isRewardProduct);
  return router;
}

const configurationInternalRoutes = () => {
  router.get("/reward_product/:shopify_product_id", configurationController.isRewardProduct);
  router.get("/reward_products", configurationController.getRewardProducts);
  router.post("/reward_product", configurationController.createRewardProduct);
  router.patch("/reward_product/:shopify_product_id", configurationController.editRewardProduct);
  router.delete("/reward_product/:shopify_product_id", configurationController.deleteRewardProduct);
  router.get("/product_points/:shopify_product_id", configurationController.getProductPoints);
  router.get("/products_points", configurationController.getProductsPoints);
  router.post("/product_points", configurationController.createProductPoints);
  router.patch("/product_points/:shopify_product_id", configurationController.editProductPoints);
  router.delete("/product_points/:shopify_product_id", configurationController.deleteProductPoints);
  return router;
}

export { configurationExternalRoutes, configurationInternalRoutes }
