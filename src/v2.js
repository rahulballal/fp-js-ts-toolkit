const R = require('ramda')
const moment = require('moment')

const isPriceCreatedBefore = (createdAt, newCreatedAt) => moment(createdAt).isBefore(newCreatedAt)

// Now a very simple Unit test
const totalPricesReducer = (accum, price) => {
	if (!R.isEmpty(accum) || isPriceCreatedBefore(accum.createdAt, price.createdAt)) {
		accum = price
	}
	return accum
}

const getTotalPriceValue = ({ totalPrices = [] }) =>
	R.pipe(
		(totalPrices) => (R.isEmpty(totalPrices) ? [] : totalPrices), // Step 1
		R.reduce(totalPricesReducer, ''), // Step 2
		({ totalPriceValue }) => (R.isEmpty(totalPriceValue) ? null : parseFloat(totalPriceValue)), // Step 3
	)(totalPrices)

// Easy to test this
const bidPartitionPredicate = (lowestBid) => (aBid) =>
	R.allPass([
		({ lowestBid, aBid }) => R.equals(getTotalPriceValue(lowestBid), getTotalPriceValue(aBid)),
		({ lowestBid, aBid }) => !!lowestBid.rank && !!aBid.rank,
	])({ lowestBid, aBid })

const flagEqualLowestBids = (bids = []) => {
	if (R.isEmpty(bids)) return []

	const [lowestBid, ...otherBids] = bids

	const [otherBidsTiedForLowest, otherBidsNotTiedForLowest] = R.partition(
		bidPartitionPredicate(lowestBid),
		otherBids,
	)

	if (R.isEmpty(otherBidsTiedForLowest)) {
		return bids
	}

	const equalLowestBids = R.prepend(lowestBid, otherBidsTiedForLowest)
	const equalLowestBidFlagged = R.map(R.mergeRight({ tiedForLowest: true }), equalLowestBids)

	return R.concat(equalLowestBidFlagged, otherBidsNotTiedForLowest)
}

module.exports = flagEqualLowestBids
