import { observable, transaction, computed, action } from 'mobx'
import { barStatusStore } from './barstatusstore'

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

    @computed get pickupLocation() {
        return this.pickupLocations[this.getPickupLocationName()]
    }

    getPickupLocationName = () : ?String => {
        const pickupLocations = barStatusStore.pickupLocations
        if (this.selectedLocationName == null && pickupLocations.length) {
            return pickupLocations[0].name
        }
        return this.selectedLocationName
    }

    @action setPickupLocationName = (locationName : String) => {
        this.selectedLocationName = locationName
    }
}

export const barSettingsStore = new BarSettingsStore()
