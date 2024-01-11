import {CSSProperties} from 'react'

import {loadAllIcons} from 'src/components/icons/loaders'
import {useCache} from 'src/util/hooks'

interface IconProps {
    iconName: string | null | undefined
    size?: number
    className?: string
    style?: CSSProperties
}

export default function Icon({iconName, size, className, style}: IconProps) {
    const {data: allIcons} = useCache<Record<string, any>>(loadAllIcons)

    if (!iconName || !allIcons)
        return null

    const Icon = allIcons[iconName]
    if (!Icon)
        return null

    return (
        <Icon
            size={size}
            className={className}
            style={style}
        />
    )
}
