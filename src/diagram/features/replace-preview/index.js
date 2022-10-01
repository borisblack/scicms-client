import PreviewSupportModule from 'diagram-js/lib/features/preview-support'

import BpmnReplacePreview from './BpmnReplacePreview'

const replacePreview = {
  __depends__: [
    PreviewSupportModule
  ],
  __init__: [ 'bpmnReplacePreview' ],
  bpmnReplacePreview: [ 'type', BpmnReplacePreview ]
};

export default replacePreview
