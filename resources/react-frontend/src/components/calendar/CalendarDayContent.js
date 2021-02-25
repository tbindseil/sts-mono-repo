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


    const pixelsForQuarterHour = 2;

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
    );
}
