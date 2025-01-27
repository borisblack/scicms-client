import _ from 'lodash'

export const exportWinFeatures = 'width=1024,height=768,top=50,left=50'

export const exportWinStyle = `
    body, table {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
        font-size: 14px;
    }
    table {
        border-spacing: 0;
        border-collapse: collapse;
    }
    table tr > th, table tr > td {
        border: 1px solid #999;
        padding: 4px 8px;
    }
    table tr > th {
        text-align: left;
    }
`

export function renderValue(value: any) {
  if (value == null || value === false) return ''

  if (value === true) return 'x'

  if (_.isObject(value)) {
    if ('data' in value) {
      if ((value as any).data == null) return ''

      return JSON.stringify((value as any).data)
    }

    return JSON.stringify(value)
  }

  return value
}
