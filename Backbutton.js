import { Platform, BackAndroid } from 'react-native'

import { store } from './Store.js'

export const handleBackButton = () => {
    if (Platform.OS === 'android') {
        BackAndroid.addEventListener('hardwareBackPress', function() {
            store.gotoPreviousTab()
            return true
        })
    }
}
