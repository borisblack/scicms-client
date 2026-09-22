import {lazy, Suspense} from "react"
import type {CustomComponentContext} from "src/extensions/plugins/types"
import type {Lifecycle} from "src/types/schema"

const LifecycleSpec = lazy(() => import("./LifecycleSpec"))

export function LifecycleSpecSuspense(ctx: CustomComponentContext<Lifecycle>) {
  return (
    <Suspense fallback={null}>
      <LifecycleSpec {...ctx} />
    </Suspense>
  )
}
