import _ from 'lodash'
import {AppConfig, PropertyKey, appConfig} from '.'
import biConfig, {BiConfig, BiPropertyKey} from './bi'
import menuConfig, {MenuConfig} from './menu'
import {store} from 'src/store'
import {selectProperties} from 'src/features/registry/registrySlice'
import {PropertyMap} from 'src/services/property'

const biPathPattern = /^bi\.(.+)$/

function getStoreProperties() {
  return selectProperties(store.getState())
}

function getLocalProperty(path: string): any {
  if (path === PropertyKey.MENU)
    return menuConfig

  const biPathMatches = path.match(biPathPattern)
  if (biPathMatches)
    return _.get(biConfig, biPathMatches[1])

  return _.get(appConfig, path)
}

export function getProperty(path: string, propertySource: PropertyMap = getStoreProperties()): any {
  return propertySource[path]?.value ?? getLocalProperty(path)
}

export const getAppProperties = (propertySource: PropertyMap = getStoreProperties()): AppConfig => ({
  coreVersion: getProperty(PropertyKey.CORE_VERSION, propertySource),
  dateTime: {
    timeZone: getProperty(PropertyKey.DATE_TIME_TIME_ZONE, propertySource),
    luxonDisplayDateFormatString: getProperty(PropertyKey.DATE_TIME_LUXON_DISPLAY_DATE_FORMAT_STRING, propertySource),
    luxonDisplayTimeFormatString: getProperty(PropertyKey.DATE_TIME_LUXON_DISPLAY_TIME_FORMAT_STRING, propertySource),
    luxonDisplayDateTimeFormatString: getProperty(PropertyKey.DATE_TIME_LUXON_DISPLAY_DATE_TIME_FORMAT_STRING, propertySource),
    momentDisplayDateFormatString: getProperty(PropertyKey.DATE_TIME_MOMENT_DISPLAY_DATE_FORMAT_STRING, propertySource),
    momentDisplayTimeFormatString: getProperty(PropertyKey.DATE_TIME_MOMENT_DISPLAY_TIME_FORMAT_STRING, propertySource),
    momentDisplayDateTimeFormatString: getProperty(PropertyKey.DATE_TIME_MOMENT_DISPLAY_DATE_TIME_FORMAT_STRING, propertySource)
  },
  query: {
    minPageSize: getProperty(PropertyKey.QUERY_MIN_PAGE_SIZE, propertySource),
    defaultPageSize: getProperty(PropertyKey.QUERY_DEFAULT_PAGE_SIZE, propertySource),
    maxPageSize: getProperty(PropertyKey.QUERY_MAX_PAGE_SIZE, propertySource)
  },
  mutation: {
    copyCollectionRelations: getProperty(PropertyKey.MUTATION_COPY_COLLECTION_RELATIONS, propertySource),
    deletingStrategy: getProperty(PropertyKey.MUTATION_DELETING_STRATEGY, propertySource)
  },
  ui: {
    dataGrid: {
      colWidth: getProperty(PropertyKey.UI_DATAGRID_COL_WIDTH, propertySource),
      maxTextLength: getProperty(PropertyKey.UI_DATAGRID_MAX_TEXT_LENGTH, propertySource)
    },
    form: {
      fieldWidth: getProperty(PropertyKey.UI_FORM_FIELD_WIDTH, propertySource),
      textAreaRows: getProperty(PropertyKey.UI_FORM_TEXT_AREA_ROWS, propertySource),
      editorHeight: getProperty(PropertyKey.UI_FORM_EDITOR_HEIGHT, propertySource)
    },
    split: {
      defaultSplitterColors: {
        color: getProperty(PropertyKey.SPLIT_DEFAULT_SPLITTER_COLORS_COLOR, propertySource),
        hover: getProperty(PropertyKey.SPLIT_DEFAULT_SPLITTER_COLORS_HOVER, propertySource),
        drag: getProperty(PropertyKey.SPLIT_DEFAULT_SPLITTER_COLORS_DRAG, propertySource)
      },
      splitterSize: getProperty(PropertyKey.SPLIT_SPLITTER_SIZE, propertySource)
    }
  }
})

export const getMenuProperty = (propertySource: PropertyMap = getStoreProperties()): MenuConfig =>
  getProperty(PropertyKey.MENU, propertySource)

