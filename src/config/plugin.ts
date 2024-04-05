import {hiPlugin} from '../extensions/plugins/hi'
import {helloPlugin} from '../extensions/plugins/hello'
import {CustomPlugin} from '../extensions/plugins'

interface PluginConfig {
    plugins: CustomPlugin[]
}

// Add plugins here
const pluginConfig: PluginConfig = {
  plugins: [
    // helloPlugin,
    // hiPlugin
  ]
}

export default pluginConfig
