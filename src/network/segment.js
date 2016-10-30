import { NetworkError, simpleFetchJSON } from './http.js'
import * as _ from '~/utils/curry.js'

const segmentURL = 'https://api.segment.io/v1/batch'

const { log, assert } = _.utils('~/network/segment.js')

export class Segment {

    constructor(segmentAPIWriteKey) {
        // base64 encoded api key
        this.segmentAPIWriteKey = segmentAPIWriteKey
        this.messages = []
        this.userID = null
    }

    setUserID = (userID) => {
        this.userID = userID
    }

    getState = () => {
        return {
            messages: this.messages,
        }
    }

    emptyState = () => {
        return {
            messages: [],
        }
    }

    setState = (segmentState) => {
        // this.messages = segmentState.messages || []
    }

    initialize = () => {
    
    }

    initialized = () => {
        this.dispatchMessages(5000)
    }

    httpBasicAuth = () => {
        return `Basic ${this.segmentAPIWriteKey}`
    }

    getHeaders = () => {
        return {
            'Content-Type':  'application/json',
            'Authorization': this.httpBasicAuth(),
        }
    }

    getBatchQuery = () => {
        return JSON.stringify({
            'batch': this.messages,
            'context': {
                'device': {
                    'type': 'phone',
                    // 'name': this.phoneName,
                },
                direct: true,
            },
        })
    }

    getHttpOptions = () => {
        return {
            method:  'POST',
            headers: this.getHeaders(),
            body:    this.getBatchQuery(),
        }
    }

    dispatchMessages = (interval) => {
        if (this.messages.length && this.userID != null)
            this._dispatchNow()
        setTimeout(() => this.dispatchMessages(interval), interval)
    }

    _dispatchNow = async () => {
        /* Format request body and get HTTP options */
        const httpOptions = this.getHttpOptions()
        /* Erase messages for now */
        const messages = this.messages
        this.messages = []

        try {
            const response = await simpleFetchJSON(segmentURL, httpOptions, 15000)
        } catch (e) {
            /* Keep old messages around for now, but do not exceed
               1000 messages
            */
            if (!e instanceof NetworkError && !e instanceof TimeoutError)
                throw e
            this.messages = [...messages, this.messages].slice(-1000)
        }
    }

    /* Identify the user. Call at registration, or whenever the traits change

        traits = {
            "name": "Peter Gibbons",
            "email": "peter@initech.com",
            "plan": "premium",
            "logins": 5,
            "address": {
                "street": "6th St",
                "city": "San Francisco",
                "state": "CA",
                "postalCode": "94103",
                "country": "USA"
            }
        }
    */
    identify = ({email, name}) => {
        this.messages.push({
            'type':     'identify',
            'userId':   this.userID,
            'traits':   {
                email: email,
                name:  name,
                // age:   age,
            },
            'timestamp':    timestamp(),
        })
    }

    /* Track an event with some properties, e.g.

        segment.track({
            event: 'Bar Card Clicked',
            properties: {
                placeID: '...',
                placeName: 'The Eagle Cambridge',
            },
        })
    */
    track = (event, properties) => {
        this.messages.push({
            'type':         'track',
            'userId':       this.userID,
            'event':        event,
            'properties':   properties,
            'timestamp':    timestamp(),
        })
    }

    /* Record a visit to a particular screen in the app, e.g.

        segment.screen('discover')
    */
    screen = (screenName) => {
        this.messages.push({
            'type':         'screen',
            'userId':       this.userID,
            'name':         screenName,
            'timestamp':    timestamp(),
        })
    }

    /* Record a user as part of a group, such as a company.
       For usable traits, see https://segment.com/docs/spec/group/#traits
    */
    group = (groupID, traits) => {
        this.messages.push({
            'type':         'group',
            'userId':       this.userID,
            'groupId':      groupID,
            'traits':       traits,
            'timestamp':    timestamp(),
        })
    }

    /* Record a user alias -- e.g. on account creation */
    alias = (previousUserID, newUserID) => {
        this.messages.push({
            'previousId':   previousUserID,
            'userId':       newUserID,
            'timestamp':    timestamp(),
        })
        this.setUserID(newUserID)
    }

    /* NOTE: BarStore.js does some monkey patching ... */
}

/* NOTE on timestamps:

    We track timestamps client-side so that out-of-order delivery to segment
    is not an issue.
*/
const timestamp = () => new Date().toISOString()


export const makeSegment = (Segment) => {
    return new Segment(segmentAPIWriteKey)
}

// echo -n '8AbRuKat3knA6wvUqiIk8jbSVZuQwtyv:' | base64
const segmentAPIWriteKey = 'OEFiUnVLYXQza25BNnd2VXFpSWs4amJTVlp1UXd0eXY6'
export const segment = makeSegment(Segment)
