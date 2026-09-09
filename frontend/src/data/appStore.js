import { sampleApprovalReview } from './sampleApprovalReview';
import { sampleApprovals } from './sampleApprovals';
import { sampleDashboard } from './sampleDashboard';
import { sampleTasks } from './sampleTasks';
import { sampleAnimals } from './sampleAnimals';
import { sampleUsers } from './sampleUsers';

const STORAGE_KEY = 'mischief-manager-state-v1';

const defaultUser = {
  id: 'u3',
  name: 'Morgan Tate',
  role: 'Manager',
};

const birdSeedTask = {
  id: 'b5',
  title: 'Bird seed level',
  taskType: 'bird_seed_level',
  state: 'incomplete',
  seedLevel: null,
  refillLocation: 'Commissary seed storage',
  refillInstructions: 'Use the labeled bird seed container and refill the bin before leaving the area.',
};

const birdBuildingTasks = [
  { id: 'bird-signs-of-life', title: 'Signs of life · All birds', state: 'incomplete', priority: 'urgent' },
  { id: 'bird-feed-bowls', title: 'Fill feeding bowls with bird seed', state: 'incomplete' },
  { id: 'bird-fresh-water', title: 'Provide fresh water for each bird', state: 'incomplete' },
  { id: 'bird-snake-check', title: 'Check area for snakes', state: 'incomplete', priority: 'urgent' },
  birdSeedTask,
];

export const defaultAppState = {
  activeUser: defaultUser,
  zones: sampleDashboard,
  approvals: sampleApprovals,
  tasks: sampleTasks,
  animals: sampleAnimals,
  users: sampleUsers,
  zoneSessions: [],
  selectedZoneId: sampleDashboard[0]?.id ?? 'garage',
  assignmentMap: {
    u1: { Garage: true, 'Bird Building': false, 'Back Porch': false },
    u2: { Garage: false, 'Bird Building': false, 'Back Porch': true },
    u3: { Garage: true, 'Bird Building': true, 'Back Porch': false },
  },
};

export function loadAppState() {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) {
      return defaultAppState;
    }

    const parsed = JSON.parse(savedState);
    if (!parsed || !Array.isArray(parsed.zones)) {
      return defaultAppState;
    }

    const zones = parsed.zones.map((zone) => {
      let migratedZone = {
        ...zone,
        cleaning: Array.isArray(zone.cleaning) ? zone.cleaning : [],
        feedingDrop: Array.isArray(zone.feedingDrop) ? zone.feedingDrop : [],
        signedInUsers: Array.isArray(zone.signedInUsers) ? zone.signedInUsers : [],
      };

      if (zone.name === 'Bird Building') {
        const existingTasks = Array.isArray(zone.cleaning) ? zone.cleaning : [];
        const cleaning = birdBuildingTasks.map((task) => ({
          ...task,
          ...(existingTasks.find((existingTask) => existingTask.id === task.id) || {}),
        }));
        migratedZone = { ...zone, cleaning, feedingDrop: [] };
      }

      if (zone.name === 'Garage' && Array.isArray(zone.feedingDrop)) {
        migratedZone = {
          ...migratedZone,
          feedingDrop: [
            ...zone.feedingDrop.map((task) => (
            task.id === 'd1'
              ? { ...task, title: 'Bowl Drop Sloth A' }
              : task.id === 'd2'
                ? { ...task, title: 'Bowl Drop Sloth B' }
                : task
            )),
            ...(zone.feedingDrop.some((task) => task.id === 'garage-monkey-teddy-drop') ? [] : [
              { id: 'garage-monkey-teddy-drop', title: 'Bowl Drop · Teddy the monkey', state: 'incomplete', initials: null },
            ]),
            ...(zone.feedingDrop.some((task) => task.id === 'garage-monkey-bubbles-drop') ? [] : [
              { id: 'garage-monkey-bubbles-drop', title: 'Bowl Drop · Bubbles the monkey', state: 'incomplete', initials: null },
            ]),
          ],
        };
      }

      if (zone.name === 'Back Porch' && Array.isArray(zone.cleaning) && !zone.cleaning.some((task) => task.id === 'porch-chinchillas-life')) {
        migratedZone = {
          ...migratedZone,
          cleaning: sampleDashboard.find((item) => item.id === 'back-porch').cleaning,
        };
      }

      if (zone.name === 'Back Porch') {
        migratedZone = {
          ...migratedZone,
          cleaning: sampleDashboard.find((item) => item.id === 'back-porch').cleaning.map((task) => ({
            ...task,
            ...(migratedZone.cleaning?.find((existingTask) => existingTask.id === task.id) || {}),
          })),
          feedingDrop: sampleDashboard.find((item) => item.id === 'back-porch').feedingDrop.map((task) => ({
            ...task,
            ...(migratedZone.feedingDrop?.find((existingTask) => existingTask.id === task.id) || {}),
          })),
        };
      }

      if (zone.name !== 'Garage' || !Array.isArray(zone.cleaning) || zone.cleaning.some((task) => task.id === 'garage-a-betsy-life')) {
        return migratedZone;
      }

      return {
        ...migratedZone,
        cleaning: sampleDashboard.find((item) => item.id === 'garage').cleaning,
      };
    });

    return {
      ...defaultAppState,
      ...parsed,
      activeUser: parsed.activeUser && typeof parsed.activeUser === 'object'
        ? { ...defaultAppState.activeUser, ...parsed.activeUser }
        : defaultAppState.activeUser,
      zones,
      approvals: Array.isArray(parsed.approvals) ? parsed.approvals : defaultAppState.approvals,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaultAppState.tasks,
      animals: Array.isArray(parsed.animals)
        ? [
            ...parsed.animals.map((animal) => (
              animal.id === 'animal-1'
                ? { ...animal, name: 'Betsy' }
                : animal.id === 'animal-4'
                  ? { ...animal, name: 'Sloth 1' }
                  : animal
            )),
            ...defaultAppState.animals.filter((animal) => !parsed.animals.some((savedAnimal) => savedAnimal.id === animal.id)),
          ]
        : defaultAppState.animals,
      users: Array.isArray(parsed.users) ? parsed.users : defaultAppState.users,
      zoneSessions: Array.isArray(parsed.zoneSessions) ? parsed.zoneSessions : defaultAppState.zoneSessions,
      assignmentUserId: parsed.assignmentUserId || defaultAppState.activeUser.id,
      assignmentMap: parsed.assignmentMap && typeof parsed.assignmentMap === 'object'
        ? Object.values(parsed.assignmentMap).some((value) => typeof value === 'boolean')
          ? { [parsed.activeUser?.id || defaultAppState.activeUser.id]: parsed.assignmentMap }
          : parsed.assignmentMap
        : defaultAppState.assignmentMap,
    };
  } catch (error) {
    console.warn('Unable to read saved app state', error);
    return defaultAppState;
  }
}

export function saveAppState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to save app state', error);
  }
}

export function resetAppState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to reset saved app state', error);
  }
}

export const getReviewFallback = () => sampleApprovalReview;
