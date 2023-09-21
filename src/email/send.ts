import nodemailer from "nodemailer";
import fs from 'fs';
import { EmailAttachment, EmailConfig, EmailOptions } from '../interfaces/email';
import { settings } from '../settings';
import { addTextToImage } from './image';
import { TimeObject } from '../interfaces/api';
import { translate, translateYearsPastText } from '../lang/translate';

/**
 * Email configuration.
 */
export const config: EmailConfig = {
    service: 'gmail',
    sender_email: settings.email.sender,
    sender_name: 'Elfring Synology App',
    password: settings.email.password
}

/**
 * Nodemailer transporter for sending emails.
 */
const transporter: nodemailer.Transporter = nodemailer.createTransport({
    service: config.service,
    auth: {
        user: config.sender_email,
        pass: config.password
    },
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * Sends a new email with optional attachments.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The email subject.
 * @param {string} content - The email content in HTML format.
 * @param {EmailAttachment[]} [attachments] - An array of email attachments.
 * @returns {Promise<void>} A Promise that resolves when the email is sent.
 */
export const newMail = async (to: string, subject: string, content: string, attachments?: EmailAttachment[]): Promise<void> => {
    let mailOptions: EmailOptions = {
        from: config.sender_name,
        to,
        subject,
        html: content
    }

    if (attachments)
        mailOptions.attachments = attachments;

    try {
        await transporter.sendMail(mailOptions);
    }
    catch (err) {
        console.log(err);
    }
}

/**
 * Sends emails with photos to recipients.
 * @param {string} photoDate - The date associated with the photos.
 * @param {TimeObject} timeObj - The time object.
 * @returns {Promise<void>} A Promise that resolves when the emails are sent.
 */
export const sendMails = async (photoDate: string, timeObj: TimeObject): Promise<void> => {
    console.log('Creating requests');

    let photos: string[] = [];

    const tempDir: string[] = fs.readdirSync('./src/temp');

    for (let i = 0; i < tempDir.length; i++)
        photos.push(tempDir[i]);

    if (photos.length > 0)
        console.log('Photos in temp dir: ' + photos);
    else
        return console.log('No photos in temp directory');

    let attachments: EmailAttachment[] = [];

    const translatedString = translateYearsPastText(timeObj);

    let html: string = `<h2>${translatedString}</h2>`;

    for (let i = 0; i < photos.length; i++) {
        const photoName: string = photos[i];

        // Add text to image
        await addTextToImage(`./src/temp/${photoName}`, photoDate);

        const cid: string = photoName.split('.')[0];

        attachments.push({ filename: photoName, path: `./src/temp/${photoName}`, cid });

        html += `<div><p>Name: ${photoName}</p><img src="cid:${cid}"/></div>`;
    }

    console.log('Sending mail(s)');

    // Getting recipients
    const recipients: string[] = crossReferenceAdminsAndRecipients();

    if (recipients.length <= 0)
        return console.log('COULD NOT SEND MAIL BECAUSE THERE ARE NO RECIPIENTS IN .env');

    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];

        if (recipient.length <= 0)
            return;

        await newMail(recipient, translatedString, html, attachments);

        console.log('Send mail to ' + recipient);
    }
}

/**
 * Sends emails to admin recipients.
 * @param {TimeObject} timeObj - The time object.
 * @returns {Promise<void>} A Promise that resolves when the emails are sent.
 */
export const sendMailsToAdmins = async (timeObj: TimeObject): Promise<void> => {
    if (settings.synology.adminRecipients.length <= 0)
        return;

    console.log('Sending mails to admin');

    const translatedString = translateYearsPastText(timeObj);

    const html: string = `<h2>${translatedString}</h2><h2>${translate('no photos')}</h2>`;

    const recipients: string[] = settings.synology.adminRecipients;

    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];

        if (recipient.length <= 0)
            return;

        await newMail(recipient, translatedString, html);

        console.log('Send mail to ' + recipient);
    }
}

/**
 * Cross-references admin and regular recipients to determine the final list of recipients.
 * @returns {string[]} - An array of recipient email addresses.
 */
const crossReferenceAdminsAndRecipients = (): string[] => {
    const admins = settings.synology.adminRecipients;
    const recipients = settings.synology.recipients;

    if (recipients.length <= 0 && admins.length <= 0) {
        console.log("No recipients!")
        return [];
    }
    else if (recipients.length <= 0)
        return admins;

    return recipients.filter(value => admins.includes(value));
}
