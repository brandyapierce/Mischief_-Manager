'use strict';

const USER_ROLES = Object.freeze([
  'manager',
  'employee',
  'volunteer',
  'trainee',
  'director',
]);

const TASK_STATES = Object.freeze([
  'complete',
  'incomplete',
  'incomplete_with_note',
  'na',
  'blocked',
  'in_progress',
]);

const SANCTUARY_HOURS = Object.freeze({
  openDays: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  closedDays: ['Mon', 'Tue'],
  openTime: '11:00',
  closeTime: '16:00',
  newDayStartsAt: '07:00',
  overnightWorkCountsFor: 'previous_day',
});

const TASK_CATEGORIES = Object.freeze({
  FEED: 'feeding',
  CLEAN: 'cleaning',
  HEALTH: 'signs_of_life',
  SECURE: 'secure',
  WATER: 'watering',
  MAINTENANCE: 'maintenance',
});

const PRIORITY_LEVELS = Object.freeze(['urgent', 'normal', 'low']);

const BIRD_SEED_LEVELS = Object.freeze(['full', 'half', 'low', 'empty']);

const generalTaskTemplate = (title, category, priority = 'normal', overrides = {}) => ({
  id: `task_${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
  title,
  category,
  priority,
  taskType: 'general_task',
  state: 'incomplete',
  notes: '',
  completedBy: null,
  completedAt: null,
  initials: null,
  naReason: null,
  requiresInitials: false,
  ...overrides,
});

const makeBirdSeedTask = (zoneName, overrides = {}) => ({
  id: `task_bird_seed_${zoneName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
  title: 'Bird Seed Level',
  category: TASK_CATEGORIES.FEED,
  priority: 'urgent',
  taskType: 'bird_seed_level',
  state: 'incomplete',
  level: 'half',
  empty: false,
  notes: '',
  refillInstructions: 'Check the seed bin. If empty, refill from the commissary seed storage and confirm the tray is replenished.',
  refillLocation: 'Commissary seed storage',
  completedBy: null,
  completedAt: null,
  initials: null,
  requiresInitials: false,
  ...overrides,
});

const makeDroppingBowlsTask = (zoneName, overrides = {}) => ({
  id: `task_drop_bowls_${zoneName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
  title: 'Dropping Bowls',
  category: TASK_CATEGORIES.FEED,
  priority: 'urgent',
  taskType: 'drop_bowls',
  workflowGroup: 'feeding_drop',
  isIndependentOfCleaning: true,
  state: 'incomplete',
  notes: '',
  completedBy: null,
  completedAt: null,
  initials: null,
  requiresInitials: true,
  appliesTo: 'non_birds',
  ...overrides,
});

const zoneChecklistTemplates = Object.freeze({
  'Front Yard': [
    'Exotic birds',
    'Ducks',
    'Turtle',
    'Plants',
  ],
  Commissary: [
    'Dishes',
    'Bowl Collection',
    'Bowl Stacking',
    'Food Sorting',
    'Floor Mopping',
  ],
  Garage: [
    'Sloth Cages A & B',
    'Fish Tank',
    'Abby (Toucan)',
    'Parrot',
    'Monkeys',
    'Tiny Birds',
    'Sweep Floor',
    'Mop Floor',
    'Doors Open',
    'Lights On',
    'Water Jugs Full',
    'Clear Spiderwebs',
  ],
  'Foxes/Racoons/Owls/Koi/Coati': [
    'Foxes',
    'Racoons',
    'Owls',
    'Coati',
  ],
  'Nocturnal Building': [
    'Bats',
    'Bush Babies',
    'Sterling Animals',
  ],
  'Bird Building': [
    'Signs of Life',
    'Fresh Water',
    'Bird Seed',
    'Bird Seed Level',
    'Spiderwebs',
  ],
  Pigeons: [
    'Signs of Life',
    'Fresh Drinking Water',
    'Fresh Bath Water',
    'Bird Seed',
    'Bird Seed Level',
    'Scrub Poop off of perches and houses',
    'Spiderwebs',
  ],
  'Back Porch': [
    'Chinchillas',
    'Sugar Gliders',
    'Isolation',
    'Sweep Floor',
  ],
  'Back Deck Owls': [
    'Signs of Life',
    'Fresh Water',
    'Collect old mice',
    'Scrub Poop off of perches and floor',
  ],
  Vultures: [
    'Signs of Life',
    'Spray/Clean Food Surface',
    'Collect old mice',
    'Fresh Water',
  ],
  Chickens: [
    'Signs of Life',
    'Fresh Water',
    'Bird Seed',
    'Bird Seed Level',
    'Spray and Clean Platforms',
    'Refill Bird Seed Bin',
  ],
  'Binturong/Lemurs': [
    'Signs of Life',
    'Fresh Water',
    'Poop Scoop',
    'Collect old Bowls',
  ],
  'Barn Cats': [
    'Signs of Life',
    'Fresh Water',
    'Top off Food',
  ],
  'Reptile Building': [
    'Snakes/Lizards',
    'Bush Babies',
    'Owl',
    'Sterling\'s People',
    'Armadillo and Friend',
    'Outside Animals',
  ],
  'Middle Area': [
    'Pigs',
    'Porcupines',
    'Skunk',
    'Prairie Dog',
  ],
  'House Animals': [
    'Birds',
    'Cats',
    'Dogs',
    'Badger',
  ],
  Ostriches: [
    'Signs of Life',
    'Fresh Water',
    'Top Off Food',
  ],
  Pasture: [
    'Signs of Life',
    'Fill Water Trough',
    'Spread out Bales of Hay',
    'Muck the Stalls',
  ],
});

const sanctuaryZones = Object.entries(zoneChecklistTemplates).map(([name, tasks]) => ({
  id: `zone_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
  name,
  status: 'active',
  staleWarningThresholdMinutes: 480,
  approvalNeeded: false,
  qrCode: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr`,
  checklist: tasks.map((taskName, index) => ({
    id: `task_${index + 1}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    title: taskName,
    category: taskName.toLowerCase().includes('water') ? TASK_CATEGORIES.WATER :
      taskName.toLowerCase().includes('bird seed') || taskName.toLowerCase().includes('food') ? TASK_CATEGORIES.FEED :
      taskName.toLowerCase().includes('spider') || taskName.toLowerCase().includes('mop') || taskName.toLowerCase().includes('sweep') ? TASK_CATEGORIES.CLEAN :
      TASK_CATEGORIES.MAINTENANCE,
    priority: taskName.toLowerCase().includes('life') || taskName.toLowerCase().includes('water') || taskName.toLowerCase().includes('food') ? 'urgent' : 'normal',
    taskType: taskName.toLowerCase().includes('bird seed') ? 'bird_seed_level' : taskName.toLowerCase().includes('bowl') ? 'drop_bowls' : 'general_task',
    state: 'incomplete',
    notes: '',
    completedBy: null,
    completedAt: null,
    initials: null,
    naReason: null,
    requiresInitials: taskName.toLowerCase().includes('bowl') && !taskName.toLowerCase().includes('bird seed'),
  })),
}));

