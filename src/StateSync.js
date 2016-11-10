type T = {}
type K = {}
type V = {}

type Event = {
    op: StateOp,
}

type StateOp = {
    SetField: {
        path: Path,
        fieldName: String,
        fieldValue: T,
    },
    ListAppend: {
        path: Path,
        value: T,
    },
    ListInsert: {
        path: Path,
        index: Int,
        value: T,
    },
    ListDelete: {
        path: Path,
        index: Int,
    },
    ListTakeLast: {
        path: Path,
        n: Int,
    },
    SetAdd: {
        path: Path,
        value: T,
    }
    SetRemove: {
        path: Path,
        value: T,
    },
    MapAdd: {
        path: Path,
        key: K,
        value: V,
    },
    MapRemove: {
        path: Path,
        key: K,
    },
}

class SyncStore {

    @observable state = null
    registeredQueries : Array<StateQuery> = []

    getState = () => {
        return {
            state: this.state,
        }
    }

    emptyState = () => {
        return {
            state: null,
        }
    }

    @action setState = (syncState) => {
        this.state = syncState.state
    }

    registerQuery = (stateQuery : StateQuery) => {
        this.registeredQueries.push(stateQuery)
    }

    @computed get stateQuery() {
        const query = {
            user: {},
            bar: {},
        }
        this.registeredQueries.forEach(stateQuery => {
            if (stateQuery.active) {
                _.mergeRecursive(
                    query[stateQuery.type],
                    { stateQuery.name: stateQuery.stateQuery },
                )
            }
        })
        return query
    }
}

const exampleQuery = {
    args: {
        users: [{
            userID: '27289929',
            authToken: '181929',
            fields: [
                'barOwnerProfile',
                'favouriteBars',
                'favouriteDrinks',
                '...',
            ],
        }, {
            userID: '985747327',
            fields: [
                'lastPubCheckin',
            ],
        }],
        bars: [{
            barID: '....',
            fields: [
                'menu',
                'barStatus',
                'activities',
                'promotions',
                '...',
            ],
        }],
    },
    result: {
        users: [{
            barOwnerProfile: BarOwnerQuery,
        }]
    },
}

class StateQuery {
    type = null
    name = null

    @computed get active() {
        return true
    }

    @computed stateQuery() => {
        throw Error(`getQuery not implemented for ${name}`)
    }
}

class MenuQuery extends StateQuery {
    type = 'bar'
    name = 'menu'

    @computed get active() {
        return barStore.barID != null
    }

    @computed stateQuery() => {
        return {

        }
    }
}

const emit = (stateOp) => {
    // TODO:
}


class StateValue {
    constructor(accessPath, state) {
        this.accessPath = accessPath
        this.state = state
    }

    /*********************************************************************/
    /* State Operations */
    /*********************************************************************/

    /* Records */
    getField = this.access

    setField = (name : String, value) => {
        const accessPath = push(this.accessPath, name)
        this.emit('SetField', {value: value})
    }

    /* Lists */
    listGet = this.access

    listInsert = (index : Int, item : T) => {
        this.emit('ListInsert', {index: index, value: item})
    }

    listAppend = (item : T) => {
        this.emit('ListAppend', {value: item})
    }

    listDelete = (index : Int) => {
        this.emit('ListDelete', {index: index})
    }

    /* Sets */
    setAdd = (item : T) => {
        this.emit('SetAdd', {value: item})
    }

    setRemove = (item : T) => {
        this.emit('SetRemove', {value: item})
    }

    /* Maps */
    mapGet = this.access

    mapAdd = (key : K, value : V) => {
        this.emit('MapAdd', {key: key, value: value})
    }

    mapDelete = (key : K) => {
        this.emit('MapDelete', {key: key})
    }

    /*********************************************************************/
    /* Internal */
    /*********************************************************************/

    access = (pathElem) => {
        return new StateValue(push(this.accessPath, pathElem), this.state[pathElem])
    }

    emit = (opName : String, opArgs, accessPath = null) => {
        accessPath = accessPath || this.accessPath
        opArgs.path = accessPath
        emit({opName: opArgs})
    }

    /*********************************************************************/
    /* State Inspection */
    /*********************************************************************/

    isLoading = () : Bool => {
        return false // TODO:
    }

    getValue = () => {
        return this.state
    }
}

const push = (xs : Array<T>, x : T) : Array<T> => {
    xs = xs.slice()
    xs.push(x)
    return xs
}
