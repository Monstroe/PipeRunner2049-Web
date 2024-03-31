
import React, { useRef, useEffect, useCallback } from 'react';
import Img from './map.png';
import Map from '../../components/Map/Map';
import './Game.css';
import Toolbar from '../../components/Toolbar/Toolbar';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function GamePage() {
    const { clientID } = useParams();
    const navigate = useNavigate();

    /*useEffect(() => {
        axios.get('/api/room/verify').then((response) => {
            console.log('S resp: ' + response);
        }).catch((error) => {
            alert('Invalid Game ID');
            navigate('/');
        });

    }, [navigate]);*/

    /*useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/pos/player', {
                    params: {
                        rClient: clientID
                    },
                });
                console.log('Data: ', response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const interval = setInterval(() => {
            fetchData();
        }, 1000); // 200 milliseconds -> 5 times per second

        // Clean-up function to clear the interval when the component unmounts
        return () => {
            clearInterval(interval);
        };
    }, []);*/

    /*const onPhantomClick = () => {
        console.log('Phantom clicked');
    }

    const onAudioClick = () => {
        console.log('Audio clicked');
    }

    const onFogClick = () => {
        console.log('Fog clicked');
    }*/

    const handleClick = (x: number, y: number, cW: number, cH: number) => {
        const normalizedX = x / cW;
        const normalizedY = y / cH;
        //console.log('Clicked: ', normalizedX, normalizedY);
        console.log('Client ID: ', clientID);
        const data = {
            rClient: clientID,
            'phantomPos': {
                x: normalizedX,
                y: normalizedY,
                "rot": 0
            }
        }

        axios.post('http://167.71.191.147:5000/api/phantom/spawn', data).then((response) => {
            console.log('Click response: ', response);
            alert('Phantom spawned! Cooldown is 10 seconds.');
        }).catch((error) => {
            console.log('Click error: ', error);
            alert('Invalid Game ID (maybe the room was closed?)');
            navigate('/');
        });
    }

    

    return (
        <div className="Game-body">
            <Map imageSrc={Img} onClick={handleClick}/>
            {/*<Toolbar onPhantomClick={onPhantomClick} onAudioClick={onAudioClick} onFogClick={onFogClick} />*/}
        </div>
    );
}

export default GamePage;