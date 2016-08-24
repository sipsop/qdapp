import { Second, Minute, Hour, Day, Month } from './Time.js'

const pink400 = '#EC407A'
const pink500 = '#E91E63'
const pink700 = '#C2185B'

const purple400 = '#AB47BC'
const purple500 = '#9C27B0'
const purple700 = '#7B1FA2'

const pinkPalette = {
    light:  pink400,
    medium: pink500,
    dark:   pink700,
}

const purplePalette = {
    light:  purple400,
    medium: purple500,
    dark:   purple700,
}

export const makeConfig = (primaryPalette, secondaryPalette) => {
    return {
        theme: {
            primary:    primaryPalette,
            secondary:  secondaryPalette,
        }
    }
}

export const config = {
    theme: {
        primary:    pinkPalette,
        secondary:  purplePalette,
    },
    refreshAfterDelta: Day,
    expiresAfterDelta: Month,
    /* TODO: DISABLE THESE FOR PRODUCTION */
    // refreshAfterDelta: Second * 30,
    // expiresAfterDelta: Minute * 2,
}
