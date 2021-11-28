import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {apiFactory} from '../fetch-enhancements/fetch-call-builders';
import {BaseScreen} from '../base-components/BaseScreen';

export function GroupScreen(props) {
    const history = useHistory();

    const [user, setUser] = useState(undefined);

    const stateProps = props.location.state;
    if (!stateProps && !stateProps.groupId) {
        history.push("/groups");
    }

    const [groupName, setGroupName] = useState('');
    const [groupOwner, setGroupOwner] = useState('');

    const [groupId, setGroupId] = useState(stateProps.groupId);

    useEffect(() => {
        if (!user) {
            return;
        }

        const successHandler = (result) => {
            setGroupName(result.name);
            setGroupOwner(result.groupOwner);
        };

        const call = apiFactory.makeGetGroup({
            user: user,
            groupId: groupId,
            successHandler: successHandler
        });
        call();
    }, [
        user, groupId, setGroupName, setGroupOwner
    ]);


    return (
        <BaseScreen
            titleText={"Group Screen"}
            needAuthenticated={true}
            setUser={setUser}>

            <table className="AvailabilityForm">
                <tr>
                    <GroupPiece
                        header={"Group Name:"}
                        content={groupName}
                    />
                </tr>
                <tr>
                    <GroupPiece
                        header={"Group Owner:"}
                        content={groupOwner}
                    />
                </tr>
            </table>

        </BaseScreen>
    );
}

function GroupPiece(props) {
    return (
        <>
            <td>
                {props.header}
            </td>
            <td>
                {props.content}
            </td>
        </>
    );
}
