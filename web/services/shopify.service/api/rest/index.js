import { shopify } from "../../index.js";

const shopifyApiRest = {
  shop: {
    metafield: {
      create_or_update: async (session, namespace, key, value, type) => {
        try {
          const metafield = new shopify.api.rest.Metafield({session});
          metafield.namespace = namespace;
          metafield.key = key;
          metafield.value = type === "json" || type === "list.product_reference" ? JSON.stringify(value) : value;
          metafield.type = type;
          await metafield.save(
            {
              update: true,
            }
          );
          return metafield;
        } catch (err) {
          console.log("shopifyApiRest.shop.metafield.create_or_update.err: ", err);
          return null;
        }
      },
    }
  },
  product: {
    get: async (session, id) => {
      try {
        const response = await shopify.api.rest.Product.find(
          {
            session,
            id,
          }
        );
        return response;
      } catch (err) {
        console.log("shopifyApiRest.product.get.err: ", err);
        return null;
      }
    },
    metafield: {
      create: async (session, productId, namespace, key, value, type) => {
        try {
          const metafield = new shopify.api.rest.Metafield({session});
          metafield.product_id = typeof productId === "string" && productId.includes("gid://") ? productId.split("/").length && productId.split("/")[productId.split("/").length - 1] : productId;
          metafield.namespace = namespace;
          metafield.key = key;
          metafield.value = type === "json" ? JSON.stringify(value) : value;
          metafield.type = type;
          await metafield.save(
            {
              update: true,
            }
          );
          return metafield;
        } catch (err) {
          console.log("shopifyApiRest.product.metafield.create.err: ", err);
          return null;
        }
      },
      update: async (session, productId, id, value, type) => {
        try {
          const metafield = new shopify.api.rest.Metafield({session});
          metafield.product_id = typeof productId === "string" && productId.includes("gid://") ? productId.split("/").length && productId.split("/")[productId.split("/").length - 1] : productId;
          metafield.id = id;
          metafield.value = type === "json" ? JSON.stringify(value) : value;
          metafield.type = type;
          await metafield.save({
            update: true,
          });
          return metafield;
        } catch (err) {
          console.log("shopifyApiRest.product.metafield.update.err: ", err);
          return null;
        }
      },
      get: async (session, productId, id) => {
        try {
          const response = await shopify.api.rest.Metafield.find(
            {
              session,
              product_id: typeof productId === "string" && productId.includes("gid://") ? productId.split("/").length && productId.split("/")[productId.split("/").length - 1] : productId,
              id,
            }
          );
          return response;
        } catch (err) {
          console.log("shopifyApiRest.product.metafield.get.err: ", err);
          return null;
        }
      },
      delete: async (session, productId, id) => {
        try {
          await shopify.api.rest.Metafield.delete(
            {
              session,
              product_id: typeof productId === "string" && productId.includes("gid://") ? productId.split("/").length && productId.split("/")[productId.split("/").length - 1] : productId,
              id,
            }
          );
          return true;
        } catch (err) {
          console.log("shopifyApiRest.product.metafield.delete.err: ", err);
          return null;
        }
      },
    },
  },
  customer: {
    metafield: {
      create_or_update: async (session, customerId, namespace, key, value, type) => {
        try {
          const metafield = new shopify.api.rest.Metafield({session});
          metafield.customer_id = typeof customerId === "string" && customerId.includes("gid://") ? customerId.split("/").length && customerId.split("/")[customerId.split("/").length - 1] : customerId;
          metafield.namespace = namespace;
          metafield.key = key;
          metafield.value = type === "json" ? JSON.stringify(value) : value;
          metafield.type = type;
          await metafield.save(
            {
              update: true,
            }
          );
          return metafield;
        } catch (err) {
          console.log("shopifyApiRest.customer.metafield.create_or_update.err: ", err);
          return null;
        }
      },
    },
  },
}

export { shopifyApiRest }
