import {CustomFunction} from '.'
import dayjs from 'dayjs'

const TEMPORAL_CATEGORY = 'Temporal Functions'

export const now: CustomFunction = {
    id: 'now',
    category: TEMPORAL_CATEGORY,
    exec: () => dayjs().toISOString(),
    description: 'Now'
}

export const secondsBeforeNow: CustomFunction = {
    id: 'secondsBeforeNow',
    category: TEMPORAL_CATEGORY,
    exec: (seconds: number) => dayjs().subtract(seconds, 'seconds').toISOString(),
    description: 'Seconds before now'
}

export const minutesBeforeNow: CustomFunction = {
    id: 'minutesBeforeNow',
    category: TEMPORAL_CATEGORY,
    exec: (minutes: number) => dayjs().subtract(minutes, 'minutes').toISOString(),
    description: 'Minutes before now'
}

export const hoursBeforeNow: CustomFunction = {
    id: 'hoursBeforeNow',
    category: TEMPORAL_CATEGORY,
    exec: (hours: number) => dayjs().subtract(hours, 'hours').toISOString(),
    description: 'Hours before now'
}

export const daysBeforeNow: CustomFunction = {
    id: 'daysBeforeNow',
    category: TEMPORAL_CATEGORY,
    exec: (days: number) => dayjs().subtract(days, 'days').toISOString(),
    description: 'Days before now'
}

export const weeksBeforeNow: CustomFunction = {
    id: 'weeksBeforeNow',
    category: TEMPORAL_CATEGORY,
    exec: (weeks: number) => dayjs().subtract(weeks, 'weeks').toISOString(),
    description: 'Weeks before now'
}

export const monthsBeforeNow: CustomFunction = {
    id: 'monthsBeforeNow',
    category: TEMPORAL_CATEGORY,
    exec: (months: number) => dayjs().subtract(months, 'months').toISOString(),
    description: 'Months before now'
}

export const yearsBeforeNow: CustomFunction = {
    id: 'yearsBeforeNow',
    category: TEMPORAL_CATEGORY,
    exec: (years: number) => dayjs().subtract(years, 'years').toISOString(),
    description: 'Years before now'
}

export const secondsAfterNow: CustomFunction = {
    id: 'secondsAfterNow',
    category: TEMPORAL_CATEGORY,
    exec: (seconds: number) => dayjs().add(seconds, 'seconds').toISOString(),
    description: 'Seconds after now'
}

export const minutesAfterNow: CustomFunction = {
    id: 'minutesAfterNow',
    category: TEMPORAL_CATEGORY,
    exec: (minutes: number) => dayjs().add(minutes, 'minutes').toISOString(),
    description: 'Minutes after now'
}

export const hoursAfterNow: CustomFunction = {
    id: 'hoursAfterNow',
    category: TEMPORAL_CATEGORY,
    exec: (hours: number) => dayjs().add(hours, 'hours').toISOString(),
    description: 'Hours after now'
}

export const daysAfterNow: CustomFunction = {
    id: 'daysAfterNow',
    category: TEMPORAL_CATEGORY,
    exec: (days: number) => dayjs().add(days, 'days').toISOString(),
    description: 'Days after now'
}

export const weeksAfterNow: CustomFunction = {
    id: 'weeksAfterNow',
    category: TEMPORAL_CATEGORY,
    exec: (weeks: number) => dayjs().add(weeks, 'weeks').toISOString(),
    description: 'Weeks after now'
}

export const monthsAfterNow: CustomFunction = {
    id: 'monthsAfterNow',
    category: TEMPORAL_CATEGORY,
    exec: (months: number) => dayjs().add(months, 'months').toISOString(),
    description: 'Months after now'
}

export const yearsAfterNow: CustomFunction = {
    id: 'yearsAfterNow',
    category: TEMPORAL_CATEGORY,
    exec: (years: number) => dayjs().add(years, 'years').toISOString(),
    description: 'Years after now'
}
