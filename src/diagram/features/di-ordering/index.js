import BpmnDiOrdering from '../di-ordering/BpmnDiOrdering'

const diOrdering = {
  __init__: [
    'bpmnDiOrdering'
  ],
  bpmnDiOrdering: [ 'type', BpmnDiOrdering ]
};

export default diOrdering;