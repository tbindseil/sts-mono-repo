import React from 'react';

import {Link} from 'react-router-dom';

import {Button, Form, Input} from 'antd';
import {LockOutlined, UserOutlined} from "@ant-design/icons";

import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {authStyles} from './styles';

export class Login extends React.Component {

    constructor(props) {
        super(props);
        this.onFinish = this.onFinish.bind(this);
        this.onFinishFailed = this.onFinishFailed.bind(this);
        this.state = {
            failed: false,
        }
    }

    componentDidMount() {
        Auth.currentAuthenticatedUser({
            bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        })
            .then(user => {
                this.props.history.push("/profile");
            })
            .catch(err => {
                // do nothing, Login is only accessible when no currentlyAuthenticatedUser
            });
    }

    onFinish = values => {
        Auth.signIn(values.email, values.password)
            .then(user => {
                this.props.history.push("/profile");
            })
            .catch(err => {
                this.setState({
                    failed: true
                });
            });
    };

    onFinishFailed = errorInfo => {
        this.setState({
            failed: true
        });
    };

    render() {
        return (
            <>
                <Header/>

                <h1>Login</h1>

                { this.state.failed &&
                    <p style={authStyles.errorMsg} >Error Logging In</p>
                }

                <Form
                    name="basic"
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
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
                    <Form.Item>
                        {/* TODO forgot password
                        <Link style={authStyles.formForgot} to="forgotpassword1">
                            Forgot password
                        </Link>
                        */}
                        <Button type="primary" htmlType="submit" style={authStyles.formButton}>
                            Log in
                        </Button>
                        Don't have an account? <Link to="register">Register here</Link>
                    </Form.Item>
                </Form>
            </>

        );
    }
}
