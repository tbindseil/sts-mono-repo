import React, {useState} from 'react';

import {BaseScreen} from '../base-components/BaseScreen';

export function GroupsScreen(props) {

    const [user, setUser] = useState(undefined);

    return (
        <BaseScreen
            titleText={"Groups Screen"}
            needAuthenticated={true}
            setUser={setUser}>

        </BaseScreen>
    );
}
