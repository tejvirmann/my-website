import React, { useEffect, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Inner component that uses Browser APIs (Matter.js, window, document)
const SecretGifsContent = () => {
  // Dynamic import of Matter.js to avoid SSR issues if it accesses window on import
  // Actually, standard import is often fine if usage is in useEffect, but checking...
  // Safest is to rely on BrowserOnly to not even render this component on server.
  const Matter = require('matter-js');

  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const bodiesRef = useRef(new Map()); 

  const [gifSources] = useState([
    '/img/dog.gif',
    '/img/collection-cats.jpg',
    '/img/collection-kittens.jpg',
    '/img/logo-pcca.svg',
    '/img/dog.gif', 
    '/img/collection-cats.jpg'
  ]);

  useEffect(() => {
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint;

    const engine = Engine.create();
    engineRef.current = engine;
    
    const width = window.innerWidth;
    const height = window.innerHeight - 60;

    const wallOpts = { isStatic: true, render: { visible: false } };
    const ground = Bodies.rectangle(width/2, height + 50, width, 100, wallOpts);
    const ceiling = Bodies.rectangle(width/2, -50, width, 100, wallOpts);
    const leftWall = Bodies.rectangle(-50, height/2, 100, height, wallOpts);
    const rightWall = Bodies.rectangle(width + 50, height/2, 100, height, wallOpts);
    
    Composite.add(engine.world, [ground, ceiling, leftWall, rightWall]);

    gifSources.forEach((src, i) => {
        const size = 100;
        const body = Bodies.rectangle(
            Math.random() * (width - 100) + 50,
            Math.random() * (height - 100) + 50,
            size,
            size,
            {
                restitution: 0.9,
                frictionAir: 0.01,
                label: `gif-${i}`
            }
        );
        Matter.Body.setVelocity(body, { 
            x: (Math.random() - 0.5) * 10, 
            y: (Math.random() - 0.5) * 10 
        });
        
        Composite.add(engine.world, body);
        bodiesRef.current.set(`gif-${i}`, { body, element: document.getElementById(`gif-img-${i}`) });
    });

    const mouse = Mouse.create(sceneRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    Composite.add(engine.world, mouseConstraint);

    const runner = Runner.create();
    Runner.run(runner, engine);
    
    const renderLoop = () => {
        bodiesRef.current.forEach(({ body, element }) => {
            if (body && element) {
                const { x, y } = body.position;
                const angle = body.angle;
                element.style.transform = `translate(${x - 50}px, ${y - 50}px) rotate(${angle}rad)`;
            }
        });
        requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
        Runner.stop(runner);
        Engine.clear(engine);
    };
  }, [gifSources]);

  return (
    <div 
        ref={sceneRef} 
        style={{ 
            position: 'relative', 
            width: '100%', 
            height: 'calc(100vh - 60px)', 
            overflow: 'hidden',
            background: '#222',
            cursor: 'grab'
        }}
    >
        <h1 style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            color: 'rgba(255,255,255,0.1)', 
            fontSize: '5rem', 
            zIndex: 0,
            pointerEvents: 'none'
        }}>
            VIP LOUNGE
        </h1>
        
        {gifSources.map((src, i) => (
            <img 
                key={i}
                id={`gif-img-${i}`}
                src={src} 
                alt="Secret Gif"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100px',
                    height: '100px',
                    objectFit: 'contain',
                    pointerEvents: 'none', 
                    display: 'block',
                    willChange: 'transform'
                }}
            />
        ))}

        <div style={{ position: 'absolute', bottom: 10, left: 10, color: '#888' }}>
            Grab and throw the gifs!
        </div>
    </div>
  );
};

export default function SecretGifs() {
    return (
        <Layout title="Secret VIP Lounge" description="Top Secret">
            <div style={{minHeight: '100vh', background: '#222'}}>
             <BrowserOnly fallback={<div>Loading Secret Sauce...</div>}>
                {() => <SecretGifsContent />}
             </BrowserOnly>
            </div>
        </Layout>
    );
}
