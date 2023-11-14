import RulesModule from 'diagram-js/lib/features/rules'

import BpmnRules from './BpmnRules'

const rules = {
  __depends__: [
    RulesModule
  ],
  __init__: [ 'bpmnRules' ],
  bpmnRules: [ 'type', BpmnRules ]
};

export default rules
