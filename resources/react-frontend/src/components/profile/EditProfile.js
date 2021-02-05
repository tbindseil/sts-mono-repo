import React from 'react';
import {Button, Form, Input, Row} from 'antd';

export class EditProfile extends React.Component {
    styles = {
        loginForm: {
            "maxWidth": "300px"
        },
        loginFormButton: {
            "width": "100%"
        }
    };

    // TODO keep going here, how to pass profile from here to api..
    onFinish = (onFinishFailed) => {
        console.log("DOY");
    }

    onFinishFailed = errorInfo => {
        console.log('onFinishFailed Failed:', errorInfo);
    };

    // pass onSave as a function, then onSave is in profile and does the heavy listing, this just passes values to the function
    EditProfile(props) {
      return (
        <>
            <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                Login
            </Row>
            <Row>
                <Form
                    name="basic"
                    onFinish={props.onSave}
                    onFinishFailed={this.onFinishFailed}
                    style={this.styles.loginForm}>
                    <Form.Item
                        name="firstName"
                        label='First Name'
                        rules={[
                            {
                                required: false,
                                message: 'First Name',
                            }
                        ]}>
                        <Input
                            placeholder={props.profile.firstName}
                        />
                    </Form.Item>
                    <Form.Item
                        name="lastName"
                        label='Last Name'
                        rules={[
                            {
                                required: false,
                                message: 'Last Name',
                            }
                        ]}>
                        <Input
                            placeholder={props.profile.lastName}
                        />
                    </Form.Item>
                    <Form.Item
                        name="school"
                        label='School'
                        rules={[
                            {
                                required: false,
                                message: 'School',
                            }
                        ]}>
                        <Input
                            placeholder={props.profile.school}
                        />
                    </Form.Item>
                    <Form.Item
                        name="grade"
                        label='Grade'
                        rules={[
                            {
                                required: false,
                                message: 'Grade',
                            }
                        ]}>
                        <Input
                            placeholder={props.profile.grade}
                        />
                    </Form.Item>
                    <Form.Item
                        name="bio"
                        label='Bio'
                        rules={[
                            {
                                required: false,
                                message: 'Bio',
                            }
                        ]}>
                        <Input
                            placeholder={props.profile.bio}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={this.styles.loginFormButton}>
                            Update
                        </Button>
                        <Button type="primary" htmlType="submit" style={this.styles.loginFormButton} onClick={props.onCancel}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Row>
        </>
      );
    }
}
