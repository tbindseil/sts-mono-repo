import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {Button, Form, Input, Row} from 'antd';
import {LockOutlined} from "@ant-design/icons";
import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkAuthenticated} from "./CheckAuthenticated";
import {PasswordRequirements} from './PasswordRequirements';

export function ChangePassword() {
    const history = useHistory();

    const [user, setUser] = useState(undefined)
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser // TODO does this cause repeats??
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // TJTAG
    // This is what I'm doing rn
    // always get user via auth bridge
    const onFinish = async (values) => {
        if (values.newPassword !== values.confirmNewPassword) {
            setErrorMessage("password entries do not match");
            setFailed(true);
            return;
        }

        try {
            await Auth.changePassword(user, values.oldPassword, values.newPassword);
        } catch (err) {
            setFailed(true);
            var message = "Error Changing Password";
            if (err.message) {
                message += ": " + err.message;
            }
            setErrorMessage(message);
        }

        history.push("/profile");
    };

    const onFinishFailed = errorInfo => {
        setErrorMessage("Error Changing Password");
        setFailed(true);
    };

    return (
        <div>

            <Header/>

            <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                Change Password
            </Row>

            <Row>
                <PasswordRequirements/>
            </Row>

            { failed &&
                <p style={authStyles.errorMsg} >{errorMessage}</p>
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
                        Change Password
                    </Button>
                </Form.Item>
            </Form>

        </div>
    );

}
