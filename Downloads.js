import { observable, computed, transaction, action, autorun } from 'mobx'
// import { observer } from 'mobx-react/native'

import { JSONDownload, QueryDownload, QueryMutation } from './HTTP.js'
import { buildURL } from './URLs.js'
import { parseBar } from './Maps/PlaceInfo.js'
import { MenuItemQuery } from './Bar/MenuQuery.js'

const APIKey : Key = 'AIzaSyAPxkG5Fe5GaWdbOSwNJuZfDnA6DiKf8Pw'

class CurrentBarInfoDownload extends JSONDownload {
    name = 'barInfo'

    @computed get active() {
        return stores.barStore.barID != null
    }

    @computed get cacheKey() {
        return `qd:placeInfo:${this.placeID}`
    }

    @computed get placeID() {
        return stores.barStore.barID
    }

    @computed get url() {
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        return buildURL(
            "https://maps.googleapis.com/maps/api/place/details/json",
            { key: APIKey
            , placeid: this.placeID
            }
        )
    }

    @action finish = () => {
        if (this.value && this.value.status !== 'OK') {
            this.downloadError(this.value.status)
        } else {
            const bar : Bar = parseBar(this.value.result, this.value.html_attributions)
            this.downloadFinished(bar)
        }
    }
}

/* Reusable bar info download */
class BarInfoDownload extends CurrentBarInfoDownload {
    constructor(placeID) {
        super()
        this._placeID = placeID
    }

    @computed get active() {
        return true
    }

    @computed get placeID() {
        return this._placeID
    }
}

class BarQueryDownload extends QueryDownload {

    @computed get active() {
        return stores.barStore.barID != null
    }

    @computed get cacheKey() {
        return `qd:${this.name}:barID=${this.barID}`
    }

    @computed get barID() {
        return stores.barStore.barID
    }

}

class TagsDownload extends BarQueryDownload {
    name = 'tags'

    @computed get query() {
        return {
            Tags: {
                args: {
                    barID: this.barID,
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

class MenuDownload extends BarQueryDownload {
    name = 'menu'

    @computed get query() {
        return {
            fragments: {
                SubMenu: {
                    image:      'String',
                    menuItems:  [MenuItemQuery],
                },
            },
            Menu: {
                args: {
                    barID: this.barID,
                },
                result: {
                    beer:               'SubMenu',
                    wine:               'SubMenu',
                    spirits:            'SubMenu',
                    cocktails:          'SubMenu',
                    water:              'SubMenu',
                    snacks:             'SubMenu',
                    food:               'SubMenu',
                }
            }
        }
    }
}

/* Object to hold all stores:

    barStore
    tagStore
    orderStore
    etc
*/
var stores = null

export const initialize = (_stores, downloadManager) => {
    stores = _stores
    downloadManager.declareDownload(new CurrentBarInfoDownload())
    downloadManager.declareDownload(new TagsDownload())
    downloadManager.declareDownload(new MenuDownload())
}
