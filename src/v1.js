// v1 : Lets untangle the code
const { size } = require("lodash/fp");
const { partition } = require("lodash");
const moment = require("moment");

const totalPricesReducer = (accum, price) => {
  // What are the semantics of this check ? Trying to get latest price ?
  if (!accum || moment(accum.createdAt).isBefore(price.createdAt)) {
    accum = price;
  }

  return accum;
};

const getTotalPriceValue = ({ totalPrices = [] }) => {
  if (size(totalPrices) === 0) {
    return null;
  }

  const { totalPriceValue } = totalPrices.reduce(totalPricesReducer, "");

  return totalPriceValue === "" ? null : parseFloat(totalPriceValue);
};

const bidPartitionPredicate = (lowestBid) => (aBid) =>
  getTotalPriceValue(aBid) === getTotalPriceValue(lowestBid) &&
  !!aBid.rank &&
  !!lowestBid.rank;

const flagEqualLowestBids = (bids = []) => {
  if (size(bids) === 0) {
    return [];
  }

  const [lowestBid, ...otherBids] = bids;

  const [otherBidsTiedForLowest, otherBidsNotTiedForLowest] = partition(
    otherBids,
    bidPartitionPredicate(lowestBid)
  );

  if (size(otherBidsTiedForLowest) === 0) {
    return bids;
  }

  const equalLowestBids = [lowestBid, ...otherBidsTiedForLowest];
  const equalLowestBidFlagged = equalLowestBids.map((equalLowestBid) => ({
    ...equalLowestBids,
    tiedForLowest: true,
  }));

  return [...equalLowestBidFlagged, ...otherBidsNotTiedForLowest];
};

module.exports = flagEqualLowestBids;
