import { Settings } from "./interfaces/settings";
import dotenv from "dotenv";
dotenv.config();

/**
 * JSON-serialized application settings.
 * @type {string}
 */
const appSettings: string = JSON.stringify({
    "email": {
        "sender": process.env.EMAIL_SENDER,
        "password": process.env.EMAIL_PASSWORD,
        "lang": process.env.EMAIL_LANG ? process.env.EMAIL_LANG : 'en'
    },
    "synology": {
        "account": process.env.SYNOLOGY_ACCOUNT,
        "password": process.env.SYNOLOGY_PASSWORD,
        "tags": process.env.PHOTOTAGS ? process.env.PHOTOTAGS.split(', ') : '',
        "minYear": process.env.MINYEAR,
        "maxYear": process.env.MAXYEAR,
        "fixedDate" : process.env.FIXEDDATE,
        "recipients": process.env.RECIPIENTS ? process.env.RECIPIENTS.split(', ') : '',
        "adminRecipients": process.env.ADMIN_RECIPIENTS ? process.env.ADMIN_RECIPIENTS.split(', ') : ''
    },
    "api": {
        "url": "https://192.168.178.248:5001",
        "endpoint": "/photo/webapi/entry.cgi",
        "authendpoint" : "/photo/webapi/auth.cgi"
    }
});

/**
 * Application settings parsed from JSON.
 * @type {Settings}
 */
export const settings: Settings = JSON.parse(appSettings);
