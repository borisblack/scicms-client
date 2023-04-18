import {CustomFunction} from '../extensions/functions'
import {
    hoursBeforeNow,
    daysBeforeNow,
    monthsBeforeNow,
    weeksBeforeNow,
    yearsBeforeNow,
    minutesBeforeNow,
    now,
    daysAfterNow,
    hoursAfterNow,
    minutesAfterNow,
    monthsAfterNow,
    secondsAfterNow,
    weeksAfterNow,
    yearsAfterNow,
    secondsBeforeNow
} from '../extensions/functions/temporal'

interface FunctionConfig {
    functions: CustomFunction[]
}

// Add functions here
const functionConfig: FunctionConfig = {
    functions: [
        now,
        secondsBeforeNow,
        minutesBeforeNow,
        hoursBeforeNow,
        daysBeforeNow,
        weeksBeforeNow,
        monthsBeforeNow,
        yearsBeforeNow,
        secondsAfterNow,
        minutesAfterNow,
        hoursAfterNow,
        daysAfterNow,
        weeksAfterNow,
        monthsAfterNow,
        yearsAfterNow
    ]
}

export default functionConfig
