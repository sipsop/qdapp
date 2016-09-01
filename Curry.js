import _ from 'lodash'
import { autorun } from 'mobx'

/*********************** Error Handling ******************************/

/* Force a MobX value to a javascript object */
export const asData = x => JSON.parse(JSON.stringify(x))

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

export const runAndLogErrors = callback => {
    try {
        callback()
    } catch (err) {
        logError(err)
    }
}

export const logError = err => {
    // TODO: Crashlytics etc
    console.error(err)
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
    for (var i = 0; i < xs.length; i+=n) {
        const chunk = []
        for (var j = 0; j < n && i + j < xs.length; j++) {
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

    var result = []
    for (var i = 0; i < xs.length; i++) {
        result.push([xs[i], ys[i]])
    }
    return result
}

export function zipWith(f) {
    const args = tail(arguments)
    const length = args[0].length
    args.forEach((arg) => {
        if (arg.length !== length) {
            throw Error("zipWith: All arrays must have the same length")
        }
    })

    args.push(f)
    return _.zipWith.apply(undefined, args)
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
    var left = []
    var right = []
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i])) {
            right.push(xs[i])
        } else {
            left.push(xs[i])
        }
    }
    return [left, right]
}

export function contains(xs, x) {
    for (var i = 0; i < xs.length; i++) {
        if (xs[i] == x) {
            return true
        }
    }
    return false
}

export function index(xs, i) {
    throw "Not implemented" // TODO: implement Maybe type
}

export function take(n, xs) {
    return xs.slice(0, n-1)
}

export function unique(xs) {
    var result = []
    for (var i = 0; i < xs.length; i++) {
        if (!contains(result, xs[i])) { // quadratic...
            result.push(xs[i])
        }
    }
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

/* Intersperse a list of values with another value:

    >>> intersperse(5, [1, 2, 3])
    [1, 5, 2, 5, 3]

*/
export function intersperse(x, xs) {
    var result = []
    for (var i = 0; i < xs.length; i++) {
        result.push(xs[i])
        result.push(x)
    }
    if (xs.length > 0) {
        result.pop()
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
