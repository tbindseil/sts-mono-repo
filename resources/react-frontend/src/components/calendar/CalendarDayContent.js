import React from 'react';

import { Button, Row } from 'antd';

import './Calendar.css';


// TODO dynamic based off stuff
const minutesPerPixel = 2;
const pixelsInADay = 24 * (60 / minutesPerPixel);
const totalHeightStyle = {
    "height": pixelsInADay
}

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
        <Row style={totalHeightStyle}>
            { timeSlices.map(timeSlice => {
                    const style = {
                        height: timeSlice.height,
                        width: "100%"
                    };

                    if (timeSlice.availability) {
                        // style.width = "100%";
                        return (
                            <Button key={timeSlice.key} className="Availability-button" style={style}>
                                {timeSlice.availability.subjects}
                            </Button>
                        );
                    } else {
                        return <Row key={timeSlice.key} style={style}/>
                    }
                })
            }
        </Row>
    );
}

function getPixels(startDate, endDate, minutesPerPixel) {
    return (endDate - startDate) / 1000 / 60 / minutesPerPixel;
}
