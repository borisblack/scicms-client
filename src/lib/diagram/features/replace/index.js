import CopyPasteModule from '../copy-paste';
import ReplaceModule from 'diagram-js/lib/features/replace';
import SelectionModule from 'diagram-js/lib/features/selection';

import BpmnReplace from './BpmnReplace';

const replace = {
  __depends__: [
    CopyPasteModule,
    ReplaceModule,
    SelectionModule
  ],
  bpmnReplace: [ 'type', BpmnReplace ]
};

export default replace;
