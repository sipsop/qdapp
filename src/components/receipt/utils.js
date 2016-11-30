import { React, Component } from '/components/Component'
import { HeaderText } from '../Header'

export const headerText = (text, fontSize = 25, textAlign = 'center') => {
    return (
        <HeaderText
            fontSize={fontSize}
            rowHeight={40}
            style={{flex: 1, textAlign: textAlign}}
            >
            {text}
        </HeaderText>
    )
}
