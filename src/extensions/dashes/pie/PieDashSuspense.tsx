import {lazy, Suspense} from "react"

import type {DashRenderContext} from ".."

const PieDash = lazy(() => import("./PieDash"))

function PieDashSuspense(ctx: DashRenderContext) {
  return (
    <Suspense fallback={null}>
      <PieDash {...ctx} />
    </Suspense>
  )
}

export default PieDashSuspense
