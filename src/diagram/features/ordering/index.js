import translate from 'diagram-js/lib/i18n/translate';

import BpmnOrderingProvider from './BpmnOrderingProvider';

const ordering = {
  __depends__: [
    translate
  ],
  __init__: [ 'bpmnOrderingProvider' ],
  bpmnOrderingProvider: [ 'type', BpmnOrderingProvider ]
};

export default ordering;