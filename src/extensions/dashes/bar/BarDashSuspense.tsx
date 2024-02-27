import {lazy, Suspense} from 'react'

import {DashRenderContext} from '..'

const BarDash = lazy(() => import('./BarDash'))

function BarDashSuspense(ctx: DashRenderContext) {
    return (
        <Suspense fallback={null}>
            <BarDash {...ctx}/>
        </Suspense>
    )
}

export default BarDashSuspense