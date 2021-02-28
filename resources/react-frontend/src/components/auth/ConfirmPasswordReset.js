import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Button, Form, Input, Row} from 'antd';
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Auth} from 'aws-amplify';

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkUnauthenticated} from "./CheckAuthenticated";
import {PasswordRequirements} from './PasswordRequirements';

export function ConfirmPasswordReset() {
    const history = useHistory();

    useEffect(() => {
        checkUnauthenticated(() => history.push("/profile"));
    }, [
        history
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const onFinish = values => {
        if (values.newPassword !== values.confirmNewPassword) {
            setErrorMessage("password entries do not match");
            setFailed(true);
            return;
        }

        Auth.forgotPasswordSubmit(values.email, values.code, values.newPassword)
            .then(data => {
                history.push("/login");
            })
            .catch(err => {
                setFailed(true);
                var message = "Error Confirming Password Reset";
                if (err.message) {
                    message += ": " + err.message;
                }
                setErrorMessage(message);
            });
    };

    const onFinishFailed = errorInfo => {
        setFailed(true);
        setErrorMessage("Error Confirming Password Reset");
    };

    return (
        <div>

            <Header/>

            <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                Use the emailed code change your password
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
                                message: 'Please input your email',
                            }
                        ]}>
                        <Input
                            prefix={<UserOutlined/>}
                            placeholder="Email"
                        />
                    </Form.Item>
                    <Form.Item
                        name="code"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your code!'
                            }
                        ]}>

                        <Input
                            prefix={<LockOutlined/>}
                            type="string"
                            placeholder="Code"
                        />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your new password!'
                            }
                        ]}>

                        <Input
                            prefix={<LockOutlined/>}
                            type="password"
                            placeholder="new password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmNewPassword"
                        rules={[
                            {
                                required: true,
                                message: 'Please confirm your new password!'
                            }
                        ]}>

                        <Input
                            prefix={<LockOutlined/>}
                            type="password"
                            placeholder="confirm new password"
                        />
                    </Form.Item>

                    <Form.Item>

                        <Button type="primary" htmlType="submit" style={authStyles.formButton}>
                            Reset Passord
                        </Button>
                    </Form.Item>
                </Form>
            </Row>
        </div>
    );

}
