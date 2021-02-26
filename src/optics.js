const R = require('ramda')
const cerealData = require('./cereal.json')

const getManufacturer = R.prop('manufacturer')

console.log(getManufacturer(cerealData[5]))
console.log(getManufacturer({ name: 'Dummy'}))
console.log(getManufacturer(null))

const getFirstManufacturer = R.path([0, 'manufacturer'])

console.log(getFirstManufacturer(cerealData))
console.log(getFirstManufacturer([]))
console.log(getFirstManufacturer(null))
