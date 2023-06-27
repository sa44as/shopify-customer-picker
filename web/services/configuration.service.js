import { configurationModel, shopifySessionModel } from "../models/map.js";
import { shopifyApiRest, shopifyApiGraphql } from "./map.js";

const watchNewShopExistenceAndSetupConfiguration = () => {
  shopifySessionModel.watch().on('change', async (data) => {
    // debugger
    // console.log('data.operationType: ', data.operationType);
    switch (data.operationType) {
      case 'insert':
        const shopifySession = data.fullDocument;
        // debugger
        // console.log('shopifySession: ', shopifySession);
        // is set for test, but dates functionality can be help later for dates development finalization if something will be necessary to improve or correct (the possible thing can be timezone to work incorrect or can be improved).
        const currentDate = new Date();
        const tomorrowDate = new Date(currentDate);
        tomorrowDate.setDate(currentDate.getDate() + 1);
        console.log('currentDate: ', currentDate, 'tomorrowDate: ', tomorrowDate);
        const datesPoints = {
          from: currentDate,
          to: tomorrowDate,
          points: 10,
        };
        console.log('datesPoints: ', datesPoints);
        // end of is set for test

        const documents = [
          {
            shopify_session__id: shopifySession._id,
            shop: shopifySession.shop,
            state: shopifySession.state,
            // is set for test
            // reward_products CRUD done, that's why commented, CRUD is accessible on App admin interface, URLs = /reward_products and /reward_products/[shopify_product_id]
            // reward_products: [
            //   {
            //     shopify_product_id: "7489095598319",
            //     points_price: 79.95,
            //     sell_with_money: false,
            //     shopify_metafield: {
            //       id: "test", // to do, need to create metafield, and get id for product with above values
            //       points_price: 79.95,
            //       sell_with_money: false,
            //     },
            //   },
            //   {
            //     shopify_product_id: "632910392",
            //     points_price: 100,
            //     sell_with_money: true,
            //     shopify_metafield: {
            //       id: "test", // to do, need to create metafield, and get id for product with above values
            //       points_price: 79.95,
            //       sell_with_money: false,
            //     },
            //   },
            // ],
            // CRUD done, that's why commented, CRUD is accessible on App admin interface, like reward_products, URLs = /products_points and /products_points/[shopify_product_id]
            // products_points: [
            //   {
            //     shopify_product_id: "632910392",
            //     points: 2,
            //   },
            // ],
            // CRUD to do, should be like reward_products, URLs = /customers_points and /customers_points/[shopify_customer_id]
            customers_points: [
              {
                shopify_customer_id: "115310627314723950",
                points: 3,
              },
            ],
            // CRUD to do, should be 3 inputs = FROM (date), TO (date), POINTS (number), URLs = /dates_points and /dates_points/[date_objectID]
            dates_points: [
              datesPoints,
            ],
            // CRUD to do, should be one input = POINTS (number)
            pre_sale_products_points: 20,
            // CRUD to do, should be one input = POINTS (number)
            gift_card_products_points: 30,
            // end of is set for test
          }
        ];
        const response = await create(documents);
        // debugger
        // console.log('configuration creation response: ', response);
        if (response.error) {
          console.log('configuration not created for shop: ', data.fullDocument.shop, ' the reason is: ', response.message);
        } else {
          console.log('configuration created successfully for shop: ', data.fullDocument.shop);
        }

        const input = {
          title: "Loyalty program discount",
          functionId: process.env.SHOPIFY_PRODUCT_DISCOUNT_ID, // should be in this format "01H0N8X28PSAV5AHNDFHSFF3DN",
          startsAt: currentDate, // should be in this format "2023-05-22T00:00:00",
        };
        // debugger
        console.log('input:', input);

        const discountAutomaticAppCreateResponse = await shopifyApiGraphql.discountAutomaticApp.create(shopifySession, input);
        // debugger
        // console.log("discountAutomaticAppCreateResposne: ", discountAutomaticAppCreateResponse);
        break;
    }
  });
}

