import React, { useEffect, useRef, useState } from 'react';
import { Brokemon, Move } from './data/pokemon';
import brokemonSprites from './assets/brokemon_sprites.png';

interface BattleSceneProps {
    playerPokemon: Brokemon;
    enemyPokemon: Brokemon;
    onWin: () => void;
    onLose: () => void;
    onRun: () => void;
}

const BattleScene: React.FC<BattleSceneProps> = ({ playerPokemon: initialPlayer, enemyPokemon: initialEnemy, onWin, onLose, onRun }) => {
    // Battle State
    const [playerMon, setPlayerMon] = useState({ ...initialPlayer });
    const [enemyMon, setEnemyMon] = useState({ ...initialEnemy });
    const [turn, setTurn] = useState<'PLAYER' | 'ENEMY' | 'BUSY'>('PLAYER');
    const [log, setLog] = useState(`Wild ${initialEnemy.name} appeared!`);
    
    // Canvas for Sprites
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const spritesRef = useRef<HTMLImageElement | null>(null);



// ...
    useEffect(() => {
        const img = new Image();
        img.src = brokemonSprites;
        spritesRef.current = img;
    }, []);

    // Render Canvas (Background + Sprites)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw Loop (mostly static but useful for animations later)
        const render = () => {
            // Background
            const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grd.addColorStop(0, '#70c5ce'); // Sky color
            grd.addColorStop(0.5, '#70c5ce');
            grd.addColorStop(0.5, '#5a6988'); // Ground color
            grd.addColorStop(1, '#5a6988'); 
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Battle Bases (Ellipses)
            ctx.fillStyle = '#8db26e';
            ctx.beginPath();
            ctx.ellipse(80, 200, 60, 20, 0, 0, Math.PI * 2); // Player base
            ctx.fill();
            
            ctx.beginPath();
            ctx.ellipse(240, 110, 60, 20, 0, 0, Math.PI * 2); // Enemy base
            ctx.fill();

            // Draw Pokemon
            if (spritesRef.current && spritesRef.current.complete) {
                // Enemy (Front Right)
                // Assuming sprites are evenly spaced 4 in a row. Adjust if needed.
                // If image width is unknown, we assume a standard size or calculate.
                // Let's assume the sprite sheet is roughly 256x64 (64x64 each).
                const spriteW = spritesRef.current.width / 4;
                const spriteH = spritesRef.current.height;
                
                const enemySX = enemyMon.spriteIndex * spriteW;
                ctx.drawImage(spritesRef.current, enemySX, 0, spriteW, spriteH, 200, 50, 80, 80);

                // Player (Back Left) - Using the last sprite as "Player" for now, ideally need back sprites
                const playerSX = playerMon.spriteIndex * spriteW;
                ctx.drawImage(spritesRef.current, playerSX, 0, spriteW, spriteH, 40, 140, 80, 80);
            } else {
                // Fallback placeholders
                ctx.fillStyle = 'purple';
                ctx.fillRect(220, 60, 40, 40); // Enemy
                ctx.fillStyle = 'blue';
                ctx.fillRect(60, 160, 40, 40); // Player
            }
        };

        render();
    }, [playerMon, enemyMon]);

    // Battle Logic
    const attack = (move: Move, attacker: 'PLAYER' | 'ENEMY') => {
        setTurn('BUSY');
        
        let damage = move.power; // Simplified
        if (attacker === 'PLAYER') {
            setLog(`${playerMon.name} used ${move.name}!`);
            setTimeout(() => {
                const newHp = Math.max(0, enemyMon.hp - damage);
                setEnemyMon(prev => ({ ...prev, hp: newHp }));
                
                if (newHp === 0) {
                    setLog(`${enemyMon.name} fainted! You won!`);
                    setTimeout(onWin, 2000);
                } else {
                    setTurn('ENEMY');
                }
            }, 1000);
        } else {
            setLog(`${enemyMon.name} used ${move.name}!`);
            setTimeout(() => {
                const newHp = Math.max(0, playerMon.hp - damage);
                setPlayerMon(prev => ({ ...prev, hp: newHp }));
                
                if (newHp === 0) {
                    setLog(`${playerMon.name} fainted! You blacked out!`);
                    setTimeout(onLose, 2000);
                } else {
                    setTurn('PLAYER');
                }
            }, 1000);
        }
    };

    // Enemy Turn AI
    useEffect(() => {
        if (turn === 'ENEMY') {
            setTimeout(() => {
                const randomMove = enemyMon.moves[Math.floor(Math.random() * enemyMon.moves.length)];
                attack(randomMove, 'ENEMY');
            }, 1000);
        }
    }, [turn]);

    // Health Bar Helper
    const HealthBar = ({ current, max }: { current: number, max: number }) => {
        const pct = (current / max) * 100;
        const color = pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500';
        return (
            <div className="w-24 h-2 bg-gray-700 rounded-sm border border-gray-600">
                <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
            </div>
        );
    };

    return (
        <div className="relative w-full h-full bg-black font-mono text-white select-none">
            {/* Game View */}
            <canvas ref={canvasRef} width={320} height={240} className="w-full h-[70%] object-cover pixelated" />
            
            {/* HUD - Enemy */}
            <div className="absolute top-4 left-4 bg-gray-800/80 p-2 rounded border border-gray-600 text-xs">
                <div className="font-bold">{enemyMon.name} <span className="text-yellow-400">Lv{enemyMon.level}</span></div>
                <HealthBar current={enemyMon.hp} max={enemyMon.maxHp} />
            </div>

            {/* HUD - Player */}
            <div className="absolute top-36 right-4 bg-gray-800/80 p-2 rounded border border-gray-600 text-xs">
                <div className="font-bold">{playerMon.name} <span className="text-yellow-400">Lv{playerMon.level}</span></div>
                <HealthBar current={playerMon.hp} max={playerMon.maxHp} />
                <div>{playerMon.hp} / {playerMon.maxHp}</div>
            </div>

            {/* Text / Menu Box */}
            <div className="absolute bottom-0 w-full h-[30%] bg-slate-900 border-t-4 border-gray-600 flex">
                {/* Text Area */}
                <div className="w-2/3 p-4 text-sm border-r border-gray-700 flex items-center">
                    <p>{log}</p>
                </div>
                
                {/* Actions Menu */}
                <div className="w-1/3 grid grid-cols-2 gap-1 p-2 bg-slate-800">
                    {turn === 'PLAYER' ? (
                        <>
                            <button onClick={() => attack(playerMon.moves[0], 'PLAYER')} className="bg-red-700 hover:bg-red-600 rounded text-xs">FIGHT</button>
                            <button className="bg-blue-700 hover:bg-blue-600 rounded text-xs">BAG</button>
                            <button className="bg-green-700 hover:bg-green-600 rounded text-xs">PKMN</button>
                            <button onClick={onRun} className="bg-yellow-600 hover:bg-yellow-500 rounded text-xs text-black font-bold">RUN</button>
                        </>
                    ) : (
                        <div className="col-span-2 flex items-center justify-center text-xs text-gray-400">
                            Waiting...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BattleScene;
