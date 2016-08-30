// @flow

import { React, Component, PureComponent, Image, View, TouchableOpacity } from '../Component.js'
import { buildURL } from '../URLs.js'

import type { Key } from "./MapStore.js";

/*********************************************************************/

export type Photo = {
    htmlAttrib: Array<string>,
    photoID:    string,
}

/*********************************************************************/

export const getPhotoURL = (apiKey : Key, photo : Photo) => {
    return buildURL("https://maps.googleapis.com/maps/api/place/photo", {
        key: apiKey,
        photoreference: photo.photoID,
        maxheight: 500,
        maxwidth: 500,
    })
}

export const parsePhoto = (photoRef) : Photo => {
    return {
        htmlAttrib: photoRef.html_attributions,
        photoID:    photoRef.photo_reference,
    }
}

/* Shows a photo image with proper attribution */
export class PhotoImage extends PureComponent {
    /* properties:
        photo: Types.Photo
        photoURL: URL to photo
        style: style object (height, width, etc)
    */

    render = () => {
        return <Image
                    style={this.props.style}
                    source={{uri: this.props.photoURL}}
                    /* TODO: html_attributions */
                    />
    }
}
