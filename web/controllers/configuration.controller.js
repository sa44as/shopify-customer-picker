import { configurationService } from "../services/map.js";

const configurationController = {
  isRewardProduct: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;
    const response = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest?._id || req.shopifySession._id,
        "reward_products.shopify_product_id": shopifySessionFromInternalApiRequest ? 'gid://shopify/Product/' + req.params.shopify_product_id : req.params.shopify_product_id,
      }
    );

    const isRewardProduct = Array.isArray(response) && response.length;
    const rewardProductConfiguration = isRewardProduct ? response[0].reward_products.filter((reward_product) => reward_product.shopify_product_id == shopifySessionFromInternalApiRequest ? 'gid://shopify/Product/' + req.params.shopify_product_id : req.params.shopify_product_id)[0] : null;
    // to do, low priority, here also can be run metafield corrector function that also need to be created in case if metafield value is not equal
    return res.status(200).json(
      {
        is_reward_product: isRewardProduct,
        reward_product_configuration: rewardProductConfiguration,
      }
    );
  },
  createRewardProduct: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const findResponse = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest?._id,
        "reward_products.shopify_product_id": req.body.shopifyProductId,
      }
    );

    const isRewardProduct = Array.isArray(findResponse) && findResponse.length;
    const rewardProductConfiguration = isRewardProduct ? findResponse[0].reward_products.filter((reward_product) => reward_product.shopify_product_id == req.body.shopifyProductId)[0] : null;
    
    if (isRewardProduct) {
      return res.status(409).json(
        {
          error: {
            statusCode: 409,
            message: "The product already is a reward product",
          },
          is_reward_product: isRewardProduct,
          reward_product_configuration: rewardProductConfiguration,
        }
      );
    }

    const response = await configurationService.createRewardProduct(
      {
        shopify_session: shopifySessionFromInternalApiRequest,
        reward_product: {
          shopify_product_id: req.body.shopifyProductId,
          points_price: req.body.pointsPrice,
          shopify_product_title: req.body.shopifyProductTitle,
          shopify_product_image_url: req.body.shopifyProductImageUrl,
        },
      }
    );

    return res.status(201).json(
      {
        reward_product: response,
      }
    );
  },
  editRewardProduct: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const findResponse = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest?._id,
        "reward_products.shopify_product_id": req.body.shopifyProductId,
      }
    );

    const isRewardProduct = Array.isArray(findResponse) && findResponse.length;
    const rewardProductConfiguration = isRewardProduct ? findResponse[0].reward_products.filter((reward_product) => reward_product.shopify_product_id == req.body.shopifyProductId)[0] : null;

    if (!isRewardProduct) {
      return res.status(400).json(
        {
          error: {
            statusCode: 400,
            message: "The product is not a reward product",
          },
          is_reward_product: isRewardProduct,
        }
      );
    }

    // to do, check the necessary field that's need to be passed
    // const response = await configurationService.updateRewardProduct(
    //   {
    //     shopify_session: shopifySessionFromInternalApiRequest,
    //     reward_product: {
    //       shopify_product_id: req.body.shopifyProductId,
    //       points_price: req.body.pointsPrice,
    //       shopify_product_title: req.body.shopifyProductTitle,
    //       shopify_product_image_url: req.body.shopifyProductImageUrl,
    //     },
    //   }
    // );

    return res.status(200).json(
      {
        // to do
        reward_product: 'to do', //response,
      }
    );
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
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const response = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest._id,
      }
    );

    return res.json(
      {
        reward_products: response[0]?.reward_products,
      }
    ).status(200);
  },
}

export { configurationController }
