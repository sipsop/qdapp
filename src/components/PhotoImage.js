/* Photo image wth attribution */
import { React, PureComponent, Img } from '~/src/components/Component.js'
import { observer } from 'mobx-react/native'

@observer
export class PhotoImage extends PureComponent {
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
