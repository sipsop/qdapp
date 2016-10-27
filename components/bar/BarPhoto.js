import React, {
  View
} from 'react'
import { observer } from 'mobx-react/native'
import LinearGradient from 'react-native-linear-gradient'

import { PureComponent } from '~/components/Component'
import { PhotoImage } from '~/components/PhotoImage'
import { BackButton } from '~/components/BackButton'
import { BarCardHeader } from './BarCardHeader'
import { BarCardFooter } from './BarCardFooter'

@observer
export class BarPhoto extends PureComponent {
    /* properties:
        photo: Photo
        bar: Bar
        imageHeight: Int
        showBackButton: Bool
        onBack: () => void
        showDistance: Bool
        showTimeInfo: Bool
        showBarName: Bool
        showMapButton: Bool
    */
  render = () => {
    let photo = this.props.photo
    const pictureIsGeneric = !photo
    if (!photo) {
      photo = {
        url: '/static/GenericBarPicture.jpg',
        htmlAttrib: []
      }
    }

    return (<PhotoImage
        key={photo.url}
        photo={photo}
        style={{flex: 0, height: this.props.imageHeight}}
                    >
            <BackButton
                onBack={this.props.onBack}
                enabled={this.props.showBackButton}
                />
            {
                /*
                this.props.showBackButton
                    ? <TouchableOpacity onPress={this.props.onBack}>
                        <View style={
                                { width: 55
                                , height: 55
                                , justifyContent: 'center'
                                , alignItems: 'center'
                                , backgroundColor: 'rgba(0,0,0,0)'
                                }
                            }>
                            <MaterialIcon name="arrow-back" size={30} color='#fff' />
                        </View>
                      </TouchableOpacity>
                    : <View style={{flex: 1}} />
                */
            }
            <BarCardHeader
                pictureIsGeneric={pictureIsGeneric}
                style={{flex: 3}} />
            <LinearGradient style={{flex: 5}} colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 1.0)']}>
                <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0)'}}>
                    <BarCardFooter
                        bar={this.props.bar}
                        showDistance={this.props.showDistance}
                        showTimeInfo={this.props.showTimeInfo}
                        showBarName={this.props.showBarName}
                        showMapButton={this.props.showMapButton}
                        />
                </View>
            </LinearGradient>
        </PhotoImage>)
  }
}
