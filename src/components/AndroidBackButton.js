import { Platform, BackAndroid } from 'react-native'

import { tabStore, historyStore } from '~/src/model/store'
// import { historyStore } from './History'

export const handleBackButton = () => {
    if (Platform.OS === 'android') {
        BackAndroid.addEventListener('hardwareBackPress', function() {
            // tabStore.gotoPreviousTab()
            historyStore.goBack()
            return true
        })
    }
}
