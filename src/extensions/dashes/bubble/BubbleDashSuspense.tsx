import {lazy, Suspense} from "react"

import type {DashRenderContext} from ".."

const BubbleDash = lazy(() => import("./BubbleDash"))

function BubbleDashSuspense(ctx: DashRenderContext) {
  return (
    <Suspense fallback={null}>
      <BubbleDash {...ctx} />
    </Suspense>
  )
}

export default BubbleDashSuspense
