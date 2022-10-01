import DrawModule from '../draw'
import ImportModule from '../import'

const core = {
  __depends__: [
    DrawModule,
    ImportModule
  ]
};

export default core