import {getAppProperties} from 'src/config/util'
import * as translations from './translations'

export default function customTranslate(template, replacements) {
    const appProps = getAppProperties()
    replacements = replacements || {};
    const translation = translations[appProps.i18nLng] || {}

    // Translate
    template = translation[template] || template;

    // Replace
    return template.replace(/{([^}]+)}/g, (_, key) => replacements[key] || '{' + key + '}')
}