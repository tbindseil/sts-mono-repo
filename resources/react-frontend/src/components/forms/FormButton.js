import React from 'react';

export function FormButton(props) {

    return (
        <input
            type={"button"}
            onClick={props.onClick}
            value={props.value}/>
    );
}
