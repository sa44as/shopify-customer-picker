import { Card, Page, Layout, SkeletonBodyText } from "@shopify/polaris";
import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { RewardProductForm } from "../../components";
import { useParams } from "react-router-dom";
import { useAppQuery } from "../../hooks";

export default function RewardProductEdit() {
  const breadcrumbs = [{ content: "Reward products", url: "/reward_products" }];

  const { shopify_product_id } = useParams();

  /*
    Fetch the Reward product.
    useAppQuery uses useAuthenticatedQuery from App Bridge to authenticate the request.
    The backend supplements app data with data queried from the internal database, Shopify REST or GraphQL Admin API.
  */
  const {
    data: getRewardProduct,
    isLoading,
    isRefetching,
  } = useAppQuery({
    url: `/api/internal/v1/configuration/reward_product/${shopify_product_id}`,
    reactQueryOptions: {
      /* Disable refetching because the RewardProductForm component ignores changes to its props */
      refetchOnReconnect: false,
    },
  });

  /* Loading action and markup that uses App Bridge and Polaris components */
  if (isLoading || isRefetching) {
    return (
      <Page>
        <TitleBar
          title="Edit Reward product"
          breadcrumbs={breadcrumbs}
          primaryAction={null}
        />
        <Loading />
        <Layout>
          <Layout.Section>
            <Card title="Product">
              <Card.Section>
                <SkeletonBodyText lines={3} />
              </Card.Section>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card sectioned title="Points price" >
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
        title="Edit Reward product"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <RewardProductForm rewardProduct={getRewardProduct.reward_product_configuration} />
    </Page>
  );
}
