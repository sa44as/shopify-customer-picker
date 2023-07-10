import {
  Card,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";
import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { EntireStorePointsForm } from "../../components";
import { useAppQuery } from "../../hooks";
export default function EntireStorePoints() {

  /*
    Fetch the Entire store configuration.
    useAppQuery uses useAuthenticatedQuery from App Bridge to authenticate the request.
    The backend supplements app data with data queried from the internal database, Shopify REST or GraphQL Admin API.
  */
  const {
    data: entireStoreConfiguration,
    isLoading,
    isRefetching,
  } = useAppQuery({
    url: `/api/internal/v1/configuration`,
    reactQueryOptions: {
      /* Disable refetching because the EntireStorePointsForm component ignores changes to its props */
      refetchOnReconnect: false,
    },
  });

  /* Loading action and markup that uses App Bridge and Polaris components */
  if (isLoading || isRefetching) {
    return (
      <Page>
        <TitleBar
          title="Entire store points multipliers"
          primaryAction={null}
        />
        <Loading />
        <Layout>
          <Layout.Section>
            <Card sectioned title="Multiplier - Purchased product money price $1 = [multiplier] points for the Entire store." >
              <SkeletonBodyText lines={3} />
            </Card>
            <Card sectioned title="Multiplier - Purchased Pre-sale products money price $1 = [multiplier] points for the Entire store." >
              <SkeletonBodyText lines={3} />
            </Card>
            <Card sectioned title="Multiplier - Purchased Gift card products money price $1 = [multiplier] points for the Entire store." >
              <SkeletonBodyText lines={3} />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <TitleBar
        title="Entire store points multipliers"
        primaryAction={null}
      />
      <EntireStorePointsForm entireStorePoints={entireStoreConfiguration} />
    </Page>
  );
}
