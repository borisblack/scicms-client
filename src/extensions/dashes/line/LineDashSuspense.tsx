import {lazy, Suspense} from 'react'

import {DashRenderContext} from '..'

const LineDash = lazy(() => import('./LineDash'))

function LineDashSuspense(ctx: DashRenderContext) {
    return (
        <Suspense fallback={null}>
            <LineDash {...ctx}/>
        </Suspense>
    )
}

export default LineDashSuspense