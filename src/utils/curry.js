import _ from 'lodash'
import shortid from 'shortid'
import { autorun, observable } from 'mobx'
import { getTime } from './time.js'

export const DEV = true

/*********************** Array *****************************/

export const insert = (xs, index, item) => {
  xs.splice(index, 0, item)
}

export const remove = (xs, index) => {
    xs.splice(index, 1)
}

export const extend = (xs, ys) => {
    ys.forEach((item) => xs.push(item))
}

/*********************** Error Handling ******************************/

/* Force a MobX value to a javascript object */
export const asData = x => {
    if (x == null)
        return null
    return JSON.parse(JSON.stringify(x))
}

export const log = (...args) => {
    console.log(...args.map(asData))
}

export const logger = (fileName) => {
    return (...args) => {
        log(fileName, ...args)
    }
}

export const logErrors = callback => {
    return (...args) => {
        const obj = this
        runAndLogErrors(() => {
            return callback.bind(this)(...args)
        })
    }
}

export const propagateErrors = (shouldThrow, callback) => {
    return (...args) => {
        const obj = this
        try {
            return callback(this, ...args)
        } catch (err) {
            if (shouldThrow(err))
                throw err // Exception allowed to propagate
            logError(err) // Exception not allowed, log error
        }
    }
}

export const logErrors2 = (target, key, descriptor) => {
    const newFunc = (...args) => {
        const obj = this
        runAndLogErrors(() => {
            return callback(obj, ...args)
        })
    }
    descriptor.value = newFunc
    return descriptor
}

export const runAndLogErrors = async (callback) => {
    try {
        await callback()
    } catch (err) {
        logError(err)
    }
}

export const logError = err => {
    // TODO: Crashlytics etc
    if (err) { // this will crash on undefined
        console.error(err)
    }
}

export const safeAutorun = callback => autorun(() => {
    runAndLogErrors(() => {
        callback()
    })
})

/*********************************************************************/

export const makeList = (xs) => {
    if (Array.isArray(xs))
        return xs
    return [xs]
}

export const merge = (o1, o2) => {
    return mergeAll([o1, o2])
}

export const mergeAll = (objects) => {
    const result = {}
    objects.forEach(obj => {
        if (obj) { // ignore null and undefined
            copyObject(obj, result)
        }
    })
    return result
}

const copyObject = (src, dst) => {
    Object.entries(src).map(entry => {
        dst[entry[0]] = entry[1]
    })
}

/*
    >>> chunking([1, 2, 3, 4, 5], 2)
    [[1, 2], [3, 4], [5]]
*/
export const chunking = (xs, n) => {
    result = []
    for (let i = 0; i < xs.length; i+=n) {
        const chunk = []
        for (let j = 0; j < n && i + j < xs.length; j++) {
            chunk.push(xs[i + j])
        }
        result.push(chunk)
    }
    return result
}

export function compose(f, g) {
    return (x) => f(g(x))
}

export function fst(xy) {
    if (xy.length != 2) {
        throw Error("Expected a tuple of length 2, got " + xy)
    }
    return xy[0]
}

export function snd(xy) {
    if (xy.length != 2) {
        throw Error("Expected a tuple of length 2, got " + xy)
    }
    return xy[1]
}

export function head(xs) {
    if (xs.length == 0) {
        throw Error("Expected at least one element in head()")
    }
    return xs[0]
}

export function tail(xs) {
    if (xs.length == 0) {
        throw Error("Expected at least one element in tail()")
    }
    return _.tail(xs)
}

export function identity(x) {
    return x
}

export function zip(xs, ys) {
    if (xs.length != ys.length) {
        throw Error("Expected two lists of the same size")
    }

    let result = []
    for (let i = 0; i < xs.length; i++) {
        result.push([xs[i], ys[i]])
    }
    return result
}

export const last = xs => {
    return xs[xs.length - 1]
}

export const init = xs => {
    return xs.slice(0, xs.length - 1)
}

export const find = (xs, x, equals=_.isEqual) => {
    for (let i = 0; i < xs.length; i++) {
        if (equals(xs[i], x)) {
            return i
        }
    }
    return -1
}

export function zipWith(...args) {
    const f = last(args)
    const xss = init(args)
    const length = xss[0].length
    xss.forEach(xs => {
        if (xs.length !== length) {
            throw Error("zipWith: All arrays must have the same length")
        }
    })

    return range(length).map(i => {
        const args = xss.map(xs => xs[i])
        return f(...args)
    })
}

export function unzip(items) {
    return [map(fst, items), map(snd, items)]
}

export function max(x, y) {
    if (x > y) {
        return x
    } else {
        return y
    }
}

export function min(x, y) {
    if (x < y) {
        return x
    } else {
        return y
    }
}

export function partition(f, xs) {
    let left = []
    let right = []
    for (let i = 0; i < xs.length; i++) {
        if (f(xs[i])) {
            right.push(xs[i])
        } else {
            left.push(xs[i])
        }
    }
    return [left, right]
}

export function includes(xs, x, equals = (x, y) => x === y) {
    for (let i = 0; i < xs.length; i++) {
        if (equals(xs[i], x)) {
            return true
        }
    }
    return false
}

export const reverse = (xs) => {
    var result = xs.slice()
    result.reverse()
    return result
}

export function index(xs, i) {
    throw "Not implemented" // TODO: implement Maybe type
}

