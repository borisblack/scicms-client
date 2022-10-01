import * as translations from './translations'
import appConfig from '../../config'

export default function customTranslate(template, replacements) {
    replacements = replacements || {};
    const translation = translations[appConfig.diagramTranslation] || {}

    // Translate
    template = translation[template] || template;

    // Replace
    return template.replace(/{([^}]+)}/g, (_, key) => replacements[key] || '{' + key + '}')
}