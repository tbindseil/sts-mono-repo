import React from 'react';
import {Button, Form, Input, Row} from 'antd';
import {Link} from 'react-router-dom';
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {Auth} from 'aws-amplify';

import {Header} from '../Header';
import {authStyles} from './styles';

export class Register extends React.Component {

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
                // navigate to home
                this.props.history.push("/profile");
            })
            .catch(err => {
                // do nothing, Register is only accessible when no currentlyAuthenticatedUser
            });
    }

    onFinish = values => {
        Auth.signUp(values.email, values.password)
            .then(data => {
                // navigate to confirm
                this.props.history.push("/confirm");
            }).catch(err => {
                this.setState({
                    failed: true,
                });
            });

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
                    Register
                </Row>

                { this.state.failed &&
                    <p style={authStyles.errorMsg} >Error Registering</p>
                }

                <Row>
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

}
