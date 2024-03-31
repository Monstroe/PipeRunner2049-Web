import React from 'react';
import './Toolbar.css';

interface ToolbarProps {
    onPhantomClick: () => void;
    onAudioClick: () => void;
    onFogClick: () => void;
}

function Toolbar( { onPhantomClick, onAudioClick, onFogClick }: ToolbarProps ) {

    return (
        <div className="toolbar">
            <button onClick={onPhantomClick}>Phantom</button>
            <button onClick={onAudioClick}>Audio</button>
            <button onClick={onFogClick}>Fog</button>
        </div>
    );
};

export default Toolbar;