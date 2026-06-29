import { useMutation, useQuery } from "@tanstack/react-query";
import { NoticeService } from "../services/NoticeService";
import { Notice } from "../models/Notice";
import { MapNoticeToCreateRequest } from "../adapters/Notice.adapter";

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

export function useNoticesMap(enabled?: boolean) {
    return useQuery({
        queryKey : ['notices-read/unread'],
        queryFn: async () => ({
            read : await NoticeService.GetReadNotices(),
            unread : await NoticeService.GetUnReadNotices()
        }),
        enabled,
    })
}

export function useDismissNotice() {
    return useMutation({
        mutationFn: (id: string) => (NoticeService.DismissNotice(id))
    })
}

