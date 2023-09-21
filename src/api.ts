import { ApiParam, TimeObject } from "./interfaces/api";
import { getRandomYear, saveImage } from "./helpers";
import { DatesUsed } from "./interfaces/datesused";
import { settings } from "./settings";
import https from 'https';
import axios from 'axios';
import fs from 'fs';

/**
 * HTTP Agent with rejectUnauthorized set to false.
 */
const agent = new https.Agent({
    rejectUnauthorized: false
});
axios.defaults.httpsAgent = agent;

/**
 * Asynchronously makes an HTTP GET request to the specified URL.
 * @param {string} url - The URL to make the GET request to.
 * @returns {Promise<any>} - A Promise that resolves with the response data or rejects with an error.
 */
export const get = async (url: string): Promise<any> => {
    return await axios.get(url)
        .then(res => res)
        .catch(err => err);
}

/**
 * Asynchronously makes an HTTP GET request to retrieve an image from the specified URL.
 * @param {string} url - The URL to fetch the image from.
 * @returns {Promise<any>} - A Promise that resolves with the image data or rejects with an error.
 */
export const getImage = async (url: string): Promise<any> => {
    return await axios.get(url, { responseType: 'arraybuffer' })
        .then(res => res)
        .catch(err => err);
}

/**
 * Builds a URL by combining a base URL, an endpoint, and an array of parameters.
 * @param {string} baseURL - The base URL.
 * @param {string} endpoint - The endpoint to append to the base URL.
 * @param {ApiParam[]} [params=[]] - An array of key-value pairs representing URL parameters.
 * @returns {string} - The constructed URL.
 */
export const urlBuilder = (baseURL: string, endpoint: string, params: ApiParam[] = []): string => {
    // Check if there are any parameters to include
    if (params.length === 0)
        return `${baseURL}${endpoint}`;

    // Build the parameter string
    const paramString = '?' + params.map(param => `${param.key}=${param.value}`).join('&');

    // Combine all parts to create the final URL
    const fullURL = `${baseURL}${endpoint}${paramString}`;

    return fullURL;
}

/**
 * Asynchronously logs in and retrieves a session ID (SID).
 * @returns {Promise<string>} - A Promise that resolves with the session ID (SID) or rejects with an error.
 */
export const login = async (): Promise<string> => {
    const params: ApiParam[] = [
        { key: 'api', value: 'SYNO.API.Auth' },
        { key: 'method', value: 'login' },
        { key: 'version', value: '3' },
        { key: 'account', value: settings.synology.account },
        { key: 'passwd', value: settings.synology.password }
    ];

    const url = urlBuilder(settings.api.url, settings.api.authendpoint, params);

    let sid: string = '-1';

    try {
        const res = await get(url);

        if (res.data.data?.sid)
            sid = res.data.data.sid;
    } catch (err) {
        console.log(err);
    }

    return sid;
}

/**
 * Asynchronously logs out and invalidates the session.
 * @returns {Promise<boolean>} - A Promise that resolves with `true` if logout was successful, `false` otherwise.
 */
export const logout = async (): Promise<boolean> => {
    const params: ApiParam[] = [
        { key: 'api', value: 'SYNO.API.Auth' },
        { key: 'method', value: 'logout' },
        { key: 'version', value: '3' }
    ];

    const url = urlBuilder(settings.api.url, settings.api.authendpoint, params);

    let success: boolean = false;

    try {
        const res = await get(url);

        if (res.data?.success)
            success = res.data.success;
    } catch (err) {
        console.log(err);
    }

    return success;
}

/**
 * Asynchronously retrieves the IDs of tags associated with photos.
 * @param {string} sid - The session ID (SID) for authentication.
 * @returns {Promise<string[]>} - A Promise that resolves with an array of tag IDs or rejects with an error.
 */
export const getTagIds = async (sid: string): Promise<string[]> => {
    const params: ApiParam[] = [
        { key: 'api', value: 'SYNO.FotoTeam.Browse.GeneralTag' },
        { key: 'method', value: 'list' },
        { key: 'version', value: '1' },
        { key: 'offset', value: '0' },
        { key: 'limit', value: '5000' },
        { key: '_sid', value: sid }
    ];

    const url: string = urlBuilder(settings.api.url, settings.api.endpoint, params);

    console.log("Looking for tags", settings.synology.tags);

    let tagIds: string[] = [];
    let tags: string[] = [];

    try {
        const res = await get(url);

        if (res.data.data?.list) {
            tags = res.data.data.list;

            tags.forEach((tag: any): void => {
                if (settings.synology.tags.indexOf(tag.name) > -1)
                    tagIds.push(tag.id); // Store the id of this tag
            });

            console.log('found id(s)', tagIds);
        }
    } catch (err) {
        console.log(err);
    }

    return tagIds;
}

