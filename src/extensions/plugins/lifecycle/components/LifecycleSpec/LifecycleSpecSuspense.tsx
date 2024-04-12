import {lazy, Suspense} from 'react'
import {CustomComponentContext} from 'src/extensions/plugins/types'

const LifecycleSpec = lazy(() => import('./LifecycleSpec'))

export function LifecycleSpecSuspense(ctx: CustomComponentContext) {
  return (
    <Suspense fallback={null}>
      <LifecycleSpec {...ctx}/>
    </Suspense>
  )
}