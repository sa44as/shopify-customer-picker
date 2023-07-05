import { Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { CustomerPointsForm } from "../../components";

export default function ManageCustomerPoints() {
  const breadcrumbs = [{ content: "Individual customer points multipliers", url: "/customers_points" }];

  return (
    <Page>
      <TitleBar
        title="Create new Individual customer points multiplier"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <CustomerPointsForm />
    </Page>
  );
}
