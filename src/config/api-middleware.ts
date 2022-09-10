import {ApiMiddleware} from '../api-middleware'

interface ApiMiddlewareConfig {
    apiMiddleware: ApiMiddleware[]
}

// Add middleware here
const apiMiddlewareConfig: ApiMiddlewareConfig = {
    apiMiddleware: []
}

export default apiMiddlewareConfig
