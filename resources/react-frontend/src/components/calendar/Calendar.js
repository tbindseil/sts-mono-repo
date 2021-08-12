import React from 'react';
import MediaQuery from 'react-responsive';
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

    let bigScreenWeekDayHeaders = [];
    let smallScreenWeekDayHeaders = [];
    bigScreenWeekDayHeaders.push(
        <div className="Time FillGridCell TopRowWeekDayCenterVertically">
            <p>Time</p>
        </div>
    );
    smallScreenWeekDayHeaders.push(
        <div className="Time FillGridCell TopRowWeekDayCenterVertically">
            <p>Time</p>
        </div>
    );
    const startOfWeek = moment(props.selectedDate).startOf('week');
    const endOfWeek = moment(props.selectedDate).endOf('week');
    let curr = moment(startOfWeek);

    while (curr.isBefore(endOfWeek)) {
        const bigScreenClazzName = `${curr.format("dddd")} FillGridCell TopRowWeekDayCenterVertically`;
        const smallScreenClazzName = 'SmallScreenWeekDayHeader FillGridCell TopRowWeekDayCenterVertically';
        bigScreenWeekDayHeaders.push(
            <div className={bigScreenClazzName}>
                <p>{curr.format("dddd, MMM D")}</p>
            </div>
        );

        smallScreenWeekDayHeaders.push(
            <div className={smallScreenClazzName}>
                <p>{curr.format("dddd, MMM D")}</p>
            </div>
        );

        curr.add(1, 'day');
    }

    const dayOffset = moment(props.selectedDate).day();
    const smallScreenHeaders = [smallScreenWeekDayHeaders[0], smallScreenWeekDayHeaders[moment(props.selectedDate).day() + 1]]
    const smallScreenTimeSlots = timeSlots.filter(function(timeSlot, index) {
        const start = (dayOffset + 1) * 48;
        const end = (dayOffset + 2) * 48;
        return ((index < 48) || (index >= start && index < end));
    });

    return (
        <>

            <MediaQuery minWidth={765}>
                <div className="Calendar">
                    {bigScreenWeekDayHeaders}

                    {timeSlots}
                </div>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <div className="SmallScreenCalendar">
                    {smallScreenHeaders}

                    {smallScreenTimeSlots}
                </div>
            </MediaQuery>

        </>
    );
}
