# App Implementation Examples

This document shows example UI and logic patterns for the sanctuary app, using the separation between cleaning and feeding-drop tasks.

## 1. Example Zone Data

```js
const zone = {
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
  signedInUsers: ['A.R.', 'J.S.']
};
```

## 2. Example Status Computation

```js
const deriveZoneStatus = (zone) => {
  const cleaningComplete = zone.cleaning.every(
    (task) => task.state === 'complete' || task.state === 'na'
  );

  const bowlDropComplete = zone.feedingDrop.every(
    (task) => task.state === 'complete'
  );

  return {
    cleaningStatus: cleaningComplete ? 'complete' : 'needs_attention',
    bowlDropStatus: bowlDropComplete ? 'complete' : 'pending',
    zoneColor: cleaningComplete ? 'green' : 'yellow',
    needsAttention: !cleaningComplete || !bowlDropComplete
  };
};
```

### Example output

```json
{
  "cleaningStatus": "complete",
  "bowlDropStatus": "pending",
  "zoneColor": "green",
  "needsAttention": true
}
```

This is the correct behavior: the zone is clean, but the feeding drop still needs to be done.

## 3. Example UI Render

```jsx
function ZoneDetailScreen({ zone }) {
  const status = deriveZoneStatus(zone);

  return (
    <div>
      <h2>{zone.name}</h2>

      <StatusBadge color={status.zoneColor}>
        {status.zoneColor.toUpperCase()}
      </StatusBadge>

      <section>
        <h3>Cleaning</h3>
        {zone.cleaning.map((task) => (
          <TaskRow key={task.id} task={task} workflow="cleaning" />
        ))}
      </section>

      <section>
        <h3>Feeding Drop</h3>
        {zone.feedingDrop.map((task) => (
          <TaskRow key={task.id} task={task} workflow="feeding_drop" requiresInitials />
        ))}
      </section>
    </div>
  );
}
```

## 4. Example Bowl Drop Sign-Off

```jsx
function FeedingDropTask({ task }) {
  const [initials, setInitials] = useState(task.initials || '');

  return (
    <div>
      <label>{task.title}</label>
      <button onClick={() => completeDrop(task.id, initials)}>
        Mark dropped
      </button>
      <input
        value={initials}
        onChange={(e) => setInitials(e.target.value)}
        placeholder="Initials"
      />
    </div>
  );
}
```

Rules:
- The user can enter initials at the time of completion.
- The bowl-drop task remains separate from the cleaning checklist.
- A different worker can complete it later.

## 5. Example Dashboard Card

```jsx
function ZoneStatusCard({ zone }) {
  const status = deriveZoneStatus(zone);

  return (
    <div className="zone-card">
      <h4>{zone.name}</h4>
      <p>Cleaning: {status.cleaningStatus}</p>
      <p>Feeding Drop: {status.bowlDropStatus}</p>
      <p>Zone color: {status.zoneColor}</p>
    </div>
  );
}
```

## 6. Manager Summary Example

```json
{
  "garage": {
    "cleaningStatus": "complete",
    "bowlDropStatus": "pending",
    "peopleSignedIn": 2,
    "urgentTasks": 1
  }
}
```

The manager can immediately see that:
- the area is clean
- feeding drops still need to happen
- someone is working in the zone
- action is still required

## 7. Key Implementation Principle

The app must not treat cleaning and feeding drop as one checklist item. They are two operational flows that happen at different times and may be performed by different people.

This is the foundational rule for the app behavior and UI state.
