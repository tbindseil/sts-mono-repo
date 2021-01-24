import React from 'react';
import {Col, Row} from "antd";
import {Header} from '../Header';

export class AuthScreen extends React.Component {

    render() {
        return (
            <>

              <Header/>

              <div style={{display: 'flex', justifyContent: 'center', minHeight: "500px"}}>
                  <Col>

                      <Row>
                          <a href={"/login"}>
                            <button href={"/login"}>login</button>
                          </a>
                          <a href={"/register"}>
                            <button href={"/register"}>register</button>
                          </a>
                          <a href={"/registerconfirm"}>
                            <button href={"/registerconfirm"}>registerconfirm</button>
                          </a>
                          <a href={"/forgotpassword1"}>
                            <button href={"/forgotpassword1"}>forgotpassword1</button>
                          </a>
                          <a href={"/forgotpassword2"}>
                            <button href={"/forgotpassword2"}>forgotpassword2</button>
                          </a>
                          <a href={"/logout"}>
                            <button href={"/logout"}>logout</button>
                          </a>
                      </Row>
                  </Col>
              </div>
            </>
        );
    }

}
