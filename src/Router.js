import {
  createRouter
} from '@exponent/ex-navigation'

import { Main } from './Main'

export const Router = createRouter(() => ({
    main: () => Main
}))
