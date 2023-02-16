import {DashOpt} from '../../../../dashboard/dashes'
import {Dataset, IDash} from '../../../../types'

export interface DashOptFieldProps {
    dashOpt: DashOpt
    availableColumns: string[]
    initialValue: any
}
