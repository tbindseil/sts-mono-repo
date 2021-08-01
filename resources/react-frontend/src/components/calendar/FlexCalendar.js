import React from 'react';

import {Calendar} from './Calendar';

export function FlexCalendar(props) {
    let timeSlots = []
    for (let i = 0; i < 2 * 24 * 7; ++i) {
        timeSlots.push(
             <div className="TimeSlot">
                 <p>{`${i} times available`}</p>
             </div>
        );
    }

    // hmm,
    // I can probably use the
    return (
        <Calendar
            timeSlots={timeSlots}
        />
    );
}
