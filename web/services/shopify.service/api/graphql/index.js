import { GraphqlQueryError } from "@shopify/shopify-api";
import { shopify } from "../../index.js";

// to do, can be necessary, remove after finishing and testing the below mutation
// `mutation {
//   discountAutomaticAppCreate(automaticAppDiscount: {
//     title: "Test Volume discount",
//     functionId: "01H0N8X28PSAV5AHNDFHSFF3DN",
//     startsAt: "2023-05-22T00:00:00"
//   }) {
//      automaticAppDiscount {
//       discountId
//      }
//      userErrors {
//       field
//       message
//      }
//   }
// }`;

// to do can be moved to constants
const QUERY = {
  CUSTOMER: {
    GET: `
        query customers($first: Int!, $query: String, $after: String) {
          customers(first: $first, query: $query, after: $after) {
            edges {
              node {
                id
                state
                email
                firstName
                lastName
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
  },
};

// to do can be moved to constants
const MUTATION = {
  DISCOUNT_AUTOMATIC_APP: {
    CREATE: `
        mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
          discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
            automaticAppDiscount {
              discountId
            }
            userErrors {
              field
              message
            }
          }
        }  
      `,
  },
  METAFIELD: {
    DELETE: `
        mutation metafieldDelete($input: MetafieldDeleteInput!) {
          metafieldDelete(input: $input) {
            deletedId
            userErrors {
              field
              message
            }
          }
        }
      `,
  },
};

const shopifyApiGraphql = {
  discountAutomaticApp: {
    create: async (session, input) => {
      try {
        const client = new shopify.api.clients.Graphql({ session });
        const response = await client.query({
          data: {
            query: MUTATION.DISCOUNT_AUTOMATIC_APP.CREATE,
            variables: {
              automaticAppDiscount: {
                title: input.title,
                functionId: input.functionId,
                startsAt: input.startsAt,
              },
            },
          },
        });
        return response;
      } catch (err) {
        console.log("shopifyApiGraphql.discountAutomaticApp.create.err: ", err);
        // the below commented error reporting type can be necessary for debug, don't remove, to do, low priority
        // if (err instanceof GraphqlQueryError) {
        //   throw new Error(
        //     `${err.message}\n${JSON.stringify(err.response, null, 2)}`
        //   );
        // } else {
        //   throw err;
        // }
        // end of the below commented error reporting type can be necessary for debug, don't remove, to do, low priority
        return null; // uncomment when above error reporting is commented
      }
    },
  },
  metafield: {
    delete: async (session, input) => {
      const id = input.id.includes("gid://") ? input.id : "gid://shopify/Metafield" + input.id;
      try {
        const client = new shopify.api.clients.Graphql({ session });
        const response = await client.query({
          data: {
            query: MUTATION.METAFIELD.DELETE,
            variables: {
              input: {
                id: id,
              },
            },
          },
        });
        return response;
      } catch (err) {
        console.log("shopifyApiGraphql.metafield.delete.err: ", err);
        // the below commented error reporting type can be necessary for debug, don't remove, to do, low priority
        // if (err instanceof GraphqlQueryError) {
        //   throw new Error(
        //     `${err.message}\n${JSON.stringify(err.response, null, 2)}`
        //   );
        // } else {
        //   throw err;
        // }
        // end of the below commented error reporting type can be necessary for debug, don't remove, to do, low priority
        return null; // uncomment when above error reporting is commented
      }
    },
  },
  customer: {
    get: async (session, input) => {
      try {
        const client = new shopify.api.clients.Graphql({ session });
        const response = await client.query({
          data: {
            query: QUERY.CUSTOMER.GET,
            variables: {
              first: Number(input.first),
              query: input.query,
              after: input.after,
            },
          },
        });
        return response;
      } catch (err) {
        console.log("shopifyApiGraphql.customer.get.err: ", err);
        // the below commented error reporting type can be necessary for debug, don't remove, to do, low priority
        // if (err instanceof GraphqlQueryError) {
        //   throw new Error(
        //     `${err.message}\n${JSON.stringify(err.response, null, 2)}`
        //   );
        // } else {
        //   throw err;
        // }
        // end of the below commented error reporting type can be necessary for debug, don't remove, to do, low priority
        return null; // uncomment when above error reporting is commented
      }
    },
  },
}

export { shopifyApiGraphql }
