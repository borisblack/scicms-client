import {lazy, Suspense} from "react"

import type {DashRenderContext} from ".."

const ScatterDash = lazy(() => import("./ScatterDash"))

function ScatterDashSuspense(ctx: DashRenderContext) {
  return (
    <Suspense fallback={null}>
      <ScatterDash {...ctx} />
    </Suspense>
  )
}

export default ScatterDashSuspense
