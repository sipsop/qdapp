import { Second, Minute, Hour, Day, Month } from './Time.js'

const pink400 = '#EC407A'
const pink500 = '#E91E63'
const pink700 = '#C2185B'

const purple400 = '#AB47BC'
const purple500 = '#9C27B0'
const purple700 = '#7B1FA2'

const purple500Trans = (t) => `rgba(156, 39, 176, ${t})`
const purple700Trans = (t) => `rgba(123, 31, 162, ${t})`

const lightGreen = t => `rgba(82, 246, 11, ${t})`
const brown = t => `rgba(145, 106, 17, ${t})`
const yellow = t => `rgba(230, 221, 10, ${t})`
const red = t => `rgba(217, 0, 0, ${t})`
const darkBlue = t => `rgba(15, 39, 110, ${t})`
const grey = t => `rgba(0, 0, 0, ${t})`

// const menuItemBackgroundColor = yellow(0.10)
// const menuItemBackgroundColor = lightGreen(0.10)
// const menuItemBackgroundColor = purple700Trans(0.05)
// const menuItemBackgroundColor = red(0.10)
// const menuItemBackgroundColor = darkBlue(0.05)
const menuItemBackgroundColor = grey(0.03)

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
        primary:        pinkPalette,
        secondary:      purplePalette,
        addColor:       'rgb(51, 162, 37)',
        removeColor:    '#900',
        // menuItemBackgroundColor: grey(0.03),
        // menuItemBackgroundColorSecondary: grey(0.06),
        menuItemBackgroundColor: purple700Trans(0.03),
        menuItemBackgroundColorSecondary: purple700Trans(0.06),
    },
    nearbyCacheInfo: {
        noCache:      false,
        refreshAfter: 20 * Minute,
        expiresAfter: 5 * Day,
    },
    defaultCacheInfo: {
        noCache:     false,
        refreshAfter: Day,
        expiresAfter: Month,
    },
    /* TODO: DISABLE THESE FOR PRODUCTION */
    // refreshAfterDelta: Minute * 1,
    // expiresAfterDelta: Minute * 5,
}
