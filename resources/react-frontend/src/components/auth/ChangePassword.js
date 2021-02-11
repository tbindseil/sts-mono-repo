import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Button, Form, Input, Row} from 'antd';
import {LockOutlined} from "@ant-design/icons";
import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkAuthenticated} from "./CheckAuthenticated";

export function ChangePassword() {
    const history = useHistory();

    useEffect(() => {
        checkAuthenticated(true, () => history.push("/anonymous-user"));
    });

    const [failed, setFailed] = useState(false);

    const onFinish = values => {
        Auth.currentAuthenticatedUser()
            .then(user => {
                return Auth.changePassword(user, values.oldPassword, values.newPassword);
            })
            .then(data => {
                history.push("/profile");
                // TODO result
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
                Change Password
            </Row>

            { failed &&
                <p style={authStyles.errorMsg} >Error Changing Password</p>
            }

            <Form
                name="basic"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                style={authStyles.form}>

                <Form.Item
                    name="oldPassword"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your old password!'
                        }
                    ]}>

                    <Input
                        prefix={<LockOutlined/>}
                        type="password"
                        placeholder="old password"
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

                { // TODO confirm new password
                }

                <Form.Item>
                    <Button type="primary" htmlType="submit" style={authStyles.formButton}>
                        Change Password
                    </Button>
                </Form.Item>
            </Form>

        </div>
    );

}
