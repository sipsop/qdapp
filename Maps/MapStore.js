import { observable, action, autorun, computed, asMap } from 'mobx'
import { store } from '../Store.js'

// Search:
//
// https://maps.googleapis.com/maps/api/geocode/json?&address=Cambridge,UK
//

const focusDelta = {
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
}

class LocationStore {
    @observable region = {
        latitude: 52.207990,
        longitude: 0.121703,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    }

    @observable currentMarker = null

    constructor() {
        this.mapView = null
    }

    @action focusBar = (bar) => {
        if (this.mapView) {
            region = merge(coords(bar), focusDelta)
            this.mapView.animateToRegion(region, 500)
        }
        this.currentMarker = bar
        store.switchToDiscoverPage(true)
    }

    @observable barMarkers = [
        {
            id: '0',
            signedUp: false,
            name: "Some Other Pub",
            desc: "This is some other pub.",
            barType: 'Pub',
            address: {
                lat: 52.207990,
                lon: 0.121703,
            },
            selected: false,
        },
        {
            id: '1',
            signedUp: true,
            name: "The Eagle",
            desc: "The Eagle is a traditional English pub.",
            barType: 'Pub',
            address: {
                lat: 52.204139,
                lon: 0.118045,
            },
            selected: false,
        },
        {
            id: '2',
            signedUp: true,
            name: 'Lola Lo',
            desc: 'Polynesian-themed nightclub',
            barType: 'Nightclub',
            address: {
                lat: 52.204519,
                lon: 0.120067,
            },
            selected: false,
        }
    ]

}

export const locationStore = new LocationStore()
