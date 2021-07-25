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

    // ok, so i have a situation where the I'll be looping over all avails
    // this is in order to see how many matches per time slot
    // each time slot should hold an array to a list of avail ids
    // so for each time slot's window,
    // if the avail matches,
    // add its id to the list associated with the time slot
    let timeSlots = [];
    for (let startTime = moment(startOfDay), endTime = startTime.add("minute", 30), timeSlotIndex = 0;
         startTime.isBefore(endOfDay);
         startTime.add('minute', 30), endTime.add('minute', 30), ++timeSlotIndex) {

        timeSlots[timeSlotIndex] = [];

        for (let i = 0; i < relevantAvailabilities.length; ++i) {
            const currAvail = relevantAvailabilities[i];
            const currStart = moment(currAvail.startTime);
            const currEnd = moment(currAvail.endTime);
            // TODO isBefore or equal to?
            if ((currStart.isBefore(startTime) && currEnd.isAfter(endTime)) ||
                (currStart.isAfter(startTime) && currStart.isBefore(endTime)) ||
                (currEnd.isAfter(startTime) && currEnd.isBefore(endTime))) {
                timeSlots[timeSlotIndex].append(currAvail.id);
            }
        }

    }

    const onClickTimeSlot = (event) => {
        // TODO how to index into time slots here?
        console.log("TODO how to index into time slots here?");
        console.log("event is:");
        console.log(event);
    }

    return (
        <>
            <table>
                {
                    timeSlots.forEach((timeSlot, index) => {
                        return (
                            <tr>
                                <button key={index} onClick={onClickTimeSlot} data={JSON.stringify(timeSlot)}>
                                    `${timeSlot.length} availabilities`
                                </button>
                            </tr>
                        );
                    })
                }
            </table>
        </>
    );
}
