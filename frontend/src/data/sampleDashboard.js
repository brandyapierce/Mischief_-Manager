export const sampleDashboard = [
  {
    id: 'garage',
    name: 'Garage',
    cleaning: [
      { id: 'c1', title: 'Clean enclosure', state: 'complete' },
      { id: 'c2', title: 'Remove old food', state: 'complete' },
      { id: 'c3', title: 'Clean water bowl', state: 'complete' }
    ],
    feedingDrop: [
      { id: 'd1', title: 'Dropping Bowls', state: 'incomplete', initials: null },
      { id: 'd2', title: 'Dropping Bowls', state: 'incomplete', initials: null }
    ],
    signedInUsers: ['A.R.', 'J.S.'],
    urgentTasks: 1,
  },
  {
    id: 'bird-building',
    name: 'Bird Building',
    cleaning: [
      { id: 'b1', title: 'Clean perches', state: 'complete' },
      { id: 'b2', title: 'Remove droppings', state: 'complete' },
      { id: 'b3', title: 'Fresh water check', state: 'complete' }
    ],
    feedingDrop: [
      { id: 'b4', title: 'Dropping Bowls', state: 'complete', initials: 'AR' }
    ],
    signedInUsers: ['M.T.'],
    urgentTasks: 0,
  },
  {
    id: 'back-porch',
    name: 'Back Porch',
    cleaning: [
      { id: 'p1', title: 'Sweep floor', state: 'incomplete' },
      { id: 'p2', title: 'Wipe surfaces', state: 'incomplete' },
      { id: 'p3', title: 'Spot clean habitat', state: 'complete' }
    ],
    feedingDrop: [
      { id: 'p4', title: 'Dropping Bowls', state: 'pending', initials: null }
    ],
    signedInUsers: [],
    urgentTasks: 2,
  }
];
