import { configurationModel, shopifySessionModel } from "../models/map.js";
import { shopifyApiRest } from "./map.js";

const watchNewShopExistenceAndSetupConfiguration = () => {
  shopifySessionModel.watch().on('change', async (data) => {
    // debugger
    console.log('###########################data.operationType: ', data.operationType);
    switch (data.operationType) {
      case 'insert':
        const shopifySession = data.fullDocument;
console.log('shopifySession: ', shopifySession);
        // is set for test, but dates functionality can be help later for dates development finalization if something will be necessary to improve or correct.
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
            reward_products: [
              {
                shopify_product_id: "7489095598319",
                points_price: 79.95,
                sell_with_money: false,
                shopify_metafield_id: "test", // to do, need to create metafield, and get id for product with above values
              },
              {
                shopify_product_id: "632910392",
                points_price: 100,
                sell_with_money: true,
                shopify_metafield_id: "test", // to do, need to create metafield, and get id for product with above values
              },
            ],
            products_points: [
              {
                shopify_product_id: "632910392",
                points: 2,
              },
            ],
            customers_points: [
              {
                shopify_customer_id: "115310627314723950",
                points: 3,
              },
            ],
            dates_points: [
              datesPoints,
            ],
            pre_sale_products_points: 20,
            gift_card_products_points: 30,
            // end of is set for test
          }
        ];
        const response = await create(documents);
        // debugger
        console.log('configuration creation response: ', response);
        if (response.error) {
          console.log('configuration not created for shop: ', data.fullDocument.shop, ' the reason is: ', response.message);
        } else {
          console.log('configuration created successfully for shop: ', data.fullDocument.shop);
        }
        break;
    }
  });
}

const getTransformedProductsPointsData = (productsPoints) => {
  const isProductsPointsDataValid = Array.isArray(productsPoints) && productsPoints.length;
  if (!isProductsPointsDataValid) return null;

  let transformedProductsPoints = [];

  let isProductPointsDataValid, transformedProductPoints;
  for (const productPoints of productsPoints) {
    isProductPointsDataValid = productPoints.shopify_product_id && productPoints.points;
    if (!isProductPointsDataValid) continue;

    isProductPointsDataValid = false;
    transformedProductPoints = {};

    transformedProductPoints.shopify_product_id = productPoints.shopify_product_id;
    transformedProductPoints.points = productPoints.points;

    transformedProductsPoints = [...transformedProductsPoints, transformedProductPoints];
  }

  return transformedProductsPoints.length ? transformedProductsPoints : null;
}

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
        item.default_points ||
        item.product_points ||
        item.customer_points ||
        item.dates_points ||
        item.pre_sale_products_points ||
        item.gift_card_products_points
      );
    
    if (!isDocumentDataValid) continue;

    doc = {};

    transformedProductsPoints = getTransformedProductsPointsData(item.products_points);
    transformedCustomersPoints = getTransformedCustomersPointsData(item.customers_points);
    transformedDatesPoints = getTransformedDatesPointsData(item.dates_points);

    if (item.shopify_session__id) doc.shopify_session = item.shopify_session__id;
    if (item.default_points) doc.default_points = item.default_points;
    if (transformedProductsPoints) doc.products_points = transformedProductsPoints;
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
    const res = await configurationModel.create(filter, projection, options);
    return res;
  } catch (err) {
    return {
      error: true,
      message: 'Error while finding Configuration. Original err.message: ' + err.message,
    };
  }
}

// to do
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

const configurationService = {
  watchNewShopExistenceAndSetupConfiguration,
  create,
  find,
  update,
}

export { configurationService }
