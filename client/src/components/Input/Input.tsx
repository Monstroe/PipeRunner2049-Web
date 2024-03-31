import React from 'react';
import './Input.css';

interface InputProps {
    // Add any props you need for your component here
    placeholder: string;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

function Input ({placeholder, onKeyDown = () => { console.log('Default input handler') }}: InputProps ) {
    return (
        <input type="text" placeholder={placeholder} onKeyDown={onKeyDown} />
    );
};

export default Input;