import React, {useEffect, useState} from 'react';

import {useHistory} from 'react-router-dom';
import {Button, Form, Input, Row} from 'antd';
import moment from 'moment';

import {Header} from '../Header';
import {checkAuthenticated} from "../auth/CheckAuthenticated";

export function CreateAvailabilityScreen(props) {

    const history = useHistory();

    const stateProps = props.location.state;
    const selectedDate = stateProps ? (stateProps.selectedDate ? stateProps.selectedDate : new Date()) : new Date();

    const baseUrl = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod'

    // TODO forms, uhhh
    const styles = {
        loginForm: {
            "maxWidth": "600px",
        },
        loginFormButton: {
            "width": "100%"
        }
    };

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    const [subjects, setSubjects] = useState("");
    const [startTime, setStartTime] = useState(selectedDate);
    const [duration, setDuration] = useState(15);

    // TODO input validation, amongst many other things like using better input methods
    const postAvailability = async () => {

        const availability = {
            subjects: subjects,
            startTime: startTime,
            endTime: moment(startTime).add(duration, 'm').toDate(),
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
            const startTimeAsDate = moment(selectedDate).startOf("day").add(value, 'h').toDate();
            setStartTime(startTimeAsDate);
        } else if (name === "duration") {
            setDuration(value);
        }
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

    return (
        <>
            <Header/>

            <h2>
                CreateAvailability
            </h2>

            <Row>
                <Form
                    name="basic"
                    onChange={handleChange}
                    onFinish={onFinish}
                    style={styles.loginForm}>

                    <Form.Item
                        label="Selected Date">
                        <Input
                            value={moment(selectedDate).format("dddd, MMM D")}
                            name="selectedDate"
                            disabled={true}
                        />
                    </Form.Item>

                    <Form.Item
                        name="subjects"
                        label='Subjects'
                        rules={[
                            {
                                required: true,
                                message: 'Subjects',
                            }
                        ]}>
                        <Input
                            placeholder="Subjects"
                            name="subjects"
                        />
                    </Form.Item>

                    <Form.Item
                        name="startTime"
                        label='Start Time (in hours, think military time..)'
                        rules={[
                            {
                                required: true,
                                message: 'Choose a start time for availability',
                            }
                        ]}>
                        <Input
                            placeholder="Start Time"
                            name="startTime"
                        />
                    </Form.Item>

                    <Form.Item
                        name="duration"
                        label='Duration'
                        rules={[
                            {
                                required: true,
                                message: 'Provide a duration for the availability (in minutes)',
                            }
                        ]}>
                        <Input
                            placeholder="Duration"
                            name="duration"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={styles.loginFormButton}>
                            Create Availability
                        </Button>
                        <Button type="primary" style={styles.loginFormButton} onClick={onCancel}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Row>
        </>
    );
}