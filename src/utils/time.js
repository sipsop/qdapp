/* Add/subtract these from UTC timestamps */
export const Second = 1
export const Minute = 60
export const Hour = 60 * Minute
export const Day = 24 * Hour
export const Week = 7 * Day
export const Month = 30 * Day

/* Time in seconds after the Jan 1, 1970, 00.00.00 UTC */
export const getTime = () => new Date().getTime() / 1000

export const formatDateTime = (time : Float) => {
    return `${formatDate(time)} ${formatTime(time)}`
}

export const formatDate = (time : Float) => {
    const d = new Date(time * 1000)
    const year  = d.getFullYear()
    const month = d.getMonth() + 1 // Yes, really... we're counting months from 0
    const day   = d.getDate() // d.getDay() <- this returns [0-6] for Mon-Sat...
    return `${formatNumber(day)}/${formatNumber(month)}/${year}`
}

export const formatTime = (time : Float) => {
    const d = new Date(time * 1000)
    const hour = d.getHours()
    const minutes = d.getMinutes()
    return `${formatNumber(hour)}:${formatNumber(minutes)}`
}

export const formatDuration = (time : Float) => {
    if (time < 60)
        return "Any time now..."
    const seconds = time % 60
    const minutes = Math.floor(time / 60)
    const hours   = Math.floor(time / 3600)
    if (hours)
        return `${timeUnit('hour', hours)} and ${timeUnit('minute', minutes)}`
    if (minutes)
        return timeUnit('minute', minutes)
    return timeUnit('second', seconds)
}

const formatNumber = (n : Int) => {
    if (n < 10)
        return '0' + n
    return '' + n
}

const timeUnit = (unit, value) => {
    if (value > 1)
        unit += 's'
    return `${value} ${unit}`
}
