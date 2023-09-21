import Jimp from "jimp";

/**
 * Adds text to an image and saves it.
 * @param {string} path - The path of the image to which text will be added.
 * @param {string} text - The text to add to the image.
 * @returns {Promise<void>} A Promise that resolves when the text is added and the image is saved.
 */
export const addTextToImage = async (path: string, text: string): Promise<void> => {
    try {
        const image = await Jimp.read(path); // Reading image

        const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE); // Loading font

        // Adding text to the image
        image.print(font, 10, (image.getHeight() - 25), text);

        await image.writeAsync(path); // Saving the modified image

        console.log('Added text to image');
    } catch (err) {
        console.log(err);
    }
}
