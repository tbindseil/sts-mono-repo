import React, {useEffect, useState} from 'react';

import {useHistory} from 'react-router-dom';
import {Button, Form, Input, Row} from 'antd';
import moment from 'moment';

import {Header} from '../Header';
import {checkAuthenticated} from "../auth/CheckAuthenticated";

// TODO all other screens should have screen in component name like CalendarScreen
// TODO here we should be able to choose between modifying (put), creating (post) and deleteing (delete)
//      I guess that means this is the availabilityscreen compononent
export function CreateAvailability(props) {

    const history = useHistory();

    // TODO make today selected date if no selected date
    const stateProps = props.location.state;

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
    const [startTime, setStartTime] = useState(stateProps.selectedDate);
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
            const startTimeAsDate = moment(stateProps.selectedDate).add(value, 'h').toDate();
            setStartTime(startTimeAsDate);
        } else if (name === "duration") {
            setDuration(value);
        }
    }

    const onFinish = async () => {
        // TODO send daate
        await postAvailability();
        history.push("/my-calendar");
    };

    const onCancel = () => {
        history.push("/my-calendar");
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
                            value={stateProps.selectedDate.toString()}
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
