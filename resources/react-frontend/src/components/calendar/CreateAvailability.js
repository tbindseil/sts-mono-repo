import React, {useEffect, useState} from 'react';

import {useHistory} from 'react-router-dom';
import {Button, Form, Input, Row} from 'antd';
import moment from 'moment';
import {Auth} from "aws-amplify";

import {Header} from '../Header';

// Many thoughts, I have like 6 things called createavailability
// this should probably be its own screen (and file) with how I'm doing things
// all other screens should have screen in component name like CalendarScreen
// here we should be able to choose between modifying (put), creating (post) and deleteing (delete)
//      I guess that means this is the availabilityscreen compononent
export function CreateAvailability(props) {

    const history = useHistory();

    const stateProps = props.location.state;

    const baseUrl = 'https://k2ajudwpt0.execute-api.us-west-2.amazonaws.com/prod'

    const styles = {
        loginForm: {
            "maxWidth": "600px",
        },
        loginFormButton: {
            "width": "100%"
        }
    };

    useEffect(() => {
        // TODO trigger this after close of CreateAvailability
        Auth.currentAuthenticatedUser({
            bypassCache: false
        })
            .then(user => {
                console.log("1");
                setUser(user);
                console.log("2");
            })
            .catch(err => {
                history.push("/anonymous-user");
            });
    }, [

    ]);

    const [user, setUser] = useState(undefined)
    const [subjects, setSubjects] = useState("");
    const [startTime, setStartTime] = useState(stateProps.selectedDate);
    const [duration, setDuration] = useState(15);

    // TODO input validation, amongst many other things like using better input methods
    const createAvailability = () => {

        const availability = {
            subjects: subjects,
            startTime: startTime,
            endTime: moment(startTime).add(duration, 'm').toDate(),
            tutor: user.username
        };

        // TODO this stuff needs to be taken care of
        // url, token, and availability could be blank??
        // also, if I have user, why not just use that for token?
        async function postAvailability(url = '', token = '') {
            const tokenString = 'Bearer ' + token;
            const response = await fetch(url, {
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

        postAvailability(baseUrl, user.signInUserSession.idToken.jwtToken);
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

    const onFinish = () => {
        createAvailability();
        history.push("/calendar");
    };

    const onCancel = () => {
        history.push("/calendar");
    };

    return (
        <>
            <Header/>

            <h2>
                CreateAvailability
            </h2>


            <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                Login
            </Row>
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
