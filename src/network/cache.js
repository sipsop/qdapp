import { AsyncStorage } from 'react-native'

import { NetworkError } from './http.js'
import { getTime } from '../utils/time.js'
import { config } from '../utils/config.js'
import * as _ from '../utils/curry.js'

import type { Float } from '../utils/types.js'

const { log, assert } = _.utils('./network/cache.js')

export type CacheInfo = {
    noCache:      Bool,
    getFromCache: Bool,
    refreshAfter: Float,
    expiresAfter: Float,
}

export const getCacheInfo = (cacheInfo, force = false) => {
    if (force)
        return { getFromCache: false, ...cacheInfo }
    return cacheInfo
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

    getKeys = async () => {
        let keys = await this.backend.getAllKeys()
        return keys.filter(key => key.startsWith('qd:'))
    }

    removeKeys = async (keys) => {
        await this.backend.multiRemove(keys)
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
    lastSavedState = null

    constructor(storage, maxEntries) {
        this.storage = storage
        this.state = null
        this.maxEntries = maxEntries
    }

    /*********************************************************************/
    /* Cache State                                                       */
    /*********************************************************************/

    initialize = async () => {
        await this.loadCacheState()
        await this.periodicallySaveCacheState()
    }

    loadCacheState = async () => {
        this.state = {
            lastAccessed: {},
            count: 0,
        }
        try {
            const cacheEntry = await this.storage.get('__cache_state:v1')
            this.state = cacheEntry.value
        } catch (e) {

        }
    }

    periodicallySaveCacheState = async () => {
        if (!_.deepEqual(this.state, this.lastSavedState)) {
            const stamp = getTime() + 1000000000
            await this.storage.set('__cache_state:v1',
                new CacheEntry(
                    '__cache_state:v1',
                    this.state,
                    stamp, /* refreshAfter, not applicable */
                    stamp, /* expiresAfter, not applicable */
                )
            )
            this.lastSavedState = _.cloneDeep(this.state)
        }
        setTimeout(this.periodicallySaveCacheState, 10000)
    }

    keyAccessed = (key) => {
        if (!this.state.lastAccessed[key]) {
            this.state.count += 1
            if (this.state.count > this.maxEntries)
                this.prune()
        }
        this.state.lastAccessed[key] = getTime()
    }

    /*********************************************************************/
    /* Cache Retrieval / Update                                          */
    /*********************************************************************/

    get = async (key, refreshCallback, expiredCallback, cacheInfo : CacheInfo) => {
        let cacheEntry
        this.keyAccessed(key)
        try {
            cacheEntry = await this.storage.get(key)
            return await this.refreshIfNeeded(key, cacheEntry, refreshCallback, expiredCallback, cacheInfo)
        } catch (e) {
            if (!(e instanceof KeyError || e instanceof InvalidCacheEntry))
                throw e
            cacheEntry = await this.refreshKey(key, refreshCallback, cacheInfo)
            return {
                value:      cacheEntry.value,
                fromCache:  false,
            }
        }
    }

    refreshIfNeeded = async (key, cacheEntry, refreshCallback, expiredCallback, cacheInfo : CacheInfo) => {
        const now = getTime()
        if (cacheEntry.refreshAfter > now) {
            // Value does not need to be refreshed
            log("Reusing value from cache...", key, cacheEntry.refreshAfter)
            return {
                value:     cacheEntry.value,
                fromCache: true,
            }
        } else {
            log("Refreshing cache entry...", key)
            try {
                cacheEntry = await this.refreshKey(key, refreshCallback, cacheInfo)
                return {
                    value:     cacheEntry.value,
                    fromCache: false,
                }
            } catch (e) {
                if (!(e instanceof NetworkError))
                    throw e
                if (cacheEntry.expiresAfter < now) {
                    // Entry has expired, re-throw network error
                    if (expiredCallback) {
                        cacheEntry = await this.refreshKey(key, expiredCallback, cacheInfo)
                        return {
                            value:     cacheEntry.value,
                            fromCache: false,
                        }
                    }
                    throw e
                }
                // Entry should be refreshed, but cannot currently be refreshed
                // due to network errors. Return old value
                return {
                    value:     cacheEntry.value,
                    fromCache: true,
                }
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
        this.keyAccessed(key)
        await this.storage.set(key, cacheEntry)
        // log("Cached entry with key", key)
        return cacheEntry
    }

    /*********************************************************************/
    /* Cache Clearing                                                    */
    /*********************************************************************/

    prune = async () => {
        const lastAccessed = this.state.lastAccessed
        const times = _.sortBy(Object.keys(lastAccessed), key => lastAccessed[key])
        const cutoff = Math.floor(this.maxEntries / 2)

        /* Determine which cache keys to keep, and which to delete */
        const keysToDelete = times.slice(0, cutoff)
        const keysToKeep = times.slice(cutoff)

        keysToDelete.forEach(key => {
            delete lastAccessed[key]
        })
        this.state.count = keysToKeep.length
        // log("DELETING KEYS FROM CACHE", keysToDelete)
        // log("KEEPING KEYS", keysToKeep)
        // log("NEW STATE", this.state)
        await this.storage.removeKeys(keysToDelete)
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

const maxEntries = 250
const storage = new Storage(AsyncStorage, maxEntries)
export const cache = new Cache(storage, maxEntries)
cache.initialize()
// cache.clearAll()
