import { AsyncStorage } from 'react-native'

import { NetworkError } from './HTTP.js'
import { Hour, Day, Month, getTime } from './Time.js'
import { promise, chunking } from './Curry.js'
import { config } from './Config.js'


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


export class Storage {
    constructor(backend, maxEntries) {
        this.backend = backend
        this.maxEntries = maxEntries
    }

    async initialize() {
        await this.prune()
    }

    async prune() {
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
    async pruneExpired(allKeys) {
        const entriesToDelete = []
        const accessTimes = []
        const now = getTime()
        const chunks = chunking(allKeys, 100)
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

    async getKeys() {
        var keys = await this.backend.getAllKeys()
        return keys.filter(key => key.startsWith('qd:'))
    }

    async clear() {
        try {
            const keys = await this.getKeys()
            if (keys.length)
                await this.backend.multiRemove(keys)
        } catch (e) {
            console.error(e)
        }
    }

    async clearAll() {
        await this.backend.clear()
    }

    async get(key) {
        const blob = await this.backend.getItem(key)
        if (!blob) {
            throw new KeyError(key)
        }
        return CacheEntry.fromBlob(key, blob)
    }

    async set(key, cacheEntry) {
        await this.backend.setItem(key, cacheEntry.toBlob())
    }
}

class Cache {
    constructor(storage) {
        this.storage = storage
    }

    async get(key, refreshCallback, expiredCallback) {
        var cacheEntry
        try {
            cacheEntry = await this.storage.get(key)
            return await this.refreshIfNeeded(key, cacheEntry, refreshCallback, expiredCallback)
        } catch (e) {
            if (!(e instanceof KeyError))
                throw e
            cacheEntry = await this.refreshKey(key, refreshCallback)
            return cacheEntry.value
        }
    }

    async refreshIfNeeded(key, cacheEntry, refreshCallback, expiredCallback) {
        const now = getTime()
        if (cacheEntry.refreshAfter > now) {
            // Value does not need to be refreshed
            console.log("Reusing value from cache...", key)
            return cacheEntry.value
        } else {
            console.log("Refreshing cache entry...", key)
            try {
                cacheEntry = await this.refreshKey(key, refreshCallback)
                return cacheEntry.value
            } catch (e) {
                if (!(e instanceof NetworkError))
                    throw e
                if (cacheEntry.expiresAfter < now) {
                    // Entry has expired, re-throw network error
                    if (expiredCallback) {
                        console.log("Trying download again with expiredCallback...", key)
                        cacheEntry = await this.refreshKey(key, expiredCallback)
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

    async refreshKey(key, refreshCallback) : CacheEntry {
        const value = await refreshCallback()
        return await this.set(key, value)
    }

    async invalidateKey(key) {
        await this.backend.delete(key)
        /* TODO: Remove any keys that are children in the key hierarchy */
    }

    async set(key, value) : CacheEntry {
        const cacheEntry = CacheEntry.freshEntry(key, value)
        await this.storage.set(key, cacheEntry)
        return cacheEntry
    }

    async clear() {
        await this.storage.clear()
    }

    async clearAll() {
        await this.storage.clearAll()
    }
}

class CacheEntry {
    constructor(key, value, refreshAfter, expiresAfter) {
        this.key = key
        this.value = value
        this.refreshAfter = refreshAfter
        this.expiresAfter = expiresAfter
        if (!refreshAfter || !expiresAfter)
            throw Error("Cannot construct cache entry without refreshAfter or expiresAfter")
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
        if (result.value == undefined || !result.refreshAfter || !result.expiresAfter) {
            console.log("Invalid cache entry:",
                            result.refreshAfter,
                            result.expiresAfter,
                            "value == undefined",
                            result.value == undefined)
            throw Error("Invalid cache entry")
        }
        return new CacheEntry(
            key,
            result.value,
            result.refreshAfter,
            result.expiresAfter,
        )
    }

    static freshEntry = (key, value) => {
        const now = getTime()
        const refreshAfter = now + config.refreshAfterDelta
        const expiresAfter = now + config.expiresAfterDelta
        return new CacheEntry(key, value, refreshAfter, expiresAfter)
    }
}

const KB = (x) => x * 1024
const MB = (x) => KB(x) * 1024

const storage = new Storage(AsyncStorage /* backend */, 100 /* maxEntries */)
export const cache = new Cache(storage)
cache.clearAll()

/********************************************/
/* TODO: Use this to optimize AsyncStorage? */
/********************************************/

/* Store entries in a dictionary in memory */
class MemoryStorage {
    constructor() {
        this.state = new Map()
    }

    getItem = (key) => {
        return promise(() => {
            if (!this.state.has(key))
                reject(new KeyError(key))
            return this.state.get(key)
        })
    }

    setItem = (key, value) => {
        return promise(() => {
            this.state.set(key, value)
        })
    }

    delItem = (key) => {
        return promise(() => {
            this.state.delete(key)
        })
    }

    clear = () => {
        return promise(() => {
            this.state.clear()
        })
    }

    getAllKeys = () => {
        return promise(() => Array.from(this.state.keys()))
    }
}
