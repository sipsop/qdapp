import { Platform } from 'react-native'
import PickerAndroid from 'react-native-picker-android';
export const Picker = Platform.OS === 'ios' ? PickerIOS : PickerAndroid
