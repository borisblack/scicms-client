import pluginConfig from 'src/config/plugin'
import {PluginEngine} from './PluginEngine'

const pluginEngine = new PluginEngine(pluginConfig.plugins)
pluginEngine.onLoad()

export {pluginEngine}
