import React, {useEffect, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';

import {Button, Form, Input, Row} from 'antd';
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Auth} from 'aws-amplify';

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkAuthenticated} from "./CheckAuthenticated";

export function Confirm() {
    const history = useHistory();

    useEffect(() => {
        checkAuthenticated(false, () => history.push("/profile"));
    });

    const [failed, setFailed] = useState(false);

    const onFinish = values => {
        Auth.confirmSignUp(values.email, values.code, {
            forceAliasCreation: true
        }).then(data => {
            history.push("/login");
        }).catch(err => {
            setFailed(true);
        });
        // TODO I might be logging pws...
    };

    const onFinishFailed = errorInfo => {
        setFailed(true);
    };

    return (
        <div>

            <Header/>

            <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                Use the emailed code to confirm your email
            </Row>

            { failed &&
                <p style={authStyles.errorMsg} >Error Confirming</p>
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
                                message: 'Please input your confirmation code!'
                            }
                        ]}>

                        <Input
                            prefix={<LockOutlined/>}
                            type="string"
                            placeholder="Code"
                        />
                    </Form.Item>

                    { // TODO link to register
                    }

                    { // TODO resend confirmation code
                        // static resendConfirmationCode = (username) => {
                        // Auth.resendSignUp(username).then(() => {
                        // }).catch(e => {
                        // });
                        //};
                    }

                    <Form.Item>

                        <Button type="primary" htmlType="submit" style={authStyles.formButton}>
                            Confirm Email
                        </Button>
                        Already confirmed? <Link to="login">Login</Link>
                    </Form.Item>
                </Form>
            </Row>
        </div>
    );

}
