import {Plot} from '@antv/g2plot'
import {PlotEvent} from '@ant-design/plots'
import {v4 as uuidv4} from 'uuid'

import {registerLocale} from '@antv/g2plot'
import {RU_RU_LOCALE} from './locales/ru_RU'
import {QueryFilter, QueryOp} from 'src/types/bi'

export function handleDashClick(chart: Plot<any>, event: PlotEvent, fieldName: string, cb: (queryFilter: QueryFilter) => void) {
    if (event.type !== 'click')
        return

    const v = event.data?.data?.[fieldName]
    if (v == null)
        return

    cb({
        id: uuidv4(),
        columnName: fieldName,
        op: QueryOp.$eq,
        value: v
    })
}

// Register additional locales
registerLocale('ru-RU', RU_RU_LOCALE)