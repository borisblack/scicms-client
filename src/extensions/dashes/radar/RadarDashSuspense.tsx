import {lazy, memo, Suspense} from 'react'

import {DashRenderContext} from '..'

const RadarDash = lazy(() => import('./RadarDash'))

function RadarDashSuspense(ctx: DashRenderContext) {
    return (
        <Suspense fallback={null}>
            <RadarDash {...ctx}/>
        </Suspense>
    )
}

export default memo(RadarDashSuspense)