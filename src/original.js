const { size } = require("lodash/fp");
const { partition } = require("lodash");

const getTotalPriceValue = ({ totalPrices }) => {
  if (totalPrices.length === 0) {
    return null;
  }
  const total = totalPrices.reduce((memo, price) => {
    if (!memo || moment(memo.createdAt).isBefore(price.createdAt)) {
      memo = price;
    }

    return memo;
  }, "");

  // TODO: [DS-1513] This is a temporary arrangement to check if totalPriceValue is empty
  // Once the migration is complete for the totalPriceValue, update the code to check for a floating value instead of string
  return total.totalPriceValue === ""
    ? null
    : parseFloat(total.totalPriceValue);
};

export default function flagEqualLowestBids(bids = []) {
  if (size(bids) === 0) {
    return [];
  }

  const [lowestBid, ...otherBids] = bids;

  // Get all proposals that have a total price equal to the lowest bid
  const [otherBidsTiedForLowest, otherBidsNotTiedForLowest] = partition(
    otherBids,
    (bid) => {
      return (
        getTotalPriceValue(bid) === getTotalPriceValue(lowestBid) &&
        !!bid.rank &&
        !!lowestBid.rank
      );
    }
  );

  if (otherBidsTiedForLowest.length === 0) {
    return bids;
  }

  const equalLowestBids = [lowestBid, ...otherBidsTiedForLowest];
  // Add tiedForLowest bool so that it can be rendered differently on the frontend
  const equalLowestBidsFlagged = equalLowestBids.map((equalLowestBid) => ({
    ...equalLowestBid,
    tiedForLowest: true,
  }));
  return [...equalLowestBidsFlagged, ...otherBidsNotTiedForLowest];
}
