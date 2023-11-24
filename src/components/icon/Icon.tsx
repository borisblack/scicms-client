import {allIcons} from 'src/util/icons'

interface IconProps {
    iconName: string | null
}

export default function Icon({iconName}: IconProps) {
    if (!iconName)
        return null

    const Icon = allIcons[iconName]
    if (!Icon)
        return null

    return <Icon/>
}
