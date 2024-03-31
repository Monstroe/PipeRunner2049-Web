import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Navbar from '../../components/Navbar/Navbar';
import axios from 'axios';

function HomePage() {

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://167.71.191.147:5000/api/').then((response) => {
      console.log(response.data);
    }).catch((error) => {
      console.log("Could not connect: " + error);
    });
  });

  const joinRoom = () => {
    console.log("Joining Room");

    axios.get('http://167.71.191.147:5000/api/room/join').then((response) => {
      let id = response.data.id;
      navigate(`/game/${id}`);
    }).catch((error) => {
      console.log(error);
      alert("No active games to join!");
    });
  }

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