export const getBiProperties = (propertySource: PropertyMap = getStoreProperties()): BiConfig => ({
  cols: getProperty(BiPropertyKey.COLS, propertySource),
  rowHeight: getProperty(BiPropertyKey.ROW_HEIGHT, propertySource),
  defaultDashType: getProperty(BiPropertyKey.DEFAULT_DASH_TYPE, propertySource),
  defaultDashHeight: getProperty(BiPropertyKey.DEFAULT_DASH_HEIGHT, propertySource),
  defaultSelectorHeight: getProperty(BiPropertyKey.DEFAULT_SELECTOR_HEIGHT, propertySource),
  defaultSelectorType: getProperty(BiPropertyKey.DEFAULT_SELECTOR_TYPE, propertySource),
  defaultTextHeight: getProperty(BiPropertyKey.DEFAULT_TEXT_HEIGHT, propertySource) as number,
  defaultPageSize: getProperty(BiPropertyKey.DEFAULT_PAGE_SIZE, propertySource) as number,
  defaultRefreshIntervalSeconds: getProperty(BiPropertyKey.DEFAULT_REFRESH_INTERVAL_SECONDS, propertySource),
  locale: getProperty(BiPropertyKey.LOCALE, propertySource),
  maxPageSize: getProperty(BiPropertyKey.MAX_PAGE_SIZE, propertySource),
  minRefreshIntervalSeconds: getProperty(BiPropertyKey.MIN_REFRESH_INTERVAL_SECONDS, propertySource),
  openFirstDashboard: getProperty(BiPropertyKey.OPEN_FIRST_DASHBOARD, propertySource),
  fractionDigits: getProperty(BiPropertyKey.FRACTION_DIGITS, propertySource),
  percentFractionDigits: getProperty(BiPropertyKey.PERCENT_FRACTION_DIGITS, propertySource),
  dateTime: {
    dateFormatString: getProperty(BiPropertyKey.DATE_TIME_DATE_FORMAT_STRING, propertySource),
    timeFormatString: getProperty(BiPropertyKey.DATE_TIME_TIME_FORMAT_STRING, propertySource),
    dateTimeFormatString: getProperty(BiPropertyKey.DATE_TIME_DATE_TIME_FORMAT_STRING, propertySource)
  },
  dash: {
    all: {
      axisLabelStyle: getProperty(BiPropertyKey.DASH_ALL_AXIS_LABEL_STYLE, propertySource),
      colors10: getProperty(BiPropertyKey.DASH_ALL_COLORS_10, propertySource),
      colors20: getProperty(BiPropertyKey.DASH_ALL_COLORS_20, propertySource),
      legend: {
        label: {
          style: getProperty(BiPropertyKey.DASH_ALL_LEGEND_LABEL_STYLE, propertySource)
        },
        itemName: {
          style: getProperty(BiPropertyKey.DASH_ALL_LEGEND_ITEM_NAME_STYLE, propertySource)
        }
      }
    },
    doughnut: {
      labelStyle: {
        textAlign: getProperty(BiPropertyKey.DASH_DOUGHNUT_LABEL_STYLE_TEXT_ALIGN, propertySource),
        fontSize: getProperty(BiPropertyKey.DASH_DOUGHNUT_LABEL_STYLE_FONT_SIZE, propertySource)
      }
    },
    map: {
      urlTemplate: getProperty(BiPropertyKey.DASH_MAP_URL_TEMPLATE, propertySource),
      defaultZoom: getProperty(BiPropertyKey.DASH_MAP_DEFAULT_ZOOM, propertySource),
      maxZoom: getProperty(BiPropertyKey.DASH_MAP_MAX_ZOOM, propertySource),
      centerPosition: {
        latitude: getProperty(BiPropertyKey.DASH_MAP_CENTER_POSITION_LATITUDE, propertySource),
        longitude: getProperty(BiPropertyKey.DASH_MAP_CENTER_POSITION_LONGITUDE, propertySource)
      },
      defaultSize: getProperty(BiPropertyKey.DASH_MAP_DEFAULT_SIZE, propertySource)
    },
    pie: {
      labelStyle: {
        textAlign: getProperty(BiPropertyKey.DASH_PIE_LABEL_STYLE_TEXT_ALIGN, propertySource),
        fontSize: getProperty(BiPropertyKey.DASH_PIE_LABEL_STYLE_FONT_SIZE, propertySource)
      }
    },
    statistic: {
      color: getProperty(BiPropertyKey.DASH_STATISTIC_COLOR, propertySource)
    }
  }
})