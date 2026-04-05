import { Notice } from "../models/Notice";
import { UserService } from "../services/UserService";

export type TNoticeBackend = {
    _id: string;
    author_id: string;
    description: string;
    created_at: string;
    send_email: boolean;
}
export type TNoticeCreateRequest = Omit<TNoticeBackend, '_id' | 'created_at'>;
export type TNoticeUpdateRequest = TNoticeBackend;

export async function MapNoticeFromBackend(data: TNoticeBackend): Promise<Notice> {

    let authorName = 'Usuario Eliminado'
    try {
        authorName = (await UserService.FindUserById(data.author_id as string)).name
    } catch(e) {
        console.log(e)
    }
    const notice: Partial<Notice> = {
        id: data._id,
        authorID: data.author_id,
        description: data.description,
        createdAt: data.created_at ? new Date(data.created_at) : undefined,
        sendEmail: data.send_email,
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
        send_email: data.sendEmail
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
        send_email: data.sendEmail
    }
}
