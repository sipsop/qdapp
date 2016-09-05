import { React, Component, PureComponent, View, T } from './Component.js'
import { observer } from 'mobx-react/native'
import { config } from './Config.js'

// import { T } from './AppText.js'

@observer
export class Header extends PureComponent {
    /* properties:
        label: String
    */
    render = () => {
        const backgroundColor = config.theme.primary.medium
        const rowHeight = 55
        return (
            <View style={
                    { justifyContent: 'center'
                    , alignItems: 'center'
                    , backgroundColor: backgroundColor
                    , height: rowHeight
                    }
                }>
                <T style={
                        { fontSize: 25
                        , color: '#fff'
                        /* , textDecorationLine: 'underline' */
                        , marginLeft: 5
                        }
                    }>
                    {this.props.label}
                </T>
            </View>
        )
    }
}
