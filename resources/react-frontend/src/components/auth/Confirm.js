import React from 'react';

import {Button, Form, Input, Row} from 'antd';
import {Link} from "react-router-dom";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Auth} from 'aws-amplify';

import {Header} from '../Header';

export class Confirm extends React.Component {

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
            "max-width": "300px"
        },
        loginFormButton: {
            "width": "100%"
        },
        confirmErrorMsg: {
            "color": "red"
        }
    };

    componentDidMount() {
        Auth.currentAuthenticatedUser({
            bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        })
            .then(user => {
                // navigate to home
                this.props.history.push("/");
            })
            .catch(err => {
                // do nothing, Confirm is only accessible when no currentlyAuthenticatedUser
            });
    }

    onFinish = values => {
        Auth.confirmSignUp(values.email, values.code, {
            forceAliasCreation: true
        }).then(data => {
            this.props.history.push("/login");
        }).catch(err => {
            this.setState({
                failed: true,
            });
        });
        // TODO I might be logging pws...
    };

    onFinishFailed = errorInfo => {
        this.setState({
            failed: true,
        });
    };

    render() {
        return (
            <div>

                <Header/>

                <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                    Use the emailed code to confirm your email
                </Row>

                { this.state.failed &&
                    <p style={this.styles.confirmErrorMsg} >Error Confirming</p>
                }

                <Row>
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

                            <Button type="primary" htmlType="submit" style={this.styles.loginFormButton}>
                                Confirm Email
                            </Button>
                            Already confirmed? <Link to="login">Login</Link>
                        </Form.Item>
                    </Form>
                </Row>
            </div>
        );

    }
}
