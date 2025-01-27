import {lazy, Suspense} from 'react'

import {IconProps} from './Icon'

const Icon = lazy(() => import('./Icon'))

export default function IconSuspense(props: IconProps) {
  const renderEmptyIcon = () => (
    <span className={props.className} style={props.style}>
      &nbsp;&nbsp;&nbsp;
    </span>
  )

  return (
    <Suspense fallback={renderEmptyIcon()}>
      <Icon {...props} />
    </Suspense>
  )
}
