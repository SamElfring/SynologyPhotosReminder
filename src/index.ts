import { get, getPhotos, getTagIds, getTimeObj, login, logout, urlBuilder } from "./api";
import { sendMails, sendMailsToAdmins } from "./email/send";
import { clearDir, stringToTimestamp } from "./helpers";
import { ApiParam, TimeObject } from "./interfaces/api";
import { settings } from "./settings";

/**
 * Search for photos and sends them to the recipients via email.
 * @returns {Promise<void>} A Promise that resolves when all tasks are completed.
 */
const makeReq = async (): Promise<void> => {
    // Login
    const sid: string = await login();

    // Check for photos on this date (random year)
    const timeObj: TimeObject = getTimeObj();

    const time: string = JSON.stringify({
        start_time: stringToTimestamp(timeObj.startYear + '-' + timeObj.startMonth + '-' + timeObj.startDay),
        end_time: stringToTimestamp(timeObj.endYear + '-' + timeObj.endMonth + '-' + timeObj.endDay)
    });

    console.log("Logged in sid = ", sid);

    let params: ApiParam[] = [
        { key: 'api', value: 'SYNO.FotoTeam.Browse.Item' },
        { key: 'method', value: 'list_with_filter' },
        { key: 'offset', value: '0' },
        { key: 'limit', value: '10' },
        { key: 'additional', value: '["thumbnail"]' },
        { key: 'version', value: '1' },
        { key: 'time', value: `[${time}]` },
        { key: 'item_type', value: '[0]' },
        { key: '_sid', value: sid }
    ];

    // Get tags
    const tags: string[] = await getTagIds(sid);
    
    if (tags.length > 0) {
        params.push({ key: 'general_tag', value: `[${tags}]` });
        params.push({ key: 'general_tag_policy', value: 'or' });
    }

    const url: string = urlBuilder(settings.api.url, settings.api.endpoint, params);

    let photos: any[] = [];
    try {
        const res = await get(url);

        if (res.data.data?.list)
            photos = res.data.data.list;
    } catch (err) {
        console.log(err);
    }

    if (photos.length > 0) {
        await getPhotos(sid, photos);

        await sendMails(`${timeObj.startYear}-${timeObj.startMonth}-${timeObj.startDay}`, timeObj);

        console.log('Clearing temp dir');
        clearDir('./src/temp');
    } else {
        console.log('No photo found');

        await sendMailsToAdmins(timeObj);
    }

    const loggedOut: boolean = await logout();

    console.log('Logged out = ', loggedOut);
}

// Execute the function to start the process
makeReq();
