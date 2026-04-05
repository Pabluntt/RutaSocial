import { HelpPoint, HelpedPerson } from "../models/HelpPoint"

export type TPeopleHelpedBackend = {
    age: number
    gender: string
    name: string
    date?: Date
}

export type THelpPointBackend = {
    _id: string
    route_id: string
    coords: number[]
    date_register: string
    people_helped: TPeopleHelpedBackend
    author_id: string
}

export type THelpPointCreateRequest = Omit<THelpPointBackend, '_id' | 'date_register'>
export type THelpPointUpdateRequest = Pick<THelpPointBackend, '_id' | 'people_helped'>

export function MapHelpedPersonFromBackend(data: Partial<TPeopleHelpedBackend>): HelpedPerson {
    const person: Partial<HelpedPerson> = {
        age: data.age,
        gender: data.gender,
        name: data.name
    };

    Object.entries(person).forEach(([key, value]) => {
        if (value === undefined) {
            throw new Error(`Missing required field in HelpedPerson: ${key}`)
        }
    })
    return person as HelpedPerson
}

export function MapHelpPointFromBackend(data: Partial<THelpPointBackend>): HelpPoint {
    const point: Partial<HelpPoint> = {
        id: data._id,
        routeID: data.route_id,
        authorID : data.author_id,
        coords: data.coords,
        dateRegister: data.date_register ? new Date(data.date_register) : undefined,
        peopleHelped: data.people_helped ? MapHelpedPersonFromBackend(data.people_helped) : undefined,
        disabled: false 
    }

    Object.entries(point).forEach(([key, value]) => {
        if (value === undefined) {
            throw new Error(`Missing required field in HelpPoint: ${key}`);
        }
    })
    return point as HelpPoint
}

export function MapHelpPointToCreateRequest(
    data: Omit<HelpPoint, 'id' | 'dateRegister'>
): THelpPointCreateRequest {
    return {
        route_id: data.routeID,
        coords: data.coords,
        people_helped: {
            age: data.peopleHelped.age,
            gender: data.peopleHelped.gender,
            name: data.peopleHelped.name
        },
        author_id: data.authorID, 
    }
}

export function MapHelpPointToUpdateRequest(
    data: HelpPoint
): THelpPointUpdateRequest {
    return {
        _id: data.id,
        people_helped: {
            age: data.peopleHelped.age,
            gender: data.peopleHelped.gender,
            name: data.peopleHelped.name,
            date: new Date()
        },
    }
}
