import React, {useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';

import {useHistory} from 'react-router-dom';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {Title} from '../layout/Title';
import {FormTableRow} from '../forms/TextInput'
import {checkAuthenticated} from "../auth/CheckAuthenticated";

export function MakeClassScreen() {
    return (
        <div className="TopLevelContainer">
            <Header/>

            <MediaQuery minWidth={765}>
                <MakeClassBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <MakeClassBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>
        </div>
    );
};

function MakeClassBody(props) {
    const baseUrl = 'https://tne2p23nkk.execute-api.us-west-2.amazonaws.com/prod/';

    const history = useHistory();

    const [className, setClassName] = useState("");
    const [teacherUsername, setTeacherUsername] = useState("");

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [user, setUser] = useState(undefined);
    useEffect(() => {
        checkAuthenticated(() => history.push("/anonymous-user"), setUser);
    }, [
        history, setUser
    ]);

    const handleChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "className") {
            setClassName(value);
        } else if (name === "teacherUsername") {
            setTeacherUsername(value);
        }
    }

    const onFinish = () => {
        async function postClass(url, token, clazz) {
            const tokenString = 'Bearer ' + token;
            const response = await fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenString
                },
                body: JSON.stringify(clazz)
            });
            return response;
        }

        const clazz = {
            className: className,
            teacherUsername: teacherUsername
        }
        postClass(baseUrl, user.signInUserSession.idToken.jwtToken, clazz)
            .then(data => {
                // go to view class
                // TODO this is kinda fucked up, its weird that only admins can make
                // a class, but then admins are almost never in the classes
                history.push("/profile");
            })
            .catch(error => {
                console.log("error is:");
                console.log(error);
                setFailed(true);
                // TODO can I relay that only admin can make class?
                setErrorMessage("Error creating class");
            });
    }

    return (
        <>
            <header className={props.pageBorderClass}>

                <Title
                    titleText={"Make Class"}
                    underlineClass={props.underlineClass}/>

                <div className="Centered MaxWidth">
                    <table className="StsTable">
                        <FormTableRow
                            onChange={handleChange}
                            name={"className"}
                            label={"Class Name:"}
                            value={className}/>

                        <FormTableRow
                            onChange={handleChange}
                            name={"teacherUsername"}
                            label={"Teacher"}
                            value={teacherUsername}/>

                        <tr>
                            <td>
                                <button onClick={onFinish}>
                                    Create Class
                                </button>
                            </td>
                        </tr>

                    </table>

                    { failed &&
                        <p className="ErrorMessage">{errorMessage}</p>
                    }

                </div>

            </header>
        </>
    );
}
