import { orderService } from "../services/map.js";

const customerController = {
  getPointsBalance: async (req, res) => {
    const response = await orderService.aggregate(
      {
        $match: {
          shopify_session: req.shopifySession._id,
          shopify_customer_id: req.params.shopify_customer_id,
        }
      },
      {
        $group: {
          _id: null,
          points_balance: {
            $sum: "$points"
          }
        }
      }
    );

    console.log("getPointsBalance.resposne: ", response);

    return res.json(
      {
        points_balance: response,
      }
    ).status(200);
  },
}

export { customerController }
