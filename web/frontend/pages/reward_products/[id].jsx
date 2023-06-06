import { Card, Page, Layout, SkeletonBodyText } from "@shopify/polaris";
import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { QRCodeForm } from "../../components";
import { useParams } from "react-router-dom";
import { useAppQuery } from "../../hooks";

export default function RewardProductEdit() {
  const breadcrumbs = [{ content: "Reward products", url: "/" }];

  /*
     These are mock values.
     Set isLoading to false to preview the page without loading markup.
  */
  // const isLoading = false;
  // const isRefetching = false;
  // const QRCode = {
  //   createdAt: "2022-06-13",
  //   destination: "checkout",
  //   title: "My first QR code",
  //   product: {}
  // };

  const { id } = useParams();

  /*
    Fetch the Reward product.
    useAppQuery uses useAuthenticatedQuery from App Bridge to authenticate the request.
    The backend supplements app data with data queried from the Shopify GraphQL Admin API.
  */
  const {
    data: rewardProduct,
    isLoading,
    isRefetching,
  } = useAppQuery({
    url: `/api/internal/v1/configuration/reward_product/${id}`,
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
          title="Edit Reward Product"
          breadcrumbs={breadcrumbs}
          primaryAction={null}
        />
        <Loading />
        <Layout>
          <Layout.Section>
            <Card sectioned title="Title">
              <SkeletonBodyText />
            </Card>
            <Card title="Product">
              <Card.Section>
                <SkeletonBodyText lines={1} />
              </Card.Section>
              <Card.Section>
                <SkeletonBodyText lines={3} />
              </Card.Section>
            </Card>
            <Card sectioned title="Discount">
              <SkeletonBodyText lines={2} />
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card sectioned title="QR code" />
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <TitleBar
        title="Edit QR code"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <QRCodeForm QRCode={QRCode} />
    </Page>
  );
}
