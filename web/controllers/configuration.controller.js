import { configurationService, shopifyApiRest } from "../services/map.js";

const configurationController = {
  isRewardProduct: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals?.shopify?.session;
    const response = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest?._id || req.shopifySession._id,
        "reward_products.shopify_product_id": 'gid://shopify/Product/' + req.params.shopify_product_id,
      },
      {
        "reward_products.$": 1,
      }
    );

    const isRewardProduct = Array.isArray(response) && response.length;
    const rewardProductConfiguration = isRewardProduct ? response[0].reward_products.filter((reward_product) => reward_product.shopify_product_id == shopifySessionFromInternalApiRequest ? 'gid://shopify/Product/' + req.params.shopify_product_id : req.params.shopify_product_id)[0] : null;
    if (isRewardProduct && rewardProductConfiguration.shopify_product_id) {
      let metafieldValue = {
        points_price: rewardProductConfiguration.points,
      };

      let createOrUpdateProductMetafieldResponse = await shopifyApiRest.product.metafield.create(shopifySessionFromInternalApiRequest || req.shopifySession, rewardProductConfiguration.shopify_product_id, "loyalty_program", "configuration", metafieldValue, "json");
      // debugger
      console.log("createOrUpdateProductMetafieldResponse: ", createOrUpdateProductMetafieldResponse);
    }

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
      },
      {
        "reward_products.$": 1,
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

    const response = await configurationService.updateRewardProduct(
      {
        shopify_session: shopifySessionFromInternalApiRequest,
        reward_product: {
          shopify_product_id: req.body.shopifyProductId,
          points_price: req.body.pointsPrice,
          shopify_metafield_id: rewardProductConfiguration.shopify_metafield.id,
        },
      }
    );

    return res.status(200).json(
      {
        reward_product: response,
      }
    );
  },
  deleteRewardProduct: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const response = await configurationService.deleteRewardProduct(
      {
        shopify_session: shopifySessionFromInternalApiRequest,
        shopify_product_id: 'gid://shopify/Product/' + req.params.shopify_product_id,
      }
    );

    return res.status(200).end();
  },
  getRewardProducts: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const response = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest._id,
      }
    );

    return res.status(200).json(
      {
        reward_products: response[0]?.reward_products,
      }
    );
  },
  getProductPoints: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const response = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest._id,
        "products_points.shopify_product_id": shopifySessionFromInternalApiRequest ? 'gid://shopify/Product/' + req.params.shopify_product_id : req.params.shopify_product_id,
      },
      {
        "products_points.$": 1,
      }
    );

    const isProductPoints = Array.isArray(response) && response.length;
    const productPointsConfiguration = isProductPoints ? response[0].products_points.filter((product_points) => product_points.shopify_product_id == shopifySessionFromInternalApiRequest ? 'gid://shopify/Product/' + req.params.shopify_product_id : req.params.shopify_product_id)[0] : null;

    return res.status(200).json(
      {
        product_points_exist: isProductPoints,
        product_points_configuration: productPointsConfiguration,
      }
    );
  },
  createProductPoints: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const findResponse = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest?._id,
        "products_points.shopify_product_id": req.body.shopifyProductId,
      },
      {
        "products_points.$": 1,
      }
    );

    const isProductPoints = Array.isArray(findResponse) && findResponse.length;
    const productPointsConfiguration = isProductPoints ? findResponse[0].products_points.filter((product_points) => product_points.shopify_product_id == req.body.shopifyProductId)[0] : null;
    
    if (isProductPoints) {
      return res.status(409).json(
        {
          error: {
            statusCode: 409,
            message: "The product points multiplier already set for this product",
          },
          product_points_exist: isProductPoints,
          product_points_configuration: productPointsConfiguration,
        }
      );
    }

    const response = await configurationService.createProductPoints(
      {
        shopify_session: shopifySessionFromInternalApiRequest,
        product_points: {
          shopify_product_id: req.body.shopifyProductId,
          points: req.body.points,
          shopify_product_title: req.body.shopifyProductTitle,
          shopify_product_image_url: req.body.shopifyProductImageUrl,
        },
      }
    );

    return res.status(201).json(
      {
        product_points: response,
      }
    );
  },
  editProductPoints: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const findResponse = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest?._id,
        "products_points.shopify_product_id": req.body.shopifyProductId,
      }
    );

    const isProductPoints = Array.isArray(findResponse) && findResponse.length;
    const productPointsConfiguration = isProductPoints ? findResponse[0].products_points.filter((product_points) => product_points.shopify_product_id == req.body.shopifyProductId)[0] : null;

    if (!isProductPoints) {
      return res.status(400).json(
        {
          error: {
            statusCode: 400,
            message: "The product points multipler not found",
          },
          is_product_points_exist: isProductPoints,
        }
      );
    }

    const response = await configurationService.updateProductPoints(
      {
        shopify_session: shopifySessionFromInternalApiRequest,
        product_points: {
          shopify_product_id: req.body.shopifyProductId,
          points: req.body.points,
        },
      }
    );

    return res.status(200).json(
      {
        product_points: response,
      }
    );
  },
  deleteProductPoints: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const response = await configurationService.deleteProductPoints(
      {
        shopify_session: shopifySessionFromInternalApiRequest,
        shopify_product_id: 'gid://shopify/Product/' + req.params.shopify_product_id,
      }
    );

    return res.status(200).end();
  },
  getProductsPoints: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const response = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest._id,
      }
    );

    return res.status(200).json(
      {
        products_points: response[0]?.products_points,
      }
    );
  },
  getCustomerPoints: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const response = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest._id,
        "customers_points.shopify_customer_id": shopifySessionFromInternalApiRequest ? 'gid://shopify/Customer/' + req.params.shopify_customer_id : req.params.shopify_customer_id,
      },
      {
        "customers_points.$": 1,
      }
    );

    const isCustomerPoints = Array.isArray(response) && response.length;
    const customerPointsConfiguration = isCustomerPoints ? response[0].customers_points.filter((customer_points) => customer_points.shopify_customer_id == shopifySessionFromInternalApiRequest ? 'gid://shopify/Customer/' + req.params.shopify_customer_id : req.params.shopify_customer_id)[0] : null;

    return res.status(200).json(
      {
        customer_points_exist: isCustomerPoints,
        customer_points_configuration: customerPointsConfiguration,
      }
    );
  },
  createCustomerPoints: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const findResponse = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest?._id,
        "customers_points.shopify_customer_id": req.body.shopifyCustomerId,
      },
      {
        "customers_points.$": 1,
      }
    );

    const isCustomerPoints = Array.isArray(findResponse) && findResponse.length;
    const customerPointsConfiguration = isCustomerPoints ? findResponse[0].customers_points.filter((customer_points) => customer_points.shopify_customer_id == req.body.shopifyCustomerId)[0] : null;

    if (isCustomerPoints) {
      return res.status(409).json(
        {
          error: {
            statusCode: 409,
            message: "The customer points multiplier already set for this customer",
          },
          customer_points_exist: isCustomerPoints,
          customer_points_configuration: customerPointsConfiguration,
        }
      );
    }

    const response = await configurationService.createCustomerPoints(
      {
        shopify_session: shopifySessionFromInternalApiRequest,
        customer_points: {
          shopify_customer_id: req.body.shopifyCustomerId,
          points: req.body.points,
          shopify_customer_first_name: req.body.shopifyCustomerFirstName,
          shopify_customer_last_name: req.body.shopifyCustomerLastName,
          shopify_customer_email: req.body.shopifyCustomerEmail,
        },
      }
    );

    return res.status(201).json(
      {
        customer_points: response,
      }
    );
  },
  editCustomerPoints: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const findResponse = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest?._id,
        "customers_points.shopify_customer_id": req.body.shopifyCustomerId,
      }
    );

    const isCustomerPoints = Array.isArray(findResponse) && findResponse.length;

    if (!isCustomerPoints) {
      return res.status(400).json(
        {
          error: {
            statusCode: 400,
            message: "The customer points multipler not found",
          },
          is_customer_points_exist: isCustomerPoints,
        }
      );
    }

    const response = await configurationService.updateCustomerPoints(
      {
        shopify_session: shopifySessionFromInternalApiRequest,
        customer_points: {
          shopify_customer_id: req.body.shopifyCustomerId,
          points: req.body.points,
        },
      }
    );

    return res.status(200).json(
      {
        customer_points: response,
      }
    );
  },
  deleteCustomerPoints: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const response = await configurationService.deleteCustomerPoints(
      {
        shopify_session: shopifySessionFromInternalApiRequest,
        shopify_customer_id: 'gid://shopify/Customer/' + req.params.shopify_customer_id,
      }
    );

    return res.status(200).end();
  },
  getCustomersPoints: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;

    const response = await configurationService.find(
      {
        shopify_session: shopifySessionFromInternalApiRequest._id,
      }
    );

    return res.status(200).json(
      {
        customers_points: response[0]?.customers_points,
      }
    );
  },
}

export { configurationController }
