import {HiPlugin} from '../extensions/plugins/hi/HiPlugin'
import {HelloPlugin} from '../extensions/plugins/hello/HelloPlugin'
import {Plugin} from '../extensions/plugins/Plugin'
import {ItemPlugin} from 'src/extensions/plugins/item/ItemPlugin'
import {DashboardPlugin} from 'src/extensions/plugins/dashboard/DashboardPlugin'
import {DatasetPlugin} from 'src/extensions/plugins/dataset/DatasetPlugin'
import {UserPlugin} from 'src/extensions/plugins/user/UserPlugin'
import {LifecyclePlugin} from 'src/extensions/plugins/lifecycle/LifecyclePlugin'
import {ProjectPlugin} from 'src/extensions/plugins/project/ProjectPlugin'
import {CommonPlugin} from 'src/extensions/plugins/common/CommonPlugin'
import {RolePlugin} from 'src/extensions/plugins/role/RolePlugin'
import {GroupMemberPlugin} from 'src/extensions/plugins/groupMember/GroupMemberPlugin'
import {AccessPlugin} from 'src/extensions/plugins/access/AccessPlugin'
import {MediaPlugin} from 'src/extensions/plugins/media/MediaPlugin'
import {PropertyPlugin} from 'src/extensions/plugins/property/PropertyPlugin'

interface PluginConfig {
    plugins: Plugin[]
}

// Add plugins here
const pluginConfig: PluginConfig = {
  plugins: [
    // new HelloPlugin(),
    // new HiPlugin(),
    new AccessPlugin(),
    new DashboardPlugin(),
    new DatasetPlugin(),
    new GroupMemberPlugin(),
    new ItemPlugin(),
    new LifecyclePlugin(),
    new MediaPlugin(),
    new ProjectPlugin(),
    new PropertyPlugin(),
    new RolePlugin(),
    new UserPlugin(),
    new CommonPlugin()
  ]
}

export default pluginConfig
