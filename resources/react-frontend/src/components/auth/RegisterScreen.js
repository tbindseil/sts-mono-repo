import React, {useEffect, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';

import {Button, Form, Input, Row} from 'antd';
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Auth} from 'aws-amplify';

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkUnauthenticated} from "./CheckAuthenticated";
import {PasswordRequirements} from './PasswordRequirements';

export function RegisterScreen() {
    const history = useHistory();

    useEffect(() => {
        checkUnauthenticated(() => history.push("/profile"));
    }, [
        history
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const onFinish = values => {
        if (values.password !== values.confirmPassword) {
            setFailed(true);
            setErrorMessage("password entries do not match");
            return;
        }

        Auth.signUp(values.email, values.password)
            .then(data => {
                history.push("/confirm");
            }).catch(err => {
                setFailed(true);
                var message = "Error Registering";
                if (err.message) {
                    message += ": " + err.message;
                }
                setErrorMessage(message);
            });

    };

    const onFinishFailed = errorInfo => {
        setFailed(true);
        setErrorMessage("Error Registering");
    };

    return (
        <div>

            <Header/>

            <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                Register
            </Row>

            <Row>
                <PasswordRequirements/>
            </Row>

            { failed &&
                <p style={authStyles.errorMsg} >{errorMessage}</p>
            }

            <Row>
                <Form
                    name="basic"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    style={authStyles.form}>
                    <Form.Item
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your email!',
                            }
                        ]}>
                        <Input
                            prefix={<UserOutlined/>}
                            placeholder="Email"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your Password!'
                            }
                        ]}>

                        <Input
                            prefix={<LockOutlined/>}
                            type="password"
                            placeholder="Password"
                        />

                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        rules={[
                            {
                                required: true,
                                message: 'Please confirm your Password!'
                            }
                        ]}>

                        <Input
                            prefix={<LockOutlined/>}
                            type="password"
                            placeholder="confirm password"
                        />

                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={authStyles.formButton}>
                            Register
                        </Button>
                        Already registered? <Link to="login">login</Link>
                        <br/>
                        Looking to confirm registration? <Link to="confirm">confirm</Link>
                    </Form.Item>

                </Form>
            </Row>
        </div>
    );

}
