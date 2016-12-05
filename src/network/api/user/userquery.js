// import { toJS } from 'mobx'
import * as _ from '/utils/curry'

export const getClearingProps = (props) => {
    props = _.asData(props)
    // props = toJS(props)
    delete props.authToken
    return props
}
