import React, {useEffect, useState} from 'react';

import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';
import moment from 'moment';
import Multiselect from 'multiselect-react-dropdown';

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
    const [day, setDay] = useState(at6pm);
    const handleChangeDay = (event) => {
        const dayMoment = moment(day);
        const currStartHour = dayMoment.hours();
        const currStartMinute = dayMoment.minutes();

        const nextDay = moment(event.target.value).add(currStartHour, "hours").add(currStartMinute, "minutes").toDate();

        setDay(nextDay);
    }

    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const handleChangeStartTime = (event) => {
        const splitTime = event.target.value.split(":");
        const hours = splitTime[0];
        const minutes = splitTime[1];

        // zero day's minutes
        const startOfDay = moment(day).hours(0).minutes(0).seconds(0).milliseconds(0);

        // add new start time's hours and minutes
        setDay(moment(startOfDay).add(hours, "hours").add(minutes, "minutes").toDate());
    }

    const [duration, setDuration] = useState(15);
    const handleChangeDuration = (event) => {
        setDuration(event.target.value);
    }

    const postAvailability = async () => {
        const availability = {
            subjects: selectedSubjects.map(subject => subject.name).join(','),
            startTime: day,
            endTime: moment(day).add(duration, 'm').toDate(),
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

    const onSubjectSelect = (selectedList, selectedItem) => {
        setSelectedSubjects(selectedList);
    };

    const onSubjectRemove = (selectedList, selectedItem) => {
        setSelectedSubjects(selectedList);
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
                        <input onChange={handleChangeDay} type="date" name="day" value={moment(day).format("YYYY-MM-DD")}/>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="startTime">
                            Start Time:
                        </label>
                    </td>
                    <td>
                        <input onChange={handleChangeStartTime} type="time" name="startTime" value={moment(day).format("HH:mm")}/>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="durationMinutes">
                            Duration (in Minutes):
                        </label>
                    </td>
                    <td>
                        <input onChange={handleChangeDuration} type="text" name="durationMinutes" value={duration}/>
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
