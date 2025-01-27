import {CSSProperties} from 'react'

import {allIcons} from './loaders'

export interface IconProps {
  iconName: string | null | undefined
  size?: number
  className?: string
  style?: CSSProperties
}

export default function Icon({iconName, size, className, style}: IconProps) {
  if (!iconName) return null

  const Icon = allIcons[iconName]
  if (!Icon) return null

  return <Icon size={size} className={className} style={style} />
}
