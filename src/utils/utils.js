/* buildURL({foo: 1, bar: 'hi'}) -> 'foo=1&bar=hi' */
export const buildURL = (baseURL, obj) => {
    const str = []
    for(let p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]))
        }
    }
    const params = str.join("&")
    return `${baseURL}?${params}`
}

export const parseJSON = (text) => {
    // Avoid JSON.parse() bug, see https://github.com/facebook/react-native/issues/4961
    return JSON.parse(text.replace( /\\u2028|\\u2029/g, ''))
}
