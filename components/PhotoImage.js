/* Photo image wth attribution */
import { React, Component, PureComponent, Img, View, TouchableOpacity } from '~/components/Component.js'
import { buildURL } from '../URLs.js'
import { APIKey } from '~/model/mapstore.js'

import type { Photo } from "../bar/Bar.js"

export class PhotoImage extends PureComponent {
    /* properties:
        photo: Photo
        style: style object (height, width, etc)
    */

    render = () => {
        return <Img
                    style={this.props.style}
                    url={this.props.photo && this.props.photo.url}
                    /* TODO: html_attributions */
                    >
            {this.props.children}
        </Img>
    }
}
