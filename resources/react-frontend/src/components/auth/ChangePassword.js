import React from 'react';

import {Button, Form, Input, Row} from 'antd';
import {LockOutlined} from "@ant-design/icons";

import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {authStyles} from './styles';

export class ChangePassword extends React.Component {

    constructor(props) {
        super(props);
        this.onFinish = this.onFinish.bind(this);
        this.onFinishFailed = this.onFinishFailed.bind(this);
        this.state = {
            failed: false,
        }
    }

    componentDidMount() {
        // TODO dry it out.. composition?
        Auth.currentAuthenticatedUser({
            bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
        })
            .then(user => {
                // do nothing
            })
            .catch(err => {
                this.props.history.push("/anonymous-user");
            });
    }

    onFinish = values => {
        Auth.currentAuthenticatedUser()
            .then(user => {
                return Auth.changePassword(user, values.oldPassword, values.newPassword);
            })
            .then(data => {
                this.props.history.push("/profile");
                // TODO result
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
            <div>

                <Header/>

                <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                    Change Password
                </Row>

                { this.state.failed &&
                    <p style={authStyles.errorMsg} >Error Changing Password</p>
                }

                <Form
                    name="basic"
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
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
        )
    }

}
