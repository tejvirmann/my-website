import React, { Suspense } from 'react';
import FunLayout from './Layout/FunLayout';
import GameCard from './Layout/GameCard';
// Lazy load all games to prevent SSR issues (document/window access)
const BouncingBalls = React.lazy(() => import('./Physics/BouncingBalls'));
const MinecraftSection = React.lazy(() => import('./Minigames/MinecraftSection'));
const FlappyBird = React.lazy(() => import('./Minigames/FlappyBird'));
const PokemonStyle = React.lazy(() => import('./Minigames/PokemonStyle'));
const DrivingGame = React.lazy(() => import('./Minigames/DrivingSection'));
const MarioPlatformer = React.lazy(() => import('./Minigames/MarioPlatformer'));
const Mario2D = React.lazy(() => import('./Minigames/Mario2D'));
const WaveShip = React.lazy(() => import('./Physics/WaveShip'));
const ZenEnvironment = React.lazy(() => import('./Minigames/ZenEnvironment')); 
 
export default function FunHome() {
  return (
    <FunLayout>
      <div style={{ 
        paddingTop: '100px', 
        paddingBottom: '100px',
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        alignItems: 'flex-start',
        gap: '2rem'
      }}>

         {/* Physics Bubbles */}
         <GameCard title="Physics Bubbles">
            <Suspense fallback={<div>Loading...</div>}>
                <BouncingBalls />
            </Suspense>
         </GameCard>

         {/* Wave Ship */}
         <GameCard title="Wave Ship">
            <Suspense fallback={<div>Loading...</div>}>
                <WaveShip />
            </Suspense>
         </GameCard>

          {/* Minecraft */}
          <GameCard title="Mini Minecraft" defaultExpanded={false}>
            <Suspense fallback={<div>Loading...</div>}>
                <MinecraftSection />
            </Suspense>
          </GameCard>

          {/* Flappy Bird */}
          <GameCard title="Flappy Bird">
              <Suspense fallback={<div>Loading...</div>}>
                  <FlappyBird />
              </Suspense>
          </GameCard>

          {/* Pokemon */}
          <GameCard title="Pokemon Walker">
              <Suspense fallback={<div>Loading...</div>}>
                  <PokemonStyle />
              </Suspense>
          </GameCard>

          {/* Mario 3D */}
         <GameCard title="Mario 3D World">
             <Suspense fallback={<div>Loading...</div>}>
                 <MarioPlatformer />
             </Suspense>
          </GameCard>
          
           {/* Zen Garden */}
           <GameCard title="Zen Garden">
              <Suspense fallback={<div>Loading...</div>}>
                  <ZenEnvironment />
              </Suspense>
           </GameCard>

          {/* Mario 2D */}
          <GameCard title="Mario Bros Classic">
              <Suspense fallback={<div>Loading...</div>}>
                  <Mario2D />
              </Suspense>
          </GameCard>

          {/* Driving */}
          <GameCard title="Desert Rally">
             <Suspense fallback={<div>Loading...</div>}>
                 <DrivingGame />
             </Suspense>
          </GameCard>
          
      </div>
    </FunLayout>
  );
}
