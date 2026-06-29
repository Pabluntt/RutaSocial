import { Notice } from "../models/Notice";
import { TPublicUserInfo, UserService } from "../services/UserService";

export type TNoticeBackend = {
    _id: string;
    author_id: string;
    description: string;
    created_at: string;
    send_email: boolean;
    send_to_all: boolean;
}
export type TNoticeCreateRequest = Omit<TNoticeBackend, '_id' | 'created_at'>;
export type TNoticeUpdateRequest = TNoticeBackend;

export type TNoticeMapCache = {
    users?: Map<string, Promise<TPublicUserInfo>>
    usersById?: Map<string, TPublicUserInfo>
}

export async function MapNoticeFromBackend(data: TNoticeBackend, cache?: TNoticeMapCache): Promise<Notice> {

    let authorName = 'Usuario Eliminado'
    try {
        let info = cache?.usersById?.get(data.author_id)
        if (!info) {
            let userPromise = cache?.users?.get(data.author_id)
            if (!userPromise) {
                userPromise = UserService.GetPublicInfoByID(data.author_id)
                cache?.users?.set(data.author_id, userPromise)
            }
            info = await userPromise
        }
        authorName = info.name
    } catch(error) {
        console.error('No se pudo obtener autor del aviso', error)
    }
    const notice: Partial<Notice> = {
        id: data._id,
        authorID: data.author_id,
        description: data.description,
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        sendEmail: data.send_email,
        sendToAll: data.send_to_all,
        authorName : authorName
    };

    Object.entries(notice).forEach(([key, value]) => {
        if (value === undefined) {
            throw Error(`Missing required field: ${key}`)
        }
    })
    return notice as Notice
}

export function MapNoticeToCreateRequest(
    data: Omit<Notice, 'id' | 'createdAt' | 'authorName'>
): TNoticeCreateRequest {
    return {
        author_id: data.authorID,
        description: data.description,
        send_email: data.sendEmail,
        send_to_all: data.sendToAll
    }
}

export function MapNoticeToUpdateRequest(
    data: Notice
): TNoticeUpdateRequest {
    return {
        _id: data.id,
        author_id: data.authorID,
        description: data.description,
        created_at: data.createdAt.toISOString(),
        send_email: data.sendEmail,
        send_to_all: data.sendToAll
    }
}
