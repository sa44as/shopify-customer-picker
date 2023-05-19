// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
* @typedef {import("../generated/api").InputQuery} InputQuery
* @typedef {import("../generated/api").FunctionResult} FunctionResult
* @typedef {import("../generated/api").Target} Target
* @typedef {import("../generated/api").ProductVariant} ProductVariant
*/

/**
* @type {FunctionResult}
*/
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

export default /**
* @param {InputQuery} input
* @returns {FunctionResult}
*/
  (input) => {
    // Define a type for your configuration, and parse it from the metafield
    /**
    * @type {{
    *  rewardPoints: number
    * }}
    */
    const configuration = {};
    const getRewardPoints = input?.cart?.buyerIdentity?.customer?.metafield?.value ?? null;
    if (getRewardPoints) configuration.rewardPoints = Number(getRewardPoints);

    if (!configuration.rewardPoints) {
      return EMPTY_DISCOUNT;
    }

    let usedRewardPoints = 0;
    let isProductVariant, getPointsPrice, pointsPrice, eligibleQuantity, isEligible, isStillEligible, isAllQuantityEligible;
    const splitedLines = [];
    const targets = input.cart.lines
      // Use the configured quantity instead of a hardcoded value
      .filter(line => {
        eligibleQuantity = 0;
        isProductVariant = line.merchandise.__typename == "ProductVariant";
        if (!isProductVariant) return false;
        getPointsPrice = line?.merchandise?.product?.metafield?.value ?? null;
        if (!getPointsPrice) return false;
        pointsPrice = Number(getPointsPrice);
        isEligible = usedRewardPoints + pointsPrice <= configuration.rewardPoints;
        if (isEligible && line.quantity > 1) {
          for (let quantity = 1; quantity <= line.quantity; quantity++) {
            isStillEligible = usedRewardPoints + pointsPrice * quantity <= configuration.rewardPoints;
            if (!isStillEligible) break;
            eligibleQuantity++;
          }
          isAllQuantityEligible = eligibleQuantity === line.quantity;
          if (!isAllQuantityEligible) {
            splitedLines.push(
              {
                ...line,
                quantity: line.quantity - eligibleQuantity,
              }
            );
            line.quantity = eligibleQuantity;
          }
        }
        usedRewardPoints += line.quantity * pointsPrice;
        return isEligible;
      })
      .map(line => {
        const variant = /** @type {ProductVariant} */ (line.merchandise);
        return /** @type {Target} */ ({
          productVariant: {
            id: variant.id,
            quantity: line.quantity,
          }
        });
      });
    
    // if (splitedLines.length) {
    //   for (const line of splitedLines) {
    //     const variant = /** @type {ProductVariant} */ (line.merchandise);
    //     const target = /** @type {Target} */ ({
    //       productVariant: {
    //         id: variant.id,
    //         quantity: line.quantity,
    //       }
    //     });
    //     targets.push(target);
    //   }
    // }

    if (!targets.length) {
      console.error("No cart lines qualify for reward discount.");
      return EMPTY_DISCOUNT;
    }

    return {
      discounts: [
        {
          targets,
          value: {
            percentage: {
              value: "100"
            }
          }
        }
      ],
      discountApplicationStrategy: DiscountApplicationStrategy.First
    };
  };
