import React, { useState } from 'react';
import Overworld from './Overworld';
import BattleScene from './BattleScene';
import IntroSequence from './IntroSequence';
import { PLAYER_STARTER, WILD_BROKEMON, Brokemon } from './data/pokemon';

type GameState = 'START' | 'INTRO' | 'ROAM' | 'BATTLE' | 'DIALOGUE';

const BrokemonGame = () => {
    const [gameState, setGameState] = useState<GameState>('START');
    const [playerPos, setPlayerPos] = useState({ x: 21, y: 21 });
    const [currentEnemy, setCurrentEnemy] = useState<Brokemon | null>(null);
    
    const handleEncounter = () => {
        // Pick random wild brokemon
        const randomInfo = WILD_BROKEMON[Math.floor(Math.random() * WILD_BROKEMON.length)];
        // Create a copy so we can modify HP during battle without affecting the "template"
        const enemy = { ...randomInfo, hp: randomInfo.maxHp }; // Full HP encounter
        
        setCurrentEnemy(enemy);
        setGameState('BATTLE');
    };

    const handleBattleEnd = (win: boolean) => {
        setGameState('ROAM');
        setCurrentEnemy(null);
        // If win, maybe gain XP? (Future task)
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 text-white p-4">
             {gameState === 'START' && (
                 <div className="text-center animate-pulse">
                     <h1 className="text-4xl font-bold text-yellow-500 mb-4" style={{ fontFamily: 'monospace' }}>BROKEMON</h1>
                     <p className="text-sm text-gray-400 mb-2">HOOD VERSION</p>
                     <p className="text-xs text-gray-600 mb-8">v0.0.2</p>
                     
                     <button 
                        onClick={() => setGameState('INTRO')}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold"
                     >
                         ENTER THE STREETS
                     </button>
                 </div>
             )}

            {gameState === 'INTRO' && (
                <IntroSequence onComplete={() => setGameState('ROAM')} />
            )}

             {gameState === 'ROAM' && (
                 <>
                    <div className="mb-2 text-xs text-gray-400">
                        Arrow Keys to Move. Find the dirt patches for trouble.
                    </div>
                    <Overworld 
                        onEncounter={handleEncounter}
                        playerPos={playerPos}
                        setPlayerPos={setPlayerPos}
                    />
                 </>
             )}

             {gameState === 'BATTLE' && currentEnemy && (
                 <div className="w-[320px] h-[320px] border-4 border-gray-800">
                     <BattleScene 
                        playerPokemon={PLAYER_STARTER}
                        enemyPokemon={currentEnemy}
                        onWin={() => handleBattleEnd(true)}
                        onLose={() => handleBattleEnd(false)}
                        onRun={() => handleBattleEnd(false)}
                     />
                 </div>
             )}
        </div>
    );
};

export default BrokemonGame;
