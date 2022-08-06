import {hiPlugin} from '../plugins/hi'
import {helloPlugin} from '../plugins/hello'
import {CustomPlugin} from '../plugins'

interface PluginConfig {
    plugins: CustomPlugin[]
}

// Add new plugins here
const pluginConfig: PluginConfig = {
    plugins: [
        helloPlugin,
        hiPlugin
    ]
}

export default pluginConfig
