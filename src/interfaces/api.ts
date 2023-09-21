export interface ApiConfig {
    url: string,
    headers?: { 
      Cookie?: string
    }
}

export interface ApiParam {
    key: string,
    value: string | number
}

export interface TimeObject {
    startYear: string | number,
    startMonth: string | number,
    startDay: string | number,
    endYear: string | number,
    endMonth: string | number,
    endDay: string | number,
    yearsPast : string | number
}