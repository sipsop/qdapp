import { React, Component, PureComponent, View, T, StyleSheet } from '/components/Component'
import { observer } from 'mobx-react/native'
import { config } from '/utils/config'

const styles = StyleSheet.create({
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 5,
        paddingRight: 5,
    },
})

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

        const style = {
            backgroundColor: backgroundColor,
            height: this.props.rowHeight,
        }
        return (
            <View style={[styles.header, style, this.props.style]}>
                {this.props.children}
            </View>
        )
    }
}

@observer
export class TextHeader extends PureComponent {
    /* properties:
        label:     String
        rowHeight: ?Int
        primary:   ?Bool
        fontColor: ?String
    */

    static defaultProps = {
        fontSize:  25,
        rowHeight: 55,
        primary:   true,
    }

    render = () => {
        return (
            <Header {...this.props}>
                <HeaderText
                    fontSize={this.props.fontSize}
                    fontColor={this.props.fontColor}
                    >
                    {this.props.label}
                </HeaderText>
            </Header>
        )
    }
}

export class HeaderText extends PureComponent {
    static defaultProps = {
        fontSize: 25,
        fontColor: '#fff',
    }

    render = () => {
        const style = {
            fontSize: this.props.fontSize,
            color: this.props.fontColor,
        }
        return <T style={[style, this.props.style]}>
            {this.props.children}
        </T>
    }
}
