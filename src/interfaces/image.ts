export interface Photo {
    id: number,
    filename: string,
    filesize: number,
    time: number,
    indexed_time: number,
    owner_user_id: number,
    folder_id: number,
    type: string,
    additional?: {}
}
