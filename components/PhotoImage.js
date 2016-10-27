/* Photo image wth attribution */
import React from 'react'
import { PureComponent, Img } from '~/components/Component.js'

class PhotoImage extends PureComponent {
    /* properties:
        photo: Photo
        style: style object (height, width, etc)
    */

  render = () => {
    return (
        <Img
            style={this.props.style}
            url={this.props.photo && this.props.photo.url}
                    /* TODO: html_attributions */
                    >
            {this.props.children}
        </Img>)
  }
}

export default PhotoImage
