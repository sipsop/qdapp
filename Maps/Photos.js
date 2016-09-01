// @flow

import { React, Component, PureComponent, Image, View, TouchableOpacity } from '../Component.js'
import { buildURL } from '../URLs.js'
import { APIKey } from './MapStore.js'

import type { Key } from "./MapStore.js";
import type { Photo } from "../Bar/Bar.js"

export const parsePhoto = (photoRef : any) : Photo => {
    return {
        htmlAttrib: photoRef.html_attributions,
        url:        getPhotoURL(photoRef.photo_reference),
    }
}

export const getPhotoURL = (photoID : String) => {
    return buildURL("https://maps.googleapis.com/maps/api/place/photo", {
        key: APIKey,
        photoreference: photoID,
        maxheight: 500,
        maxwidth: 500,
    })
}

/* Shows a photo image with proper attribution */
export class PhotoImage extends PureComponent {
    /* properties:
        photo: Types.Photo
        style: style object (height, width, etc)
    */

    render = () => {
        return <Image
                    style={this.props.style}
                    source={{uri: this.props.photo.url}}
                    /* TODO: html_attributions */
                    />
    }
}