// ignored call after completion the CRUD system, do not necessary when configuration is creating on installation time
// const getTransformedProductsPointsData = (productsPoints) => {
//   const isProductsPointsDataValid = Array.isArray(productsPoints) && productsPoints.length;
//   if (!isProductsPointsDataValid) return null;

//   let transformedProductsPoints = [];

//   let isProductPointsDataValid, transformedProductPoints;
//   for (const productPoints of productsPoints) {
//     isProductPointsDataValid = productPoints.shopify_product_id && productPoints.points;
//     if (!isProductPointsDataValid) continue;

//     isProductPointsDataValid = false;
//     transformedProductPoints = {};

//     transformedProductPoints.shopify_product_id = productPoints.shopify_product_id;
//     transformedProductPoints.points = productPoints.points;
//     transformedProductPoints.shopify_product_title = productPoints.shopify_product_title,
//     transformedProductPoints.shopify_product_image_url = productPoints.shopify_product_image_url,

//     transformedProductsPoints = [...transformedProductsPoints, transformedProductPoints];
//   }

//   return transformedProductsPoints.length ? transformedProductsPoints : null;
// }

const getTransformedCustomersPointsData = (customersPoints) => {
  const isCustomersPointsDataValid = Array.isArray(customersPoints) && customersPoints.length;
  if (!isCustomersPointsDataValid) return null;

  let transformedCustomersPoints = [];

  let isCustomerPointsDataValid, transformedCustomerPoints;
  for (const customerPoints of customersPoints) {
    isCustomerPointsDataValid = customerPoints.shopify_customer_id && customerPoints.points;
    if (!isCustomerPointsDataValid) continue;

    isCustomerPointsDataValid = false;
    transformedCustomerPoints = {};

    transformedCustomerPoints.shopify_customer_id = customerPoints.shopify_customer_id;
    transformedCustomerPoints.points = customerPoints.points;

    transformedCustomersPoints = [...transformedCustomersPoints, transformedCustomerPoints];
  }

  return transformedCustomersPoints.length ? transformedCustomersPoints : null;
}

const getTransformedDatesPointsData = (datesPoints) => {
  const isDatesPointsDataValid = Array.isArray(datesPoints) && datesPoints.length;
  if (!isDatesPointsDataValid) return null;

  let transformedDatesPoints = [];

  let isDatePointsDataValid, transformedDatePoints;
  for (const datePoints of datesPoints) {
    isDatePointsDataValid = datePoints.from && datePoints.to && datePoints.points;
    if (!isDatePointsDataValid) continue;

    isDatePointsDataValid = false;
    transformedDatePoints = {};

    transformedDatePoints.from = datePoints.from;
    transformedDatePoints.to = datePoints.to;
    transformedDatePoints.points = datePoints.points;

    transformedDatesPoints = [...transformedDatesPoints, transformedDatePoints];
  }

  return transformedDatesPoints.length ? transformedDatesPoints : null;
}

