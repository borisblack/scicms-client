import EditorActionsModule from 'diagram-js/lib/features/editor-actions'

import BpmnEditorActions from './BpmnEditorActions'

const editorActions = {
  __depends__: [
    EditorActionsModule
  ],
  editorActions: [ 'type', BpmnEditorActions ]
};

export default editorActions;