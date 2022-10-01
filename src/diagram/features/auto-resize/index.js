import BpmnAutoResize from './BpmnAutoResize'
import BpmnAutoResizeProvider from './BpmnAutoResizeProvider'


const autoResize = {
  __init__: [
    'bpmnAutoResize',
    'bpmnAutoResizeProvider'
  ],
  bpmnAutoResize: [ 'type', BpmnAutoResize ],
  bpmnAutoResizeProvider: [ 'type', BpmnAutoResizeProvider ]
};

export default autoResize;
