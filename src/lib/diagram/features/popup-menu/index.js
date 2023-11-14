import PopupMenuModule from 'diagram-js/lib/features/popup-menu'
import ReplaceModule from '../replace'

import ReplaceMenuProvider from './ReplaceMenuProvider'


const popupMenu = {
  __depends__: [
    PopupMenuModule,
    ReplaceModule
  ],
  __init__: [ 'replaceMenuProvider' ],
  replaceMenuProvider: [ 'type', ReplaceMenuProvider ]
};

export default popupMenu;