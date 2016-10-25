import { computed, transaction, action, autorun } from 'mobx'
import { BarQueryDownload } from './barquery.js'
import { config } from './Config.js'

export class TagsDownload extends BarQueryDownload {
    name = 'tags'

    @computed get query() {
        return {
            Tags: {
                args: {
                    barID: this.props.barID,
                },
                result: {
                    tagInfo: [{
                        tagID:   'String',
                        tagName: 'String',
                        excludes: ['String'],
                    }],
                    tagGraph: [{
                        srcID:  'String',
                        dstIDs: ['String'],
                    }],
                },
            }
        }
    }

    @computed get tags() {
        if (!this.lastValue)
            return { tagInfo: [], tagGraph: [] }
        return this.lastValue
    }
}
