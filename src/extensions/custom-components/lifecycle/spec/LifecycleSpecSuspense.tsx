import {lazy, Suspense} from 'react'

import {CustomComponentRenderContext} from 'src/extensions/custom-components'

const LifecycleSpec = lazy(() => import('./LifecycleSpec'))

export default function LifecycleSpecSuspense(ctx: CustomComponentRenderContext) {
  return (
    <Suspense fallback={null}>
      <LifecycleSpec {...ctx}/>
    </Suspense>
  )
}