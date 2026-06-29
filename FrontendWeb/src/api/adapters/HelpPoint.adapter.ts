import { HelpPoint, HelpedPerson } from "../models/HelpPoint"

export type TPeopleHelpedBackend = {
    age: number
    gender: string
    name: string
    rut?: string
    date?: Date
    persona_id?: string
}

export type THelpPointBackend = {
    _id: string
    route_id: string
    coords: number[]
    date_register: string
    comment?: string
    people?: TPeopleHelpedBackend[]
    people_helped?: TPeopleHelpedBackend
    persona_ids?: string[]
    author_id: string
}

export type THelpPointCreateRequest = Omit<THelpPointBackend, '_id' | 'date_register'>
export type THelpPointUpdateRequest = THelpPointCreateRequest & Pick<THelpPointBackend, '_id'>

export function MapHelpedPersonFromBackend(data: Partial<TPeopleHelpedBackend>): HelpedPerson {
    const requiredFields = ['age', 'gender', 'name'] as const;
    const optionalFields = ['rut'] as const;
    
    const person: Partial<HelpedPerson> = {
        age: data.age,
        gender: data.gender,
        name: data.name,
        rut: data.rut
    };

    requiredFields.forEach((key) => {
        if (person[key] === undefined) {
            throw new Error(`Missing required field in HelpedPerson: ${key}`)
        }
    })
    
    return person as HelpedPerson
}

export function MapHelpPointFromBackend(data: Partial<THelpPointBackend>): HelpPoint {
    const peopleFromBackend = data.people?.length ? data.people : data.people_helped ? [data.people_helped] : []
    const personaIDs = data.persona_ids || []
    const mappedPeople = peopleFromBackend.map((person, index) => ({
        ...MapHelpedPersonFromBackend(person),
        personaID: personaIDs[index],
    }))

    const point: Partial<HelpPoint> = {
        id: data._id,
        routeID: data.route_id,
        authorID : data.author_id,
        coords: data.coords,
        dateRegister: data.date_register ? new Date(data.date_register) : new Date(),
        comment: data.comment ?? '',
        people: mappedPeople,
        peopleHelped: mappedPeople[0],
        personaID: personaIDs[0],
        disabled: false 
    }

    const requiredFields = ['id', 'routeID', 'authorID', 'coords', 'dateRegister', 'comment', 'people', 'disabled'] as const;
    
    requiredFields.forEach((key) => {
        if (point[key] === undefined) {
            throw new Error(`Missing required field in HelpPoint: ${key}`);
        }
    })
    return point as HelpPoint
}

export function MapHelpPointToCreateRequest(
    data: Omit<HelpPoint, 'id' | 'dateRegister'>
): THelpPointCreateRequest {
    const people = data.people.length > 0
        ? data.people
        : data.peopleHelped
            ? [data.peopleHelped]
            : []

    const personaIDs = people
        .map(p => p.personaID)
        .filter((id): id is string => !!id)

    return {
        route_id: data.routeID,
        coords: data.coords,
        comment: data.comment,
        people: people.map((person) => ({
            age: person.age,
            gender: person.gender,
            name: person.name,
            rut: person.rut,
            persona_id: person.personaID,
        })),
        people_helped: people[0] ? {
            age: people[0].age,
            gender: people[0].gender,
            name: people[0].name,
            rut: people[0].rut,
            persona_id: people[0].personaID,
        } : undefined,
        persona_ids: personaIDs.length > 0 ? personaIDs : undefined,
        author_id: data.authorID,
    }
}

export function MapHelpPointToUpdateRequest(
    data: HelpPoint
): THelpPointUpdateRequest {
    const people = data.people.length > 0
        ? data.people
        : data.peopleHelped
            ? [data.peopleHelped]
            : []

    const personaIDs = people
        .map(p => p.personaID)
        .filter((id): id is string => !!id)

    return {
        _id: data.id,
        route_id: data.routeID,
        coords: data.coords,
        comment: data.comment,
        people: people.map((person) => ({
            age: person.age,
            gender: person.gender,
            name: person.name,
            rut: person.rut,
            persona_id: person.personaID,
        })),
        people_helped: people[0] ? {
            age: people[0].age,
            gender: people[0].gender,
            name: people[0].name,
            rut: people[0].rut,
            persona_id: people[0].personaID,
            date: new Date()
        } : undefined,
        persona_ids: personaIDs.length > 0 ? personaIDs : undefined,
        author_id: data.authorID,
    }
}
