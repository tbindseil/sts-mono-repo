import React from 'react';

export function FlexCalendar(props) {
    let timeSlots = []
    for (let i = 0; i < 2 * 24 * 7; ++i) {
        timeSlots.push(`${i} times available`);
    }

    return (
        <>
            <div className="Calendar">
                {
                    timeSlots.map(timeSlot => {
                        return (
                            <div className="TimeSlot">
                                <p>{timeSlot}</p>
                            </div>
                        );
                    })
                }
            </div>
        </>
    );
}
