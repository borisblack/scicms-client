import {ApiMiddleware} from '../api-middleware'
import {itemMiddleware} from '../api-middleware/item'
import {itemTemplateMiddleware} from '../api-middleware/item-template'

interface ApiMiddlewareConfig {
    apiMiddleware: ApiMiddleware[]
}

// Add middleware here
const apiMiddlewareConfig: ApiMiddlewareConfig = {
    apiMiddleware: [
        itemMiddleware,
        itemTemplateMiddleware
    ]
}

export default apiMiddlewareConfig
