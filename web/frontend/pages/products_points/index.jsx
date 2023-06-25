import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";
import { ProductsPointsIndex } from "../../components";
import { useAppQuery } from "../../hooks";

export default function ProductsPoints() {
  /*
    Add an App Bridge useNavigate hook to set up the navigate function.
    This function modifies the top-level browser URL so that you can
    navigate within the embedded app and keep the browser in sync on reload.
  */
  const navigate = useNavigate();

  /* useAppQuery wraps react-query and the App Bridge authenticatedFetch function */
  const {
    data: getProductsPoints,
    isLoading,

    /*
      react-query provides stale-while-revalidate caching.
      By passing isRefetching to Index Tables we can show stale data and a loading state.
      Once the query refetches, IndexTable updates and the loading state is removed.
      This ensures a performant UX.
    */
    isRefetching,
  } = useAppQuery({
    url: "/api/internal/v1/configuration/products_points",
  });

  /* Set the Products points multipliers to use in the list */
  const productsPointsMarkup = getProductsPoints?.products_points?.length ? (
    <ProductsPointsIndex productsPoints={getProductsPoints.products_points} loading={isRefetching} />
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
    !isLoading && !getProductsPoints?.products_points?.length ? (
      <Card sectioned>
        <EmptyState
          heading="Create product points multiplier"
          /* This button will take the user to a Create a product points multiplier page */
          action={{
            content: "Create product points multiplier",
            onAction: () => navigate("/products_points/new"),
          }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>
            Setup product points price multiplier.
          </p>
        </EmptyState>
      </Card>
    ) : null;

  /*
    Use Polaris Page and TitleBar components to create the page layout,
    and include the empty state contents set above.
  */
  return (
    <Page fullWidth={!!productsPointsMarkup}>
      <TitleBar
        title="Products points multipliers"
        primaryAction={{
          content: "Create Product points multiplier",
          onAction: () => navigate("/products_points/new"),
        }}
      />
      <Layout>
        <Layout.Section>
          {loadingMarkup}
          {productsPointsMarkup}
          {emptyStateMarkup}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
