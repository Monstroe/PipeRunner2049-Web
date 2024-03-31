import React from 'react';
import './Home.css';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Navbar from '../../components/Navbar/Navbar';
import io from 'socket.io-client';

function HomePage() {

  const socket = io('http://localhost:5000');

  const joinRoom = () => {
    console.log("Joining Room");
    socket.emit('joinroom');
  }

  fetch('/').then(res => res.text().then(text => console.log(text)));

  return (
    <div className="Home">
      <Navbar />
      <body className="Home-body">
        <h1>
          Pipe Runner <i>2049</i>
        </h1>
        <p>The Web Component allows you to haunt other rooms! You can mess with players and affect things in their lobby. To haunt a random lobby, click the button below!</p>
        {/*<Input placeholder="Enter your display name" />*/}
        <Button text="Haunt Random Lobby" onClick={joinRoom} />
      </body>
    </div>
  );
}

export default HomePage;