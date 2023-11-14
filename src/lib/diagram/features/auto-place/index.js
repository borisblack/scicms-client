import AutoPlaceModule from 'diagram-js/lib/features/auto-place'

import BpmnAutoPlace from './BpmnAutoPlace'

const autoPlace = {
  __depends__: [ AutoPlaceModule ],
  __init__: [ 'bpmnAutoPlace' ],
  bpmnAutoPlace: [ 'type', BpmnAutoPlace ]
};

export default autoPlace