const zoneTaskBuilders = {
  birdSeed: (zoneName, overrides = {}) => makeBirdSeedTask(zoneName, overrides),
  dropBowls: (zoneName, overrides = {}) => makeDroppingBowlsTask(zoneName, overrides),
  general: (title, category, priority = 'normal', overrides = {}) => generalTaskTemplate(title, category, priority, overrides),
};

const buildZoneChecklist = (zoneName, overrides = {}) => {
  const tasks = (zoneChecklistTemplates[zoneName] || []).map((title, index) => {
    const normalizedTitle = title.toLowerCase();

    if (normalizedTitle.includes('bird seed') || normalizedTitle.includes('refill bird seed bin')) {
      return makeBirdSeedTask(zoneName, {
        id: `task_${index + 1}_${zoneName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        title,
        ...overrides,
      });
    }

    if (normalizedTitle.includes('bowl') && !normalizedTitle.includes('bird seed')) {
      return makeDroppingBowlsTask(zoneName, {
        id: `task_${index + 1}_${zoneName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        title,
        ...overrides,
      });
    }

    return generalTaskTemplate(title, TASK_CATEGORIES.MAINTENANCE, 'normal', {
      id: `task_${index + 1}_${zoneName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      ...overrides,
    });
  });

  return {
    zoneName,
    tasks,
  };
};

module.exports = {
  USER_ROLES,
  TASK_STATES,
  TASK_CATEGORIES,
  PRIORITY_LEVELS,
  BIRD_SEED_LEVELS,
  SANCTUARY_HOURS,
  zoneChecklistTemplates,
  sanctuaryZones,
  zoneTaskBuilders,
  buildZoneChecklist,
  makeBirdSeedTask,
  makeDroppingBowlsTask,
  generalTaskTemplate,
};
