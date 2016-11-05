/* Add/subtract these from UTC timestamps */
export const Second = 1
export const Minute = 60
export const Hour = 60 * Minute
export const Day = 24 * Hour
export const Week = 7 * Day
export const Month = 30 * Day

/* Time in seconds after the Jan 1, 1970, 00.00.00 UTC */
export const getTime = () => new Date().getTime() / 1000

export const formatDuration = (time : Float) => {
    if (time < 60)
        return "Any time now..."
    const seconds = time % 60
    const minutes = Math.floor(time / 60)
    const hours   = Math.floor(time / 3600)
    if (hours)
        return `${renderTime('hour', hours)} and ${renderTime('minute', minutes)}`
    if (minutes)
        return renderTime('minute', minutes)
    return renderTime('second', seconds)
}

const renderNumber = (n : Int) => {
    if (n < 10)
        return '0' + n
    return '' + n
}

const renderTime = (unit, value) => {
    if (value > 1)
        unit += 's'
    return `${value} ${unit}`
}
