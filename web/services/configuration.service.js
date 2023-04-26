import { configurationModel, shopifySessionModel } from "../models/map.js";

const watchNewShopExistenceAndSetupConfiguration = () => {
  shopifySessionModel.watch().on('change', async (data) => {
    switch (data.operationType) {
      case 'insert':
        const documents = [
          {
            shopify_session__id: data.fullDocument._id,
            // is set for test
            products_points: [
              {
                shopify_product_id: 632910392,
                points: 2,
              },
            ],
            customers_points: [
              {
                shopify_customer_id: 115310627314723950,
                points: 3,
              },
            ]
            // end of is set for test
          }
        ];
        const response = create(documents);
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

const getTransformedConfigurationData = (documents) => {
  const isDocumentsDataValid = Array.isArray(documents) && documents.length && documents[0];
  if (!isDocumentsDataValid) return null;

  let transformedData = [];

  let isDocumentDataValid, doc, transformedProductsPoints, transformedCustomersPoints;
  for (const item of documents) {
    isDocumentDataValid = typeof item === 'object' &&
      (
        item.shopify_session__id ||
        item.default_points ||
        item.product_points ||
        item.customer_points
      );
    
    if (!isDocumentDataValid) continue;

    doc = {};

    transformedProductsPoints = getTransformedProductsPointsData(item.products_points);
    transformedCustomersPoints = getTransformedCustomersPointsData(item.customers_points);

    if (item.shopify_session__id) doc.shopify_session = item.shopify_session__id;
    if (item.default_points) doc.default_points = item.default_points;
    if (transformedProductsPoints) doc.products_points = transformedProductsPoints;
    if (transformedCustomersPoints) doc.customers_points = transformedCustomersPoints;

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
