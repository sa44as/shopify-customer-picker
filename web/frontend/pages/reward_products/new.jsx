import { Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { RewardProductForm } from "../../components";

export default function ManageRewardProduct() {
  const breadcrumbs = [{ content: "Reward products", url: "/" }];

  return (
    <Page>
      <TitleBar
        title="Create new Reward product"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <RewardProductForm />
    </Page>
  );
}
