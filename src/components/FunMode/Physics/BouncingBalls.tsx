
import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

const BouncingBalls = () => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          World = Matter.World,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint;

    const engine = Engine.create();
    engineRef.current = engine; // Fix: Assign ref so addBall works
    const world = engine.world;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 500,
        wireframes: false,
        background: 'transparent'
      }
    });

    // Customize walls to be part of a set we can rotate
    // Canvas is 800x500. Center at 400, 250.
    // Box size: 300x300 so it fits when rotating (diagonal ~424 which fits in 500 height)
    // Fix Overlap: Top/Bottom span full width. Left/Right sit between.
    const boxSize = 300; // Inner size
    const wallThick = 20;
    const totalWidth = boxSize + wallThick * 2;
    
    const wallOptions = { 
        isStatic: true,
        chamfer: { radius: 10 }, 
        render: { 
            fillStyle: 'white',
            strokeStyle: 'transparent'
        } 
    };
    
    // Top/Bottom (Full Width)
    const ground = Bodies.rectangle(400, 250 + boxSize/2 + wallThick/2, totalWidth, wallThick, wallOptions);
    const ceiling = Bodies.rectangle(400, 250 - boxSize/2 - wallThick/2, totalWidth, wallThick, wallOptions);
    
    // Left/Right (Fits between)
    const leftWall = Bodies.rectangle(400 - boxSize/2 - wallThick/2, 250, wallThick, boxSize, wallOptions);
    const rightWall = Bodies.rectangle(400 + boxSize/2 + wallThick/2, 250, wallThick, boxSize, wallOptions);
    
    // Group walls
    const container = Composite.create();
    Composite.add(container, [ground, ceiling, leftWall, rightWall]);
    World.add(engine.world, container);

    // Add balls with LOWER restitution
    const balls = []; 
    for (let i = 0; i < 20; i++) {
        const ball = Bodies.circle(
            Math.random() * 800,
            Math.random() * 500,
            Math.random() * 20 + 10,
            {
                restitution: 0.9, 
                friction: 0.005,
                frictionAir: 0.001, 
                render: {
                    fillStyle: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'][Math.floor(Math.random() * 6)]
                }
            }
        );
        balls.push(ball);
        World.add(engine.world, ball);
    }
    
    // Custom update loop for ROTATING THE BOX
    let angle = 0;
    Matter.Events.on(engine, 'beforeUpdate', () => {
        angle += 0.005; 
        Composite.rotate(container, 0.005, { x: 400, y: 250 });
    });

    // Add mouse control
    const mouse = Mouse.create(render.canvas);
    
    // Zoom Fix: Scale 0.4 -> 0.65
    // Mouse Scale: 1 / 0.65 = ~1.538
    Mouse.setScale(mouse, { x: 1.538, y: 1.538 }); 

    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

    // Click to Shoot Logic
    Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
        const mousePosition = event.mouse.position;
        const allBodies = Composite.allBodies(engine.world);
        const clickedBodies = Matter.Query.point(allBodies, mousePosition);
        
        clickedBodies.forEach((body) => {
            if (!body.isStatic) {
                 const forceMagnitude = 0.5; 
                 const angle = Math.random() * Math.PI * 2;
                 Matter.Body.applyForce(body, body.position, { 
                     x: Math.cos(angle) * forceMagnitude, 
                     y: Math.sin(angle) * forceMagnitude 
                 });
            }
        });
    });

    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    return () => {
        Render.stop(render);
        Runner.stop(runner);
    };
  }, []);

  const addBall = () => {
      if (!engineRef.current) return;
      
      const ball = Matter.Bodies.circle(
          400 + (Math.random() - 0.5) * 50,
          250 + (Math.random() - 0.5) * 50,
          Math.random() * 20 + 10,
          {
                restitution: 0.9,
                friction: 0.005,
                frictionAir: 0.001,
                render: {
                    fillStyle: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'][Math.floor(Math.random() * 6)]
                }
          }
      );
      Matter.Composite.add(engineRef.current.world, ball);
  };

  return (
    <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        overflow: 'hidden',
        background: 'black',
        position: 'relative'
    }}>
        {/* Scale down to fit - Increased to 0.65 */}
        <div 
            ref={sceneRef} 
            style={{ 
                transform: 'scale(0.65)', 
                transformOrigin: 'center center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }} 
        />
        
        {/* Add Ball Button */}
        <button 
            onClick={addBall}
            style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.8)',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                zIndex: 10
            }}
        >
            + Add Ball
        </button>
    </div>
  );
};

export default BouncingBalls;
