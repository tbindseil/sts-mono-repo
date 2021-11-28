import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

import {apiFactory} from '../fetch-enhancements/fetch-call-builders';
import {BaseScreen} from '../base-components/BaseScreen';
import {TextInput} from '../forms/TextInput';
import {FormButton} from '../forms/FormButton';

export function CreateGroupScreen(props) {
    const history = useHistory();

    const [user, setUser] = useState(undefined);

    const [groupName, setGroupName] = useState("");
    const [parentGroup, setParentGroup] = useState(null);

    const handleChange = event => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "groupName") {
            setGroupName(value);
        } else if (name === "parentGroup") {
            setParentGroup(value);
        }
    };

    const onFinish = () => {
        const body = {
            groupName: groupName,
            parentGroup: parentGroup
        };

        const successHandler = (response) => {
            history.push({
                pathname: "/group",
                state: {
                    groupId: response.groupId
                }
            });
        };

        const call = apiFactory.makePostGroup({
            user: user,
            body: JSON.stringify(body),
            successHandler: successHandler
        });
        return call();
    };

    return (
        <BaseScreen
            titleText={"Create Group Screen"}
            needAuthenticated={true}
            setUser={setUser}>

            <form
                className="Centered MaxWidth AuthForm"
                onChange={handleChange}>

                <br/>Group Info<br/>

                <TextInput
                    name={"groupName"}
                    placeHolder={"Group Name"}
                    value={groupName}/>
                <br/>

                <TextInput
                    name={"parentGroup"}
                    placeHolder={"Parent Group"}
                    value={parentGroup}/>
                <br/>

                <FormButton
                    onClick={onFinish}
                    value={"Create Group"}/>
            </form>

        </BaseScreen>
    );
}
