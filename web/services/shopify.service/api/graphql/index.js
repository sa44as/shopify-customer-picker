import { GraphqlQueryError } from "@shopify/shopify-api";
import { shopify } from "../../index.js";

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

const shopifyApiGraphql = {
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
