import {lazy, memo, Suspense} from 'react'

import {DashRenderContext} from '..'

const PieDash = lazy(() => import('./PieDash'))

function PieDashSuspense(ctx: DashRenderContext) {
    return (
        <Suspense fallback={null}>
            <PieDash {...ctx}/>
        </Suspense>
    )
}

export default memo(PieDashSuspense)