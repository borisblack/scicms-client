import {CustomComponent} from '../custom-components'
import {helloComponent} from '../custom-components/hello'
import {hiComponent} from '../custom-components/hi'

interface CustomComponentConfig {
    components: CustomComponent[]
}

// Add custom components here
const customComponentConfig: CustomComponentConfig = {
    components: [
        helloComponent,
        hiComponent
    ]
}

export default customComponentConfig