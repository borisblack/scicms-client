import {CustomFunction} from '../extensions/functions'
import {
  secondsBeforeNow,
  minutesBeforeNow,
  hoursBeforeNow,
  daysBeforeNow,
  weeksBeforeNow,
  weeksBeforeNowTrunc,
  monthsBeforeNow,
  monthsBeforeNowTrunc,
  yearsBeforeNow,
  yearsBeforeNowTrunc,
  now,
  secondsAfterNow,
  minutesAfterNow,
  hoursAfterNow,
  daysAfterNow,
  weeksAfterNow,
  weeksAfterNowTrunc,
  monthsAfterNow,
  monthsAfterNowTrunc,
  yearsAfterNow,
  yearsAfterNowTrunc
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
    weeksBeforeNowTrunc,
    monthsBeforeNow,
    monthsBeforeNowTrunc,
    yearsBeforeNow,
    yearsBeforeNowTrunc,
    secondsAfterNow,
    minutesAfterNow,
    hoursAfterNow,
    daysAfterNow,
    weeksAfterNow,
    weeksAfterNowTrunc,
    monthsAfterNow,
    monthsAfterNowTrunc,
    yearsAfterNow,
    yearsAfterNowTrunc
  ]
}

export default functionConfig
