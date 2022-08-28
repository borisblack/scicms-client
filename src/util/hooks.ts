import {useEffect, useRef} from 'react'
import type {TypedUseSelectorHook} from 'react-redux'
import {useDispatch, useSelector} from 'react-redux'
import type {AppDispatch, RootState} from '../store'

export const useAppDispatch: () => AppDispatch = useDispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export function usePrevious(value: any): any {
    const ref = useRef()
    useEffect(() => {
        ref.current = value
    })
    return ref.current
}