//src
import join from 'lodash/join'
import size from 'lodash/size'
import map from 'lodash/fp/map'
import fetch from 'node-fetch'

const distanceBaseUrl =
    'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial'
const directionBaseUrl =
    'https://maps.googleapis.com/maps/api/directions/json?units=imperial'

export function getDistanceMatrix(origins, destinations) {
    const originQuery = generateRequestParamsFromFilters(origins)
    const destinationQuery = generateRequestParamsFromFilters(destinations)
    const distanceMatrixUrl = `${distanceBaseUrl}&origins=${originQuery}&destinations=${destinationQuery}&key=${
        process.env.ETA_API_KEY
    }`

    return fetch(distanceMatrixUrl).then(res => res.json())
}
export function getDirection(origin, destination, waypoints) {
    const originQuery = generateRequestParamsFromFilters([origin])
    const destinationQuery = generateRequestParamsFromFilters([destination])
    const waypointsQuery = generateRequestParamsFromFilters(waypoints)
    const directionUrl = `${directionBaseUrl}&origin=${originQuery}&destination=${destinationQuery}&waypoints=${waypointsQuery}&key=${
        process.env.ETA_API_KEY
    }`

    return fetch(directionUrl).then(res => res.json())
}
function generateRequestParamsFromFilters(locations) {
    if (locations.length === 1) {
        const { lat, lng } = locations[0]
        return encodeURIComponent(`${lat}, ${lng}`)
    }
    const locationArray = map(loc => `${loc.lat}, ${loc.lng}`)(locations)

    return `${encodeURIComponent(join(locationArray, '|'))}`
}

// function find(originIndex, destinationindex, data) {
//     return [(originIndex - 1) * size(data)] + destinationIndex
// }
