import {lazy, Suspense} from 'react'
import {CustomComponentContext} from 'src/extensions/plugins/types'
import {Lifecycle} from 'src/types/schema'

const LifecycleSpec = lazy(() => import('./LifecycleSpec'))

export function LifecycleSpecSuspense(ctx: CustomComponentContext<Lifecycle>) {
  return (
    <Suspense fallback={null}>
      <LifecycleSpec {...ctx} />
    </Suspense>
  )
}
