import {Dash} from '../extensions/dashes'
import {area} from '../extensions/dashes/area'
import {bar} from '../extensions/dashes/bar'
import {bubble} from '../extensions/dashes/bubble'
import {bubbleMap} from '../extensions/dashes/bubble-map'
import {column} from '../extensions/dashes/column'
import {doughnut} from '../extensions/dashes/doughnut'
import {line} from '../extensions/dashes/line'
import {pie} from '../extensions/dashes/pie'
import {polarArea} from '../extensions/dashes/polar-area'
import {radar} from '../extensions/dashes/radar'
import {scatter} from '../extensions/dashes/scatter'
import {statistic} from '../extensions/dashes/statistic'
import {report} from '../extensions/dashes/report'

interface DashConfig {
  dashes: Dash[]
}

// Add dashes here
const dashConfig: DashConfig = {
  dashes: [area, bar, bubble, bubbleMap, column, doughnut, line, pie, polarArea, radar, report, scatter, statistic]
}

export default dashConfig
