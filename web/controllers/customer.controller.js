import { orderService } from "../services/map.js";

const customerController = {
  getPointsBalance: async (req, res) => {
    const pointsBalance = await orderService.getCustomerPointsBalance(req.shopifySession._id, req.params.shopify_customer_id);

    return res.status(200).json(
      {
        points_balance: pointsBalance,
      }
    );
  },
}

export { customerController }
