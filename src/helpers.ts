import fs from 'fs';

/**
 * Saves an image to a specified path.
 * @param {string} path - The path where the image will be saved.
 * @param {any} imgBuffer - The image data as a buffer.
 * @returns {void}
 */
export const saveImage = (path: string, imgBuffer: any): void => {
    if (!fs.existsSync("./src/temp"))
        fs.mkdirSync("./src/temp");

    try {
        fs.writeFileSync(path, imgBuffer);
        console.log(`Downloaded image: ${path}`);
    } catch (err) {
        console.log(err);
    }
}

/**
 * Converts a string date to a Unix timestamp.
 * @param {string} strDate - The string date to convert.
 * @returns {number} - The Unix timestamp.
 */
export const stringToTimestamp = (strDate: string): number => (Date.parse(strDate) / 1000);

/**
 * Generates a random year within a specified range.
 * @param {number} min - The minimum year.
 * @param {number} max - The maximum year.
 * @returns {number} - A random year.
 */
export const getRandomYear = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min);

/**
 * Clears all files in a directory.
 * @param {string} dir - The directory path to clear.
 * @returns {void}
 */
export const clearDir = (dir: string): void => fs.readdirSync(dir).forEach(f => fs.rmSync(`${dir}/${f}`));
