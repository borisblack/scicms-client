import {lazy, memo, Suspense} from 'react'

import {DashRenderContext} from '..'

const PolarAreaDash = lazy(() => import('./PolarAreaDash'))

function PolarAreaDashSuspense(ctx: DashRenderContext) {
    return (
        <Suspense fallback={null}>
            <PolarAreaDash {...ctx}/>
        </Suspense>
    )
}

export default memo(PolarAreaDashSuspense)