import { useNavigate } from "@shopify/app-bridge-react";
import {
  Card,
  IndexTable,
  UnstyledLink,
} from "@shopify/polaris";

export function CustomersPointsIndex({ customersPoints, loading }) {
  const navigate = useNavigate();

  const resourceName = {
    singular: "Customer points multiplier",
    plural: "Customer points multipliers",
  };

  const rowMarkup = customersPoints.map(
    ({ shopify_customer_id, shopify_customer_first_name, shopify_customer_last_name, shopify_customer_email, points }, index) => {
      /* The form layout, created using Polaris components. Includes the customer points multiplier data set above. */
      return (
        <IndexTable.Row
          id={shopify_customer_id}
          key={shopify_customer_id}
          position={index}
          onClick={() => {
            navigate(`/customers_points/${shopify_customer_id.includes("gid://") ? shopify_customer_id.split("/").length && shopify_customer_id.split("/")[shopify_customer_id.split("/").length - 1] : shopify_customer_id}`);
          }}
        >
          <IndexTable.Cell>
            <UnstyledLink data-primary-link url={`/customers_points/${shopify_customer_id.includes("gid://") ? shopify_customer_id.split("/").length && shopify_customer_id.split("/")[shopify_customer_id.split("/").length - 1] : shopify_customer_id}`}>
              {truncate(shopify_customer_first_name, 45)}
            </UnstyledLink>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <UnstyledLink data-primary-link url={`/customers_points/${shopify_customer_id.includes("gid://") ? shopify_customer_id.split("/").length && shopify_customer_id.split("/")[shopify_customer_id.split("/").length - 1] : shopify_customer_id}`}>
              {truncate(shopify_customer_last_name, 45)}
            </UnstyledLink>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <UnstyledLink data-primary-link url={`/customers_points/${shopify_customer_id.includes("gid://") ? shopify_customer_id.split("/").length && shopify_customer_id.split("/")[shopify_customer_id.split("/").length - 1] : shopify_customer_id}`}>
              {truncate(shopify_customer_email, 45)}
            </UnstyledLink>
          </IndexTable.Cell>
          <IndexTable.Cell>{points}</IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  /* A layout for small screens, built using Polaris components */
  return (
    <Card>      
      <IndexTable
        resourceName={resourceName}
        itemCount={customersPoints.length}
        headings={[
          { title: "First name" },
          { title: "Last name" },
          { title: "Email" },
          { title: "Purchased product money price $1 = [multiplier] points for the selected customer." },
        ]}
        selectable={false}
        loading={loading}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}

/* A function to truncate long strings */
function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}
