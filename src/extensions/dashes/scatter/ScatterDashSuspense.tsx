import {lazy, memo, Suspense} from 'react'

import {DashRenderContext} from '..'

const ScatterDash = lazy(() => import('./ScatterDash'))

function ScatterDashSuspense(ctx: DashRenderContext) {
    return (
        <Suspense fallback={null}>
            <ScatterDash {...ctx}/>
        </Suspense>
    )
}

export default memo(ScatterDashSuspense)