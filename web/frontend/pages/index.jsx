import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";
import { RewardProductsIndex } from "../components";
import { useAppQuery } from "../hooks";

export default function HomePage() {
  /*
    Add an App Bridge useNavigate hook to set up the navigate function.
    This function modifies the top-level browser URL so that you can
    navigate within the embedded app and keep the browser in sync on reload.
  */
  const navigate = useNavigate();

  /* useAppQuery wraps react-query and the App Bridge authenticatedFetch function */
  const {
    data: getRewardProducts,
    isLoading,

    /*
      react-query provides stale-while-revalidate caching.
      By passing isRefetching to Index Tables we can show stale data and a loading state.
      Once the query refetches, IndexTable updates and the loading state is removed.
      This ensures a performant UX.
    */
    isRefetching,
  } = useAppQuery({
    url: "/api/internal/v1/configuration/reward_products",
  });

  /* Set the QR codes to use in the list */
  const rewardProductsMarkup = getRewardProducts?.reward_products?.length ? (
    <RewardProductsIndex rewardProducts={getRewardProducts.reward_products} loading={isRefetching} />
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
    !isLoading && !getRewardProducts?.reward_products?.length ? (
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
            Make the reward product and setup points price.
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
          {loadingMarkup}
          {rewardProductsMarkup}
          {emptyStateMarkup}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
