/* Add/subtract these from UTC timestamps */
export const Second = 1
export const Minute = 60
export const Hour = 60 * Minute
export const Day = 24 * Hour
export const Week = 7 * Day
export const Month = 30 * Day

/* Time in seconds after the Jan 1, 1970, 00.00.00 UTC */
export const getTime = () => new Date().getTime() / 1000
