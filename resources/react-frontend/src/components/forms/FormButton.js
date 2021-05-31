import React from 'react';

export function FormButton(props) {
    return (
        <input
            type={"button"}
            onClick={props.onClick}
            value={props.value}/>
    );
}

export function LoadingFormButton(props) {
    const loadingText = props.loadingText ? props.loadingText : "Loading...";
    return (
        <input
            type={"button"}
            onClick={props.loading ? () => {} : props.onClick}
            value={props.loading ? loadingText : props.value}/>
    );
}
