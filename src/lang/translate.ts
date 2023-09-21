import i18next from "i18next";
import { TimeObject } from "../interfaces/api";
import { settings } from "../settings";
import { translations } from "./translations";

/**
 * Initializes the i18next internationalization library with the specified language and resources.
 */
i18next.init({
    lng: settings.email.lang,
    resources: translations
});

/**
 * Translates a given key to the specified language.
 * @param {string} key - The translation key.
 * @param {any} [options] - Additional translation options.
 * @returns {string} - The translated string.
 */
export const translate = (key: string, options?: any): string => {
    if (options)
        return i18next.t(key, options).toString();

    return i18next.t(key);
}

/**
 * Translates a text for years past using the TimeObject data.
 * @param {TimeObject} timeObj - The TimeObject containing time-related data.
 * @returns {string} - The translated text.
 */
export const translateYearsPastText = (timeObj: TimeObject): string => {
    const date = new Date(`2000/${timeObj.startMonth}/${timeObj.startDay}`);

    const month = date.toLocaleString(settings.email.lang, { month: 'long' });

    return translate('yearspast', {
        "years": timeObj.yearsPast,
        month,
        "day": timeObj.startDay
    });
}
