import React, { useRef, useEffect, useState } from 'react';
import { UserSettings } from '../types';
import { socketService } from '../services/socket';

interface Point {
    x: number;
    y: number;
}

interface DrawEvent {
    points: Point[];
    color: string;
    lineWidth: number;
}

interface Props {
    userSettings: UserSettings;
    width?: number;
    height?: number;
}

export function SharedCanvas({ userSettings, width = 800, height = 600 }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);
    const [lineWidth, setLineWidth] = useState(2);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set up canvas
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = userSettings.color;
        context.lineWidth = lineWidth;
        contextRef.current = context;

        // Set up socket listener for drawing events
        socketService.onCanvasUpdate((drawEvent: DrawEvent) => {
            drawPath(drawEvent.points, drawEvent.color, drawEvent.lineWidth);
        });
    }, [width, height, userSettings.color]);

    const drawPath = (points: Point[], color: string, width: number) => {
        const context = contextRef.current;
        if (!context || points.length < 2) return;

        const originalStyle = context.strokeStyle;
        const originalWidth = context.lineWidth;

        context.strokeStyle = color;
        context.lineWidth = width;
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
        }

        context.stroke();
        context.strokeStyle = originalStyle;
        context.lineWidth = originalWidth;
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        setIsDrawing(true);
        setCurrentPath([point]);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        setCurrentPath(prev => {
            const newPath = [...prev, point];
            drawPath(newPath, userSettings.color, lineWidth);
            return newPath;
        });
    };

    const stopDrawing = () => {
        if (!isDrawing) return;

        // Emit the complete path to other participants
        socketService.updateCanvas({
            points: currentPath,
            color: userSettings.color,
            lineWidth
        });

        setIsDrawing(false);
        setCurrentPath([]);
    };

    return (
        <div className="shared-canvas">
            <div className="canvas-controls">
                <div className="line-width-control">
                    <label>Line Width:</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                    />
                </div>
            </div>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="drawing-canvas"
            />
        </div>
    );
} 