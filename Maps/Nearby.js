import { locationStore } from './MapStore.js'
import { fetchJSON } from '../HTTP.js'

const BaseURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

/* buildURL({foo: 1, bar: 'hi'}) -> 'foo=1&bar=hi' */
const buildURL = (baseURL, obj) => {
    const str = []
    for(var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]))
        }
    }
    const params = str.join("&")
    return `${baseURL}?${params}`
}

const Key = 'AIzaSyAPxkG5Fe5GaWdbOSwNJuZfDnA6DiKf8Pw'

const lat = locationStore.region.latitude
const lon = locationStore.region.longitude

export const searchNearby = (lat, lon) => {
    const url = buildURL(BaseURL, {
        key: Key,
        // rankby: 'distance',
        radius: 5000,
        location: `${lat},${lon}`,
        type: 'bar',
    })
    return fetchJSON(url)
        .then(jsonDownloadResult => {
            try {
                return jsonDownloadResult.update(parseResponse)
            } catch (error) {
                console.log(error)
                return undefined
            }
        })
        .catch(error => emptyResult().downloadError("" + error)) // download failed
}

const parseResponse = (doc) => {
    return {
        'html_attribution': doc.html_attribution,
        'results': doc.results.map(
            result => {
                return {
                    placeID: result.place_id,
                    lat: result.geometry.location.lat,
                    lon: result.geometry.location.lon,
                }
            }
        ),
    }
}
