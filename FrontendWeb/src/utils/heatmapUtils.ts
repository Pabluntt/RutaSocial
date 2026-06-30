import { HelpPoint } from "../api/models/HelpPoint";

export type HeatmapTimeRange = 'none' | '1w' | '1m' | '1y' | 'custom';

export function filterHelpPointsByTimeRange(
    helpPoints: HelpPoint[],
    range: HeatmapTimeRange,
    customStart?: Date | null,
    customEnd?: Date | null
): HelpPoint[] {
    if (range === 'none') return helpPoints

    const now = new Date()
    const cutoff = new Date(now)

    if (range === '1w') cutoff.setDate(cutoff.getDate() - 7)
    else if (range === '1m') cutoff.setMonth(cutoff.getMonth() - 1)
    else if (range === '1y') cutoff.setFullYear(cutoff.getFullYear() - 1)

    return helpPoints.map(hp => {
        if (range === 'custom' && customStart && customEnd) {
            const date = new Date(hp.dateRegister)
            return {
                ...hp,
                disabled: date < customStart || date > customEnd
            }
        }
        return {
            ...hp,
            disabled: hp.dateRegister < cutoff
        }
    })
}

export function getPeopleCount(helpPoint: HelpPoint): number {
    const people = helpPoint.people.length || 0
    const extra = helpPoint.peopleHelped ? 1 : 0
    return people + extra
}
