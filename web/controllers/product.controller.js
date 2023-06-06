import { configurationService } from "../services/map.js";

const productController = {
  isRewardProduct: async (req, res) => {
    const response = await configurationService.find(
      {
        shopify_session: req.shopifySession._id,
        "reward_products.shopify_product_id": req.params.shopify_product_id,
      }
    );

    const isRewardProduct = Array.isArray(response) && response.length;
    const rewardProductConfiguration = isRewardProduct ? response[0].reward_products.filter((reward_product) => reward_product.shopify_product_id == req.params.shopify_product_id)[0] : null;

    return res.json(
      {
        is_reward_product: isRewardProduct,
        reward_product_configuration: rewardProductConfiguration,
      }
    ).status(200);
  },
  
}

export { productController }
