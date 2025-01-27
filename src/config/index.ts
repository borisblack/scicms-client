import dayjs from 'dayjs'
import {notification} from 'antd'
import {Locale} from 'antd/lib/locale'
import enUS from 'antd/locale/en_US'
import ruRU from 'antd/locale/ru_RU'
// import {Settings as LuxonSettings} from 'luxon'
import 'dayjs/locale/ru'

import {
  DEFAULT_CORE_URL,
  DEFAULT_I18N_LNG,
  LUXON_DATE_FORMAT_STRING,
  LUXON_DATETIME_FORMAT_STRING,
  LUXON_TIME_FORMAT_STRING
} from './constants'
import {DeletingStrategy} from '../types'

// LuxonSettings.defaultZone = UTC
// dayjs.tz.setDefault(UTC)

interface ClientConfig {
  i18nLng: string
  coreUrl: string
  antdLocale: Locale
  notification: {
    duration: number
    placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  }
}

export interface AppConfig {
  coreVersion: string
  dateTime: {
    timeZone: string
    luxonDisplayDateFormatString: string
    luxonDisplayTimeFormatString: string
    luxonDisplayDateTimeFormatString: string
    momentDisplayDateFormatString: string
    momentDisplayTimeFormatString: string
    momentDisplayDateTimeFormatString: string
  }
  query: {
    minPageSize: number
    defaultPageSize: number
    maxPageSize: number
  }
  mutation: {
    copyCollectionRelations: boolean
    deletingStrategy: DeletingStrategy
  }
  ui: {
    dataGrid: {
      colWidth: number
      maxTextLength: number
    }
    form: {
      fieldWidth: number
      textAreaRows: number
      editorHeight: string
    }
    split: {
      defaultSplitterColors: {
        color: string
        hover: string
        drag: string
      }
      splitterSize: string
    }
  }
}

export enum PropertyKey {
  CORE_VERSION = 'coreVersion',
  DATE_TIME_TIME_ZONE = 'dateTime.timeZone',
  DATE_TIME_LUXON_DISPLAY_DATE_FORMAT_STRING = 'dateTime.luxonDisplayDateFormatString',
  DATE_TIME_LUXON_DISPLAY_TIME_FORMAT_STRING = 'dateTime.luxonDisplayTimeFormatString',
  DATE_TIME_LUXON_DISPLAY_DATE_TIME_FORMAT_STRING = 'dateTime.luxonDisplayDateTimeFormatString',
  DATE_TIME_MOMENT_DISPLAY_DATE_FORMAT_STRING = 'dateTime.momentDisplayDateFormatString',
  DATE_TIME_MOMENT_DISPLAY_TIME_FORMAT_STRING = 'dateTime.momentDisplayTimeFormatString',
  DATE_TIME_MOMENT_DISPLAY_DATE_TIME_FORMAT_STRING = 'dateTime.momentDisplayDateTimeFormatString',
  MENU = 'menu',
  MUTATION_COPY_COLLECTION_RELATIONS = 'mutation.copyCollectionRelations',
  MUTATION_DELETING_STRATEGY = 'mutation.deletingStrategy',
  QUERY_MIN_PAGE_SIZE = 'query.minPageSize',
  QUERY_DEFAULT_PAGE_SIZE = 'query.defaultPageSize',
  QUERY_MAX_PAGE_SIZE = 'query.maxPageSize',
  SPLIT_DEFAULT_SPLITTER_COLORS_COLOR = 'split.defaultSplitterColors.color',
  SPLIT_DEFAULT_SPLITTER_COLORS_DRAG = 'split.defaultSplitterColors.drag',
  SPLIT_DEFAULT_SPLITTER_COLORS_HOVER = 'split.defaultSplitterColors.hover',
  SPLIT_SPLITTER_SIZE = 'split.splitterSize',
  UI_DATAGRID_COL_WIDTH = 'ui.dataGrid.colWidth',
  UI_DATAGRID_MAX_TEXT_LENGTH = 'ui.dataGrid.maxTextLength',
  UI_FORM_EDITOR_HEIGHT = 'ui.form.editorHeight',
  UI_FORM_FIELD_WIDTH = 'ui.form.fieldWidth',
  UI_FORM_TEXT_AREA_ROWS = 'ui.form.textAreaRows'
}

const antdLocales: Record<string, Locale> = {
  'en-US': enUS,
  'ru-RU': ruRU
}

const i18nLng = process.env.REACT_APP_I18N_LNG ?? DEFAULT_I18N_LNG
export const clientConfig: ClientConfig = {
  coreUrl: process.env.REACT_APP_CORE_URL ?? DEFAULT_CORE_URL,
  i18nLng,
  antdLocale: antdLocales[i18nLng] ?? ruRU,
  notification: {
    duration: 10,
    placement: 'topRight'
  }
}

export const appConfig: AppConfig = {
  coreVersion: 'v1',
  dateTime: {
    timeZone: 'Asia/Krasnoyarsk',
    luxonDisplayDateFormatString: LUXON_DATE_FORMAT_STRING,
    luxonDisplayTimeFormatString: LUXON_TIME_FORMAT_STRING,
    luxonDisplayDateTimeFormatString: LUXON_DATETIME_FORMAT_STRING,
    momentDisplayDateFormatString: 'DD.MM.YYYY',
    momentDisplayTimeFormatString: 'HH:mm',
    momentDisplayDateTimeFormatString: 'DD.MM.YYYY HH:mm'
  },
  query: {
    minPageSize: 5,
    defaultPageSize: 20,
    maxPageSize: 100
  },
  mutation: {
    copyCollectionRelations: true,
    deletingStrategy: DeletingStrategy.CASCADE
  },
  ui: {
    dataGrid: {
      colWidth: 140,
      maxTextLength: 160
    },
    form: {
      fieldWidth: 6,
      textAreaRows: 5,
      editorHeight: '110px'
    },
    split: {
      defaultSplitterColors: {
        color: '#dddddd',
        hover: '#cccccc',
        drag: '#cccccc'
      },
      splitterSize: '4px'
    }
  }
}

dayjs.locale(clientConfig.i18nLng)

notification.config({
  placement: clientConfig.notification.placement,
  duration: clientConfig.notification.duration
})
