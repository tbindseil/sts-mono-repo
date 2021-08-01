import React, {useCallback, useEffect, useMemo, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import moment from 'moment';

import './Calendar.css';
import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {checkAuthenticated} from "../auth/CheckAuthenticated";
import {MyCalendarDayContent} from './MyCalendarDayContent';
import {Calendar} from './Calendar';

// using a two layered "MediaQueryWrapper" here
export function MyCalendarScreen2(props) {
    return (
        <div>
            <Header/>

            <MediaQuery minWidth={765}>
                { // TODO the different classes for this stuff could be handled by a registry?
                }
                <MyCalendarBody
                    location={props.location}
                    pageBorderClass={"PageBorderCalendar"}
                    underlineClass={"Underline"}
                    datePickerClass={"BigScreenNavigationDatePicker"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <MyCalendarBody
                    location={props.location}
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}
                    datePickerClass={"SmallScreenNavigationDatePicker"}/>
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

    const stateProps = props.location.state;
    const selectedDate = useMemo(() => { return stateProps ? (stateProps.selectedDate ? stateProps.selectedDate : new Date()) : new Date() }, [stateProps]);

    const [availabilities, setAvailabilities] = useState([]);
    const getAvailabilities = useCallback(
        (user) => {
            if (!user) {
                return;
            }

            // startTime and endTime are 12:00:00 am of sunday morning and 11:59:59 of saturday night for week of selectedDate
            // could be improved by only getting for 1 day for small screen
            const startTime = moment(selectedDate).startOf('week').toDate();
            const endTime = moment(selectedDate).endOf('week').toDate();
            const url = new URL(baseUrl)
            const getAvailInput = {
                username: user.username,
                subject: "*",
                startTime: startTime,
                endTime: endTime
            };
            url.searchParams.append('getAvailInput', JSON.stringify(getAvailInput));

            const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
            fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenString
                },
            })
                .then(res => res.json())
                .then((result) => {
                    const availabilitiesWithDates = []
                    for (const [id, avail] of Object.entries(result)) {
                        availabilitiesWithDates.push({
                            endTime: moment.utc(avail.endTime).local().toDate(),
                            startTime: moment.utc(avail.startTime).local().toDate(),
                            subjects: avail.subjects,
                            tutor: avail.tutor,
                            id: id
                        });
                    }
                    setAvailabilities(availabilitiesWithDates);
                },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    (error) => {
                        setFailed(true);
                        var message = "1Error getting availabilties";
                        if (error.message) {
                            message += ": " + error.message;
                        }
                        setErrorMessage(message);
                    })
                .catch(err => {
                    setFailed(true);
                    var message = "2Error getting availabilties";
                    if (err.message) {
                        message += ": " + err.message;
                    }
                    setErrorMessage(message);
                });
        },
        [selectedDate]
    );

    useEffect(() => {
        getAvailabilities(user);
    }, [
        user, getAvailabilities
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // get day's week day number,
    const weekDayNumber = moment(selectedDate).day();

    // find previous sunday if day is not sunday
    var currDay = moment(selectedDate).subtract(weekDayNumber, "days").toDate();

    // make a MyCalendarDayContent for each day of week
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
                <MyCalendarDayContent
                    key={currDay.toString()}
                    date={currDay}
                    availabilities={availabilities}/>
            </td>
        );

        currDay = moment(currDay).add(1, "days").toDate();
    }

    // looks like defaults don't refresh when navigating to the same page
    const [jumpToDate, setJumpToDate] = useState(selectedDate);
    const handleChangeJumpToDate = (event) => {
        setJumpToDate(event.target.value);
    };

    const onClickJumpToDate = () => {
        goToDate(history, moment(jumpToDate).toDate());
    };




    const onClickCreateAvailability = (value) => {
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


    // visitor pattern?
    // walk the 2*24*7 30 minute blocks
    //    * I'm on my calendar *
    // for each block, find if it has an avail
    // since this is my calendar,
    // there will be only one avail
    let timeSlots = [];
    let startOfBlock = moment(selectedDate).startOf('week');
    const endOfCalendar = moment(selectedDate).endOf('week');
    while (startOfBlock.isBefore(endOfCalendar)) { // this happens a lot...
        const endOfBlock = moment(startOfBlock).add('minute', 30);

        // I have availabilities as state...

        // could be optimised such that we keep a reference to the oldest avail,
        // easier on my calendar because we are garaunteed to have no overlap

        let found = false;
        let subjects = "";
        let foundAvail = null;
        availabilities.forEach(a => {
            const startMoment = moment(a.startTime);
            const endMoment = moment(a.endTime);
            if ((startMoment.isBefore(startOfBlock) && endMoment.isAfter(endOfBlock))
                || (startMoment.isAfter(startOfBlock) && startMoment.isBefore(endOfBlock))
                || (endMoment.isAfter(startOfBlock) && endMoment.isBefore(endOfBlock))) {
                found = true;
                subjects = a.subjects;
                foundAvail = a;
            }
        });

        timeSlots.push(
            found ?
                <div className="timeslot FillGridCell">
                    <button onClick={() => {
                        onClickDeleteAvailability(foundAvail);
                    }}>
                        {subjects}
                    </button>
                </div>
            :
                <div className="timeslot FillGridCell">
                    <button onClick={() => {
                        onClickCreateAvailability(startOfBlock.toDate());
                    }}>
                        Open
                    </button>
                </div>
        );

        startOfBlock.add('minute', 30);
    }


    /*let timeSlots = []
    for (let i = 0; i < 2 * 24 * 7; ++i) {
        timeSlots.push(
             <div className="TimeSlot FillGridCell">
                 <button>{`${i} times available`}</button>
             </div>
        );
    }*/

    return (
        <header className={props.pageBorderClass}>
            <Title
                titleText="My Calendar Screen"
                underlineClass={props.underlineClass}/>

            { failed &&
                <p className="ErrorMessage">{errorMessage}</p>
            }

            <MediaQuery minWidth={765}>
                <BigScreenNavigationTable
                    selectedDate={selectedDate}/>
            </MediaQuery>
            <MediaQuery maxWidth={765}>
                <SmallScreenNavigationTable
                    selectedDate={selectedDate}/>
            </MediaQuery>

            <div className={props.datePickerClass}>
                <label for="jumpToDate">Jump to Date:</label>
                <input onChange={handleChangeJumpToDate} type="date" name="jumpToDate" value={moment(jumpToDate).format("YYYY-MM-DD")}/>
                <button onClick={onClickJumpToDate}>Go</button>
            </div>

            <br/>

            <Calendar
                timeSlots={timeSlots}
            />

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

function BigScreenNavigationTable(props) {
    const history = useHistory();
    const selectedDate = props.selectedDate;

    const onClickPreviousWeek = () => {
        goToDate(history, moment(selectedDate).subtract(7, "days").toDate());
    };

    const onClickCurrentWeek = () => {
        goToDate(history, moment().toDate());
    };

    const onClickNextWeek = () => {
        goToDate(history, moment(selectedDate).add(7, "days").toDate());
    };

    return (
        <table className="BigScreenNavigationTable">
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
    );
}

function SmallScreenNavigationTable(props) {
    const history = useHistory();
    const selectedDate = props.selectedDate;

    const onClickPreviousDay = () => {
        goToDate(history, moment(selectedDate).subtract(1, "days").toDate());
    };

    const onClickCurrentDay = () => {
        goToDate(history, moment().toDate());
    };

    const onClickNextDay = () => {
        goToDate(history, moment(selectedDate).add(1, "days").toDate());
    };

    return (
        <table className="SmallScreenNavigationTable">
            <tr>
                <td>
                    <button onClick={onClickPreviousDay}>
                        Previous Day
                    </button>
                    <button onClick={onClickCurrentDay}>
                        Today
                    </button>
                    <button onClick={onClickNextDay}>
                        Next Day
                    </button>
                </td>
            </tr>
        </table>
    );
}

function goToDate(history, date) {
    history.push({
        pathname: "/my-calendar",
        state: {
            selectedDate: date
        }
    });
}

