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
        if (err instanceof GraphqlQueryError) {
          throw new Error(
            `${err.message}\n${JSON.stringify(err.response, null, 2)}`
          );
        } else {
          throw err;
        }
        // end of the below commented error reporting type can be necessary for debug, don't remove, to do, low priority
        // return null; // uncomment when above error reporting is commented
      }
    },
  },
}

export { shopifyApiGraphql }
