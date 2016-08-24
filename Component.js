import React, { Component } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

export class PureComponent extends Component {
    constructor(props) {
        super(props)
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
    }
}
