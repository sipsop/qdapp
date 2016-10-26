import { Platform, BackAndroid } from 'react-native'

import { tabStore, historyStore } from '/model/store.js'
// import { historyStore } from './History.js'

export const handleBackButton = () => {
    if (Platform.OS === 'android') {
        BackAndroid.addEventListener('hardwareBackPress', function() {
            // tabStore.gotoPreviousTab()
            historyStore.goBack()
            return true
        })
    }
}
