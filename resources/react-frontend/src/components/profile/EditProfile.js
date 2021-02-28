import React, {useState} from 'react';
import {Button, Form, Input, Row} from 'antd';

export function EditProfile(props) {
    const [newProfile, setNewProfile] = useState(props.currProfile);

    const styles = {
        loginForm: {
            "maxWidth": "300px"
        },
        loginFormButton: {
            "width": "100%"
        }
    };

    const onFinish = () => {
        props.onSave(newProfile);
    }

    const handleChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        var updatedProfile = newProfile;
        updatedProfile[name] = value;

        setNewProfile(updatedProfile);
    }

    return (
      <>
          <Row style={{display: 'flex', justifyContent: 'center', margin: "15px"}}>
              Login
          </Row>
          <Row>
              <Form
                  name="basic"
                  onChange={handleChange}
                  onFinish={onFinish}
                  onFinishFailed={props.onCancel}
                  style={styles.loginForm}>
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
                          placeholder={newProfile.firstName}
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
                          placeholder={newProfile.lastName}
                          name="lastName"
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
                          placeholder={newProfile.school}
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
                          placeholder={newProfile.grade}
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
                          placeholder={newProfile.bio}
                          name="bio"
                      />
                  </Form.Item>
                  <Form.Item>
                      <Button type="primary" htmlType="submit" style={styles.loginFormButton}>
                          Update
                      </Button>
                      <Button type="primary" style={styles.loginFormButton} onClick={props.onCancel}>
                          Cancel
                      </Button>
                  </Form.Item>
              </Form>
          </Row>
      </>
    );
}