export function take(n, xs) {
    return xs.slice(0, n-1)
}

export const unique = (xs, key = (x) => x.id) => {
    let seen = {}
    return xs.filter(x => {
        const id = key(x)
        const result = !seen[id]
        seen[id] = true
        return result
    })
}

export const and = (x, y) => x && y
export const or  = (x, y) => x || y

export const all = (xs) => {
    return fold(and, true, xs)
}

export const any = (xs) => {
    return fold(or, false, xs)
}

/* map((x) => x * 2, [1,2,3]) -> [2,3,6] */
export function map(f, xs) {
    return xs.map(f)
}

export function filter(f, xs) {
    return xs.filter(f)
}

export function fold(f, z, xs) {
    return xs.reduce(f, z)
}

export const scan = (f, z, xs) => {
    const results = []
    xs.reduce((x, y) => {
        const result = f(x, y)
        results.push(result)
        return result
    })
    return results
}

/* Intersperse a list of values with another value:

    >>> intersperse(5, [1, 2, 3])
    [1, 5, 2, 5, 3]

*/
export function intersperse(x, xs) {
    let result = []
    for (let i = 0; i < xs.length; i++) {
        result.push(xs[i])
        result.push(x)
    }
    if (xs.length > 0) {
        result.pop()
    }
    return result
}

export const range = /*<T>*/(n : Int) : Array<T> => {
    const result = []
    for (let i = 0; i < n; i++) {
        result.push(i)
    }
    return result
}

export const isNull = (x) => x === null || x === undefined

export const equals = (val1, val2) => {
    return _.isEqualWith(val1, val2, (x, y) => {
        if (!isNull(x) && x.equals !== undefined) {
            return x.equals(y)
        } else if (!isNull(y) && y.equals !== undefined) {
            return y.equals(x)
        } else {
            /* Let lodash determine the equality */
            return undefined
        }
    })
}


/* Flatten a nested list. Use this instead of _.flatten as it doesn't work with MobX... */
export const flatten = /*<T>*/(xss : Array<Array<T>>) : Array<T> => {
    const result = []
    xss.forEach(xs => {
        xs.forEach(x => result.push(x))
    })
    return result
}

export const makeAssert = (modname : String) => {
    return (val, message = "Expected true, got false") => {
        assert(val, `${modname}: ${message}`)
    }
}

export const assert = (val : Bool, message : String = "Expected true, got false") => {
    if (!val)
        throw Error(message)
}

export const utils = (modname : String) => {
    return {
        assert: makeAssert(modname),
        log:    logger(modname),
    }
}

export const sortBy = _.sortBy
export const deepEqual = _.isEqual
export const intersection = _.intersection
export const union = _.union
export const clone = _.clone
export const sum = xs => fold((x, y) => x + y, 0, xs)
export const product = xs => fold((x, y) => x * y, 1, xs)


export const uuid = () => {
    let id = ""
    for (let i = 0; i < 4; i++) {
        id += shortid.generate()
    }
    return id
}

/*********************** Async Stuff ******************************/

/* Throttle how often `f` may be called */
export const throttler = (period, f) => {
    const o = {
        lastTime: 0,
        run: (...args) => {
            const time = getTime()
            if (time > o.lastTime + period) {
                f(...args)
                o.lastTime = time
            }
        }
    }
    return o
}

export class TimeoutError {
    message : string
    constructor() {
        this.message = "Downloading is taking too long, please try again later."
    }
}

export const promise = f => {
    return (...args) => {
        new Promise((resolve, reject) => {
            try {
                resolve(f(...args))
            } catch (err) {
                reject(err)
            }
        })
    }
}

const timedout = { timedout: true }

const timeoutPromise = (timeout, callback) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(callback()), timeout)
    })
}

const timeoutError = (timeout) => {
    return timeoutPromise(timeout, () => {
        return timedout
    })
}

/* Set a timeout for an asynchronous callback */
export const timeout = async (timeout, promise) : Promise<T> => {
    const tPromise = timeoutError(timeout)
    const result = await Promise.race([tPromise, promise])
    if (result == timedout) {
        log('/utils/curry.js', 'download timed out...')
        throw new TimeoutError()
    }
    return result
}

/* Set a timeout for an async callback.
If the timeout expires before resolve() is called, call reject().

Returns a wrapped version of 'resolve'.
*/
export const timeoutCallback = (timeout, resolve, reject) => {
    const obj = { called: false }
    setTimeout(() => {
        if (!obj.called)
            reject(new TimeoutError())
    }, timeout)
    return (...args) => {
        obj.called = true
        resolve(...args)
    }
}

class Throttler {
    @observable value = null
    timer = null

    constructor(timeout, getComputedValue) {
        const update = () => {
            this.value = getComputedValue()
        }
        this.timer = runPeriodically(timeout, update)
    }

    destroy = () => {
        clearTimeout(this.timer)
    }
}

/* Run a function periodically, returning a timer */
export const runPeriodically = (timeout, callback) => {
    callback()
    setTimeout(() => runPeriodically(timeout, callback), timeout)
}

/* Throttle a stream of values (e.g. @computed values) */
export const throttle = (timeout, getComputedValue) => {
    return new Throttler(timeout, getComputedValue)
}

export const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

/************************************************************************/
/* Strings */

if (!String.prototype.strip) {
    String.prototype.strip = function () {
        return this.replace(/^\s+|\s+$/g, '')
    }
}
