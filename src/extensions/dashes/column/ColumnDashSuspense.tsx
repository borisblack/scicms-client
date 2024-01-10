import {lazy, memo, Suspense} from 'react'

import {DashRenderContext} from '..'

const ColumnDash = lazy(() => import('./ColumnDash'))

function ColumnDashSuspense(ctx: DashRenderContext) {
    return (
        <Suspense fallback={null}>
            <ColumnDash {...ctx}/>
        </Suspense>
    )
}

export default memo(ColumnDashSuspense)