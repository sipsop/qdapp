import { observable, transaction, computed, action } from 'mobx'
import { barStatusStore } from '../barstatusstore'

/* Store for controlling bar settings pickup location.

The real meat is in barStatusStore.
*/
class BarSettingsStore {
    @observable selectedLocationName : String = null

    @computed get pickupLocations() : Map<String, PickupLocation> {
        const result = {}
        barStatusStore.pickupLocations.forEach(pickupLocation => {
            result[pickupLocation.name] = pickupLocation
        })
        return result
    }

    @computed get pickupLocation() : ?PickupLocation {
        const pickupLocations = barStatusStore.pickupLocations
        if (this.selectedLocationName == null && pickupLocations.length) {
            return pickupLocations[0]
        } else if (this.selectedLocationName) {
            return this.pickupLocations[this.selectedLocationName]
        }
        return this.pickupLocations[this.getPickupLocationName()]
    }

    @computed get pickupLocationName() : ?String {
        return this.pickupLocation && this.pickupLocation.name
    }

    @computed get pickupLocationOpen() : ?Bool {
        return this.pickupLocation && this.pickupLocation.open
    }

    @action setPickupLocationName = (locationName : String) => {
        this.selectedLocationName = locationName
    }
}

export const barSettingsStore = new BarSettingsStore()