/**
 * Generates a start year for searching photos.
 * @param {DatesUsed} used - Object containing dates that have been used.
 * @param {Date} date - The current date.
 * @param {number} runId - The number of times this function has been called recursively.
 * @returns {number} - The generated start year.
 */
export const generateStartYear = (used: DatesUsed, date: Date, runId: number): number => {
    console.log(`GenerateStartYear called runId = ${runId}`);
    let year: number;

    if (settings.synology.fixedDate) {
        // If date is fixed always return that
        console.log("GenerateStartYear using fixed date");

        return (date.getFullYear());
    } else {
        // Generate a year
        year = getRandomYear(parseInt(settings.synology.minYear), Math.min(parseInt(settings.synology.maxYear), date.getFullYear() - 1));
        let day: string = String(date.getDate()).padStart(2, '0');
        let month: string = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 to month because months are 0 indexed.

        console.log(`GenerateStartYear random year = ${year}`);

        // Check if it is already used
        if (used.dates.indexOf(`${year}-${month}-${day}`) < 0) {
            // This year has never been used
            console.log(`GenerateStartYear found unused year = ${year}`);
            return year;
        } else {
            if (runId > 100) {
                console.log('Maximum tries of finding unused date!, returning ${year}');
                return year;
            } else {
                // Call this function again
                console.log(`GenerateStartYear  year = ${year} already used, retry`);
                return generateStartYear(used, date, runId + 1);
            }
        }
    }
}

/**
 * Gets the start date for searching photos, considering used dates.
 * @returns {Date} - The start date for searching photos.
 */
export const getStartDate = (): Date => {
    // App uses today's day and month
    // However we want to avoid that a random year which has already been chosen to be used
    if (settings.synology.fixedDate)
        return new Date(settings.synology.fixedDate);

    let allDates: DatesUsed = {
        dates: []
    };

    try {
        let data: string = fs.readFileSync('./datesused.json', 'utf-8');

        if (data) {
            let usedDates: DatesUsed = JSON.parse(data);
            allDates.dates.push.apply(allDates.dates, usedDates.dates);
            console.log('Dates used read');
        } else {
            console.log('Dates used file empty');
        }
    } catch (err) {
        console.log('Dates used file not found');
    }

    // Get an unused year
    let today: Date = new Date();

    let year: number = generateStartYear(allDates, today, 0);

    today.setFullYear(year);
    const day: string = String(today.getDate()).padStart(2, '0');
    const month: string = String(today.getMonth() + 1).padStart(2, '0');

    allDates.dates.push(`${year}-${month}-${day}`);

    // Now save the updated array
    try {
        let data = JSON.stringify(allDates);

        fs.writeFileSync('./datesused.json', data);
    } catch (err) {
        console.log('Could not write dates used file');
    }

    return today;
}

/**
 * Gets a TimeObject representing the search time frame.
 * @returns {TimeObject} - The TimeObject with start and end date information.
 */
export const getTimeObj = (): TimeObject => {
    const searchDate: Date = getStartDate(); // Unused date to search for photos

    const today: Date = new Date(); // todays date
    const searchEndDate: Date = new Date(searchDate.valueOf() + 24 * 60 * 60 * 1000);

    const yearsPast = today.getFullYear() - searchDate.getFullYear();

    const day: string = String(searchDate.getDate()).padStart(2, '0');
    const month: string = String(searchDate.getMonth() + 1).padStart(2, '0'); // Add 1 to month because months are 0 indexed.

    console.log(`Looking for photos on: ${searchDate.getFullYear()}-${month}-${day}`);

    return {
        startYear: searchDate.getFullYear(),
        startMonth: searchDate.getMonth() + 1,
        startDay: searchDate.getDate(),
        endYear: searchEndDate.getFullYear(),
        endMonth: searchEndDate.getMonth() + 1,
        endDay: searchEndDate.getDate(),
        yearsPast: yearsPast
    }
}

/**
 * Downloads photos using their URLs and saves them to the specified directory.
 * @param {string} sid - The session ID (SID) for authentication.
 * @param {any[]} photos - An array of photo objects with URLs.
 */
export const getPhotos = async (sid: string, photos: any[]) => {
    for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];

        const t: any = photo.additional.thumbnail;

        const imageParams: ApiParam[] = [
            { key: '_sid', value: sid },
            { key: 'api', value: 'SYNO.FotoTeam.Thumbnail' },
            { key: 'method', value: 'get' },
            { key: 'version', value: '1' },
            { key: 'cache_key', value: t.cache_key },
            { key: 'id', value: `${t.unit_id}` },
            { key: 'size', value: `m` },
            { key: 'type', value: 'unit' }
        ];

        const imageUrl: string = urlBuilder(settings.api.url, settings.api.endpoint, imageParams);

        try {
            const res: any = await getImage(imageUrl);

            saveImage(`./src/temp/${photo.filename}`, res.data);
        } catch (err) {
            console.log(err);
        }
    }
}
