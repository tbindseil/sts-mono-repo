// navigate here from AnonymousUser (or from Login)
// this page allows for registration via email/password/confirm password
// Also, this page links to confirmation page where recently registered users can enter their registration code
//
// in addition, if this page is navigated too with a logged in user, we inform the user that they are already logged in, then allow for them to logout via a link to the logout page

import React from 'react';
import {Button, Form, Input, Row} from 'antd';
import {Link} from 'react-router-dom';
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Auth} from 'aws-amplify';

import {Header} from '../Header';

export class Register extends React.Component {

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
        registerErrorMsg: {
            "color": "red"
        }
    };

    onFinish = values => {
        Auth.signUp(values.email, values.password)
            .then(data => {
                // navigate to confirm
                this.props.history.push("/confirm");
            }).catch(err => {
                this.setState({
                    failed: false,
                });
            });

    };

    onFinishFailed = errorInfo => {
        this.setState({
            failed: false,
        });
    };

    render() {
        return (
            <div>

                <Header/>

                <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                    Register
                </Row>

                { this.state.failed &&
                    <p style={this.styles.registerErrorMsg} >Error Registering In</p>
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
                            <Button type="primary" htmlType="submit" style={this.styles.loginFormButton}>
                                Register
                            </Button>
                            Already registered? <Link to="login">login</Link>
                        </Form.Item>
                    </Form>
                </Row>
            </div>
        );
    }

}
