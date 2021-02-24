import React from 'react';

import { Row } from 'antd';

export function CalendarDayContent(props) {
    const pixelsForQuarterHour = 1;

    const total = 24 * 4; // 15 minute slices
    const before = 2;
    const length = 3;

    // I need a series of tuples of (~percentage~15 minute sessions, on/off)
    // given a list of appointments overlayed over an off day
    //
    // but first lets see how this looks

    const stripes = [{sessionLength: before, onOrOff: 'off'}, {sessionLength: length, onOrOff: 'on'}, {sessionLength: total - length - before, onOrOff: 'off'}];

    var startTimeTemp = 0;
    const rowProps = stripes.map(stripe => {
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

    var itr = 0;
    const longlist = rowProps.map(rowProp => {
        console.log('itr is:');
        console.log(itr);
        itr += 1;
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
