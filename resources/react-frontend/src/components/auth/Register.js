import React, {useEffect, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';

import {Button, Form, Input, Row} from 'antd';
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Auth} from 'aws-amplify';

import {Header} from '../Header';
import {authStyles} from './styles';
import {checkAuthenticated} from "./CheckAuthenticated";

export function Register() {
    const history = useHistory();

    useEffect(() => {
        checkAuthenticated(false, () => history.push("/profile"));
    });

    const [failed, setFailed] = useState(false);

    const onFinish = values => {
        Auth.signUp(values.email, values.password)
            .then(data => {
                // navigate to confirm
                history.push("/confirm");
            }).catch(err => {
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
                Register
            </Row>

            { failed &&
                <p style={authStyles.errorMsg} >Error Registering</p>
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

                    { // TODO confirm pw
                    }

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={authStyles.formButton}>
                            Register
                        </Button>
                        Already registered? <Link to="login">login</Link>
                    </Form.Item>

                    { // TODO link to confirmation code page
                    }

                </Form>
            </Row>
        </div>
    );

}
