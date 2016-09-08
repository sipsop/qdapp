import { React, Component, PureComponent, View, T } from './Component.js'
import { observer } from 'mobx-react/native'
import { config } from './Config.js'

// import { T } from './AppText.js'


@observer
export class Header extends PureComponent {
    /* properties:
        children: [Component]
        primary: bool
        style
    */

    static defaultProps = {
        primary: true,
        rowHeight: 55,
        style: {},
    }

    render = () => {
        const backgroundColor =
            this.props.primary
                ? config.theme.primary.medium
                : config.theme.primary.dark
        return (
            <View style={
                    { justifyContent: 'center'
                    , alignItems: 'center'
                    , backgroundColor: backgroundColor
                    , height: this.props.rowHeight
                    , paddingLeft: 5
                    , paddingRight: 5
                    , ...this.props.style
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
        rowHeight: Int
    */

    static defaultProps = {
        fontSize: 25,
        rowHeight: 55,
    }
    render = () => {
        const backgroundColor = config.theme.primary.medium
        return (
            <Header rowHeight={this.props.rowHeight}>
                <HeaderText fontSize={this.props.fontSize}>
                    {this.props.label}
                </HeaderText>
            </Header>
        )
    }
}

export class HeaderText extends PureComponent {
    static defaultProps = {
        fontSize: 25,
    }

    render = () => {
        return <T style={
                { fontSize: this.props.fontSize
                , color: '#fff'
                , ...this.props.style
                }
            }>
            {this.props.children}
        </T>
    }
}
