import React, {
  TouchableOpacity,
  View,
  Image
} from 'react'
import { observer } from 'mobx-react/native'
import LinearGradient from 'react-native-linear-gradient'
import { PureComponent, T } from '~/components/Component'

@observer class Card extends PureComponent {
    /* properties:
        name: str
            e.g. "Beer", "Wine"
        tag: str
            e.g. "#beer", "#wine" etc
        submenu: SubMenu
        style: style object
    */
  render = () => {
    const submenu = this.props.submenu
    const radius = 20
    const style = {borderRadius: radius, ...this.props.style}

        // log("LOADING IMAGE", submenu.image)

    return (<TouchableOpacity onPress={this.handleCardPress}>
            <Image source={{uri: submenu.image}} style={style}>
                {/* Push footer to bottom */}
                <View style={{flex: 1, borderRadius: radius}} />
                <LinearGradient
                    style={{flex: 1, borderRadius: radius}}
                    colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 1.0)']}
                        >
                    <View style={{ flex: 1,
                             justifyContent: 'flex-end',
                             alignItems: 'center',
                             borderRadius: radius,
                             backgroundColor: 'rgba(0,0,0,0)'
                            }}>
                        <T style={{ fontSize: 20,
                                 color: 'rgba(255, 255, 255, 95)',
                                 marginBottom: 5
                                }}>
                            {this.props.name}
                        </T>
                    </View>
                </LinearGradient>
            </Image>
        </TouchableOpacity>)
  }

  handleCardPress = () => {
    analytics.trackMenuCardClick(this.props.tag)
    tabStore.setCurrentTab(2)
    tagStore.pushTag(this.props.tag)
  }

}

export default Card
