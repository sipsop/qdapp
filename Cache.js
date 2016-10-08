import { AsyncStorage } from 'react-native'

import { NetworkError } from './HTTP.js'
import { Hour, Day, Month, getTime } from './Time.js'
import { config } from './Config.js'
import * as _ from './Curry.js'

import type { Float } from './Types.js'

const { log, assert } = _.utils('./Cache.js')

export type CacheInfo = {
    noCache:      Bool,
    refreshAfter: Float,
    expiresAfter: Float,
}


const keyPrefix = 'qd:'
const key = (args) => {
    return keyPrefix + args.join(':')
}

const cacheKey = (args) => {
    return keyPrefix + 'cache:' + args.join(':')
}

class KeyError {
    constructor(key) {
        this.key = key
        this.message = `Not found: ${key}`
    }
}

class InvalidCacheEntry {
    constructor(blob) {
        this.message = `Invalid cache entry: ${blob}`
    }
}


export class Storage {
    constructor(backend, maxEntries) {
        this.backend = backend
        this.maxEntries = maxEntries
    }

    initialize = async () => {
        await this.prune()
    }

    prune = async () => {
        const allKeys = await this.getKeys()
        const pruneResult = await this.pruneExpired(allKeys)

        if (allKeys.length - pruneResult.deleted.length > this.maxEntries) {
            /* TODO: sort by lastAccessTime and remove some entries */
        }
    }

    /*
        Remove expired keys.
        Returns the lastAccessTime for each entry for which a key was provided.
    */
    pruneExpired = async (allKeys) => {
        const entriesToDelete = []
        const accessTimes = []
        const now = getTime()
        const chunks = _.chunking(allKeys, 100)
        for (var i = 0; i < chunks.length; i++) {
            const keys = chunks[i]
            const cacheEntries = await this.getMulti(keys)
            cacheEntries.forEach((cacheEntry, i) => {
                if (cacheEntry.expiresAfter < now)
                    entriesToDelete.push(keys[i])
                accessTimes.push(cacheEntry.lastAccessed)
            })
        }
        await this.backend.deleteMulti(entriesToDelete)
        return { lastAccessTimes: lastAccessTimes, deleted: entriesToDelete }
    }

    getKeys = async () => {
        var keys = await this.backend.getAllKeys()
        return keys.filter(key => key.startsWith('qd:'))
    }

    clear = async () => {
        try {
            const keys = await this.getKeys()
            if (keys.length)
                await this.backend.multiRemove(keys)
        } catch (e) {
            console.error(e)
        }
    }

    clearAll = async () => {
        await this.backend.clear()
    }

    get = async (key) => {
        const blob = await this.backend.getItem(key)
        if (!blob) {
            throw new KeyError(key)
        }
        return CacheEntry.fromBlob(key, blob)
    }

    set = async (key, cacheEntry) => {
        await this.backend.setItem(key, cacheEntry.toBlob())
    }
}

class Cache {
    constructor(storage) {
        this.storage = storage
    }

    get = async (key, refreshCallback, expiredCallback, cacheInfo : CacheInfo) => {
        var cacheEntry
        try {
            cacheEntry = await this.storage.get(key)
            return await this.refreshIfNeeded(key, cacheEntry, refreshCallback, expiredCallback, cacheInfo)
        } catch (e) {
            if (!(e instanceof KeyError || e instanceof InvalidCacheEntry))
                throw e
            cacheEntry = await this.refreshKey(key, refreshCallback, cacheInfo)
            return cacheEntry.value
        }
    }

    refreshIfNeeded = async (key, cacheEntry, refreshCallback, expiredCallback, cacheInfo : CacheInfo) => {
        const now = getTime()
        if (cacheEntry.refreshAfter > now) {
            // Value does not need to be refreshed
            log("Reusing value from cache...", key, cacheEntry.refreshAfter)
            return cacheEntry.value
        } else {
            log("Refreshing cache entry...", key)
            try {
                cacheEntry = await this.refreshKey(key, refreshCallback, cacheInfo)
                return cacheEntry.value
            } catch (e) {
                if (!(e instanceof NetworkError))
                    throw e
                if (cacheEntry.expiresAfter < now) {
                    // Entry has expired, re-throw network error
                    if (expiredCallback) {
                        cacheEntry = await this.refreshKey(key, expiredCallback, cacheInfo)
                        return cacheEntry.value
                    }
                    throw e
                }
                // Entry should be refresh, but cannot currently be refreshed
                // due ot network errors. Return old value
                return cacheEntry.value
            }
        }
    }

    refreshKey = async (key, refreshCallback, cacheInfo : CacheInfo) : CacheEntry => {
        const value = await refreshCallback()
        return await this.set(key, value, cacheInfo)
    }

    invalidateKey = async (key) => {
        await this.backend.delete(key)
        /* TODO: Remove any keys that are children in the key hierarchy */
    }

    set = async (key, value, cacheInfo : CacheInfo) : CacheEntry => {
        const cacheEntry = CacheEntry.freshEntry(key, value, cacheInfo)
        await this.storage.set(key, cacheEntry)
        // log("Cached entry with key", key)
        return cacheEntry
    }

    clear = async () => {
        await this.storage.clear()
    }

    clearAll = async () => {
        await this.storage.clearAll()
    }
}

class CacheEntry {
    constructor(key, value, refreshAfter, expiresAfter) {
        this.key = key
        this.value = value
        this.refreshAfter = refreshAfter
        this.expiresAfter = expiresAfter
        if (refreshAfter == null || expiresAfter == null)
            throw Error(`Cannot construct cache entry without refreshAfter or expiresAfter ${key} ${value}`)
    }

    toBlob = () => {
        return JSON.stringify({
            value: this.value,
            refreshAfter: this.refreshAfter,
            expiresAfter: this.expiresAfter,
        })
    }

    static fromBlob = (key, blob) => {
        const result = JSON.parse(blob)
        if (!result.refreshAfter || !result.expiresAfter)
            throw new InvalidCacheEntry(blob)
        return new CacheEntry(
            key,
            result.value,
            result.refreshAfter,
            result.expiresAfter,
        )
    }

    static freshEntry = (key, value, cacheInfo : CacheInfo = config.defaultCacheInfo) => {
        const now = getTime()
        const refreshAfter = now + cacheInfo.refreshAfter
        const expiresAfter = now + cacheInfo.expiresAfter
        return new CacheEntry(key, value, refreshAfter, expiresAfter)
    }
}

const KB = (x) => x * 1024
const MB = (x) => KB(x) * 1024

const storage = new Storage(AsyncStorage /* backend */, 100 /* maxEntries */)
export const cache = new Cache(storage)
// cache.clearAll()
