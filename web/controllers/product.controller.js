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
    console.log("req.params.shopify_product_id: ", req.params.shopify_product_id);
    console.log("isRewardProduct.resposne: ", response);

    const isRewardProduct = true; // to do set from response
    const rewardProductConfiguration = {}; // to do set from response

    return res.json(
      {
        response: response,
        is_reward_product: isRewardProduct,
        reward_product_configuration: rewardProductConfiguration,
      }
    ).status(200);
  },
}

export { productController }
