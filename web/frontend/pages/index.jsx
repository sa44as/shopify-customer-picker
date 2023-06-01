import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";
import { RewardProductsIndex } from "../components";

export default function HomePage() {
  /*
    Add an App Bridge useNavigate hook to set up the navigate function.
    This function modifies the top-level browser URL so that you can
    navigate within the embedded app and keep the browser in sync on reload.
  */
  const navigate = useNavigate();

  /*
    These are mock values. Setting these values lets you preview the loading markup and the empty state.
  */
  const isLoading = false;
  const isRefetching = false;
  const rewardProducts = [
    {
      shopify_product_id: "test_product_id",
      shopify_product_image_url: 'test_url',
      shopify_product_title: "test ptoduct title",
      points_price: "79.95",
    },
  ];

  /* Set the QR codes to use in the list */
  const rewardProductsMarkup = rewardProducts?.length ? (
    <RewardProductsIndex rewardProducts={rewardProducts} loading={isRefetching} />
  ) : null;

  /* loadingMarkup uses the loading component from AppBridge and components from Polaris  */
  const loadingMarkup = isLoading ? (
    <Card sectioned>
      <Loading />
      <SkeletonBodyText />
    </Card>
  ) : null;

  /* Use Polaris Card and EmptyState components to define the contents of the empty state */
  const emptyStateMarkup =
    !isLoading && !rewardProducts?.length ? (
      <Card sectioned>
        <EmptyState
          heading="Create reward product"
          /* This button will take the user to a Create a reward product page */
          action={{
            content: "Create reward product",
            onAction: () => navigate("/reward_products/new"),
          }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>
            Make product reward and setup points price.
          </p>
        </EmptyState>
      </Card>
    ) : null;

  /*
    Use Polaris Page and TitleBar components to create the page layout,
    and include the empty state contents set above.
  */
  return (
    <Page fullWidth={!!rewardProductsMarkup}>
      <TitleBar
        title="Reward products"
        primaryAction={{
          content: "Create Reward product",
          onAction: () => navigate("/reward_products/new"),
        }}
      />
      <Layout>
        <Layout.Section>
          <p>here</p>
          {loadingMarkup}
          {rewardProductsMarkup}
          {emptyStateMarkup}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
