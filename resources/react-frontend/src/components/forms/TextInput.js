import React from 'react';

// TODO required
export function TextInput(props) {
    return (
        <>
            <label
                className={props.className}
                for={props.name}>
                {props.label}
            </label>
            <input
                className={props.className}
                type={props.type ? props.type : "text"}
                name={props.name}
                value={props.value}
                placeHolder={props.placeHolder}
                readOnly={props.readOnly}/>
        </>
    );
}
