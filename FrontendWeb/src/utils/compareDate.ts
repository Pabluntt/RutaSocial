import { Notice } from "../api/models/Notice"
import { Route } from "../api/models/Route"


export default function compareSort(a : Route, b : Route) {
    if(!a.dateFinished || !b.dateFinished) {
        return 0
    }
    if(a.dateFinished == b.dateFinished) {
        return 0
    } else if(a.dateFinished > b.dateFinished) {
        return -1
    } else {
        return 1
    }
}



export function compareSortNotices(a : Notice, b : Notice) {
    if(!a.createdAt || !b.createdAt) {
        return 0
    }
    if(a.createdAt == b.createdAt) {
        return 0
    } else if(a.createdAt > b.createdAt) {
        return -1
    } else {
        return 1
    }
}