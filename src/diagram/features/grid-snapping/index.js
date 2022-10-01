import BpmnGridSnapping from './BpmnGridSnapping'
import GridSnappingModule from 'diagram-js/lib/features/grid-snapping'

import GridSnappingBehaviorModule from './behavior'

const gridSnapping = {
  __depends__: [
    GridSnappingModule,
    GridSnappingBehaviorModule
  ],
  __init__: [ 'bpmnGridSnapping' ],
  bpmnGridSnapping: [ 'type', BpmnGridSnapping ]
};

export default gridSnapping;