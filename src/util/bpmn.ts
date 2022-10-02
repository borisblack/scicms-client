import _ from 'lodash'

import {LifecycleSpec, StateMap} from '../types'

interface BpmnDefinitions {
    process: {
        id: string
        isExecutable: boolean
        startEvent: {
            id: string
            outgoings: string[]
        }
        endEvent: {
            id: string
            incomings: string[]
        }
        tasks: {
            id: string
            name: string
            incomings: string[]
            outgoings: string[]
        }[]
        sequenceFlows: {
            id: string
            name: string | null
            sourceRef: string
            targetRef: string
        }[]
    }
}

export function parseBpmn(bpmn: string): BpmnDefinitions {
    const parser = new DOMParser()
    const doc = parser.parseFromString(bpmn, "application/xml")
    const processEl = doc.getElementsByTagName('bpmn:process')[0]
    const startEventEl = processEl.getElementsByTagName('bpmn:startEvent')[0]
    const endEventEl = processEl.getElementsByTagName('bpmn:endEvent')[0]
    const taskEls = processEl.getElementsByTagName('bpmn:task')
    const sequenceFlowEls = processEl.getElementsByTagName('bpmn:sequenceFlow')

    return {
        process: {
            id: processEl.getAttribute('id') as string,
            isExecutable: processEl.getAttribute('isExecutable') === 'true',
            startEvent: {
                id: startEventEl.getAttribute('id') as string,
                outgoings: Array.from(startEventEl.getElementsByTagName('bpmn:outgoing')).map(it => it.textContent) as string[]
            },
            endEvent: {
                id: endEventEl.getAttribute('id') as string,
                incomings: Array.from(endEventEl.getElementsByTagName('bpmn:incoming')).map(it => it.textContent) as string[]
            },
            tasks: Array.from(taskEls).map(it => ({
                id: it.getAttribute('id') as string,
                name: it.getAttribute('name') as string,
                incomings: Array.from(it.getElementsByTagName('bpmn:incoming')).map(it => it.textContent) as string[],
                outgoings: Array.from(it.getElementsByTagName('bpmn:outgoing')).map(it => it.textContent) as string[],
            })),
            sequenceFlows: Array.from(sequenceFlowEls).map(it => ({
                id: it.getAttribute('id') as string,
                name: it.getAttribute('name'),
                sourceRef: it.getAttribute('sourceRef') as string,
                targetRef: it.getAttribute('targetRef') as string
            }))
        }
    }
}

export function parseLifecycleSpec(bpmn: string): LifecycleSpec {
    const definitions = parseBpmn(bpmn)
    const {process} = definitions
    const tasks = _.mapKeys(process.tasks, it => it.id)
    const sequenceFlows = _.mapKeys(process.sequenceFlows, it => it.id)
    const states: StateMap = {}
    process.tasks.forEach(task => {
        const transitions = task.outgoings
            .filter(sequenceFlowId => {
                const sequenceFlow = sequenceFlows[sequenceFlowId]
                return sequenceFlow.targetRef != process.endEvent.id
            })
            .map(sequenceFlowId => {
                const sequenceFlow = sequenceFlows[sequenceFlowId]
                const targetTask = tasks[sequenceFlow.targetRef]
                return targetTask.name
            })

        states[task.name] = {transitions}
    })

    return {states}
}