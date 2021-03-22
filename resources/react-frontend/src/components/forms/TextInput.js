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

export function FormTableRow(props) {
    return (
        <>
            <tr>
                <td>
                    <label
                        className={props.className}
                        for={props.name}>
                        {props.label}
                    </label>
                </td>
                <td>
                    <input
                        className={props.className}
                        onChange={props.onChange}
                        type={props.type ? props.type : "text"}
                        name={props.name}
                        value={props.value}
                        placeHolder={props.placeHolder}
                        readOnly={props.readOnly}/>
                </td>
            </tr>
        </>
    );
}
