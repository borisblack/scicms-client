import {CustomFunction} from '.'
import dayjs from 'dayjs'

export const now: CustomFunction = {
    id: 'now',
    exec: () => dayjs().toISOString(),
    description: 'Now'
}

export const secondsBeforeNow: CustomFunction = {
    id: 'secondsBeforeNow',
    exec: (seconds: number) => dayjs().subtract(seconds, 'seconds').toISOString(),
    description: 'Seconds before now'
}

export const minutesBeforeNow: CustomFunction = {
    id: 'minutesBeforeNow',
    exec: (minutes: number) => dayjs().subtract(minutes, 'minutes').toISOString(),
    description: 'Minutes before now'
}

export const hoursBeforeNow: CustomFunction = {
    id: 'hoursBeforeNow',
    exec: (hours: number) => dayjs().subtract(hours, 'hours').toISOString(),
    description: 'Hours before now'
}

export const daysBeforeNow: CustomFunction = {
    id: 'daysBeforeNow',
    exec: (days: number) => dayjs().subtract(days, 'days').toISOString(),
    description: 'Days before now'
}

export const weeksBeforeNow: CustomFunction = {
    id: 'weeksBeforeNow',
    exec: (weeks: number) => dayjs().subtract(weeks, 'weeks').toISOString(),
    description: 'Weeks before now'
}

export const monthsBeforeNow: CustomFunction = {
    id: 'monthsBeforeNow',
    exec: (months: number) => dayjs().subtract(months, 'months').toISOString(),
    description: 'Months before now'
}

export const yearsBeforeNow: CustomFunction = {
    id: 'yearsBeforeNow',
    exec: (years: number) => dayjs().subtract(years, 'years').toISOString(),
    description: 'Years before now'
}

export const secondsAfterNow: CustomFunction = {
    id: 'secondsAfterNow',
    exec: (seconds: number) => dayjs().add(seconds, 'seconds').toISOString(),
    description: 'Seconds after now'
}

export const minutesAfterNow: CustomFunction = {
    id: 'minutesAfterNow',
    exec: (minutes: number) => dayjs().add(minutes, 'minutes').toISOString(),
    description: 'Minutes after now'
}

export const hoursAfterNow: CustomFunction = {
    id: 'hoursAfterNow',
    exec: (hours: number) => dayjs().add(hours, 'hours').toISOString(),
    description: 'Hours after now'
}

export const daysAfterNow: CustomFunction = {
    id: 'daysAfterNow',
    exec: (days: number) => dayjs().add(days, 'days').toISOString(),
    description: 'Days after now'
}

export const weeksAfterNow: CustomFunction = {
    id: 'weeksAfterNow',
    exec: (weeks: number) => dayjs().add(weeks, 'weeks').toISOString(),
    description: 'Weeks after now'
}

export const monthsAfterNow: CustomFunction = {
    id: 'monthsAfterNow',
    exec: (months: number) => dayjs().add(months, 'months').toISOString(),
    description: 'Months after now'
}

export const yearsAfterNow: CustomFunction = {
    id: 'yearsAfterNow',
    exec: (years: number) => dayjs().add(years, 'years').toISOString(),
    description: 'Years after now'
}
