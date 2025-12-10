import React, { useState, useEffect } from 'react';
import IntroSprite from './IntroSpriteHelper';

interface IntroSequenceProps {
    onComplete: () => void;
}

const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [fade, setFade] = useState(false);

    const dialogs = [
        "Yo. Welcome to the Hood.",
        "They call me Professor O-G. I run this block.",
        "This world is full of creatures called Brokemon.",
        "Some use 'em for protection. I use 'em to stack paper.",
        "But the streets are in chaos. Rival gangs are everywhere.",
        "Listen up. Your mission is simple.",
        "Defeat the rival gangs. Unite the hood.",
        "Become the Top G.",
        "Are you ready to handle business?"
    ];

    const currentText = dialogs[step];

    const advance = () => {
        if (step < dialogs.length - 1) {
            setStep(step + 1);
        } else {
            setFade(true);
            setTimeout(onComplete, 1000);
        }
    };

    return (
        <div className={`w-full h-full bg-black flex flex-col items-center justify-center p-4 transition-opacity duration-1000 ${fade ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-32 h-32 mb-8 flex items-center justify-center overflow-hidden relative">
             <IntroSprite />
        </div>
            
            <div 
                className="w-full bg-slate-800 border-2 border-white p-4 rounded cursor-pointer hover:bg-slate-700"
                onClick={advance}
            >
                <p className="text-yellow-400 font-bold mb-2">PROFESSOR O-G:</p>
                <p className="text-white font-mono text-sm leading-6 animate-pulse">
                    {currentText}
                    <span className="inline-block w-2 h-4 bg-white ml-2 animate-bounce"></span>
                </p>
            </div>
            
            <p className="text-gray-500 text-xs mt-4">Click to continue...</p>
        </div>
    );
};

export default IntroSequence;
