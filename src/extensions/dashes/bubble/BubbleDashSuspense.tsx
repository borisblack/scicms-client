import {lazy, memo, Suspense} from 'react'

import {DashRenderContext} from '..'

const BubbleDash = lazy(() => import('./BubbleDash'))

function BubbleDashSuspense(ctx: DashRenderContext) {
    return (
        <Suspense fallback={null}>
            <BubbleDash {...ctx}/>
        </Suspense>
    )
}

export default memo(BubbleDashSuspense)