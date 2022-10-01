import SearchPadModule from 'diagram-js/lib/features/search-pad'

import BpmnSearchProvider from './BpmnSearchProvider'


const search = {
  __depends__: [
    SearchPadModule
  ],
  __init__: [ 'bpmnSearch' ],
  bpmnSearch: [ 'type', BpmnSearchProvider ]
};

export default search
