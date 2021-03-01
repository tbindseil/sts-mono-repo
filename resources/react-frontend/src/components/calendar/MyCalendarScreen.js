import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import moment from 'moment';

import {checkAuthenticated} from "../auth/CheckAuthenticated";
import {CalendarDayContent} from './CalendarDayContent';

const tableStyle = {
    width: 1500
};

const headerStyle = {
    textAlign: "Center"
};

const calendarDayStyle = {
    border: "solid black 2px"
};

export function MyCalendarScreen(props) {

    const baseUrl = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod'

    const history = useHistory();

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    useEffect(() => {
        getAvailabilities(user);
    }, [
        user
    ]);

    const [availabilities, setAvailabilities] = useState([]);
    const getAvailabilities = (user) => {
        if (!user) {
            return;
        }

        const url = baseUrl;
        const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
        fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenString
                }
                })
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(moment());
                    const availabilitiesWithDates = result.map(a => {
                        return {
                            endTime: moment.utc(a.endTime).local(),
                            startTime: moment.utc(a.startTime).local(),
                            subjects: a.subjects,
                            tutor: a.tutor
                        }
                    });

                    setAvailabilities(availabilitiesWithDates);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                }
            )
            .catch(err => {
                // TODO
                console.log("error fetching availabilities, err is:");
                console.log(err);
            });
    };

    // based off stateProps.selectedDate
    const stateProps = props.location.state;

    // get day's week day number,
    const weekDayNumber = moment(stateProps.selectedDate).day();

    // find previous sunday if day is not sunday
    const selectedDateCopy = moment(stateProps.selectedDate);
    var currDay = selectedDateCopy.subtract(weekDayNumber, "days");

    // make a CalendarDayContent for each day of week
    const calendarDays = [];
    const calendarHeaders = [];
    for (var i = 0; i < 7; i++) {
        console.log("currDay is:");
        console.log(currDay);

        calendarHeaders.push(
            <th style={headerStyle}>
                {moment(currDay).format("dddd")}
            </th>
        );

        calendarDays.push(
            <td style={calendarDayStyle}>
                <CalendarDayContent
                    key={currDay.toString()}
                    date={currDay}
                    availabilities={availabilities}/>
            </td>
        );

        // tomorrow..
        currDay = moment(currDay).add(1, "days"); 
    }

    return (
        <>
            <p>
                My Calendar Screen
            </p>

            <table style={tableStyle}>
                <tr>
                    {calendarHeaders}
                </tr>
                <tr>
                    {calendarDays}
                </tr>
            </table>
        </>
    );
}
