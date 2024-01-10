import {lazy, Suspense} from 'react'
import {EditorProps} from './Editor'

const Editor = lazy(() => import('./Editor'))

const EditorSuspense = (props: EditorProps) =>  (
    <Suspense fallback={null}>
        <Editor {...props}/>
    </Suspense>
)

export default EditorSuspense