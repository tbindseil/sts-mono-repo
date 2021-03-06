import React from 'react';
import {useHistory} from 'react-router-dom';

import moment from 'moment';

import './Calendar.css';


// TODO dynamic based off stuff
const minutesPerPixel = 2;
const pixelsInADay = 24 * (60 / minutesPerPixel);
const totalHeightStyle = {
    "height": pixelsInADay,
    "width": "100%",
    "paddingLeft": 0,
    "paddingRight": 0
}

export function CalendarDayContent(props) {
    const history = useHistory();

    const startOfDay = moment(props.date).startOf("day").toDate();
    const endOfDay = moment(props.date).endOf("day").toDate();

    const relevantAvailabilities = props.availabilities
        .filter(a => {
            return (a.startTime >= startOfDay && a.startTime < endOfDay) || (a.endTime > startOfDay && a.endTime <= endOfDay)
        })
        .sort((avail1, avail2) => {
            return avail1.startTime - avail2.startTime
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

    const onClickDay = (value) => {
        history.push({
            pathname: "/create-availability",
            state: {
                selectedDate: value
            }
        });
    }

    const onClickDeleteAvailability = (availability) => {
        history.push({
            pathname: "/delete-availability",
            state: {
                availability: availability
            }
        });
    }

    return (
        <button style={totalHeightStyle}>
            { timeSlices.map(timeSlice => {
                    const style = {
                        height: timeSlice.height,
                        width: "100%"
                    };

                    if (timeSlice.availability) {
                        return (
                            <div
                                key={timeSlice.key}
                                className="Availability-button"
                                style={style}
                                onClick={() => {
                                    onClickDeleteAvailability(timeSlice.availability);
                                }}>
                                { timeSlice.height > 22 ? timeSlice.availability.subjects : "" }
                            </div>
                        );
                    } else {
                        return (
                            <div
                                key={timeSlice.key}
                                className="Open-time-button"
                                style={style}
                                onClick={() => {
                                    onClickDay(props.date)
                                }}>
                                { timeSlice.height > 22 ? "open" : "" }
                            </div>
                        );
                    }
                })
            }
        </button>
    );
}

function getPixels(startDate, endDate, minutesPerPixel) {
    return (endDate - startDate) / 1000 / 60 / minutesPerPixel;
}
