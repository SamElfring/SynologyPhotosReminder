export interface Settings {
    email: {
        sender: string,
        password: string,
        lang: string
    },
    synology: {
        account: string, 
        password: string,
        tags: string[],
        minYear: string,
        maxYear: string,
        fixedDate: string,
        recipients: string[],
        adminRecipients: string[]
    },
    api: {
        url: string,
        endpoint: string,
        authendpoint : string
    }
}
