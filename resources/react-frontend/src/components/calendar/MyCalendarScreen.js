import React, {useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import moment from 'moment';

import './Calendar.css';
import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {checkAuthenticated} from "../auth/CheckAuthenticated";
import {CalendarDayContent} from './CalendarDayContent';

export function MyCalendarScreen(props) {
    return (
        <div>
            <Header/>

            <MediaQuery minWidth={765}>
                <MyCalendarBody
                    location={props.location}
                    pageBorderClass={"PageBorderCalendar"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <MyCalendarBody
                    location={props.location}
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>
        </div>
    );
}


function MyCalendarBody(props) {
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
                    setFailed(true);
                    var message = "Error getting availabilties";
                    if (error.message) {
                        message += ": " + error.message;
                    }
                    setErrorMessage(message);
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
            <th className="CalendarDayHeader">
                {moment(currDay).format("dddd, MMM D")}
            </th>
        );

        calendarDays.push(
            <td className="CalendarDayBody">
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

    const [jumpToDate, setJumpToDate] = useState(selectedDate);
    const handleChangeJumpToDate = (event) => {
        setJumpToDate(event.target.value);
    };

    const onClickJumpToDate = () => {
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: moment(jumpToDate).toDate()
            }
        });
    };

    return (
        <header className={props.pageBorderClass}>
            <Title
                titleText="My Calendar Screen"
                underlineClass={props.underlineClass}/>

            { failed &&
                <p className="ErrorMessage">{errorMessage}</p>
            }

            <table className="NavigationTable">
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

            <div className="NavigationDatePicker">
                <label for="jumpToDate">Jump to Date:</label>
                <input onChange={handleChangeJumpToDate} type="date" name="jumpToDate" value={moment(jumpToDate).format("YYYY-MM-DD")}/>
                <button onClick={onClickJumpToDate}>Go</button>
            </div>

            <table className="CalendarTable">
                <tr>
                    {calendarHeaders}
                </tr>
                <tr>
                    {calendarDays}
                </tr>
            </table>

            <div className="BelowCalendar">
                <p>
                    Click somewhere on a given day to add tutoring availability to that day.
                    <br/>

                    Click on an existing availability to adjust or delete it
                </p>
            </div>

        </header>
    );
}
