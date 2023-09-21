# Synology Photos Reminder

### Synology Photo Retrieval and Email Automation

This Node.js application automates the process of searching for photos stored on your Synology NAS server, finding pictures captured on the current day but a random number of years ago, and delivering them to your email. In essence, it retrieves nostalgic photos from the past and presents them to you via email.

## Features

- **Photo Search**: The application queries your Synology NAS server to locate photos captured on the same day but a random number of years ago.

- **Date Generation**: It intelligently generates a date that corresponds to the same day but in a previous year, providing a nostalgic touch to the photo selection.

- **Email Delivery**: The retrieved photos are seamlessly packaged and sent to your email address for convenient access.

- **Text Addition**: The application adds the date the image was taken on the image itself.

- **Customization**: You can configure various settings such as specific tags to search, a minimum and maximum year and more through environment variables.

## Getting Started

To get started with this application, follow these steps:

1. **Prerequisites**: Ensure you have Node.js and npm (Node Package Manager) installed on your system.

2. **Configuration**: Customize the application's behavior by setting environment variables. Configure your Synology NAS access details, email credentials, and other preferences.

3. **Installation**: Install project dependencies using the following command:
   ```bash
   npm install
   ```

4. **Running the Application**: Start the application with the following command:
    ```bash
    npm start
    ```

    Enjoy Your Photos: Sit back and relax as the application retrieves nostalgic photos and delivers them to your email inbox.

## Configuration
The application relies on environment variables for configuration. You can customize the following settings:

- **Synology NAS Access**: Provide your Synology NAS account credentials, server URL, and API endpoints.

- **Email Configuration**: Set your email sender, password, language preference, and recipient addresses.

- **Date and Year Range**: Define the minimum and maximum years for date generation.

- **Additional Options**: Explore additional settings to tailor the application to your needs.

## Contributing
Please feel free to share your ideas and suggestions.

## License
This project is licensed under the MIT License.