const getTransformedConfigurationData = (documents) => {
  const isDocumentsDataValid = Array.isArray(documents) && documents.length && documents[0];
  if (!isDocumentsDataValid) return null;

  let transformedData = [];

  let isDocumentDataValid, doc, transformedProductsPoints, transformedCustomersPoints, transformedDatesPoints;
  for (const item of documents) {
    isDocumentDataValid = typeof item === 'object' &&
      (
        item.shopify_session__id ||
        item.shop ||
        item.state ||
        item.default_points ||
        item.product_points ||
        item.customer_points ||
        item.dates_points ||
        item.pre_sale_products_points ||
        item.gift_card_products_points
      );
    
    if (!isDocumentDataValid) continue;

    doc = {};

    // ignored call, because do not necessary to insert when configuration is creating on installation time
    // transformedProductsPoints = getTransformedProductsPointsData(item.products_points);
    transformedCustomersPoints = getTransformedCustomersPointsData(item.customers_points);
    transformedDatesPoints = getTransformedDatesPointsData(item.dates_points);

    if (item.shopify_session__id) doc.shopify_session = item.shopify_session__id;
    if (item.shop) doc.shop = item.shop;
    if (item.state) doc.state = item.state;
    // ignored call, because do not necessary to insert when configuration is creating
    // if (item.reward_products) doc.reward_products = item.reward_products;
    if (item.default_points) doc.default_points = item.default_points;
    // ignored call, because do not necessary to insert when configuration is creating
    // if (transformedProductsPoints) doc.products_points = transformedProductsPoints;
    if (transformedCustomersPoints) doc.customers_points = transformedCustomersPoints;
    if (transformedDatesPoints) doc.dates_points = transformedDatesPoints;
    if (item.pre_sale_products_points) doc.pre_sale_products_points = item.pre_sale_products_points;
    if (item.gift_card_products_points) doc.gift_card_products_points = item.gift_card_products_points;

    transformedData = [...transformedData, doc];
  }

  return transformedData.length ? transformedData : null;
}

const create = async (documents) => {
  const transformedConfigurationData = getTransformedConfigurationData(documents);
  if (!transformedConfigurationData) {
    return {
      error: true,
      message: 'Error while creating Configuration, the provided data is not correct.',
    };
  }

  try {
    const res = await configurationModel.create(transformedConfigurationData);
    return res;
  } catch (err) {
    return {
      error: true,
      message: 'Error while creating Configuration. Original err.message: ' + err.message,
    };
  }
}

const find = async (filter, projection, options) => {
  try {
    const res = await configurationModel.find(filter, projection, options);
    return res;
  } catch (err) {
    return {
      error: true,
      message: 'Error while finding Configuration. Original err.message: ' + err.message,
    };
  }
}

// to do, not sure if necessary, leaving here for the furter development can be help
const update = async ({ shopify_session__id, default_points, products_points, customers_points }, where) => {
  const record = {};
  let data_products_points = null;
  let record_customers_points = null;
  if (shopify_session__id) doc.shopify_session__id = shopify_session__id;
  if (default_points) doc.default_points = default_points;
  if (products_points?.shopify_product_id) {
    data_products_points = {
      shopify_product_id: products_points.shopify_product_id,
    };
  }
  if (products_points?.points && data_products_points) {
    data_products_points.points = products_points.points;
  } else if (products_points?.points) {
    data_products_points = {
      points: products_points.points,
    }
  }
  if (customers_points) {
    record_customers_points.customers_points = {
      shopify_customer_id: customers_points.shopify_customer_id,
      points: customers_points.points,
    };
  }

  try {
    const res = await configurationModel.update(
      record,
      {
        where,
      }
    );

    if (res != 1) {
      throw Error("Cannot update Configuration.");
    }

    return res;
  } catch (e) {
    console.error(e);
    throw Error('Error while updating Configuration')
  }
}
// end of to do, not sure if necessary, leaving here for the furter development can be help

const getTransformedRewardProductData = async (shopify_session, rewardProduct, isUpdate) => {
  const isRewardProductDataValid = rewardProduct && typeof rewardProduct === 'object' && rewardProduct.shopify_product_id && rewardProduct.points_price && (isUpdate ? rewardProduct.shopify_metafield_id : true);
  if (!isRewardProductDataValid) return null;

  const metafieldValue = {
    points_price: rewardProduct.points_price,
  };

  let shopifyMetafield;
  if (isUpdate) {
    shopifyMetafield = await shopifyApiRest.product.metafield.update(shopify_session, rewardProduct.shopify_product_id, rewardProduct.shopify_metafield_id, metafieldValue, "json");
  } else {
    shopifyMetafield = await shopifyApiRest.product.metafield.create(shopify_session, rewardProduct.shopify_product_id, "loyalty_program", "configuration", metafieldValue, "json");
  }

  const transformedRewardProduct = {
    shopify_product_id: rewardProduct.shopify_product_id,
    points_price: rewardProduct.points_price,
    shopify_metafield: shopifyMetafield,
    shopify_product_title: rewardProduct.shopify_product_title,
    shopify_product_image_url: rewardProduct.shopify_product_image_url,
  };

  return transformedRewardProduct;
}

