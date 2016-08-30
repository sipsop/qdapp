// @flow

export type Float = number
export type Int = number

export type Photo = {
    htmlAttrib: Array<string>,
    photoID:    string,
}

export type SearchResult = {
    placeID:    string,
    lat:        Float,
    lon:        Float,
    photos:     Array<Photo>,
    priceLevel: Int,            // 1 through 4 (4 being "very exprensive" and 1 being "free")
    rating:     Float,          // e.g. 3.4
    types:      Array<string>,  // e.g. ['cafe', 'food', 'restaurant']

}

export type SearchResults = {
    htmlAttrib: Array<string>,
    nextToken:  string,
    results:    SearchResult,
}
