import express from "express";
import { customerController } from "../controllers/map.js";

const router = express.Router();

const customerRoutes = () => {
  router.get("/points_balance/:shopify_customer_id", customerController.getPointsBalance);
  return router;
}

export { customerRoutes }
