import translate from 'diagram-js/lib/i18n/translate'

import BpmnImporter from './BpmnImporter'

const importer = {
  __depends__: [
    translate
  ],
  bpmnImporter: [ 'type', BpmnImporter ]
};

export default importer