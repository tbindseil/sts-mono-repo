import React, {useEffect, useState} from 'react';
import MediaQuery from 'react-responsive';
import {useHistory} from 'react-router-dom';

import {Auth} from 'aws-amplify';

import {Header} from '../header/Header';
import {Bottom} from '../header/Bottom';
import {TextInput} from '../forms/TextInput';
import {Title} from '../layout/Title';
import {FormButton} from '../forms/FormButton';
import {checkUnauthenticated} from "./CheckAuthenticated";
import {PasswordRequirements} from './PasswordRequirements';

export function RegisterScreen() {
    return (
        <div className="TopLevelContainer">

            <Header/>

            <MediaQuery minWidth={765}>
                <RegisterBody
                    pageBorderClass={"PageBorder"}
                    underlineClass={"Underline"}/>
            </MediaQuery>

            <MediaQuery maxWidth={765}>
                <RegisterBody
                    pageBorderClass={"PageBorder2"}
                    underlineClass={"Underline2"}/>
            </MediaQuery>

            <Bottom/>

        </div>
    );
}

function RegisterBody(props) {
    const history = useHistory();

    useEffect(() => {
        checkUnauthenticated(() => history.push("/profile"));
    }, [
        history
    ]);

    const [failed, setFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [parentEmail, setParentEmail] = useState("");
    const [parentName, setParentName] = useState("");

    const [email, setEmail] = useState("");
    const [school, setSchool] = useState("");
    const [grade, setGrade] = useState("");
    const [age, setAge] = useState("");
    const [address, setAddress] = useState("");
    const [bio, setBio] = useState("");

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        } else if (name === "confirmPassword") {
            setConfirmPassword(value);
        } else if (name === "parentEmail") {
            setParentEmail(value);
        } else if (name === "parentName") {
            setParentName(value);
        } else if (name === "email") {
            setEmail(value);
        } else if (name === "school") {
            setSchool(value);
        } else if (name === "grade") {
            if ((value >= 1 && value <= 12) || value === "") {
                setGrade(value);
            }
        } else if (name === "age") {
            setAge(value);
        } else if (name === "address") {
            setAddress(value);
        } else if (name === "bio") {
            setBio(value);
        }
    }

    const onFinish = () => {
        if (password !== confirmPassword) {
            setFailed(true);
            setErrorMessage("password entries do not match");
            return;
        }

        Auth.signUp(email, password)
            .then(data => {
                history.push("/confirm");
            }).catch(err => {
                setFailed(true);
                var message = "Error Registering";
                if (err.message) {
                    message += ": " + err.message;
                }
                setErrorMessage(message);
            });
        // TODO .then post user
    };

    return (
        <>
            <header className={props.pageBorderClass}>

                <Title
                    titleText={"Register"}
                    underlineClass={props.underlineClass}/>

                <div className="Centered MaxWidth">
                    <PasswordRequirements/>

                    { failed &&
                        <p className="ErrorMessage">{errorMessage}</p>
                    }
                </div>

                <form
                    className="Centered MaxWidth AuthForm"
                    onChange={handleChange}>

                    <br/>Login Info<br/>
                    <TextInput
                        name={"username"}
                        value={username}
                        placeHolder={"Username"}/>
                    <br/>

                    <TextInput
                        name={"password"}
                        value={password}
                        placeHolder={"Password"}
                        type={"password"}/>
                    <br/>

                    <TextInput
                        name={"confirmPassword"}
                        value={confirmPassword}
                        placeHolder={'Confirm Password'}
                        type={"password"}/>
                    <br/>

                    <br/>Parent Info<br/>
                    <TextInput
                        name={"parentEmail"}
                        value={parentEmail}
                        placeHolder={"Parent Email"}/>
                    <br/>

                    <TextInput
                        name={"parentName"}
                        value={parentName}
                        placeHolder={"Parent Name"}/>
                    <br/>

                    <br/>Profile Info<br/>
                    <TextInput
                        name={"email"}
                        placeHolder={"Email"}
                        value={email}/>
                    <br/>

                    <TextInput
                        name={"school"}
                        placeHolder={"School"}
                        value={school}/>
                    <br/>

                    <TextInput
                        name={"grade"}
                        placeHolder={"Grade"}
                        value={grade}
                        type={"number"}/>
                    <br/>

                    <TextInput
                        name={"age"}
                        placeHolder={"Age"}
                        value={age}
                        type={"number"}/>
                    <br/>

                    <TextInput
                        name={"address"}
                        placeHolder={"Addrss"}
                        value={address}/>
                    <br/>

                    <TextInput
                        name={"bio"}
                        placeHolder={"Bio"}
                        value={bio}/>
                    <br/>

                    <FormButton
                        onClick={onFinish}
                        value={"Register"}/>
                </form>
                <br/>

                <div className="Centered MaxWidth">
                    <p>Already registered? <a href="/login">Log in here</a></p>
                    <p>Looking to confirm registration? <a href="/confirm">Go here</a></p>
                </div>

            </header>
        </>
    );
}
