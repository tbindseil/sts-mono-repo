import React, {useCallback, useEffect, useState} from 'react';

import {useHistory} from 'react-router-dom';
import {cloneDeep} from 'lodash';

import './Profile.css';
import {FormTableRow} from '../forms/TextInput'
import {apiFactory} from '../fetch-enhancements/fetch-call-builders';
import {BaseScreenInDepthBase} from '../base-components/BaseScreen';

/**
 * So, I dont think we should be able to edit parent name or parent email, which are the only
 * things on the account page. So I'm commenting out the edit button but leaving the code
 * in case I want to turn it on.
 */

export function AccountScreen() {
    const history = useHistory();

    const [editting, setEditting] = useState(false);

    const [user, setUser] = useState(undefined);

    const getProfile = useCallback(() => {
        if (!user) {
            return;
        }

        const successHandler = (result) => {
            const newProfile = {
                parentName: result.parentName,
                parentEmail: result.parentEmail
            };

            setProfile(newProfile);
        };

        const call = apiFactory.makeGetUser({
            username: user.username,
            successHandler: successHandler
        });
        call();
    }, [
        user
    ]);

    const [profile, setProfile] = useState({
        parentName: "",
        parentEmail: ""
    });
    useEffect(() => {
        getProfile();
    }, [
        user, getProfile
    ]);

    const editProfileOnClickHandler = () => {
        setEditting(true);
    }

    const onSave = (profile) => {
        const call = apiFactory.makePutUser({
            user: user,
            successHandler: () => {},
            body: JSON.stringify(profile)
        });

        call();

        setEditting(false);
    }

    const onCancel = () => {
        setEditting(false);
        getProfile();
    }

    const onFinish = () => {
        onSave(profile);
    }

    const handleChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        var updatedProfile = cloneDeep(profile);
        updatedProfile[name] = value;

        setProfile(updatedProfile);
    }

    return (
        <BaseScreenInDepthBase
            titleText={"Account Screen"}
            needAuthenticated={true}
            setUser={setUser}>

            <div className="Centered MaxWidth">
                <table className="ProfileTable">
                    <FormTableRow
                        onChange={handleChange}
                        name={"parentEmail"}
                        label={"Parent Email:"}
                        value={profile.parentEmail}
                        readOnly={true}/>

                    <FormTableRow
                        onChange={handleChange}
                        name={"parentName"}
                        label={"Parent Name:"}
                        placeHolder={"<parent name>"}
                        value={profile.parentName}
                        readOnly={!editting}/>

        { //ditting ?
                        // <tr>
                            // <td>
                                // <button onClick={onCancel}>
                                    // Cancel
                                // </button>
                            // </td>
                            // <td>
                                // <button onClick={onFinish}>
                                    // Update Profile
                                // </button>
                            // </td>
                        // </tr> :
                        // <tr>
                            // <td>
                                // <button onClick={editProfileOnClickHandler}>
                                    // Edit
                                // </button>
                            // </td>
                            // <td>
                            // </td>
                        // </tr>
                    // }
        }
            

                </table>

            </div>

        </BaseScreenInDepthBase>
    );
}
