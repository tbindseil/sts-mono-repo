import {Button, Form, Row} from 'antd';
import React from 'react';

import {Auth} from "aws-amplify";

import {Header} from '../Header';
import {authStyles} from './styles';

export class Logout extends React.Component {

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
                // do nothing
            })
            .catch(err => {
                this.props.history.push("/anonymous-user");
            });
    }

    onFinish = values => {
        Auth.signOut({ global: true })
            .then(() => {
                this.props.history.push("/");
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
                    Logout
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
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={authStyles.formButton}>
                                Log out
                            </Button>
                        </Form.Item>
                    </Form>
                </Row>
            </div>
        )
    }

}
