import React, {useEffect, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';

import {Button, Form, Input, Row} from 'antd';
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Auth} from 'aws-amplify';

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkUnauthenticated} from "./CheckAuthenticated";

export function Confirm() {
    const history = useHistory();

    useEffect(() => {
        checkUnauthenticated(() => history.push("/profile"));
    });

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [email, setEmail] = useState("");

    const onFinish = values => {
        Auth.confirmSignUp(values.email, values.code, {
            forceAliasCreation: true
        }).then(data => {
            history.push("/login");
        }).catch(err => {
            setFailed(true);
            var message = "Error Confirming";
            if (err.message) {
                message += ": " + err.message;
            }
            setErrorMessage(message);
            // TODO some weird wait
        });
    };

    const onFinishFailed = errorInfo => {
        setFailed(true);
        setErrorMessage("Error Confirming");
    };

    const resendCode = () => {
        Auth.resendSignUp(email).then(() => {
            // do nothing
        }).catch(err => {
            setFailed(true);
            var message = "Error Resending Code";
            if (err.message) {
                message += ": " + err.message;
            }
            setErrorMessage(message);
        });
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    return (
        <div>

            <Header/>

            <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                Use the emailed code to confirm your email
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
                        onChange={handleEmailChange}
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
                                message: 'Please input your confirmation code!'
                            }
                        ]}>

                        <Input
                            prefix={<LockOutlined/>}
                            type="string"
                            placeholder="Code"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={authStyles.formButton}>
                            Confirm Email
                        </Button>
                        <Button type="primary" onClick={resendCode} style={authStyles.formButton}>
                            Resend Code
                        </Button>
                        Already confirmed? <Link to="login">Login</Link>
                        <br/>
                        Not registered yet? <Link to="register">register</Link>
                    </Form.Item>
                </Form>
            </Row>
        </div>
    );

}
