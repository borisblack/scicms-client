import {DateTime} from 'luxon'
import {CustomFunction} from '.'
import {UTC} from '../../config/constants'

const TEMPORAL_CATEGORY = 'Temporal Functions'

export const now: CustomFunction = {
  id: 'now',
  category: TEMPORAL_CATEGORY,
  exec: () => DateTime.now().setZone(UTC, {keepLocalTime: true}),
  description: 'Now'
}

export const secondsBeforeNow: CustomFunction = {
  id: 'secondsBeforeNow',
  category: TEMPORAL_CATEGORY,
  exec: (seconds: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .minus({seconds})
      .toISO(),
  description: 'Seconds before now'
}

export const minutesBeforeNow: CustomFunction = {
  id: 'minutesBeforeNow',
  category: TEMPORAL_CATEGORY,
  exec: (minutes: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .minus({minutes})
      .toISO(),
  description: 'Minutes before now'
}

export const hoursBeforeNow: CustomFunction = {
  id: 'hoursBeforeNow',
  category: TEMPORAL_CATEGORY,
  exec: (hours: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .minus({hours})
      .toISO(),
  description: 'Hours before now'
}

export const daysBeforeNow: CustomFunction = {
  id: 'daysBeforeNow',
  category: TEMPORAL_CATEGORY,
  exec: (days: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .minus({days})
      .toISO(),
  description: 'Days before now'
}

export const weeksBeforeNow: CustomFunction = {
  id: 'weeksBeforeNow',
  category: TEMPORAL_CATEGORY,
  exec: (weeks: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .minus({weeks})
      .toISO(),
  description: 'Weeks before now'
}

export const weeksBeforeNowTrunc: CustomFunction = {
  id: 'weeksBeforeNowTrunc',
  category: TEMPORAL_CATEGORY,
  exec: (weeks: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .minus({weeks})
      .startOf('day')
      .toISO(),
  description: 'Weeks before now (truncated to day)'
}

export const monthsBeforeNow: CustomFunction = {
  id: 'monthsBeforeNow',
  category: TEMPORAL_CATEGORY,
  exec: (months: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .minus({months})
      .toISO(),
  description: 'Months before now'
}

export const monthsBeforeNowTrunc: CustomFunction = {
  id: 'monthsBeforeNowTrunc',
  category: TEMPORAL_CATEGORY,
  exec: (months: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .minus({months})
      .startOf('day')
      .toISO(),
  description: 'Months before now (truncated to day)'
}

export const yearsBeforeNow: CustomFunction = {
  id: 'yearsBeforeNow',
  category: TEMPORAL_CATEGORY,
  exec: (years: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .minus({years})
      .toISO(),
  description: 'Years before now'
}

export const yearsBeforeNowTrunc: CustomFunction = {
  id: 'yearsBeforeNowTrunc',
  category: TEMPORAL_CATEGORY,
  exec: (years: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .minus({years})
      .startOf('day')
      .toISO(),
  description: 'Years before now (truncated to day)'
}

export const secondsAfterNow: CustomFunction = {
  id: 'secondsAfterNow',
  category: TEMPORAL_CATEGORY,
  exec: (seconds: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .minus({seconds})
      .toISO(),
  description: 'Seconds after now'
}

export const minutesAfterNow: CustomFunction = {
  id: 'minutesAfterNow',
  category: TEMPORAL_CATEGORY,
  exec: (minutes: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .plus({minutes})
      .toISO(),
  description: 'Minutes after now'
}

export const hoursAfterNow: CustomFunction = {
  id: 'hoursAfterNow',
  category: TEMPORAL_CATEGORY,
  exec: (hours: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .plus({hours})
      .toISO(),
  description: 'Hours after now'
}

export const daysAfterNow: CustomFunction = {
  id: 'daysAfterNow',
  category: TEMPORAL_CATEGORY,
  exec: (days: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .plus({days})
      .toISO(),
  description: 'Days after now'
}

export const weeksAfterNow: CustomFunction = {
  id: 'weeksAfterNow',
  category: TEMPORAL_CATEGORY,
  exec: (weeks: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .plus({weeks})
      .toISO(),
  description: 'Weeks after now'
}

export const weeksAfterNowTrunc: CustomFunction = {
  id: 'weeksAfterNowTrunc',
  category: TEMPORAL_CATEGORY,
  exec: (weeks: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .plus({weeks})
      .startOf('day')
      .toISO(),
  description: 'Weeks after now (truncated to day)'
}

export const monthsAfterNow: CustomFunction = {
  id: 'monthsAfterNow',
  category: TEMPORAL_CATEGORY,
  exec: (months: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .plus({months})
      .toISO(),
  description: 'Months after now'
}

export const monthsAfterNowTrunc: CustomFunction = {
  id: 'monthsAfterNowTrunc',
  category: TEMPORAL_CATEGORY,
  exec: (months: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .plus({months})
      .startOf('day')
      .toISO(),
  description: 'Months after now (truncated to day)'
}

export const yearsAfterNow: CustomFunction = {
  id: 'yearsAfterNow',
  category: TEMPORAL_CATEGORY,
  exec: (years: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .plus({years})
      .toISO(),
  description: 'Years after now'
}

export const yearsAfterNowTrunc: CustomFunction = {
  id: 'yearsAfterNowTrunc',
  category: TEMPORAL_CATEGORY,
  exec: (years: number) =>
    DateTime.now().setZone(UTC, {keepLocalTime: true})
      .plus({years})
      .startOf('day')
      .toISO(),
  description: 'Years after now (truncated to day)'
}
