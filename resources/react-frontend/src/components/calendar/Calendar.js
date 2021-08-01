import React from 'react';
import moment from 'moment';

export function Calendar(props) {
    let timeLegend = [];
    let startTime = moment().startOf('day');
    const endOfDay = moment().endOf('day');
    while (startTime.isBefore(endOfDay)) {
        const key = startTime.format("h:mm");
        timeLegend.push(
            <div key={key} className="TimeSlot">
                <p>{key}</p>
            </div>
        );
        startTime.add('minute', 30);
    }

    const timeSlots = timeLegend.concat(props.timeSlots);

    return (
        <>
            <div className="Calendar">
                <div className="Time FillGridCell TopRowWeekDayCenterVertically">
                    <p>Time</p>
                </div>
                <div className="Sunday FillGridCell TopRowWeekDayCenterVertically">
                    <p>Sunday</p>
                </div>
                <div className="Monday FillGridCell TopRowWeekDayCenterVertically">
                    <p>Monday</p>
                </div>
                <div className="Tuesday FillGridCell TopRowWeekDayCenterVertically">
                    <p>Tuesday</p>
                </div>
                <div className="Wednesday FillGridCell TopRowWeekDayCenterVertically">
                    <p>Wednesday</p>
                </div>
                <div className="Thursday FillGridCell TopRowWeekDayCenterVertically">
                    <p>Thursday</p>
                </div>
                <div className="Friday FillGridCell TopRowWeekDayCenterVertically">
                    <p>Friday</p>
                </div>
                <div className="Saturday FillGridCell TopRowWeekDayCenterVertically">
                    <p>Saturday</p>
                </div>

                {timeSlots}
            </div>
        </>
    );
}

