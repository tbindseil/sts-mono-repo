import React from 'react';
import {Button, Form, Input, Row} from 'antd';

// TODO there's a bug here with modifying profiles for sure..
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
        };
    }

    styles = {
        loginForm: {
            "maxWidth": "300px"
        },
        loginFormButton: {
            "width": "100%"
        }
    };

    onFinish = () => {
        this.onSave(this.state.newProfile);
    }

    handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        var updatedProfile = this.state.newProfile;
        updatedProfile[name] = value;

        this.setState({
            newProfile: updatedProfile
        });
    }

    render() {

      return (
        <>
            <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
                Login
            </Row>
            <Row>
                <Form
                    name="basic"
                    onChange={this.handleChange}
                    onFinish={this.onFinish}
                    onFinishFailed={this.onCancel}
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
                            name="firstName"
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
                            name="LastName"
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
                            name="school"
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
                            name="grade"
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
                            name="bio"
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
