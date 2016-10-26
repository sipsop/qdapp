import React from 'react'
import { observer } from 'mobx-react/native'

import { PureComponent } from '~/components/Component'
import { LazyComponent } from '~/components/LazyComponent'

@observer
export class LazyBarPhoto extends PureComponent {
  static defaultProps = {
    showMapButton: false
  }

  render = () => {
    return (<LazyComponent
                    timeout={this.props.timeout || 0}
                    style={{height: this.props.imageHeight}}
                    >
            <BarPhoto {...this.props} />
        </LazyComponent>)
  }
}
