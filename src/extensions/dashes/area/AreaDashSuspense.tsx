import {lazy, Suspense} from 'react'

import {DashRenderContext} from '..'

const AreaDash = lazy(() => import('./AreaDash'))

function AreaDashSuspense(ctx: DashRenderContext) {
  return (
    <Suspense fallback={null}>
      <AreaDash {...ctx} />
    </Suspense>
  )
}

export default AreaDashSuspense
