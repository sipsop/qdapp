import requests

searchURL = "https://maps.googleapis.com/maps/api/place/radarsearch/json"
apiKey = "AIzaSyAPxkG5Fe5GaWdbOSwNJuZfDnA6DiKf8Pw"

location = {
    'latitude': 52.207990,
    'longitude': 0.121703,
}

def formatCoords(coords):
    return '%s,%s' % (coords['latitude'], coords['longitude'])

loc = formatCoords(location)
searchURL = searchURL + '?key={apiKey}&location={loc}&radius=1000&type=bar'.format(**locals())

def search():
    return requests.get(searchURL)

def get_place_ids(r):
    return [result['place_id'] for result in r.json()['results']]

detailsURL = "https://maps.googleapis.com/maps/api/place/details/json?key={apiKey}&placeid={placeid}"

def details(place_id):
    url = detailsURL.format(apiKey=apiKey, placeid=place_id)
    return requests.get(url)
