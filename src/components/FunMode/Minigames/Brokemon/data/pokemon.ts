export type Move = {
    name: string;
    power: number;
    type: 'Normal' | 'Ghetto';
};

export type Brokemon = {
    id: number;
    name: string;
    maxHp: number;
    hp: number;
    level: number;
    spriteIndex: number; // Index in the sprite sheet
    moves: Move[];
};

export const MOVES: Record<string, Move> = {
    SLAP: { name: 'PIMP SLAP', power: 10, type: 'Normal' },
    SHOOT: { name: 'DRIVE BY', power: 25, type: 'Ghetto' }, // High dmg, low accuracy implied?
    STEAL: { name: 'PICKPOCKET', power: 0, type: 'Ghetto' }, // Status move? For now just 0 dmg
    BARK: { name: 'BARK', power: 5, type: 'Normal' },
    BITE: { name: 'BITE', power: 15, type: 'Normal' },
    SCRATCH: { name: 'SCRATCH', power: 10, type: 'Normal' },
};

export const WILD_BROKEMON: Brokemon[] = [
    {
        id: 1,
        name: 'G-RAT',
        maxHp: 30,
        hp: 30,
        level: 5,
        spriteIndex: 0, // 1st in sheet
        moves: [MOVES.SCRATCH, MOVES.BITE]
    },
    {
        id: 2,
        name: 'PIDGEON-G',
        maxHp: 25,
        hp: 25,
        level: 4,
        spriteIndex: 1, // 2nd
        moves: [MOVES.SCRATCH, MOVES.SHOOT]
    },
    {
        id: 3,
        name: 'THUG-DOG',
        maxHp: 40,
        hp: 40,
        level: 6,
        spriteIndex: 2, // 3rd
        moves: [MOVES.BARK, MOVES.BITE]
    }
];

export const PLAYER_STARTER: Brokemon = {
    id: 99,
    name: 'OG-ZARD',
    maxHp: 50,
    hp: 50,
    level: 10,
    spriteIndex: 3, // 4th (Raccoon looking thing or whatever generated)
    moves: [MOVES.SLAP, MOVES.SHOOT]
};
