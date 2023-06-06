import { useNavigate } from "@shopify/app-bridge-react";
import {
  Card,
  IndexTable,
  Thumbnail,
  UnstyledLink,
} from "@shopify/polaris";
import { ImageMajor } from "@shopify/polaris-icons";

export function RewardProductsIndex({ rewardProducts, loading }) {
  const navigate = useNavigate();

  const resourceName = {
    singular: "Reward product",
    plural: "Reward products",
  };

  const rowMarkup = rewardProducts.map(
    ({ shopify_product_id, shopify_product_image_url, shopify_product_title, points_price }, index) => {
      /* The form layout, created using Polaris components. Includes the reward product data set above. */
      return (
        <IndexTable.Row
          id={shopify_product_id}
          key={shopify_product_id}
          position={index}
          onClick={() => {
            navigate(`/reward_products/${shopify_product_id}`);
          }}
        >
          <IndexTable.Cell>
            <Thumbnail
              source={null || ImageMajor}
              alt="placeholder"
              color="base"
              size="small"
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <UnstyledLink data-primary-link url={`/reward_products/${shopify_product_id}`}>
              {truncate(shopify_product_title, 25)}
            </UnstyledLink>
          </IndexTable.Cell>
          <IndexTable.Cell>{points_price}</IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  /* A layout for small screens, built using Polaris components */
  return (
    <Card>      
      <IndexTable
        resourceName={resourceName}
        itemCount={rewardProducts.length}
        headings={[
          { title: "Thumbnail", hidden: true },
          { title: "Title" },
          { title: "Points price" },
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
