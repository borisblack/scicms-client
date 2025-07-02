import util from 'util'
import i18n from 'src/i18n'
import {RlsEntry, RlsIdentities} from 'src/types/bi'

const COMMA_REGEXP = /\s*,\s*/
const RLS_ENTRY_REGEXP = /^\s*(#)?\s*(?:'(.+)'|(\*))\s*:\s*(.+?)\s*$/
const RLS_IDENTITY_REGEXP = /^(\w+)|(@role:\w+)|(\*)$/

/**
 * Parses RLS rules from string. Rules examples:
 *  - 'value1': user1, user2, @role:ROLE_MANAGER - access to rows with the field value 'value1' is allowed to users user1, user2, and all users with the role ROLE_MANAGER;
 *  - *: user3, user4 - users user3, user4 are allowed to access a row with any field value;
 *  - # 'value2': user5 - commented-out (inactive) rule;
 *  - 'value3': * - access to rows with the field value 'value3' is allowed to users.
 *
 * @param rawRls RLS rules string
 * @returns Parsed RLS
 */
export function parseRls(rawRls: string): RlsEntry[] {
  if (!rawRls) return []

  const rls = rawRls
    .split('\n')
    .map(rule => rule.match(RLS_ENTRY_REGEXP))
    .filter(Boolean)
    .map(mg => {
      const matchGroups = mg as RegExpMatchArray
      const exp = matchGroups[0] // the whole expression
      const comment = matchGroups[1]
      const value = matchGroups[2] // value in single quotes
      const star = matchGroups[3] // * placeholder
      const rawIdentities = matchGroups[4]
      const rlsEntry: RlsEntry = {
        active: comment == null,
        value: value ?? star,
        ...parseIdentities(rawIdentities)
      }

      if (rlsEntry.value === '*' && rlsEntry.anyIdentity)
        throw new Error(util.format(i18n.t('Invalid rule: [%s]. Any value cannot be allowed for any identity.'), exp))

      return rlsEntry
    })
  // console.log('Parsed RLS', rls)

  return rls
}

/**
 * Serializes RLS rules into string.
 *
 * @param rls RLS rules to serialize
 * @returns serialized string
 */
export function serializeRls(rls: RlsEntry[]): string {
  return rls.map(serializeRlsEntry).join('\n')
}

function serializeRlsEntry(rls: RlsEntry): string {
  const {active, value, identities, anyIdentity} = rls
  if (value === '*' && anyIdentity) {
    throw new Error(
      util.format(i18n.t('Invalid rule: [%s]. Any value cannot be allowed for any identity.'), JSON.stringify(rls))
    )
  }

  if (anyIdentity && identities.length > 0) {
    throw new Error(
      util.format(
        i18n.t(
          'Invalid identities definition: [%s]. All identities are allowed, but the personal identities list is not empty.'
        ),
        JSON.stringify(identities)
      )
    )
  }

  const comment = active ? '' : '# '
  const valueExp = value === '*' ? value : `'${value}'`
  const identitiesExp = anyIdentity ? '*' : Array.from(identities).join(', ')

  return `${comment}${valueExp}: ${identitiesExp}`
}

function parseIdentities(rawIdentities: string): RlsIdentities {
  const identities = new Set<string>()
  let anyIdentity = false

  rawIdentities
    .split(COMMA_REGEXP)
    .map(rlsIdentity => rlsIdentity.match(RLS_IDENTITY_REGEXP))
    .filter(Boolean)
    .forEach(mg => {
      const matchGroups = mg as RegExpMatchArray
      const exp = matchGroups[0] // the whole expression
      const user = matchGroups[1]
      const role = matchGroups[2]
      const star = matchGroups[3]

      if (user) {
        identities.add(user)
      } else if (role) {
        identities.add(role)
      } else if (star) {
        if (anyIdentity) {
          throw new Error(
            util.format(i18n.t('Invalid identities definition: [%s]. Only one star placeholder is allowed.'), exp)
          )
        }

        if (identities.size > 0) {
          throw new Error(
            util.format(
              i18n.t(
                'Invalid identities definition: [%s]. All identities are allowed, but the personal identities list is not empty.'
              ),
              exp
            )
          )
        }

        anyIdentity = true
      }
    })

  const rlsIdentities = {
    identities: Array.from(identities),
    anyIdentity
  }

  // console.log('Parsed RLS identities', rlsIdentities)

  return rlsIdentities
}
