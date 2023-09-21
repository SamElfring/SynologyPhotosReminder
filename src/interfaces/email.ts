export interface EmailConfig {
    service: string,
    sender_email: string,
    sender_name: string,
    password: string | undefined
}

export interface EmailOptions {
    from: string,
    to: string,
    subject: string,
    text?: string,
    html?: string,
    attachments?: EmailAttachment[]
}

export interface EmailAttachment {
    filename: string,
    path: string,
    cid: string
}
