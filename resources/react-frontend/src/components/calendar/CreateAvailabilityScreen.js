import React, {useEffect, useState} from 'react';

import {useHistory} from 'react-router-dom';
import moment from 'moment';

import {Header} from '../Header';
import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';
import {checkAuthenticated} from "../auth/CheckAuthenticated";

export function CreateAvailabilityScreen(props) {

    const history = useHistory();

    const stateProps = props.location.state;
    const selectedDate = stateProps ? (stateProps.selectedDate ? stateProps.selectedDate : new Date()) : new Date();

    const baseUrl = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod'

    // TJTAG
    // TODO forms, uhhh

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    const [subjects, setSubjects] = useState("");
    const [startTime, setStartTime] = useState(16);
    const [duration, setDuration] = useState(15);

    // TODO input validation, amongst many other things like using better input methods
    const postAvailability = async () => {

        const startTimeAsDate = moment(selectedDate).startOf("day").add(startTime, 'h').toDate();

        const availability = {
            subjects: subjects,
            startTime: startTimeAsDate,
            endTime: moment(startTimeAsDate).add(duration, 'm').toDate(),
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

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "subjects") {
            setSubjects(value);
        } else if (name === "startTime") {
            setStartTime(value);
        } else if (name === "duration") {
            setDuration(value);
        }
    }

    const onFinish = async () => {
        console.log("calling onFinish");
        await postAvailability();
        console.log("done calling onFinish");
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

    return (
        <>
            <Header/>

            <h2>
                CreateAvailability
            </h2>

            <form
                onChange={handleChange}>

                <TextInput
                    name={"selectedDate"}
                    label={"Selected Date"}
                    value={moment(selectedDate).format("dddd, MMM D")}
                    readOnly={true}/>
                <br/>
                <br/>

                <TextInput
                    name={"subjects"}
                    label={"Subjects"}
                    value={subjects}/>
                <br/>
                <br/>

                <TextInput
                    name={"startTime"}
                    label={'Start Time (in hours, think military time..)'}
                    value={startTime}/>
                <br/>
                <br/>

                <TextInput
                    name={"duration"}
                    label={'Duration (in minutes)'}
                    value={duration}/>
                <br/>
                <br/>

                <FormButton
                    onClick={onCancel}
                    value={"Cancel"}/>
                <FormButton
                    onClick={onFinish}
                    value={"Create Availability"}/>
            </form>

        </>
    );
}
