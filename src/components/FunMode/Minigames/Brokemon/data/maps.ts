
// 0 = Street (Walkable)
// 1 = Building (Wall)
// 2 = Grass/Dirt (Wild Encounter)
// 3 = Sidewalk (Walkable)
// 4 = Fence (Wall)
// 5 = Water (Wall)

export const TILE_SIZE = 32;
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 40;

// Helper to generate a basic "Hood" city layout
// In a real scenario, this would be a hand-crafted large array or JSON
const generateMap = () => {
    const map = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Default: Asphalt
            let tile = 0;

            // Borders are walls (Buildings)
            if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                tile = 1;
            }
            // Some random buildings
            else if (Math.random() < 0.1 && x % 4 === 0 && y % 4 === 0) {
               tile = 1;
            }
            // A "park" area in the center with "grass" (Dirt patches)
            else if (x > 15 && x < 25 && y > 15 && y < 25) {
                tile = 2; 
            }
            // Sidewalks along roads (simplified)
            else if (x % 5 === 0) {
                tile = 3;
            }

            row.push(tile);
        }
        map.push(row);
    }
    return map;
};

export const HOOD_MAP = generateMap();

export const TILE_TYPES = {
    STREET: 0,
    BUILDING: 1,
    DIRT: 2,
    SIDEWALK: 3,
    FENCE: 4,
    WATER: 5
};

export const COLLISION_TILES = [
    TILE_TYPES.BUILDING,
    TILE_TYPES.FENCE,
    TILE_TYPES.WATER
];

export const ENCOUNTER_TILES = [
    TILE_TYPES.DIRT
];
