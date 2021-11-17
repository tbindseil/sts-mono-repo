import React, {useCallback, useEffect, useMemo, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import moment from 'moment';

import './Calendar.css';
import {Calendar} from './Calendar';
import {BigScreenNavigationTable, SmallScreenNavigationTable, goToDate} from './NavigationTable';
import {apiFactory} from '../fetch-enhancements/fetch-call-builders';
import {BaseScreen} from '../base-components/BaseScreen';
import {ScreenSizeConfigurable} from '../base-components/ScreenSizeConfigurable';

// using a two layered "MediaQueryWrapper" here
export function MyCalendarScreen(props) {
    const history = useHistory();

    const [user, setUser] = useState(undefined)

    const stateProps = props.location.state;
    const selectedDate = useMemo(() => { return stateProps ? (stateProps.selectedDate ? stateProps.selectedDate : new Date()) : new Date() }, [stateProps]);

    const [availabilities, setAvailabilities] = useState([]);
    const getAvailabilities = useCallback(
        (user) => {
            if (!user) {
                return;
            }

            const successHandler = (result) => {
                const availabilitiesWithDates = []
                for (const [id, avail] of Object.entries(result)) {
                    availabilitiesWithDates.push({
                        endTime: moment.utc(avail.endTime).local().toDate(),
                        startTime: moment.utc(avail.startTime).local().toDate(),
                        subjects: avail.subjects,
                        tutor: avail.tutor,
                        id: id,
                        availabilitySeries: avail.availabilitySeries
                    });
                }
                setAvailabilities(availabilitiesWithDates);
            };

            const startTime = moment(selectedDate).startOf('week').toDate();
            const endTime = moment(selectedDate).endOf('week').toDate();
            const call = apiFactory.makeGetAvailabilities({
                user: user,
                username: user.username,
                subject: "*",
                startTime: startTime,
                endTime: endTime,
                successHandler: successHandler
            });
            call();
        },
        [selectedDate]
    );

    useEffect(() => {
        getAvailabilities(user);
    }, [
        user, getAvailabilities
    ]);

    // looks like defaults don't refresh when navigating to the same page
    const [jumpToDate, setJumpToDate] = useState(selectedDate);
    const handleChangeJumpToDate = (event) => {
        setJumpToDate(event.target.value);
    };

    const onClickJumpToDate = () => {
        goToDate(history, moment(jumpToDate).toDate(), "/my-calendar");
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

    // visitor pattern? build all time slots
    // this is probably also best done as a callback that triggers whenever avails or selectedDate changes
    let timeSlots = [];
    let startOfBlock = moment(selectedDate).startOf('week');
    const endOfCalendar = moment(selectedDate).endOf('week');
    while (startOfBlock.isBefore(endOfCalendar)) { // this happens a lot...
        const endOfBlock = moment(startOfBlock).add('minute', 30);

        // could be optimised such that we keep a reference to the oldest avail,
        // easier on my calendar because we are garaunteed to have no overlap

        let foundAvail = null;
        availabilities.forEach(a => {
            const startMoment = moment(a.startTime);
            const endMoment = moment(a.endTime);
            if ((startMoment.isBefore(startOfBlock) && endMoment.isAfter(endOfBlock))
                || (startMoment.isAfter(startOfBlock) && startMoment.isBefore(endOfBlock))
                || (endMoment.isAfter(startOfBlock) && endMoment.isBefore(endOfBlock))) {
                foundAvail = a;
            }
        });

        const selectedDate = moment(startOfBlock).toDate();
        timeSlots.push(
            foundAvail !== null ?
                <div className="timeslot FillGridCell">
                    <button onClick={() => {
                        onClickDeleteAvailability(foundAvail);
                    }}>
                        {foundAvail.subjects}
                    </button>
                </div>
            :
                <div className="timeslot FillGridCell">
                    <button onClick={() => {
                        onClickCreateAvailability(selectedDate);
                    }}>
                        Open
                    </button>
                </div>
        );

        startOfBlock.add('minute', 30);
    }

    return (
        <BaseScreen
            titleText={"My Calender"}
            needAuthenticated={true}
            setUser={setUser}>

            <MediaQuery minWidth={765}>
                <BigScreenNavigationTable
                    selectedDate={selectedDate}
                    pathName="/my-calendar"/>
            </MediaQuery>
            <MediaQuery maxWidth={765}>
                <SmallScreenNavigationTable
                    selectedDate={selectedDate}
                    pathName="/my-calendar"/>
            </MediaQuery>

            <ScreenSizeConfigurable
                bigScreenClassName={"BigScreenNavigationDatePicker"}
                smallScreenClassName={"SmallScreenNavigationDatePicker"}>
                <div className={props.datePickerClass}>
                    <label for="jumpToDate">Jump to Date:</label>
                    <input onChange={handleChangeJumpToDate} type="date" name="jumpToDate" value={moment(jumpToDate).format("YYYY-MM-DD")}/>
                    <button onClick={onClickJumpToDate}>Go</button>
                </div>
            </ScreenSizeConfigurable>


            <br/>

            <Calendar
                timeSlots={timeSlots}
                selectedDate={selectedDate}
            />

            <div className="BelowCalendar">
                <p>
                    Click somewhere on a given day to add tutoring availability to that day.
                    <br/>

                    Click on an existing availability to adjust or delete it
                </p>
            </div>

        </BaseScreen>
    );
}
