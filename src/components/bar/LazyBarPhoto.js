import { React, PureComponent } from '~/src/components/Component'
import { observer } from 'mobx-react/native'

import { LazyComponent } from '~/src/components/LazyComponent'
import { BarPhoto } from './BarPhoto'

@observer
export class LazyBarPhoto extends PureComponent {
    static defaultProps = {
        showMapButton: false
    }

    render = () => {
        return (
            <LazyComponent
                timeout={this.props.timeout || 0}
                style={{height: this.props.imageHeight}}
                >
                <BarPhoto {...this.props} />
            </LazyComponent>
        )
    }
}
