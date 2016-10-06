class History {
    constructor() {
        this.history = []
        this.handlers = {}
    }

    push = (tag, value = null) => {
        this.history.push({tag: tag, value: value})
    }

    pop = () => {
        if (this.history.length)
            this.history.pop()
    }

    registerHandler = (tag, handler) => {
        this.handlers[tag] = handler
    }

    goBack = () => {
        if (this.history.length) {
            this.dispatch(this.history.pop())
        }
    }

    dispatch = ({tag, value}) => {
        this.handlers[tag](value)
    }
}

export const historyStore = new History()
