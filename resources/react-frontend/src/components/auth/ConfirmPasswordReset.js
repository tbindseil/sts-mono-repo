import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Button, Form, Input, Row} from 'antd';
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Auth} from 'aws-amplify';

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkAuthenticated} from "./CheckAuthenticated";

export function ConfirmPasswordReset() {
    const history = useHistory();

    useEffect(() => {
        checkAuthenticated(false, () => history.push("/profile"));
    });

    const [failed, setFailed] = useState(false);

    const onFinish = values => {
        Auth.forgotPasswordSubmit(values.email, values.code, values.newPassword)
            .then(data => {
                history.push("/login");
            })
            .catch(err => {
                setFailed(true);
            });
    };

    const onFinishFailed = errorInfo => {
        setFailed(true);
    };

    return (
        <div>

            <Header/>

            <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                Use the emailed code change your password
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
