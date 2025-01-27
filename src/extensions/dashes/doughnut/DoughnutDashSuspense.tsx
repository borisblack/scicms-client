import {lazy, Suspense} from 'react'

import {DashRenderContext} from '..'

const DoughnutDash = lazy(() => import('./DoughnutDash'))

function DoughnutDashSuspense(ctx: DashRenderContext) {
  return (
    <Suspense fallback={null}>
      <DoughnutDash {...ctx} />
    </Suspense>
  )
}

export default DoughnutDashSuspense
