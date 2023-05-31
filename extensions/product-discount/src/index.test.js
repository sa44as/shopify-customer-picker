import { describe, it, expect } from 'vitest';
import productDiscounts from './index';

/**
 * @typedef {import("../generated/api").FunctionResult} FunctionResult
 */
// The test is not finilized, leaving here for example, can be necessary for the furter development
describe('product discounts function', () => {
  it('returns no discounts without configuration', () => {
    const result = productDiscounts({
      cart: {
        buyerIdentity: {
          customer: {
            metafield: null
          }
        }
      }
    });
    const expected = /** @type {FunctionResult} */ ({
      discounts: [],
      discountApplicationStrategy: "FIRST",
    });

    expect(result).toEqual(expected);
  });
});