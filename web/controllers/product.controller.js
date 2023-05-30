import { configurationService } from "../services/map.js";

const productController = {
  isRewardProduct: async (req, res) => {
    const response = await configurationService.find(
      {
        shopify_session: req.shopifySession._id,
        "reward_products.shopify_product_id": req.params.shopify_product_id,
      }
    );
      
    // debuggers
    console.log("req.params.shopify_product_id: ", req.params.shopify_product_id, "req.shopifySession._id: ", req.shopifySession._id);
    console.log("isRewardProduct.resposne: ", response, "response.reward_products: ",  response.reward_products);

    const isRewardProduct = Array.isArray(response) && response.length;
    const rewardProductConfiguration = isRewardProduct ? response.reward_products.filter((reward_product) => {
      // debugger
      console.log("reward_product.shopify_product_id", reward_product.shopify_product_id, "req.params.shopify_product_id: ", req.params.shopify_product_id);
      return reward_product.shopify_product_id == req.params.shopify_product_id;
    })[0] : null;

    return res.json(
      {
        is_reward_product: isRewardProduct,
        reward_product_configuration: rewardProductConfiguration,
      }
    ).status(200);
  },
}

export { productController }
