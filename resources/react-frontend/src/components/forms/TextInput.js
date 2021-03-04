import React from 'react';

export function TextInput(props) {
    return (
        <>
            <label
                for={props.name}>
                {props.label}
            </label>
            <input
                type={"text"}
                id={props.name}
                name={props.name}
                value={props.value}
                readOnly={props.readOnly}/>
        </>
    );
}
