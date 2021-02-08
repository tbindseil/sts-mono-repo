// navigate here from AnonymousUser
// this page allows for login via email/password
// in addition, if this page is navigated to with a logged in user, we inform the user that they are already logged in, then allow for them to logout via a link to the logout page
//
// this page also links to register for those who don't have an account yet

import React from 'react';

import {Link} from 'react-router-dom';

import {Button, Form, Input} from 'antd';
import {LockOutlined, UserOutlined} from "@ant-design/icons";

import {Auth} from "aws-amplify";

import {Header} from '../Header';

export class Login extends React.Component {

    constructor(props) {
        super(props);
        this.onFinish = this.onFinish.bind(this);
        this.onFinishFailed = this.onFinishFailed.bind(this);
        this.state = {
            failed: false,
        }
    }

    styles = {
        loginForm: {
            "maxWidth": "300px"
        },
        loginFormForgot: { // trim these
            "float": "right"
        },
        loginFormButton: {
            "width": "100%"
        },
        loginErrorMsg: {
            "color": "red"
        }
    };

    componentDidMount() {
        // TODO dry it out..
        Auth.currentAuthenticatedUser({
            bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        })
            .then(user => {
                // navigate to home
                this.props.history.push("/");
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
                    <p style={this.styles.loginErrorMsg} >Error Logging In</p>
                }

                <Form
                    name="basic"
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                    style={this.styles.loginForm}>
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
                        <Link style={this.styles.loginFormForgot} to="forgotpassword1">
                            Forgot password
                        </Link>
                        */}
                        <Button type="primary" htmlType="submit" style={this.styles.loginFormButton}>
                            Log in
                        </Button>
                        Don't have an account? <Link to="register">Register here</Link>
                    </Form.Item>
                </Form>
            </>

        );
    }
}
