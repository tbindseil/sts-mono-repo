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
                <button>{key}</button>
            </div>
        );
        startTime.add('minute', 30);
    }

    const timeSlots = timeLegend.concat(props.timeSlots);

    return (
        <>
            <div className="Calendar">
                <div className="Time">
                    <p>Time</p>
                </div>
                <div className="Sunday">
                    <p>Sunday</p>
                </div>
                <div className="Monday">
                    <p>Monday</p>
                </div>
                <div className="Tuesday">
                    <p>Tuesday</p>
                </div>
                <div className="Wednesday">
                    <p>Wednesday</p>
                </div>
                <div className="Thursday">
                    <p>Thursday</p>
                </div>
                <div className="Friday">
                    <p>Friday</p>
                </div>
                <div className="Saturday">
                    <p>Saturday</p>
                </div>

                {timeSlots}
            </div>
        </>
    );
}

