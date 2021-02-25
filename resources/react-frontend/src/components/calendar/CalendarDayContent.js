import React from 'react';

import { Row } from 'antd';

export function CalendarDayContent(props) {
    console.log("props is:");
    console.log(props);
    /*
     *
     *
{date: Sun Feb 28 2021 00:00:00 GMT-0700 (Mountain Standard Time), view: "month", availabilities: Array(1)}
availabilities: Array(1)
0:
endTime: "2021-02-28 01:30:00"
startTime: "2021-02-28 01:00:00"
subjects: "math"
tutor: "a1a4c0cf-d7ca-4b4a-86e4-844cf20e910c"
     *
     *
     * */

    /* const stripes = [];
    props.availabilities.forEach(availability -> {
        stripes.append(
    }); */

    const startOfDay = props.date;
    const endOfDay = new Date(new Date(startOfDay).getTime() + 24 * 60 * 60 * 1000);
    /*console.log("startOfDay is:");
    console.log(startOfDay);
    console.log("endOfDay is:");
    console.log(endOfDay);*/

    const relevantAvailabilities = props.availabilities.filter(a => {
        console.log("a.startTime is:");
        console.log(a.startTime);
        console.log("a.endTime is:");
        console.log(a.endTime);
        console.log("startOfDay is:");
        console.log(startOfDay);
        console.log("endOfDay is:");
        console.log(endOfDay);
        return (a.startTime >= startOfDay && a.startTime < endOfDay) || (a.endTime > startOfDay && a.endTime <= endOfDay)
    });

    console.log("relevantAvailabilities is:");
    console.log(relevantAvailabilities);

    var rowHeights = [];

    var lastEnd = startOfDay;

    for (var i = 0; i < relevantAvailabilities.length; ++i) {
        const currAvail = relevantAvailabilities[i];
        if (currAvail.startTime > lastEnd) {
            rowHeights.push({
                height: getPixels(lastEnd, currAvail.startTime),
                availability: null
            });
        }

        // add availability
        rowHeights.push({
            height: getPixels(currAvail.startTime, currAvail.endTime),
            availability: currAvail
        });

        // new lastEnd
        lastEnd = currAvail.endTime;
    }

    // fill in any remaining part of the day
    if (lastEnd < endOfDay) {
        rowHeights.push({
            height: getPixels(lastEnd, endOfDay),
            availability: null
        });
    }

    const longlist = rowHeights.map(rowProp => {
        const style = {
            "height": rowProp.height,
            "backgroundColor": rowProp.availability === null ? "inherit" : "red"
        };

        return <Row key={rowProp.key} style={style}>
                </Row>
    });
    return (
        <>
            {longlist}
        </>
    )
    // um, looking to collect components
    /*for (var i = 0; i < relevantAvailabilities.length; ++i) {
        const currAvail = relevantAvailabilities[i];

        if (i == 0 && currAvail.startTime > startOfDay) {
            // add starter row
            rowHeights.append({
                height: getPixels(currAvail.startTime, startOfDay),
                availability: currAvail
            });
        }

        if (i < relevantAvailabilities.length - 1) {
            // add empty row between start of this avail and end of last
        } else if (currAvail.endTime < endOfDay) {
            // add empty row after end of 
        }


        // get start of avail
        // extend row to start of avail
        // create fow for start of avail to min(end of avail, end of day)
        // start next row..
    }*/
















    /*const pixelsForQuarterHour = 2;

    const total = 24 * 4; // 15 minute slices
    const before = 2;
    const length = 3;

    // I need a series of tuples of (~percentage~15 minute sessions, on/off)
    // given a list of appointments overlayed over an off day
    //
    // but first lets see how this looks

    const stripess = [{sessionLength: before, onOrOff: 'off'}, {sessionLength: length, onOrOff: 'on'}, {sessionLength: total - length - before, onOrOff: 'off'}];

    var startTimeTemp = 0;
    const rowProps = stripess.map(stripe => {
        const ret = {
            key: startTimeTemp, // availability start time
            height: stripe.sessionLength * pixelsForQuarterHour,
            backgroundColor: (stripe.onOrOff === "on" ? "blue" : "red")
        };

        startTimeTemp += stripe.sessionLength;
            
        return ret;
    });

    // foreach row, we want
    // maybe do some logic to determine number of pixels as a multiple of 48 or something?
    // for now just choose 96 * 4

    const longlist = rowProps.map(rowProp => {
        const style = {
            "height": rowProp.height,
            "backgroundColor": rowProp.backgroundColor,
        };

        return <Row key={rowProp.key} style={style}>
                </Row>
    });
    return (
        <>
            {longlist}
        </>
    );*/
}

function getPixels(startDate, endDate) {
    console.log("calling get pixels with start time and endtime as:");
    console.log(startDate);
    console.log(endDate);
    // this thing takes the difference between two dates and determines how many pixels it is
    // assumes 15 minutes is 2 pixels
    const retVal = 2 * (endDate - startDate) / 1000 / 60 / 15;
    console.log("retval is:");
    console.log(retVal);
    return retVal;
}
