import { Platform, BackAndroid } from 'react-native'

import { tabStore } from './Store.js'

export const handleBackButton = () => {
    if (Platform.OS === 'android') {
        BackAndroid.addEventListener('hardwareBackPress', function() {
            tabStore.gotoPreviousTab()
            return true
        })
    }
}
