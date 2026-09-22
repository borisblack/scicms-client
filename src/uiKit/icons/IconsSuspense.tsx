import {lazy, Suspense} from "react"

import type {IconsProps} from "./Icons"

const Icons = lazy(() => import("./Icons"))

export default function IconsSuspense(props: IconsProps) {
  return (
    <Suspense fallback={null}>
      <Icons {...props} />
    </Suspense>
  )
}
