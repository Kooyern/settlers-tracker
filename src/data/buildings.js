// Settlers building types for battle reports
export const BUILDINGS = {
  // Military
  military: [
    { id: 'barracks', name: 'Barracks', icon: '⚔️', category: 'military' },
    { id: 'archery', name: 'Archery Range', icon: '🏹', category: 'military' },
    { id: 'stable', name: 'Stable', icon: '🐴', category: 'military' },
    { id: 'siege-workshop', name: 'Siege Workshop', icon: '🏰', category: 'military' },
    { id: 'watchtower', name: 'Watchtower', icon: '🗼', category: 'military' },
    { id: 'fortress', name: 'Fortress', icon: '🏯', category: 'military' },
  ],

  // Production
  production: [
    { id: 'woodcutter', name: 'Woodcutter', icon: '🪓', category: 'production' },
    { id: 'sawmill', name: 'Sawmill', icon: '🪚', category: 'production' },
    { id: 'stonecutter', name: 'Stonecutter', icon: '⛏️', category: 'production' },
    { id: 'mine-iron', name: 'Iron Mine', icon: '🔩', category: 'production' },
    { id: 'mine-gold', name: 'Gold Mine', icon: '💰', category: 'production' },
    { id: 'mine-coal', name: 'Coal Mine', icon: '⬛', category: 'production' },
    { id: 'smelter', name: 'Smelter', icon: '🔥', category: 'production' },
    { id: 'toolmaker', name: 'Toolmaker', icon: '🔧', category: 'production' },
    { id: 'weaponsmith', name: 'Weaponsmith', icon: '⚒️', category: 'production' },
  ],

  // Food
  food: [
    { id: 'farm', name: 'Farm', icon: '🌾', category: 'food' },
    { id: 'mill', name: 'Mill', icon: '🌀', category: 'food' },
    { id: 'bakery', name: 'Bakery', icon: '🍞', category: 'food' },
    { id: 'fishery', name: 'Fishery', icon: '🐟', category: 'food' },
    { id: 'hunter', name: 'Hunter\'s Lodge', icon: '🦌', category: 'food' },
    { id: 'pig-farm', name: 'Pig Farm', icon: '🐷', category: 'food' },
    { id: 'butcher', name: 'Butcher', icon: '🥩', category: 'food' },
  ],

  // Other
  infrastructure: [
    { id: 'storehouse', name: 'Storehouse', icon: '📦', category: 'infrastructure' },
    { id: 'marketplace', name: 'Marketplace', icon: '🏪', category: 'infrastructure' },
    { id: 'harbor', name: 'Harbor', icon: '⚓', category: 'infrastructure' },
    { id: 'residence', name: 'Residence', icon: '🏠', category: 'infrastructure' },
  ]
}

export const getAllBuildings = () => {
  return Object.values(BUILDINGS).flat()
}

export const getBuildingById = (id) => {
  return getAllBuildings().find(b => b.id === id)
}

export const BUILDING_CATEGORIES = [
  { id: 'military', name: 'Military', color: 'text-red-400' },
  { id: 'production', name: 'Production', color: 'text-orange-400' },
  { id: 'food', name: 'Food', color: 'text-green-400' },
  { id: 'infrastructure', name: 'Infrastructure', color: 'text-blue-400' },
]
