// @flow

import React, { Component } from 'react';
import {
  Image,
  View,
  TouchableOpacity,
} from 'react-native';
import { buildURL } from '../URLs.js'

import type { Key, Photo } from "./MapTypes.js";

export const getPhotoURL = (apiKey : Key, photo : Photo) => {
    return buildURL("https://maps.googleapis.com/maps/api/place/photo", {
        key: apiKey,
        photoreference: photo.photoID,
        maxheight: 500,
        maxwidth: 500,
    })
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
