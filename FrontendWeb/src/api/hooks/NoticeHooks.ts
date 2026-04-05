import { useMutation, useQuery } from "@tanstack/react-query";
import { NoticeService } from "../services/NoticeService";
import { Notice } from "../models/Notice";
import { MapNoticeToCreateRequest, MapNoticeToUpdateRequest } from "../adapters/Notice.adapter";

export type NoticesReadUnread = {
    read : Notice[]
    unread : Notice[]
}

export function useMarkNotices() {
    return useMutation({
        mutationFn : (unreadNotices : Notice[]) => (NoticeService.MarkAsReadNotices(unreadNotices ))
    })
}

export function useCreateNotice() {
    return useMutation({
        mutationFn: (body : Omit<Notice, 'id' | 'createdAt' | 'authorName'>) => (NoticeService.PostNotice(MapNoticeToCreateRequest(body))),   
    })
}

export function useNoticesMap() {
    return useQuery({
        queryKey : ['notices-read/unread'],
        queryFn: async () => ({
            read : await NoticeService.GetReadNotices(),
            unread : await NoticeService.GetUnReadNotices()
        })
    })
}

export function useNotices() {
    return useQuery({
        queryKey: ['notices'],
        queryFn: () => (NoticeService.GetNotices())
            
    })
}

export function useDeleteNotice(_id : string) {
    return useMutation({
        mutationFn: () => (NoticeService.DeleteNotice(_id,))
    })
}

export function useUpdateNotice() {
    return useMutation({
        mutationFn: (body : Notice) => (NoticeService.UpdateNotice(MapNoticeToUpdateRequest(body))),
    })
}

