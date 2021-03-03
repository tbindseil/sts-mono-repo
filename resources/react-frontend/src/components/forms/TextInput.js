import React from 'react';

export function TextInput(props) {

    // yikes, I have to use value instead of defaultValue when
    // returning to old values after canceling a form submission
    if (props.readOnly) {
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
    } else {
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
                    defaultValue={props.value}
                    readOnly={props.readOnly}/>
            </>
        );
    }
}
