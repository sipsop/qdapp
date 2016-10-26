import Map from 'es6-map'
import { equals } from '~/utils/curry.js'

export { Map }

/* Create a new map from an object or array */
export const mapCreate = (obj) => {
    if (obj instanceof Map) {
        return obj
    } else if (Array.isArray(obj)) {
        return new Map(obj)
    } else {
        let result = new Map()
        Object.keys(obj).forEach((key) => {
            result.set(key, obj[key])
        })
        return result
    }
}

/* Compare two maps for equality */
export const mapEquals = (map1, map2) => {
    if (map1.size !== map2.size) {
        return false
    }
    for (let key of map1.keys()) {
        if (!equals(map1.get(key), map2.get(key))) {
            return false
        }
    }
    return true
}
