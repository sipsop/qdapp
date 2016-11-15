import { computed, transaction, action, autorun } from 'mobx'
import { HTTPDownload } from '/network/http'

export class MarkdownDownload extends HTTPDownload {
    /* properties:
        url: ?String
    */
    name = 'markdown'

    @computed get cacheKey() {
        return `qd:markdown:url=${this.props.url}`
    }

    @computed get url() {
        return this.props.url
    }

    @computed get body() {
        return this.lastValue
    }
}