const createRewardProduct = async ({shopify_session, reward_product}) => {
  const transformedRewardProductData = await getTransformedRewardProductData(shopify_session, reward_product);
  try {
    const response = await configurationModel.findOneAndUpdate(
      {
        shopify_session: shopify_session._id,
      },
      {
        $push: {
          reward_products: transformedRewardProductData,
        }
      },
    );
    return transformedRewardProductData;
  } catch (err) {
    return {
      error: true,
      message: 'Error while creating Reward product Configuration. Original err.message: ' + err.message,
    };
  }
}

const updateRewardProduct = async ({shopify_session, reward_product}) => {
  const transformedRewardProductData = await getTransformedRewardProductData(shopify_session, reward_product, true);
  try {
    const response = await configurationModel.findOneAndUpdate(
      {
        shopify_session: shopify_session._id,
      },
      {
        $set: {
          [`reward_products.$[outer].points_price`]: transformedRewardProductData.points_price,
          [`reward_products.$[outer].shopify_metafield`]: transformedRewardProductData.shopify_metafield,
        }
      },
      {
        arrayFilters: [
          {
            "outer.shopify_product_id": transformedRewardProductData.shopify_product_id
          }
        ]
      }
    );
    return transformedRewardProductData;
  } catch (err) {
    return {
      error: true,
      message: 'Error while updating Reward product Configuration. Original err.message: ' + err.message,
    };
  }
}

const deleteRewardProduct = async ({shopify_session, shopify_product_id}) => {
  try {
    const response = await configurationModel.findOneAndUpdate(
      {
        shopify_session: shopify_session._id,
        "reward_products.shopify_product_id": shopify_product_id,
      },
      {
        $pull: {
          reward_products: {
            shopify_product_id: shopify_product_id,
          }
        }
      }
    );

    const isRewardProduct = response && typeof response === "object";
    const rewardProductConfiguration = isRewardProduct ? response.reward_products.filter((reward_product) => reward_product.shopify_product_id == shopify_product_id)[0] : null;

    if (rewardProductConfiguration) {
      await shopifyApiRest.product.metafield.delete(shopify_session, shopify_product_id, rewardProductConfiguration.shopify_metafield.id);
    }

    return response;
  } catch (err) {
    return {
      error: true,
      message: 'Error while deleting Reward product Configuration. Original err.message: ' + err.message,
    };
  }
}

const getTransformedProductPointsData = async (productPoints) => {
  const isProductPointsDataValid = productPoints && typeof productPoints === 'object' && productPoints.shopify_product_id && productPoints.points;
  if (!isProductPointsDataValid) return null;

  const transformedProductPoints = {
    shopify_product_id: productPoints.shopify_product_id,
    points: productPoints.points,
    shopify_product_title: productPoints.shopify_product_title,
    shopify_product_image_url: productPoints.shopify_product_image_url,
  };

  return transformedProductPoints;
}

const createProductPoints = async ({shopify_session, product_points}) => {
  const transformedProductPointsData = await getTransformedProductPointsData(product_points);

  try {
    const response = await configurationModel.findOneAndUpdate(
      {
        shopify_session: shopify_session._id,
      },
      {
        $push: {
          products_points: transformedProductPointsData,
        }
      },
    );

    return transformedProductPointsData;
  } catch (err) {
    return {
      error: true,
      message: 'Error while creating Product points Configuration. Original err.message: ' + err.message,
    };
  }
}

