import React from 'react';
import moment from 'moment';

export function Calendar(props) {
    let timeLegend = [];
    let startTime = moment().startOf('day');
    const endOfDay = moment().endOf('day');
    while (startTime.isBefore(endOfDay)) {
        const key = startTime.format("LT");
        timeLegend.push(
            <div key={key} className="TimeSlot">
                <p>{key}</p>
            </div>
        );
        startTime.add('minute', 30);
    }

    const timeSlots = timeLegend.concat(props.timeSlots);

    let weekDayHeaders = [];
    weekDayHeaders.push(
        <div className="Time FillGridCell TopRowWeekDayCenterVertically">
            <p>Time</p>
        </div>
    );
    const startOfWeek = moment(props.selectedDate).startOf('week');
    const endOfWeek = moment(props.selectedDate).endOf('week');
    let curr = moment(startOfWeek);
    while (curr.isBefore(endOfWeek)) {
        const clazzName = `${curr.format("dddd")} FillGridCell TopRowWeekDayCenterVertically`;
        weekDayHeaders.push(
            <div className={clazzName}>
                <p>{curr.format("dddd, MMM D")}</p>
            </div>
        );

        curr.add(1, 'day');
    }

    return (
        <>
            <div className="Calendar">
                {weekDayHeaders}

                {timeSlots}
            </div>
        </>
    );
}

