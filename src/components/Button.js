import { React, Component, View, TouchableOpacity, PureComponent, T } from '/components/Component.js'
import { config } from '/utils/config.js'
import { merge } from '/utils/curry.js'

export class PrimaryButton extends PureComponent {
    render = () => {
        const props = {
            ...this.props,
            textColor: config.theme.primary.medium,
            prominent: false,
            borderWidth: 0,
            style: {
                minWidth: 70,
                minHeight: 55,
            }
        }
        return <LargeButton {...props} />
    }
}

export class SecondaryButton extends PureComponent {
    render = () => {
        const props = {
            ...this.props,
            textColor: config.theme.primary.dark,
            prominent: false,
            borderWidth: 0,
            minWidth: 70,
            minHeight: 55,
        }
        return <LargeButton {...props} />
    }
}

export class LargeButton extends PureComponent {
    /* properties:
        label: str
        onPress: () => void
        primary: bool
        style: style object
        borderRadius: int
        prominent: bool
            if true, set a pink background color. Otherwise, set a white one.
        backgroundColor: str
        borderColor: str
        textColor: str
        disabled: bool
        borderWidth: Float
    */
    static defaultProps = {
        primary: true,
        prominent: true,
        borderRadius: 10,
        disabled: false,
        fontSize: 25,
        borderWidth: 1.5,
    }

    render = () => {
        return <TextButton
                    fontSize={this.props.fontSize}
                    borderWidth={this.props.borderWidth}
                    {...this.props} />
    }
}

export class TextButton extends Component {
    /* properties:
        primary: bool
        onPress() -> void
        fontSize: int
        borderWidth: int
        borderRadius: int
        label: str
        style: style object
        prominent: bool
        alignLeft: bool
        borderColor: str
        textColor: str
        disabled: bool
    */

    static defaultProps = {
        primary: true,
        borderWidth: 2,
        prominent: true,
        borderRadius: 5,
        alignLeft: false,
        disabled: false,
    }

    render = () => {
        const textColor = this.props.textColor || (this.props.prominent ? '#fff' : '#000')
        let text = <T   ellipsizeMode='tail'
                        numberOfLines={1}
                        style={{fontSize: this.props.fontSize, color: textColor, textAlign: 'left'}}
                        >
                        {this.props.label}
                    </T>
        if (this.props.alignLeft)
            text = <View style={{flex: 1}}>{text}</View>

        return (
            <Button {...this.props}>
                {text}
            </Button>
        )
    }
}


export class Button extends Component {
    /* properties:
        primary: bool
        onPress() -> void
        borderWidth: int
        borderRadius: int
        style: style object
        prominent: bool
        children: [Component]
        backgroundColor: str
        borderColor: str
        disabled: bool
        disabledColor: str
    */

    static defaultProps = {
        primary: true,
        borderWidth: 2,
        borderRadius: 5,
        prominent: true,
        disabled: false,
    }

    render = () => {
        const buttonStyle = {}

        if (this.props.prominent) {
            if (this.props.primary) {
                buttonStyle.background = config.theme.primary.medium
                buttonStyle.border = config.theme.primary.dark
            } else {
                buttonStyle.background = config.theme.primary.dark
                buttonStyle.border = config.theme.primary.medium
            }
            if (this.props.disabled) {
                /* Make disabled buttons transparent */
                buttonStyle.background += '5f'
                buttonStyle.border += '5f'
            }
        }

        if (this.props.backgroundColor)
            buttonStyle.background = this.props.backgroundColor
        if (this.props.borderColor)
            buttonStyle.border = this.props.borderColor

        if (this.props.disabledColor && this.props.disabled) {
            buttonStyle.background = this.props.disabledColor
        }

        const button = <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={
                    { flex: 1
                    // , flexWrap: 'wrap'
                    , flexDirection: 'row'
                    , justifyContent: 'center'
                    , alignItems: 'center'
                    , borderWidth: this.props.borderWidth
                    , backgroundColor: buttonStyle.background
                    , borderColor: buttonStyle.border
                    , borderRadius: this.props.borderRadius
                    , padding: 5
                    }
                }>
                {this.props.children}
            </View>
        </View>

        if (this.props.disabled) {
            return <View style={this.props.style}>
                {button}
            </View>
        }

        return <TouchableOpacity onPress={this.props.onPress} style={this.props.style}>
            {button}
        </TouchableOpacity>
    }
}
