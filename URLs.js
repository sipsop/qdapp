/* buildURL({foo: 1, bar: 'hi'}) -> 'foo=1&bar=hi' */
export const buildURL = (baseURL, obj) => {
    const str = []
    for(var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]))
        }
    }
    const params = str.join("&")
    return `${baseURL}?${params}`
}
