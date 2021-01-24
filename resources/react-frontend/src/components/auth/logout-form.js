import {Button, Form, Input, notification, Row} from 'antd';
import React, {useEffect, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';

import {AuthService} from "../../services/auth-service";
import {Hub, Logger} from '@aws-amplify/core';
import {Auth} from "aws-amplify";
import {LockOutlined, UserOutlined} from "@ant-design/icons";

import {Header} from '../Header';

export function LogoutForm() {
    const logger = new Logger('LogoutForm');
    const history = useHistory();

    const styles = {
        logoutForm: {
            "maxWidth": "300px"
        },
        logoutFormForgot: {
            "float": "right"
        },
        logoutFormButton: {
            "width": "100%"
        }
    };
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        Hub.listen(AuthService.CHANNEL, onHubCapsule, 'MyListener');

        // maybe if nobody signed in, display message or grey out signout?
        /*Auth.currentAuthenticatedUser({
            bypassCache: true  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        }).then(user => {
            if (user)
                history.push("/")

        }).catch(err => console.log(err));*/

        return function cleanup() {
            logger.info("Removing HUB subscription to " + AuthService.CHANNEL);
            Hub.remove(AuthService.CHANNEL, onHubCapsule);
        };
    });


    // Default handler for listening events
    const onHubCapsule = (capsule) => {
        const {channel, payload} = capsule;
        if (channel === AuthService.CHANNEL && payload.event === AuthService.AUTH_EVENTS.LOGOUT) {
            logger.info("Hub Payload: " + JSON.stringify(payload));
            if (!payload.success) {
                logger.info("Payload error: " + JSON.stringify(payload.error));

                setErrorMessage(payload.message);

                notification.open({
                    type: 'error',
                    message: 'Could not log out',
                    description: payload.message,
                    duration: 10
                });
            } else {
                notification.open({
                    type: 'success',
                    message:
                        ' You have successfully logged out!',
                    description: 'click logo to go home!',
                });

                // history.push("/")
            }
        }
    };
    const onFinish = values => {
        console.log('Success:', values);
        AuthService.logout();
    };

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    return <div>

        <Header/>

        <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
            Logout
        </Row>
        <Row>
            <Form
                name="basic"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                style={styles.logoutForm}>
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={styles.logoutFormButton}>
                        Log out
                    </Button>
                </Form.Item>
            </Form>
        </Row>
    </div>


}