const updateProductPoints = async ({shopify_session, product_points}) => {
  const transformedProductPointsData = await getTransformedProductPointsData(product_points);
  try {
    const response = await configurationModel.findOneAndUpdate(
      {
        shopify_session: shopify_session._id,
      },
      {
        $set: {
          [`products_points.$[outer].points`]: transformedProductPointsData.points,
        }
      },
      {
        arrayFilters: [
          {
            "outer.shopify_product_id": transformedProductPointsData.shopify_product_id
          }
        ]
      }
    );
    return transformedProductPointsData;
  } catch (err) {
    return {
      error: true,
      message: 'Error while updating Product points Configuration. Original err.message: ' + err.message,
    };
  }
}

const deleteProductPoints = async ({shopify_session, shopify_product_id}) => {
  try {
    const response = await configurationModel.findOneAndUpdate(
      {
        shopify_session: shopify_session._id,
        "products_points.shopify_product_id": shopify_product_id,
      },
      {
        $pull: {
          products_points: {
            shopify_product_id: shopify_product_id,
          }
        }
      }
    );

    return response;
  } catch (err) {
    return {
      error: true,
      message: 'Error while deleting Product points Configuration. Original err.message: ' + err.message,
    };
  }
}

const getTransformedCustomerPointsData = async (customerPoints) => {
  const isCustomerPointsDataValid = customerPoints && typeof customerPoints === 'object' && customerPoints.shopify_customer_id && customerPoints.points;
  if (!isCustomerPointsDataValid) return null;

  const transformedCustomerPoints = {
    shopify_customer_id: customerPoints.shopify_customer_id,
    points: customerPoints.points,
    shopify_customer_email: customerPoints.shopify_customer_email,
    shopify_customer_fisrt_name: customerPoints.shopify_customer_first_name,
    shopify_custoer_last_name: customerPoints.shopify_customer_last_name,
  };

  return transformedCustomerPoints;
}

const createCustomerPoints = async ({shopify_session, customer_points}) => {
  const transformedCustomerPointsData = await getTransformedCustomerPointsData(customer_points);
  try {
    const response = await configurationModel.findOneAndUpdate(
      {
        shopify_session: shopify_session._id,
      },
      {
        $push: {
          customers_points: transformedCustomerPointsData,
        }
      },
    );
    return transformedCustomerPointsData;
  } catch (err) {
    return {
      error: true,
      message: 'Error while creating Customer points Configuration. Original err.message: ' + err.message,
    };
  }
}

const updateCustomerPoints = async ({shopify_session, customer_points}) => {
  const transformedCustomerPointsData = await getTransformedCustomerPointsData(customer_points);
  try {
    const response = await configurationModel.findOneAndUpdate(
      {
        shopify_session: shopify_session._id,
      },
      {
        $set: {
          [`customers_points.$[outer].points`]: transformedCustomerPointsData.points,
          [`customers_points.$[outer].shopify_metafield`]: transformedCustomerPointsData.shopify_metafield,
        }
      },
      {
        arrayFilters: [
          {
            "outer.shopify_customer_id": transformedCustomerPointsData.shopify_customer_id
          }
        ]
      }
    );
    return transformedCustomerPointsData;
  } catch (err) {
    return {
      error: true,
      message: 'Error while updating Customer points Configuration. Original err.message: ' + err.message,
    };
  }
}

const deleteCustomerPoints = async ({shopify_session, shopify_customer_id}) => {
  try {
    const response = await configurationModel.findOneAndUpdate(
      {
        shopify_session: shopify_session._id,
        "customers_points.shopify_customer_id": shopify_customer_id,
      },
      {
        $pull: {
          customers_points: {
            shopify_customer_id: shopify_customer_id,
          }
        }
      }
    );

    return response;
  } catch (err) {
    return {
      error: true,
      message: 'Error while deleting Customer points Configuration. Original err.message: ' + err.message,
    };
  }
}

const configurationService = {
  watchNewShopExistenceAndSetupConfiguration,
  create,
  find,
  update,
  createRewardProduct,
  updateRewardProduct,
  deleteRewardProduct,
  createProductPoints,
  updateProductPoints,
  deleteProductPoints,
  createCustomerPoints,
  updateCustomerPoints,
  deleteCustomerPoints,
}

export { configurationService }
