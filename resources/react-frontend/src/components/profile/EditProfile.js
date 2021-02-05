import React from 'react';
import {Button, Form, Input, Row} from 'antd';

export class EditProfile extends React.Component {
    onSave;
    onCancel;

    constructor(props) {
        super(props);

        this.onFinish = this.onFinish.bind(this);

        this.onSave = props.onSave;
        this.onCancel = props.onCancel;

        this.state = {
            newProfile: props.currProfile
        }
    }

    styles = {
        loginForm: {
            "maxWidth": "300px"
        },
        loginFormButton: {
            "width": "100%"
        }
    };

    onFinish = (onSave) => {
        onSave(this.state.newProfile);
    }

    handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        console.log("value is: " + value);
        console.log("name is: " + name);

        this.setState({
            newProfile: {
                [name]: value
            }
        });
    }

    // pass onSave as a function, then onSave is in profile and does the heavy listing, this just passes values to the function
    render() {
      console.log("this.state.newProfile is:");
      console.log(this.state.newProfile);

      return (
        <>
            <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                Login
            </Row>
            <Row>
                <Form
                    name="basic"
                    onChange={this.handleChange}
                    onFinish={this.onFinish(this.onSave)}
                    onFinishFailed={this.onCancel()}
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
                            placeholder={this.state.newProfile.firstName}
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
                            placeholder={this.state.newProfile.lastName}
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
                            placeholder={this.state.newProfile.school}
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
                            placeholder={this.state.newProfile.grade}
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
                            placeholder={this.state.newProfile.bio}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={this.styles.loginFormButton}>
                            Update
                        </Button>
                        <Button type="primary" style={this.styles.loginFormButton} onClick={this.onCancel}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Row>
        </>
      );
    }
}
