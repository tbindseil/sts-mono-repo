import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import moment from 'moment';

import {Header} from '../header/Header';
import {checkAuthenticated} from "../auth/CheckAuthenticated";
import {CalendarDayContent} from './CalendarDayContent';

const errorStyle = {
    color: "red"
};

const tableStyle = {
    width: 1750
};

const headerStyle = {
    textAlign: "Center",
    width: (tableStyle.width / 7),
    border: "solid black",
    borderWidth: "2px 2px 2px 0"
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
                    const availabilitiesWithDates = result.map(a => {
                        return {
                            endTime: moment.utc(a.endTime).local().toDate(),
                            startTime: moment.utc(a.startTime).local().toDate(),
                            subjects: a.subjects,
                            tutor: a.tutor,
                            id: a.id
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
                setFailed(true);
                var message = "Error getting availabilties";
                if (err.message) {
                    message += ": " + err.message;
                }
                setErrorMessage(message);
            });
    };

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // based off stateProps.selectedDate
    // const today = 
    const stateProps = props.location.state;
    const selectedDate = stateProps ? (stateProps.selectedDate ? stateProps.selectedDate : new Date()) : new Date();

    // get day's week day number,
    const weekDayNumber = moment(selectedDate).day();

    // find previous sunday if day is not sunday
    var currDay = moment(selectedDate).subtract(weekDayNumber, "days").toDate();

    // make a CalendarDayContent for each day of week
    const calendarDays = [];
    const calendarHeaders = [];
    for (var i = 0; i < 7; i++) {
        calendarHeaders.push(
            <th style={headerStyle}>
                {moment(currDay).format("dddd, MMM D")}
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

        currDay = moment(currDay).add(1, "days").toDate(); 
    }

    const onClickPreviousWeek = () => {
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: moment(selectedDate).subtract(7, "days").toDate()
            }
        });
    };

    const onClickCurrentWeek = () => {
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: moment().toDate()
            }
        });
    };

    const onClickNextWeek = () => {
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: moment(selectedDate).add(7, "days").toDate()
            }
        });
    };

    return (
        <>
            <Header/>

            <p>
                My Calendar Screen
            </p>

            { failed &&
                <p style={errorStyle} >{errorMessage}</p>
            }

            <table>
                <tr>
                    <td>
                        <button onClick={onClickPreviousWeek}>
                            Previous Week
                        </button>
                        <button onClick={onClickCurrentWeek}>
                            Current Week
                        </button>
                        <button onClick={onClickNextWeek}>
                            Next Week
                        </button>
                    </td>
                </tr>
            </table>

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
