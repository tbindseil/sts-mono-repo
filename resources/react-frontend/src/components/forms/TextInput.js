import React from 'react';

// TODO required
export function TextInput(props) {
    return (
        <>
            <label
                for={props.name}>
                {props.label}
            </label>
            <input
                type={props.type ? props.type : "text"}
                name={props.name}
                value={props.value}
                readOnly={props.readOnly}/>
        </>
    );
}
