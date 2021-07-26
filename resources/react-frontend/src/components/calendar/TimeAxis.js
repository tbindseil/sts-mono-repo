import React from 'react';

import moment from 'moment';


export function TimeAxis(props) {
    const startOfDay = moment().startOf("day");
    const endOfDay = moment().endOf("day");

    let timeSlotTableRows = [];
    let currStartTime = moment(startOfDay);
    while (currStartTime.isBefore(endOfDay)) {
        const key = currStartTime.format("h:mm");
        timeSlotTableRows.push(
            (
                <tr>
                    <button key={key}>
                        {`${key}`}
                    </button>
                </tr>
            )
        );

        currStartTime.add('minute', 30);
    }

    return (
        <>
            <table>
                {timeSlotTableRows}
            </table>
        </>
    );
}
