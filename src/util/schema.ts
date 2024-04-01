import {Attribute} from 'src/types/schema'

export const sortAttributes = (attributes: Record<string, Attribute>): Record<string, Attribute> =>
  Object.entries(attributes)
    .sort(([ka, va], [kb, vb]) => {
      if (va.sortOrder == null && vb.sortOrder == null)
        return 0

      if (va.sortOrder == null && vb.sortOrder != null)
        return 1

      if (va.sortOrder != null && vb.sortOrder == null)
        return -1

      return (va.sortOrder ?? 0) - (vb.sortOrder ?? 0)
    })
    .reduce((obj, [k, v]) => {
      obj[k] = v
      return obj
    }, {} as Record<string, Attribute>)