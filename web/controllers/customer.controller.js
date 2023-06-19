import { orderService } from "../services/map.js";

const customerController = {
  getPointsBalance: async (req, res) => {
    const response = await orderService.aggregate(
      [
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
      ]
    );

    const pointsBalance = response?.points_balance?.[0]?.points_balance;

    return res.status(200).json(
      {
        points_balance: pointsBalance,
      }
    );
  },
}

export { customerController }
