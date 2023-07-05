# Shopify App Template - Node

This is a template for building a [Shopify app](https://shopify.dev/docs/apps/getting-started) using Node and React. It contains the basics for building a Shopify app.

Rather than cloning this repo, you can use your preferred package manager and the Shopify CLI with [these steps](#installing-the-template).

## Benefits

Shopify apps are built on a variety of Shopify tools to create a great merchant experience. The [create an app](https://shopify.dev/docs/apps/getting-started/create) tutorial in our developer documentation will guide you through creating a Shopify app using this template.

The Node app template comes with the following out-of-the-box functionality:

- OAuth: Installing the app and granting permissions
- GraphQL Admin API: Querying or mutating Shopify admin data
- REST Admin API: Resource classes to interact with the API
- Shopify-specific tooling:
  - AppBridge
  - Polaris
  - Webhooks

## Tech Stack

This template combines a number of third party open-source tools:

- [Express](https://expressjs.com/) builds the backend.
- [Vite](https://vitejs.dev/) builds the [React](https://reactjs.org/) frontend.
- [React Router](https://reactrouter.com/) is used for routing. We wrap this with file-based routing.
- [React Query](https://react-query.tanstack.com/) queries the Admin API.

The following Shopify tools complement these third-party tools to ease app development:

- [Shopify API library](https://github.com/Shopify/shopify-node-api) adds OAuth to the Express backend. This lets users install the app and grant scope permissions.
- [App Bridge React](https://shopify.dev/docs/apps/tools/app-bridge/getting-started/using-react) adds authentication to API requests in the frontend and renders components outside of the App’s iFrame.
- [Polaris React](https://polaris.shopify.com/) is a powerful design system and component library that helps developers build high quality, consistent experiences for Shopify merchants.
- [Custom hooks](https://github.com/Shopify/shopify-frontend-template-react/tree/main/hooks) make authenticated requests to the Admin API.
- [File-based routing](https://github.com/Shopify/shopify-frontend-template-react/blob/main/Routes.jsx) makes creating new pages easier.

## Getting started

### Requirements

1. You must [download and install Node.js](https://nodejs.org/en/download/) if you don't already have it.
1. You must [create a Shopify partner account](https://partners.shopify.com/signup) if you don’t have one.
1. You must create a store for testing if you don't have one, either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store).

### Installing the template

This template can be installed using your preferred package manager:

Using yarn:

```shell
yarn create @shopify/app
```

Using npm:

```shell
npm init @shopify/app@latest
```

Using pnpm:

```shell
pnpm create @shopify/app@latest
```

This will clone the template and install the required dependencies.

#### Local Development

[The Shopify CLI](https://shopify.dev/docs/apps/tools/cli) connects to an app in your Partners dashboard. It provides environment variables, runs commands in parallel, and updates application URLs for easier development.

You can develop locally using your preferred package manager. Run one of the following commands from the root of your app.

Using yarn:

```shell
yarn dev
```

Using npm:

```shell
npm run dev
```

Using pnpm:

```shell
pnpm run dev
```

Open the URL generated in your console. Once you grant permission to the app, you can start development.

## Deployment

### Application Storage

Already switched to MongoDB, you can skip reading till the Build section.

This template uses [SQLite](https://www.sqlite.org/index.html) to store session data. The database is a file called `database.sqlite` which is automatically created in the root. This use of SQLite works in production if your app runs as a single instance.

The database that works best for you depends on the data your app needs and how it is queried. You can run your database of choice on a server yourself or host it with a SaaS company. Here’s a short list of databases providers that provide a free tier to get started:

| Database   | Type             | Hosters                                                                                                                                                                                                                               |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MySQL      | SQL              | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-mysql), [Planet Scale](https://planetscale.com/), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/mysql) |
| PostgreSQL | SQL              | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-postgresql), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres)                                   |
| Redis      | Key-value        | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-redis), [Amazon MemoryDB](https://aws.amazon.com/memorydb/)                                                                                                        |
| MongoDB    | NoSQL / Document | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-mongodb), [MongoDB Atlas](https://www.mongodb.com/atlas/database)                                                                                                  |

To use one of these, you need to change your session storage configuration. To help, here’s a list of [SessionStorage adapter packages](https://github.com/Shopify/shopify-api-js/tree/main/docs/guides/session-storage.md).

### Build

The frontend is a single page app. It requires the `SHOPIFY_API_KEY`, which you can find on the page for your app in your partners dashboard. Paste your app’s key in the command for the package manager of your choice:

Using yarn:

```shell
cd web/frontend/ && SHOPIFY_API_KEY=REPLACE_ME yarn build
```

Using npm:

```shell
cd web/frontend/ && SHOPIFY_API_KEY=REPLACE_ME npm run build
```

Using pnpm:

```shell
cd web/frontend/ && SHOPIFY_API_KEY=REPLACE_ME pnpm run build
```

You do not need to build the backend.

## Hosting

When you're ready to set up your app in production, you can follow [our deployment documentation](https://shopify.dev/docs/apps/deployment/web) to host your app on a cloud provider like [Heroku](https://www.heroku.com/) or [Fly.io](https://fly.io/).

When you reach the step for [setting up environment variables](https://shopify.dev/docs/apps/deployment/web#set-env-vars), you also need to set the variable `NODE_ENV=production`.

## Known issues

### Hot module replacement and Firefox

When running the app with the CLI in development mode on Firefox, you might see your app constantly reloading when you access it.
That happened in previous versions of the CLI, because of the way HMR websocket requests work.

We fixed this issue with v3.4.0 of the CLI, so after updating it, you can make the following changes to your app's `web/frontend/vite.config.js` file:

1. Change the definition `hmrConfig` object to be:

   ```js
   const host = process.env.HOST
     ? process.env.HOST.replace(/https?:\/\//, "")
     : "localhost";

   let hmrConfig;
   if (host === "localhost") {
     hmrConfig = {
       protocol: "ws",
       host: "localhost",
       port: 64999,
       clientPort: 64999,
     };
   } else {
     hmrConfig = {
       protocol: "wss",
       host: host,
       port: process.env.FRONTEND_PORT,
       clientPort: 443,
     };
   }
   ```

1. Change the `server.host` setting in the configs to `"localhost"`:

   ```js
   server: {
     host: "localhost",
     ...
   ```

### I can't get past the ngrok "Visit site" page

When you’re previewing your app or extension, you might see an ngrok interstitial page with a warning:

```text
You are about to visit <id>.ngrok.io: Visit Site
```

If you click the `Visit Site` button, but continue to see this page, then you should run dev using an alternate tunnel URL that you run using tunneling software.
We've validated that [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/run-tunnel/trycloudflare/) works with this template.

To do that, you can [install the `cloudflared` CLI tool](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/), and run:

```shell
# Note that you can also use a different port
cloudflared tunnel --url http://localhost:3000
```

Out of the logs produced by cloudflare you will notice a https URL where the domain ends with `trycloudflare.com`. This is your tunnel URL. You need to copy this URL as you will need it in the next step.

```shell
2022-11-11T19:57:55Z INF Requesting new quick Tunnel on trycloudflare.com...
2022-11-11T19:57:58Z INF +--------------------------------------------------------------------------------------------+
2022-11-11T19:57:58Z INF |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
2022-11-11T19:57:58Z INF |  https://randomly-generated-hostname.trycloudflare.com                                     |
2022-11-11T19:57:58Z INF +--------------------------------------------------------------------------------------------+
```

Below you would replace `randomly-generated-hostname` with what you have copied from the terminal. In a different terminal window, navigate to your app's root and with the URL from above you would call:

```shell
# Using yarn
yarn dev --tunnel-url https://randomly-generated-hostname.trycloudflare.com:3000
# or using npm
npm run dev --tunnel-url https://randomly-generated-hostname.trycloudflare.com:3000
# or using pnpm
pnpm dev --tunnel-url https://randomly-generated-hostname.trycloudflare.com:3000
```

## Developer resources

- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [App authentication](https://shopify.dev/docs/apps/auth)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify API Library documentation](https://github.com/Shopify/shopify-api-js#readme)


## Loyalty program

For integration with the shop, you need to check only external thre API endpoints, the loyalty-program.bnsystems.org/api/external/v1/configuration/is_reward_product/:shopify_product_id, and loyalty-program.bnsystems.org/api/external/v1/customer/points_balance/:shopify_customer_id before adding the product to the cart, and the loyalty-program.bnsystems.org/api/external/v1/order/:shopify_customer_id for detailed order data with rewarded points, please review the below Endpoints documentation for more information.
Note: The loyalty-program discount is working with a product-discount function (extension), and the extension is running like the below scenario:
When a product variant exists on the cart, you need to use the quantity change cart API endpoint instead of adding to the cart endpoint, the function doesn't run when the product variant exists in the cart and you are using add to cart Shopify API endpoint for the same product variant.

Get started
Read Readme.md to understand used technologies, how to work with Shopify CLI commands, and how to run the application in dev mode, then clone the repository, install packages, and run development.
You need to deploy the product-discount function (extension) on Shopify as well using the npm run typegen command inside the extension path ./extensions/product-discount then run npm run deploy from the application root ./.
If you are creating a new app it will be good if you clone the repository and begin from the installation of the product-discount extension as described above, only use -  -    -  -reset with npm run deploy  -   -  -  -reset to create a new app on your partner account and have the product-discount function (extension) also deployed on it as a part of the app.

Shopify Functions (Extensions)
The product-discount type function (extension)  is used for adding a 100% discount on the reward product in the Shopify → cart, this is working with the Product and the Customer metafields.
Documentation: https://shopify.dev/docs/api/functions/reference/product-discounts 

Backend

1. The backend structure is made for having Models, Controllers, Routes (external and internal), and Services.
2. Custom authentication middleware is made for the External API endpoints that attach the shop access token to the request, the external API endpoints are accessible only from the shop domain where the application is installed, and the requests from other sources will be blocked by CORS.
3. The GDPR and ORDERS webhookHandlers are made to receive the ORDERS_PAID webhook from Shopify.
The ORDERS_PAID  webhookHandler is receiving the order payload and makes custom calculations using predefined entire Shop, Individual Customers, Specific products, Pre-sale products, Gift card products, and Specific dates configurations and stores historical data in the internal database mongoDB.
4. The API endpoints /api/internal/v1 and  the /api/external/v1 are made for Configurations CRUD modules and for integration with the SHOP.


Frontend
1. The frontend structure is made for having pages with dynamic routes, components, hooks, and constants, keeping all necessary things compatible with the Shopify CLI, and with AppBridge, and Polaris, using which ones can be done authenticated fetch to the internal API requests from the App Admin interface.

Deploy
1. Internal database is MongoDB hosted on DigitalOcean and working on the project with Mongoose.
2. The server is droplet hosted on DigitalOcean.
3. the backend project is deployed with pm2.

Delete old process and logs:

pm2 flush API
pm2 delete API

Run application:

cd web
pm2 start ecosystem.config.cjs --env production

Restart to add timestamp in logs:

pm2 restart API --time

View logs:

pm2 logs API --lines 1000

4. The frontend needs to build for deployment as described here https://github.com/Stax-LTD/loyalty-program#build 



API
API URL: loyalty-program.bnsystems.org/api


Endpoints


Configuration

External routes
Route: /external/v1/configuration
Description: Used for integration with the shop.

Endpoint: GET /is_reward_product/:shopify_product_id
shopify_product_id is required

Description: Check if the product is a reward product, this is necessary to be used before adding the product to the cart, (and before going to checkout ??? need to decide).
Before going to checkout you need to detect in-cart reward products,…??? need to decide after having integrated with add-to-cart level low priority
Note: The product that needs to be reward product needs to have a high money price to avoid wrong orders caused by any technical issue if something will go not as expected.
Note: For rendering the reward products on grid views or on the product page, you can check the product metafield with Namespace: loyalty_program, and Key: configuration, and if the product will have that metafield it means the product is a reward and you can get the product price with points from the metafield points_price property value.
Note: This Endpoint needs to be used with /api/external/v1/customer/points_balance/:shopify_customer_id endpoint.
Do not use the metafield information for adding products to the cart or before going to checkout.

Internal routes
Route: /internal/v1/configuration
Description: Used for Admin interface Configurations CRUD modules.

Endpoint: GET /reward_product/:shopify_product_id
Query parameters:
shopify_product_id is required
Description: Get a reward product.

Endpoint: GET /reward_products
No parameters
Description: Get all Reward Products in the shop.

Endpoint: POST /reward_product
Body parameters:
shopifyProductId is required
pointsPrice is required
shopifyProductTitle is required
shopifyProductImageUrl is required
Description: Create a Reward product

Endpoint: PATCH /reward_product/:shopify_product_id
Body parameters:
shopifyProductId  is required
pointsPrice  is required
Description: Update Reward product points price

Endpoint: DELETE /reward_product/:shopify_product_id
Description: Delete Reward product


Customer

External routes
Route: /external/v1/customer
Description: Used for integration with the shop.

Endpoint: GET /points_balance/:shopify_customer_id

Query parameters:
shopify_customer_id  is required

Description: Get Customer points balance, this is necessary to be used before adding the product to the cart, (and before going to checkout ??? need to decide after integration with add to cart level).
Before adding a product to the cart you need to get the customer points balance and compare it with the points_prices amount of in-cart products plus the points price of the reward product that needs to be added to the cart, then if the customer points balance is higher or equal to the result (points_prices_amount), then allowed to add reward product to cart, otherwise need to inform customer the point balance is not enough to buy a product with points.
Before going to checkout you need to detect in-cart reward products,…??? need to decide after integration with add to cart level low priority


Order

External routes
Route: /external/v1/order
Description: Used for integration with the shop.

Endpoint: GET /:shopify_customer_id

Query parameters
shopify_customer_id is required

Description: Get customer orders in detail, with reward points information for each order and line item.

Endpoint: GET /before_add_to_cart/:shopify_customer_id/:shopify_product_id (final review necessary, not using can be necessary for future versions)

Query parameters
shopify_customer_id is required
shopify_product_id is required

Description: Run before adding to the cart for making sure the customer has enough balance to buy that product with points and the product is a reward product, in other words, make sure everything is correct before moving forward to add the product to the cart because the discount is adding by checking Shopify metafields which is accessible for manual change.



Help for integrastion with the shop

The below codes can be helpful for integration with the shop, these are just developer tested API calls with the test data directly in the theme.liquid file, just you need to use them at the correct time and under the correct conditions.

HTML:
<button id="apiCallOrdersBtn" style="position: fixed; top:0; left:0; padding-top: 100px">API CALL Orders</button>
<button id="apiCallCustomerPointsBalanceBtn" style="position: fixed; top:0; left:200px; padding-top: 100px">API CALL CustomerPointsBalance</button>
<button id="apiCallProductIsRewardBtn" style="position: fixed; top:0; left:400px; padding-top: 100px">API CALL ProductIsReward</button>
<button id="apiCallBeforeAddToCartBtn" style="position: fixed; top:0; left: 100px; padding-top:100px">API CALL BeforeAddToCart</button>

JS:
<script>
  const apiCallOrders = async () => {
    const response = await fetch('https://loyalty-program.bnsystems.org/api/external/v1/order/{{ http://customer.id  }}');

const json = await response.json();

console.log(JSON.stringify(json));

  }
  const apiCallOrdersBtn = document.querySelector('#apiCallOrdersBtn');
  apiCallOrdersBtn.onclick = apiCallOrders;

  const apiCallBeforeAddToCart = async () => {
    const response = await fetch('https://loyalty-program.bnsystems.org/api/external/v1/order/before_add_to_cart/{{ http://customer.id  }}/7489095598319');

const json = await response.json();

console.log(JSON.stringify(json));

  }
  const apiCallBeforeAddToCartBtn = document.querySelector('#apiCallBeforeAddToCartBtn');
  apiCallBeforeAddToCartBtn.onclick = apiCallBeforeAddToCart;

  const apiCallCustomerPointsBalance = async () => {
    const response = await fetch('https://loyalty-program.bnsystems.org/api/external/v1/customer/points_balance/{{ http://customer.id  }}');

const json = await response.json();

console.log(JSON.stringify(json));
return json;

  }
  const apiCallCustomerPointsBalanceBtn = document.querySelector('#apiCallCustomerPointsBalanceBtn');
  apiCallCustomerPointsBalanceBtn.onclick = apiCallCustomerPointsBalance;

 const apiCallProductIsReward = async () => {
    const response = await fetch('https://loyalty-program.bnsystems.org/api/external/v1/configuration/is_reward_product/{{ product.id }}');

const json = await response.json();

console.log(JSON.stringify(json));
return json;

  }
  const apiCallProductIsRewardBtn = document.querySelector('#apiCallProductIsRewardBtn');
  apiCallProductIsRewardBtn.onclick = apiCallProductIsReward;
</script>

Completed TO DOS

1. Install the app in the staging environment after discussion with the integration team, I need to provide a development store to the integration team, where they need to install the Stax 2.0 theme latest version, parallelly I will install the app staging environment to the same development store. - DONE



3. Admin interface Configuration:

b) Specific products [product input] $1 = [number input] points  - CRUD is done
c) Individual customers [customer input] $1 = [number input] points - CRUD is done
g) Reward products [product input] points price [number input] points - CRUD is done
h) Navigation, pages, and routes - are done

5. Final review for double-checking, optimizing, and finalizing all things that are necessary for integration with the shop - Done

TO DOS

1. Integration with SHOP using the above-mentioned API endpoints and the Product and Customer Shopify metafield values and in Cart existing products data to compare things and understand if the Customer balance - in cart reward product points * in cart reward product quantity >= New product adding to cart when the customer clicks to the Buy with points button. - IN PROGRESS by the integration team

3.  Admin interface Configuration:
a) Entire store $1  = [number input] points (low priority - because the backend is done. and the default setting  multiplier is 1, which can be done after final review for double checking, optimizing, and finalizing all things that are necessary for integration with the shop)
d) Specific dates [date range input] $1 = [number input] points (low priority - because the backend is done. and the default setting  multiplier is 1, which can be done after final review for double checking, optimizing, and finalizing all things that are necessary for integration with the shop)
e) Pre Sale product $1 = [number input] points (low priority - because the backend is done. and the default setting  multiplier is 1, which can be done after final review for double checking, optimizing, and finalizing all things that are necessary for integration with the shop)
f) Gift Card $1 = [number input] points (low priority - because the backend is done. and the default setting  multiplier is 1, which can be done after final review for double checking, optimizing, and finalizing all things that are necessary for integration with the shop)

4. ) Many internal API endpoints documentation are not documented and have very low priority, possibly also not necessary.
   