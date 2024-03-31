import React from 'react';
import './Button.css';

interface ButtonProps {
    text: string;
    onClick?: () => void;
}

function Button ({ text, onClick = () => { console.log('Default click handler') } }: ButtonProps ) {
    return (
        <button onClick={onClick}>
            {text}
        </button>
    );
};

export default Button;