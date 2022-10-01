import CopyPasteModule from 'diagram-js/lib/features/copy-paste'

import BpmnCopyPaste from './BpmnCopyPaste'
import ModdleCopy from './ModdleCopy'

const copyPaste = {
  __depends__: [
    CopyPasteModule
  ],
  __init__: [ 'bpmnCopyPaste', 'moddleCopy' ],
  bpmnCopyPaste: [ 'type', BpmnCopyPaste ],
  moddleCopy: [ 'type', ModdleCopy ]
};

export default copyPaste;
