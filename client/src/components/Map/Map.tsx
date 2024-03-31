import React, { useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface MapProps {
    imageSrc: string;
    onClick: (x: number, y: number, cW: number, cH: number) => void;
}

function Map({ imageSrc, onClick }: MapProps) {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(new Image());
    const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const image = imageRef.current;
        image.src = imageSrc;
        image.onload = () => {
            setDimensions(calcDimensions());
        };

        const calcDimensions = () => {
            const ratio = image.height / image.width;
            const width = window.innerWidth;
            const height = window.innerWidth * ratio;
            return { width, height };
        }

        const resizeCanvas = () => {
            setDimensions(calcDimensions());
        }

        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        }
    }, [imageSrc]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const image = imageRef.current;
        
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        context.clearRect(0, 0, dimensions.width, dimensions.height);
        context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
    }, [dimensions]);

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        event.preventDefault();
        const canvas = canvasRef.current;
        if(!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        onClick(x, y, canvas?.width, canvas?.height); // Call the onClick prop with the coordinates
    };

    return (
        <TransformWrapper>
            <TransformComponent>
                <canvas ref={canvasRef} onContextMenu={handleClick}/>
            </TransformComponent>
        </TransformWrapper>
    );
}

export default Map;
