import React from 'react';

import { Row } from 'antd';

// TODO dynamic based off stuff
const minutesPerPixel = 9;

export function CalendarDayContent(props) {

    const startOfDay = props.date;

    const endOfDay = new Date(new Date(startOfDay).getTime() + 24 * 60 * 60 * 1000);

    const relevantAvailabilities = props.availabilities.filter(a => {
        return (a.startTime >= startOfDay && a.startTime < endOfDay) || (a.endTime > startOfDay && a.endTime <= endOfDay)
    });

    var timeSlices = [];

    var lastEndDate = startOfDay;

    for (var i = 0; i < relevantAvailabilities.length; ++i) {
        const currAvail = relevantAvailabilities[i];
        if (currAvail.startTime > lastEndDate) {
            timeSlices.push({
                height: getPixels(lastEndDate, currAvail.startTime, minutesPerPixel),
                availability: null
            });
        }

        timeSlices.push({
            height: getPixels(currAvail.startTime, currAvail.endTime, minutesPerPixel),
            availability: currAvail
        });

        lastEndDate = currAvail.endTime;
    }

    // fill in any remaining part of the day
    if (lastEndDate < endOfDay) {
        timeSlices.push({
            height: getPixels(lastEndDate, endOfDay, minutesPerPixel),
            availability: null
        });
    }

    return (
        <>
            { timeSlices.map(timeSlice => {
                    const style = {
                        "height": timeSlice.height,
                        "backgroundColor": timeSlice.availability === null ? "inherit" : "red"
                    };

                    return <Row key={timeSlice.key} style={style}/>
                })
            }
        </>
    );
}

function getPixels(startDate, endDate, minutesPerPixel) {
    // this thing takes the difference between two dates and determines how many pixels it is
    return (endDate - startDate) / 1000 / 60 / minutesPerPixel;
}
