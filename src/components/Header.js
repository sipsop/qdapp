import { React, Component, PureComponent, View, T, StyleSheet } from '/components/Component'
import { computed } from 'mobx'
import { observer } from 'mobx-react/native'
import { BackButton } from './BackButton'
import { config } from '/utils/config'

@observer
export class Header extends PureComponent {
    /* properties:
        children: [Component]
        primary: bool
        style
        onBack: ?() => void
    */

    static defaultProps = {
        primary: true,
        rowHeight: 55,
        style: {},
    }

    @computed get styles() {
        const backgroundColor =
            this.props.primary
                ? config.theme.primary.medium
                : config.theme.primary.dark

        return StyleSheet.create({
            header: {
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingLeft: 5,
                paddingRight: 5,
                backgroundColor: backgroundColor,
                height: this.props.rowHeight,
            },
            backButton: {
                position: 'absolute',
                // top:      Math.floor((this.props.rowHeight - 30) / 2),
                left:     5,
            },
        })
    }

    render = () => {
        return (
            <View style={[this.styles.header, this.props.style]}>
                {
                    this.props.onBack &&
                        <View style={this.styles.backButton}>
                            <BackButton onBack={this.props.onBack} />
                        </View>
                }
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
        onBack:    ?() => void
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
