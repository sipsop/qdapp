import { QueryDownload } from '/network/http.js'

export class BarQueryDownload extends QueryDownload {
    @computed get active() {
        return this.props.barID != null
    }

    @computed get cacheKey() {
        return `qd:${this.name}:barID=${this.props.barID}`
    }
}
