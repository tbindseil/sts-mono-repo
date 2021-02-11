import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Button, Form, Input, Row} from 'antd';
import {UserOutlined} from "@ant-design/icons";
import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkAuthenticated} from "./CheckAuthenticated";

export function InitiatePasswordReset() {
    const history = useHistory();

    useEffect(() => {
        checkAuthenticated(false, () => history.push("/profile"));
    });

    const [failed, setFailed] = useState(false);

    const onFinish = values => {
        Auth.forgotPassword(values.email)
            .then(data => {
                history.push("/confirm-password-reset");
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
                Initiate Password Reset
            </Row>

            { failed &&
                <p style={authStyles.errorMsg} >Error Logging out</p>
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
                                message: 'Please input your email!'
                            }
                        ]}>

                        <Input
                            prefix={<UserOutlined/>}
                            placeholder="email"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={authStyles.formButton}>
                            Initiate Password Reset
                        </Button>
                    </Form.Item>
                </Form>
            </Row>
        </div>
    );

}
