import KeyboardModule from 'diagram-js/lib/features/keyboard'

import BpmnKeyboardBindings from './BpmnKeyboardBindings'

const keyboard = {
  __depends__: [
    KeyboardModule
  ],
  __init__: [ 'keyboardBindings' ],
  keyboardBindings: [ 'type', BpmnKeyboardBindings ]
};

export default keyboard;
