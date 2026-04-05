import { compareSortNotices } from "../../utils/compareDate"
import { MapNoticeFromBackend, TNoticeBackend, TNoticeCreateRequest, TNoticeUpdateRequest } from "../adapters/Notice.adapter"
import { Notice } from "../models/Notice"
import { axiosInstance } from "./axiosInstance"


export class NoticeService {

    private static readonly RESOURCE_NAME = 'notification'

    static async MarkAsReadNotices( unreadNotices: Notice[] ) : Promise<boolean> {
        Promise.all(unreadNotices.map(async (notice , _ ) => (
            await axiosInstance.put(`/${NoticeService.RESOURCE_NAME}/read/${notice.id}`)
        )))
        return true
    }

    static async GetReadNotices() : Promise<Notice[]> {
        const { data } = await axiosInstance.get(`/${NoticeService.RESOURCE_NAME}/read`)
        if( data?.message === null) return []
        const notices : Notice[] = await Promise.all((data?.message as TNoticeBackend[]).map(async (notice, _) => (
            await MapNoticeFromBackend(notice)
        )))
        return notices.sort(compareSortNotices)
    }

    static async GetUnReadNotices() : Promise<Notice[]> {
        const { data } = await axiosInstance.get(`/${NoticeService.RESOURCE_NAME}/unread`)
        if( data?.message === null) return []
        const notices : Notice[] = await Promise.all((data?.message as TNoticeBackend[]).map(async (notice, _) => (
            await MapNoticeFromBackend(notice)
        )))
        return notices.sort(compareSortNotices)
    }

    static async GetNotices() : Promise<Notice[]>{
        const { data } = await axiosInstance.get(`/${NoticeService.RESOURCE_NAME}`) 
        if( data?.message === null) return []
        const notices : Notice[] = await Promise.all((data?.message as TNoticeBackend[]).map(async (notice, _) => (
            await MapNoticeFromBackend(notice)
        )))
        return notices.sort(compareSortNotices)
    }

    static async PostNotice( body : TNoticeCreateRequest ) : Promise<Notice> {
        const { data } = await axiosInstance.post(`/${NoticeService.RESOURCE_NAME}`, body)
        return await MapNoticeFromBackend(data?.message as TNoticeBackend)
    }

    static async DeleteNotice( _id : string ) : Promise<string> {
        const { data } = await axiosInstance.delete(`/${NoticeService.RESOURCE_NAME}/${_id}`)
        return data?.message
    }

    static async UpdateNotice( body : TNoticeUpdateRequest ) : Promise<Notice> {
        const { data } = await axiosInstance.put(`/${NoticeService.RESOURCE_NAME}/${body._id}`, body)
        return await MapNoticeFromBackend(data?.message as TNoticeBackend)
    } 

}