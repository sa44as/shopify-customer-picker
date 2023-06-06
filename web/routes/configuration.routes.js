import express from "express";
import { configurationController } from "../controllers/map.js";

const router = express.Router();

const configurationExternalRoutes = () => {
  router.get("/is_reward_product/:shopify_product_id", configurationController.isRewardProduct);
  return router;
}

const configurationInternalRoutes = () => {
  router.get("/reward_products", configurationController.getRewardProducts);
  router.post("/reward_product", configurationController.createRewardProduct);
  router.patch("/reward_product/:shopify_product_id", configurationController.editRewardProduct);
  router.delete("/reward_product/:shopify_product_id", configurationController.deleteRewardProduct);
  return router;
}

export { configurationExternalRoutes, configurationInternalRoutes }
