import React from 'react';

import {Button, Form, Input, Row} from 'antd';
import {UserOutlined} from "@ant-design/icons";

import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {authStyles} from './styles';

export class InitiatePasswordReset extends React.Component {

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
                // do nothing
            });
    }

    onFinish = values => {
        Auth.forgotPassword(values.email)
            .then(data => {
                this.props.history.push("/confirm-password-reset");
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
                    Initiate Password Reset
                </Row>

                { this.state.failed &&
                    <p style={authStyles.errorMsg} >Error Logging out</p>
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
        )
    }

}