import React, {useState} from 'react';

import {BaseScreen} from '../base-components/BaseScreen';

export function ExampleScreen(props) {

    const [user, setUser] = useState(undefined);

    return (
        <BaseScreen
            titleText={"Example Screen"}
            needAuthenticated={true}
            setUser={setUser}>

        </BaseScreen>
    );
}
