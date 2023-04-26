import { shopifySessionModel } from "../models/map.js";

const create = async (documents) => {
  const transformedConfigurationData = getTransformedConfigurationData(documents);
  if (!transformedConfigurationData) {
    return {
      error: true,
      message: 'Error while creating Configuration, the provided data is not correct.',
    };
  }

  try {
    const res = await shopifySessionModel.create(transformedConfigurationData);
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
    const res = await shopifySessionModel.find(filter, projection, options);
    return res;
  } catch (err) {
    return {
      error: true,
      message: 'Error while finding Shopify session. Original err.message: ' + err.message,
    };
  }
}

const shopifySessionService = {
  create,
  find,
}

export { shopifySessionService }
