import { DateSpanApi } from "@fullcalendar/core/index.js";


export function isSingleDaySelection(selectionInfo : DateSpanApi) {
    let startDate = selectionInfo.start;
    let endDate = selectionInfo.end;
    endDate.setSeconds(endDate.getSeconds() - 1);  // allow full day selection

    return startDate.getDate() === endDate.getDate()
}


export const timeSlots = Array.from(new Array(24 * 2)).map(
  (_, index) =>
    `${index < 20 ? '0' : ''}${Math.floor(index / 2)}:${
      index % 2 === 0 ? '00' : '30'
    }`,
);
 