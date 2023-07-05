import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";
import { CustomersPointsIndex } from "../../components";
import { useAppQuery } from "../../hooks";

export default function CustomersPoints() {
  /*
    Add an App Bridge useNavigate hook to set up the navigate function.
    This function modifies the top-level browser URL so that you can
    navigate within the embedded app and keep the browser in sync on reload.
  */
  const navigate = useNavigate();

  /* useAppQuery wraps react-query and the App Bridge authenticatedFetch function */
  const {
    data: getCustomersPoints,
    isLoading,

    /*
      react-query provides stale-while-revalidate caching.
      By passing isRefetching to Index Tables we can show stale data and a loading state.
      Once the query refetches, IndexTable updates and the loading state is removed.
      This ensures a performant UX.
    */
    isRefetching,
  } = useAppQuery({
    url: "/api/internal/v1/configuration/customers_points",
  });

  /* Set the Customers points to use in the list */
  const customersPointsMarkup = getCustomersPoints?.customers_points?.length ? (
    <CustomersPointsIndex customersPoints={getCustomersPoints.customers_points} loading={isRefetching} />
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
    !isLoading && !getCustomersPoints?.customers_points?.length ? (
      <Card sectioned>
        <EmptyState
          heading="Create Individual customer points multiplier"
          /* This button will take the user to a Create a Individual customer points page */
          action={{
            content: "Create Individual customer points multiplier",
            onAction: () => navigate("/customers_points/new"),
          }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>
            Purchased product money price $1 = [multiplier] points for the selected customer.
          </p>
        </EmptyState>
      </Card>
    ) : null;

  /*
    Use Polaris Page and TitleBar components to create the page layout,
    and include the empty state contents set above.
  */
  return (
    <Page /*fullWidth={!!customersPointsMarkup}*/>
      <TitleBar
        title="Individual customer points multipliers"
        primaryAction={{
          content: "Create Individual customer points multiplier",
          onAction: () => navigate("/customers_points/new"),
        }}
      />
      <Layout>
        <Layout.Section>
          {loadingMarkup}
          {customersPointsMarkup}
          {emptyStateMarkup}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
