import { configurationModel } from "../models/map.js"; // not sure if necessary
import { configurationService } from "../services/map.js";

const configurationController = {
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
  createRewardProduct: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const response = await configurationService.createRewardProduct(
      {
        shopify_session: shopifySessionFromInternalApiRequest,
        reward_product: {
          shopify_product_id: req.body.shopifyProductId,
          points_price: req.body.pointsPrice,
        },
      }
    );

    return res.json(
      {
        response: response,
      }
    ).status(200);
  },
  editRewardProduct: async (req, res) => {
    // to do
    return res.json(
      {
        response: "to do",
      }
    ).status(200);
  },
  deleteRewardProduct: async (req, res) => {
    // to do
    return res.json(
      {
        response: "to do",
      }
    ).status(200);
  },
  getRewardProducts: async (req, res) => {
    // to do
    return res.json(
      {
        response: "to do",
      }
    ).status(200);
  },
  // to do, below all methods need to be reviewed, and changed as necessary, controller is not finilized
  find: (req, res) => {
    const response = configurationModel.find(
      {
        shop: req.params.shop,
        shopify_customer_id: req.params.shopify_customer_id,
      }
    );

    res.json(
      {
        response: response,
      }
    ).status(200);
  },

  update: () => {
    return { action: 'update' };
  },

  remove: () => {
    return { action: 'delete' };
  },
}

export { configurationController }
