
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
        console.log('Game ID: ', gameID);
        axios.get('/api/room/verify').then((response) => {
            console.log('S resp: ' + response);
        }).catch((error) => {
            alert('Invalid Game ID');
            navigate('/');
        });
        console.log('asdfhasdlkfasdf Game ID');
        if(gameID === undefined) {
            alert('No Game ID Provided');
            navigate('/');
        }
    }, [gameID, navigate]);*/


    const onPhantomClick = () => {
        axios.post('/api/phantom/spawn').then((response) => {
            console.log('Phantom clicked');
        });
    }

    const onAudioClick = () => {
        console.log('Audio clicked');
    }

    const onFogClick = () => {
        console.log('Fog clicked');
    }

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
        console.log('Click data: ', data);
        axios.post('/api/phantom/spawn', data).then((response) => {
            console.log('Click response: ', response);
        }).catch((error) => {
            console.log('Click error: ', error);
        });
    }

    return (
        <div className="Game-body">
            <Map imageSrc={Img} onClick={handleClick}/>
            <Toolbar onPhantomClick={onPhantomClick} onAudioClick={onAudioClick} onFogClick={onFogClick} />
        </div>
    );
}

export default GamePage;


/*<canvas className="map" ref={canvasRef} width={canvasRef.current?.width} height={canvasRef.current?.height}/>*/