import React from 'react';
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <li><a href="/" rel="noopener noreferrer">Home</a></li>
            <li><a href="/about" rel="noopener noreferrer">About</a></li>
            <li><a href="https://ttmayor.itch.io/gobbo-versus" target="_blank" rel="noopener noreferrer">Gobbo?</a></li>
            <li><a href="https://store.steampowered.com/app/2831700/GizmoLab_VR/" target="_blank" rel="noopener noreferrer">Gizmo?</a></li>
        </nav>
    );
};

export default Navbar;