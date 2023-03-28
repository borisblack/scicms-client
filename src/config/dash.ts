import {Dash} from '../dashes'
import {area} from '../dashes/area'
import {bar} from '../dashes/bar'
import {bubble} from '../dashes/bubble'
import {bubbleMap} from '../dashes/bubble-map'
import {column} from '../dashes/column'
import {doughnut} from '../dashes/doughnut'
import {line} from '../dashes/line'
import {pie} from '../dashes/pie'
import {polarArea} from '../dashes/polar-area'
import {radar} from '../dashes/radar'
import {scatter} from '../dashes/scatter'
import {statistic} from '../dashes/statistic'

interface DashConfig {
    dashes: Dash[]
}

// Add dashes here
const dashConfig: DashConfig = {
    dashes: [
        area,
        bar,
        bubble,
        bubbleMap,
        column,
        doughnut,
        line,
        pie,
        polarArea,
        radar,
        scatter,
        statistic
    ]
}

export default dashConfig