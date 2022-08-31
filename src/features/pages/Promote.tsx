import {Lifecycle} from '../../types'
import {useEffect, useState} from 'react'
import LifecycleService from '../../services/lifecycle'
import {Button, List, message, Spin} from 'antd'

interface Props {
    lifecycleId: string
    currentState?: string | null
    onSelect: (state: string) => void
}

interface StateItem {
    title: string
    description: string
}

const {Item: ListItem} = List

const lifecycleService = LifecycleService.getInstance()

export default function Promote({lifecycleId, currentState: currentStateName, onSelect}: Props) {
    const [loading, setLoading] = useState(false)
    const [lifecycle, setLifecycle] = useState<Lifecycle | null>(null)

    function getAllowedStates(): StateItem[] {
        if (!lifecycle)
            return []

        const {states} = lifecycle.spec
        if (!currentStateName) {
            const startState = states[lifecycle.startState]
            if (!startState)
                throw new Error('Invalid start state')

            return [{
                title: lifecycle.startState,
                description: startState.displayName
            }]
        }

        const currentState = states[currentStateName]
        if (!currentState)
            throw new Error('Invalid current state')

        return Object.keys(currentState.transitions)
            .map(key => {
                const allowedState = states[key]
                if (!allowedState)
                    throw new Error('Invalid transition')

                return {
                    title: key,
                    description: allowedState.displayName
                }
            })
    }

    useEffect(() => {
        setLoading(true)
        lifecycleService.findById(lifecycleId)
            .then(it => {
                setLifecycle(it)
            })
            .catch((e: any) => {
                message.error(e.message)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [lifecycleId])

    return (
        <Spin spinning={loading}>
            {lifecycle && (
                <List
                    itemLayout="horizontal"
                    dataSource={getAllowedStates()}
                    renderItem={it => (
                        <ListItem>
                            <ListItem.Meta
                                title={<Button type="link" style={{paddingLeft: 0, paddingRight: 0}} onClick={() => onSelect(it.title)}>{it.title}</Button>}
                                description={it.description}
                            />
                        </ListItem>
                    )}
                />
            )}
        </Spin>
    )
}