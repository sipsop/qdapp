import { React, Component, PureComponent, View, T } from './Component.js'
import { observer } from 'mobx-react/native'
import { config } from './Config.js'

// import { T } from './AppText.js'


@observer
export class Header extends PureComponent {
    /* properties:
        children: [Component]
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
                    , paddingLeft: 5
                    , paddingRight: 5
                    }
                }>
                {this.props.children}
            </View>
        )
    }
}

@observer
export class TextHeader extends PureComponent {
    /* properties:
        label: String
    */
    render = () => {
        const backgroundColor = config.theme.primary.medium
        const rowHeight = 55
        return (
            <Header>
                <HeaderText>{this.props.label}</HeaderText>
            </Header>
        )
    }
}

export class HeaderText extends PureComponent {
    render = () => {
        return <T style={
                { fontSize: 25
                , color: '#fff'
                , ...this.props.style
                }
            }>
            {this.props.children}
        </T>
    }
}
