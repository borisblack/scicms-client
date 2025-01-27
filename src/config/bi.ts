import {FieldType} from 'src/types'
import {ColumnType} from 'src/types/bi'
import {clientConfig} from '.'

export interface BiConfig {
  cols: number
  rowHeight: number
  defaultDashType: string
  defaultDashHeight: number
  defaultSelectorHeight: number
  defaultSelectorType: ColumnType
  defaultTextHeight: number
  defaultPageSize: number
  defaultRefreshIntervalSeconds: number
  locale: string
  maxPageSize: number
  minRefreshIntervalSeconds: number
  openFirstDashboard: boolean
  fractionDigits: number
  percentFractionDigits: number
  dateTime: {
    dateFormatString: string
    timeFormatString: string
    dateTimeFormatString: string
  }
  dash: {
    all: {
      colors10: string[]
      colors20: string[]
      legend?: {
        label?: {
          style?: {
            [key: string]: any
          }
        }
        itemName?: {
          style?: {
            [key: string]: any
          }
        }
      }
      axisLabelStyle?: {
        [key: string]: any
      }
    }
    doughnut?: {
      labelStyle: {
        [key: string]: any
      }
      statistic?: {
        title?: false
      }
    }
    map: {
      urlTemplate: string
      defaultZoom: number
      maxZoom: number
      centerPosition?: {
        latitude: number
        longitude: number
      }
      defaultSize: number
    }
    pie?: {
      labelStyle: {
        [key: string]: any
      }
    }
    statistic: {
      color?: string
    }
  }
}

export enum BiPropertyKey {
  COLS = 'bi.cols',
  DASH_ALL_AXIS_LABEL_STYLE = 'bi.dash.all.axisLabelStyle',
  DASH_ALL_COLORS_10 = 'bi.dash.all.colors10',
  DASH_ALL_COLORS_20 = 'bi.dash.all.colors20',
  DASH_ALL_LEGEND_LABEL_STYLE = 'bi.dash.all.legend.label.style',
  DASH_ALL_LEGEND_ITEM_NAME_STYLE = 'bi.dash.all.legend.itemName.style',
  DASH_DOUGHNUT_LABEL_STYLE_FONT_SIZE = 'bi.dash.doughnut.labelStyle.fontSize',
  DASH_DOUGHNUT_LABEL_STYLE_TEXT_ALIGN = 'bi.dash.doughnut.labelStyle.textAlign',
  DASH_MAP_CENTER_POSITION_LATITUDE = 'bi.dash.map.centerPosition.latitude',
  DASH_MAP_CENTER_POSITION_LONGITUDE = 'bi.dash.map.centerPosition.longitude',
  DASH_MAP_DEFAULT_SIZE = 'bi.dash.map.defaultSize',
  DASH_MAP_DEFAULT_ZOOM = 'bi.dash.map.defaultZoom',
  DASH_MAP_MAX_ZOOM = 'bi.dash.map.maxZoom',
  DASH_MAP_URL_TEMPLATE = 'bi.dash.map.urlTemplate',
  DASH_PIE_LABEL_STYLE_FONT_SIZE = 'bi.dash.pie.labelStyle.fontSize',
  DASH_PIE_LABEL_STYLE_TEXT_ALIGN = 'bi.dash.pie.labelStyle.textAlign',
  DASH_STATISTIC_COLOR = 'bi.dash.statistic.color',
  DATE_TIME_DATE_FORMAT_STRING = 'bi.dateTime.dateFormatString',
  DATE_TIME_DATE_TIME_FORMAT_STRING = 'bi.dateTime.dateTimeFormatString',
  DATE_TIME_TIME_FORMAT_STRING = 'bi.dateTime.timeFormatString',
  DEFAULT_DASH_HEIGHT = 'bi.defaultDashHeight',
  DEFAULT_DASH_TYPE = 'bi.defaultDashType',
  DEFAULT_PAGE_SIZE = 'bi.defaultPageSize',
  DEFAULT_REFRESH_INTERVAL_SECONDS = 'bi.defaultRefreshIntervalSeconds',
  DEFAULT_SELECTOR_HEIGHT = 'bi.defaultSelectorHeight',
  DEFAULT_SELECTOR_TYPE = 'bi.defaultSelectorType',
  DEFAULT_TEXT_HEIGHT = 'bi.defaultTextHeight',
  FRACTION_DIGITS = 'bi.fractionDigits',
  LOCALE = 'bi.locale',
  MAX_PAGE_SIZE = 'bi.maxPageSize',
  MIN_REFRESH_INTERVAL_SECONDS = 'bi.minRefreshIntervalSeconds',
  OPEN_FIRST_DASHBOARD = 'bi.openFirstDashboard',
  PERCENT_FRACTION_DIGITS = 'bi.percentFractionDigits',
  ROW_HEIGHT = 'bi.rowHeight'
}

const biConfig: BiConfig = {
  cols: 24,
  rowHeight: 100,
  defaultDashType: 'bar',
  defaultDashHeight: 3,
  defaultSelectorHeight: 1,
  defaultSelectorType: FieldType.string,
  defaultTextHeight: 1,
  defaultPageSize: 100,
  defaultRefreshIntervalSeconds: 300,
  locale: clientConfig.i18nLng,
  maxPageSize: 1000,
  minRefreshIntervalSeconds: 5,
  openFirstDashboard: true,
  fractionDigits: 2,
  percentFractionDigits: 2,
  dateTime: {
    dateFormatString: 'DD.MM.YYYY',
    timeFormatString: 'HH:mm',
    dateTimeFormatString: 'DD.MM.YYYY HH:mm'
  },
  dash: {
    all: {
      colors10: [
        '#5B8FF9',
        '#5AD8A6',
        '#5D7092',
        '#F6BD16',
        '#6F5EF9',
        '#6DC8EC',
        '#945FB9',
        '#FF9845',
        '#1E9493',
        '#FF99C3'
      ],
      colors20: [
        '#5B8FF9',
        '#CDDDFD',
        '#5AD8A6',
        '#CDF3E4',
        '#5D7092',
        '#CED4DE',
        '#F6BD16',
        '#FCEBB9',
        '#6F5EF9',
        '#D3CEFD',
        '#6DC8EC',
        '#D3EEF9',
        '#945FB9',
        '#DECFEA',
        '#FF9845',
        '#FFE0C7',
        '#1E9493',
        '#BBDEDE',
        '#FF99C3',
        '#FFE0ED'
      ]
    },
    doughnut: {
      labelStyle: {
        textAlign: 'center',
        fontSize: 14
      }
    },
    map: {
      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      defaultZoom: 9,
      maxZoom: 19,
      centerPosition: {
        latitude: 56.12,
        longitude: 93.0
      },
      defaultSize: 100
    },
    pie: {
      labelStyle: {
        textAlign: 'center',
        fontSize: 14
      }
    },
    statistic: {
      color: '#333366'
    }
  }
}

export default biConfig
