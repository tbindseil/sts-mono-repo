import React, {useEffect, useState} from 'react';

import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';
import moment from 'moment';

import Multiselect from 'multiselect-react-dropdown';
import Select from "react-dropdown-select";

import subjects from '../../configs/subjects';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {checkAuthenticated} from "../auth/CheckAuthenticated";

export function CreateAvailabilityScreen(props) {
    return (
        <div className="TopLevelContainer">

            <Header/>

            <MediaQuery minWidth={765}>
                <CreateAvailabilityBody
                    location={props.location}
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <CreateAvailabilityBody
                    location={props.location}
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>

        </div>
    );
}

function CreateAvailabilityBody(props) {
    const history = useHistory();

    const stateProps = props.location.state;
    const selectedDate = stateProps ? (stateProps.selectedDate ? stateProps.selectedDate : new Date()) : new Date();

    const baseUrl = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod'

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    // default to 6pm
    const at6pm = moment(selectedDate).hours(0).minutes(0).seconds(0).milliseconds(0).add(18, "hours").toDate();

    // time stuff
    const snapTo30Min = (initial) => {
        if (initial.minute() < 30) {
            return 0;
        } else {
            return 30;
        }
    }

    const [day, setDay] = useState(at6pm); // TODO day is really start moment
    const handleChangeDay = (event) => {
        const dayMoment = moment(day);
        const currStartHour = dayMoment.hours();
        const currStartMinute = dayMoment.minutes();

        const nextDay = moment(event.target.value).add(currStartHour, "hours").add(currStartMinute, "minutes").toDate();

        setDay(nextDay);

        // TODO if date in past selected, set to today
        // if date today, check time
        // if date after today, no worries
    }

    const [startTime, setStartTime] = useState('10:00');
    const handleChangeStartTime = (event) => {
        console.log('handleChangeStartTime');
        console.log(event);
        /*const splitTime = event.target.value.split(":");
        const hours = splitTime[0];
        const minutes = splitTime[1];

        // zero day's minutes
        const startOfDay = moment(day).hours(0).minutes(0).seconds(0).milliseconds(0);

        // add new start time's hours and minutes
        setDay(moment(startOfDay).add(hours, "hours").add(minutes, "minutes").toDate());*/
    }

    const [endTime, setEndTime] = useState('10:30');
    const handleChangeEndTime = (event) => {
        console.log("handleChangeEndTime");
        console.log(event);
    }

    const postAvailability = async () => {
        const startTime = moment(day);
        const endTime = moment();
        const availability = {
            subjects: selectedSubjects.map(subject => subject.name).join(','),
            startTime: startTime,
            endTime: endTime,
            tutor: user.username
        };

        const tokenString = 'Bearer ' + user.signInUserSession.idToken.jwtToken;
        const response = await fetch(baseUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': tokenString
            },
            body: JSON.stringify(availability)
        });
        return response;
    }

    const onFinish = async () => {
        await postAvailability();
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: selectedDate
            }
        });
    };

    const onCancel = () => {
        history.push({
            pathname: "/my-calendar",
            state: {
                selectedDate: selectedDate
            }
        });
    };

    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const onSubjectSelect = (selectedList, selectedItem) => {
        setSelectedSubjects(selectedList);
    };

    const onSubjectRemove = (selectedList, selectedItem) => {
        setSelectedSubjects(selectedList);
    };

    const makeStartTimeOptions = () => {
        let isToday = moment(day).isSame(new Date(), "day");

        let initial = moment(day);
        if (isToday) {
            const snappedMinute = snapTo30Min(initial);
            initial.set('minute',  snappedMinute);
        } else {
            initial.set('hour', 0);
            initial.set('minute', 0);
        }

        let options = [];
        let index = 0;
        let current = moment(initial);
        while (current.day() === initial.day()) {
            const hour = current.hour() % 12 === 0 ? 12 : current.hour() % 12;
            const minutes = current.minute() === 0 ? '00' : '30';
            const amOrPm = current.hour() >= 12 ? 'PM' : 'AM';
            options.push({
                label: `${hour}:${minutes} ${amOrPm}`,
                id: index
            });

            current.add(30, 'minutes');
            ++index;
        }

        return options;
    };

    const makeEndTimeOptions = () => {

    };

    return (
        <header className={props.pageBorderClass}>
            <Title
                titleText={"CreateAvailability"}
                underlineClass={props.underlineClass}/>

            <table className="AvailabilityForm">
                <tr>
                    <td>
                        <label for="subject">
                            Subjects
                        </label>
                    </td>
                    <td>
                        <Multiselect
                            options={subjects.map((subject, index) => { return { name: subject, id: index}}) } // Options to display in the dropdown
                            selectedValues={null}  // Preselected value to persist in dropdown
                            onSelect={onSubjectSelect} // Function will trigger on select event
                            onRemove={onSubjectRemove} // Function will trigger on remove event
                            displayValue="name" // Property name to display in the dropdown options
                            closeOnSelect={false}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="day">
                            Day:
                        </label>
                    </td>
                    <td>
                        <input
                            onChange={handleChangeDay}
                            type="date"
                            name="day"
                            value={moment(day).format("YYYY-MM-DD")}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="startTime">
                            Start Time:
                        </label>
                    </td>
                    <td>
                        <Select
                            options={makeStartTimeOptions()}
                            onChange={handleChangeStartTime}
                            multi={false}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="endTime">
                            End Time:
                        </label>
                    </td>
                    <td>
                        <Select
                            options={makeEndTimeOptions()}
                            onChange={handleChangeEndTime}
                            multi={false}
                        />
                    </td>
                </tr>
                <tr>
                    <td>
                        <button onClick={onCancel}>
                            Cancel
                        </button>
                    </td>
                    <td>
                        <button onClick={onFinish}>
                            Create Availability
                        </button>
                    </td>
                </tr>
            </table>

        </header>
    );
}
