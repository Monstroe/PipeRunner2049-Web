import React from 'react';
import Navbar from '../../components/Navbar/Navbar';

const AboutPage: React.FC = () => {
    return (
        <div className="About">
            <Navbar />
            <h1>About</h1>
            <p>By: Cole Montrose & Joseph DeMartini</p>
            <p>This project was created for <a href="https://itch.io/jam/joint-jam-2024" target="_blank" rel="noopener noreferrer">Joint Jam 2024</a>!</p>
        </div>
    );
};

export default AboutPage;