import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimalDetailPanel } from './components/AnimalDetailPanel';
import { ApprovalReviewPanel } from './components/ApprovalReviewPanel';
import { DashboardScreen } from './components/DashboardScreen';
import { EmployeeLocationPanel } from './components/EmployeeLocationPanel';
import { ManagerApprovalQueue } from './components/ManagerApprovalQueue';
import { ManagerDailyOverview } from './components/ManagerDailyOverview';
import { PeoplePanel } from './components/PeoplePanel';
import { SignInScreen } from './components/SignInScreen';
import { SettingsPanel } from './components/SettingsPanel';
import { TaskFormModal } from './components/TaskFormModal';
import { TasksPanel } from './components/TasksPanel';
import { ZoneAssignmentPanel } from './components/ZoneAssignmentPanel';
import { ZoneDetailScreen } from './components/ZoneDetailScreen';
import { ZoneDirectoryScreen } from './components/ZoneDirectoryScreen';
import { ZoneMapLegend } from './components/ZoneMapLegend';
import { ZoneMapView } from './components/ZoneMapView';
import { loadAppState, resetAppState, saveAppState } from './data/appStore';
import { sampleAnimals } from './data/sampleAnimals';
import { sampleUsers } from './data/sampleUsers';
import { sampleZone } from './data/sampleZone';
import { hasPermission } from './utils/permissions';
import { formatWorkdayDate, getOperatingStatus, getWorkdayDate } from './utils/workday';

function ZoneDetailRoute({ zones, selectedZoneId, updateZone, openTaskModal, onSelectZone, recentTasks, pendingApproval, onReviewAction, onZoneLifecycleChange, canManage, activeUser, activeSession, onStartWork, onEndWork }) {
  const { zoneId } = useParams();
  const navigate = useNavigate();

  const handleSignIn = (user) => {
    setActiveUser(user);
    navigate('/');
  };
  const effectiveZoneId = zoneId ?? selectedZoneId;
  const zone = zones.find((item) => item.id === effectiveZoneId) ?? zones[0] ?? sampleZone;
  const reviewTask = pendingApproval ?? (recentTasks[0]?.approvalStatus === 'pending' ? recentTasks[0] : null);

  useEffect(() => {
    if (zoneId && zoneId !== selectedZoneId) {
      onSelectZone(zoneId);
    }
  }, [zoneId, selectedZoneId, onSelectZone]);

  return (
    <div className="content-panel">
      <ZoneDetailScreen
        zone={zone}
        recentTasks={recentTasks}
        onZoneChange={updateZone}
        onOpenTaskModal={openTaskModal}
        canManage={canManage}
        activeUser={activeUser}
        activeSession={activeSession}
        onStartWork={onStartWork}
        onEndWork={onEndWork}
        onCloseZone={({ initials, notes }) =>
          onZoneLifecycleChange({
            status: zone.status === 'closed' ? 'open' : 'closed',
            initials,
            notes,
          })
        }
      />
      <ApprovalReviewPanel
        task={reviewTask}
        onApprove={() => onReviewAction?.(reviewTask.id, 'approve', '')}
        onReject={(reviewNotes) => onReviewAction?.(reviewTask.id, 'reject', reviewNotes)}
      />
      <button
        type="button"
        className="secondary-button back-to-dashboard"
        onClick={() => navigate('/')}
      >
        Back to dashboard
      </button>
    </div>
  );
}

export default function App() {
  const [initialState] = useState(loadAppState);
  const location = useLocation();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalType, setTaskModalType] = useState('feeding_drop');
  const [taskModalTaskId, setTaskModalTaskId] = useState(null);
  const [taskModalAction, setTaskModalAction] = useState('complete');
  const [activeUser, setActiveUser] = useState(initialState.activeUser);
  const [zones, setZones] = useState(initialState.zones);
  const [approvals, setApprovals] = useState(initialState.approvals);
  const [tasks, setTasks] = useState(initialState.tasks);
  const [animals, setAnimals] = useState(initialState.animals ?? sampleAnimals);
  const [users, setUsers] = useState(initialState.users ?? sampleUsers);
  const [zoneSessions, setZoneSessions] = useState(initialState.zoneSessions ?? []);
  const [selectedZoneId, setSelectedZoneId] = useState(initialState.selectedZoneId);
  const [assignmentMap, setAssignmentMap] = useState(initialState.assignmentMap);
  const [assignmentUserId, setAssignmentUserId] = useState(
    initialState.assignmentUserId || sampleUsers.find((user) => user.role === 'employee')?.id || 'u1'
  );
  const routeZoneId = location.pathname.match(/^\/zones\/([^/]+)/)?.[1];
  const activeZoneId = routeZoneId ?? selectedZoneId;
  const selectedZone = zones.find((zone) => zone.id === activeZoneId) ?? zones[0] ?? sampleZone;
  const recentZoneTasks = tasks.filter((task) => task.zone === selectedZone.name).slice(0, 3);
  const canWorkTasks = hasPermission(activeUser, 'workTasks');
  const canManageOperations = hasPermission(activeUser, 'manageOperations');
  const assignmentUser = sampleUsers.find((user) => user.id === assignmentUserId) ?? activeUser;
  const activeUserInitials = activeUser.initials || activeUser.name.split(' ').map((part) => part[0]).join('').slice(0, 3).toUpperCase();
  const operatingStatus = getOperatingStatus();
  const currentWorkday = formatWorkdayDate();
  const navigate = useNavigate();

  useEffect(() => {
    saveAppState({ activeUser, zones, approvals, tasks, animals, users, zoneSessions, selectedZoneId, assignmentMap, assignmentUserId });
  }, [activeUser, zones, approvals, tasks, animals, users, zoneSessions, selectedZoneId, assignmentMap, assignmentUserId]);

  const updateZone = (nextZone) => {
    setZones((currentZones) =>
      currentZones.map((zone) => (zone.id === nextZone.id ? nextZone : zone))
    );
  };

  const updateAnimal = (nextAnimal, changedTask) => {
    if (!canWorkTasks) {
      return;
    }

    setAnimals((currentAnimals) => currentAnimals.map((animal) => (
      animal.id === nextAnimal.id ? nextAnimal : animal
    )));

    if (changedTask) {
      setTasks((currentTasks) => [
        {
          id: `animal-task-${Date.now()}`,
          title: `${changedTask.title} · ${nextAnimal.name}`,
          priority: changedTask.group === 'health' ? 'urgent' : 'normal',
          zone: nextAnimal.zone,
          notes: '',
          completedBy: activeUser.id,
          completedByName: activeUser.name,
          completedAt: changedTask.updatedAt,
          state: changedTask.state,
          source: 'animal-care',
        },
        ...currentTasks,
      ]);
    }
  };

  const handleZoneLifecycleChange = ({ status, initials, notes }) => {
    if (!canManageOperations) {
      return;
    }

    setZones((currentZones) =>
      currentZones.map((zone) =>
        zone.id === activeZoneId
          ? {
              ...zone,
              status,
              signedBy: initials || zone.signedBy || 'MT',
              signoffNotes: notes || zone.signoffNotes || '',
              lastStatusUpdatedAt: new Date().toISOString(),
            }
          : zone
      )
    );
  };

  const handleSelectZone = (zoneId) => {
    setSelectedZoneId(zoneId);
    navigate(`/zones/${zoneId}`);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data on this device?')) {
      resetAppState();
      window.location.reload();
    }
  };

  const activeSession = zoneSessions.find(
    (session) => session.userId === activeUser.id && session.zoneId === activeZoneId && !session.endedAt
  );

  const handleStartWork = () => {
    if (!canWorkTasks || activeSession || selectedZone.status === 'closed') {
      return;
    }

    const startedAt = new Date().toISOString();
    setZoneSessions((currentSessions) => [
      ...currentSessions,
      {
        id: `session-${Date.now()}`,
        userId: activeUser.id,
        userName: activeUser.name,
        initials: activeUserInitials,
        zoneId: activeZoneId,
        zoneName: selectedZone.name,
        workdayDate: getWorkdayDate(startedAt).toISOString().slice(0, 10),
        startedAt,
        endedAt: null,
      },
    ]);
    setZones((currentZones) => currentZones.map((zone) => (
      zone.id === activeZoneId && !(zone.signedInUsers ?? []).includes(activeUserInitials)
        ? { ...zone, signedInUsers: [...(zone.signedInUsers ?? []), activeUserInitials], lastActivityAt: startedAt }
        : zone.id === activeZoneId
          ? { ...zone, lastActivityAt: startedAt }
        : zone
    )));
  };

  const handleEndWork = () => {
    if (!canWorkTasks || !activeSession) {
      return;
    }

    setZoneSessions((currentSessions) => currentSessions.map((session) => (
      session.id === activeSession.id ? { ...session, endedAt: new Date().toISOString() } : session
    )));
    setZones((currentZones) => currentZones.map((zone) => (
      zone.id === activeZoneId
        ? { ...zone, signedInUsers: (zone.signedInUsers ?? []).filter((initials) => initials !== activeSession.initials), lastActivityAt: new Date().toISOString() }
        : zone
    )));
  };

  const openTaskModal = (type = 'feeding_drop', taskId = null, action = 'complete') => {
    if (!canWorkTasks || selectedZone.status === 'closed') {
      return;
    }

    const taskKey = type === 'feeding_drop' ? 'feedingDrop' : 'cleaning';
    const targetTaskId = taskId ?? selectedZone[taskKey]?.find((task) => task.state !== 'complete')?.id;

    if (!targetTaskId) {
      return;
    }

    setTaskModalType(type);
    setTaskModalTaskId(targetTaskId);
    setTaskModalAction(action);
    setShowTaskModal(true);
  };

  const handleTaskSave = ({ notes, initials, seedLevel, naReason, refillInstructions }) => {
    if (!canWorkTasks || selectedZone.status === 'closed') {
      return;
    }

    const completedAt = new Date().toISOString();
    const activityId = `task-${Date.now()}`;
    const isTrainee = activeUser.role.toLowerCase() === 'trainee';
    const selectedTask = selectedZone[taskModalType === 'feeding_drop' ? 'feedingDrop' : 'cleaning']
      ?.find((task) => task.id === taskModalTaskId);

    setZones((currentZones) =>
      currentZones.map((zone) => {
        if (zone.id !== activeZoneId) {
          return zone;
        }

        const taskKey = taskModalType === 'feeding_drop' ? 'feedingDrop' : 'cleaning';
          const nextTasks = zone[taskKey].map((task) => task.id === taskModalTaskId
          ? {
              ...task,
                state: taskModalAction === 'na'
                ? 'na'
                : task.taskType === 'bird_seed_level' && seedLevel === 'out' ? 'incomplete' : 'complete',
            seedLevel: task.taskType === 'bird_seed_level' ? seedLevel : task.seedLevel,
            empty: task.taskType === 'bird_seed_level' ? seedLevel === 'out' : task.empty,
              refillInstructions: task.taskType === 'bird_seed_level'
                ? refillInstructions || task.refillInstructions
                : task.refillInstructions,
              priority: task.taskType === 'bird_seed_level'
                ? ['low', 'out'].includes(seedLevel) ? 'urgent' : 'normal'
                : task.priority,
              initials: taskModalType === 'feeding_drop' ? initials : task.initials,
              notes: notes || task.notes,
              naReason: taskModalAction === 'na' ? naReason : task.naReason,
              completedBy: activeUser.id,
              completedByName: activeUser.name,
              completedAt,
              approvalRequired: isTrainee,
              approvalStatus: isTrainee ? 'pending' : 'not_required',
            }
          : task
        );

        return {
          ...zone,
          [taskKey]: nextTasks,
          lastTaskNote: notes || zone.lastTaskNote,
          lastActivityAt: completedAt,
        };
      })
    );

    setTasks((currentTasks) => [
      {
        id: activityId,
        checklistTaskId: taskModalTaskId,
        title: selectedTask?.title || (taskModalType === 'feeding_drop'
          ? `Dropping bowls · ${selectedZone.name}`
          : `Cleaning task · ${selectedZone.name}`),
        priority: taskModalType === 'feeding_drop' || ['low', 'out'].includes(seedLevel) ? 'urgent' : 'normal',
        zone: selectedZone.name,
        initials: initials || null,
        notes: notes || '',
        naReason: taskModalAction === 'na' ? naReason : null,
        state: taskModalAction === 'na' ? 'na' : 'complete',
        seedLevel: seedLevel || null,
        refillInstructions: refillInstructions || null,
        displayNote: seedLevel
          ? `Seed level: ${seedLevel === 'out' ? 'Out' : seedLevel.charAt(0).toUpperCase() + seedLevel.slice(1)}${refillInstructions ? ` · ${refillInstructions}` : ''}`
          : taskModalAction === 'na' ? `N/A: ${naReason}` : notes || '',
        completedBy: activeUser.id,
        completedByName: activeUser.name,
        completedAt,
        workdayDate: getWorkdayDate(completedAt).toISOString().slice(0, 10),
        approvalRequired: isTrainee,
        approvalStatus: isTrainee ? 'pending' : 'not_required',
      },
      ...currentTasks,
    ]);

    if (isTrainee) {
      setApprovals((currentApprovals) => [
        {
          id: `approval-${activityId}`,
          taskId: activityId,
          checklistTaskId: taskModalTaskId,
          name: activeUser.name,
          zone: selectedZone.name,
          zoneId: selectedZone.id,
          title: selectedTask?.title || 'Trainee task',
          notes: notes || '',
          submittedBy: activeUser.id,
          status: 'pending',
        },
        ...currentApprovals,
      ]);
    }

    setShowTaskModal(false);
  };

  const handleReviewAction = (approvalId, action, reviewNotes = '') => {
    if (!canManageOperations) {
      return;
    }

    const approval = approvals.find((item) => item.id === approvalId);
    if (!approval || approval.status !== 'pending') {
      return;
    }

    const reviewStatus = action === 'approve' ? 'approved' : 'rejected';
    setApprovals((currentApprovals) => currentApprovals.map((item) => (
      item.id === approvalId
        ? { ...item, status: reviewStatus, reviewedBy: activeUser.id, reviewedByName: activeUser.name, reviewedAt: new Date().toISOString(), reviewNotes }
        : item
    )));
    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === approval.taskId
        ? { ...task, approvalStatus: reviewStatus, reviewNotes }
        : task
    )));
    if (action === 'reject') {
      setZones((currentZones) => currentZones.map((zone) => (
        zone.id === approval.zoneId
          ? {
              ...zone,
              cleaning: zone.cleaning.map((task) => task.id === approval.checklistTaskId ? { ...task, state: 'incomplete', approvalStatus: 'rejected', reviewNotes } : task),
              feedingDrop: zone.feedingDrop.map((task) => task.id === approval.checklistTaskId ? { ...task, state: 'incomplete', approvalStatus: 'rejected', reviewNotes } : task),
            }
          : zone
      )));
    }
  };

  const navItems = [
    { label: 'Dashboard', to: '/' },
    { label: 'Zones', to: '/zones' },
    ...(canManageOperations ? [{ label: 'Overview', to: '/overview' }] : []),
    { label: 'People', to: '/people' },
    ...(canManageOperations ? [
      { label: 'Tasks', to: '/tasks' },
      { label: 'Animals', to: '/animals' },
      { label: 'Settings', to: '/settings' },
    ] : []),
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-main">
          <h1>Mischief Manager</h1>
          <span className={`operating-status ${operatingStatus.state}`}>{operatingStatus.label}</span>
        </div>
        <div className="app-header-meta">
          <span>Workday: {currentWorkday}</span>
          <span>{operatingStatus.reason}</span>
        </div>
      </header>

      <nav className="nav-tabs">
        {navItems.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <main className={`app-main ${location.pathname === '/' ? 'dashboard-route' : 'workflow-route'}`}>
        {location.pathname === '/' && <div className="left-column">
          <SignInScreen user={activeUser} users={users} onSignIn={handleSignIn} />
          <ZoneAssignmentPanel
            user={activeUser}
            users={users}
            zones={['Garage', 'Bird Building', 'Back Porch']}
            assignmentMap={assignmentMap}
            canManage={canManageOperations}
            selectedUserId={canManageOperations ? assignmentUser.id : activeUser.id}
            onSelectUser={setAssignmentUserId}
            onToggleAssign={(zoneName) => {
              if (!canManageOperations) {
                return;
              }

              setAssignmentMap((current) => ({
                ...current,
                [assignmentUserId]: {
                  ...(current[assignmentUserId] ?? {}),
                  [zoneName]: !current[assignmentUserId]?.[zoneName],
                },
              }));
            }}
          />
          {canManageOperations && (
            <ManagerApprovalQueue
              trainees={approvals}
              onApprove={(approvalId, reviewNotes) => handleReviewAction(approvalId, 'approve', reviewNotes)}
              onReject={(approvalId, reviewNotes) => handleReviewAction(approvalId, 'reject', reviewNotes)}
            />
          )}
        </div>}

        <Routes>
          <Route
            path="/signin"
            element={<SignInScreen user={activeUser} users={users} onSignIn={handleSignIn} showQr={false} />}
          />
          <Route
            path="/"
            element={
              <div className="dashboard-panel">
                <DashboardScreen
                  zones={zones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={handleSelectZone}
                />
                <ZoneMapLegend />
                <ZoneMapView
                  zones={zones}
                  selectedZoneId={selectedZoneId}
                  onSelectZone={handleSelectZone}
                />
                <EmployeeLocationPanel users={sampleUsers} />
              </div>
            }
          />
          <Route
            path="/zones"
            element={
              <ZoneDirectoryScreen
                zones={zones}
                selectedZoneId={activeZoneId}
                onSelectZone={handleSelectZone}
              />
            }
          />
          <Route
            path="/zones/:zoneId"
            element={
              <ZoneDetailRoute
                zones={zones}
                selectedZoneId={activeZoneId}
                updateZone={updateZone}
                openTaskModal={openTaskModal}
                onSelectZone={handleSelectZone}
                recentTasks={recentZoneTasks}
                onReviewAction={handleReviewAction}
                pendingApproval={approvals.find((approval) => approval.status === 'pending' && approval.zoneId === activeZoneId)}
                onZoneLifecycleChange={handleZoneLifecycleChange}
                canManage={canManageOperations}
                activeUser={activeUser}
                activeSession={activeSession}
                onStartWork={handleStartWork}
                onEndWork={handleEndWork}
              />
            }
          />
          <Route
            path="/overview"
            element={canManageOperations ? (
              <ManagerDailyOverview zones={zones} tasks={tasks} zoneSessions={zoneSessions} approvals={approvals} />
            ) : (
              <DashboardScreen zones={zones} selectedZoneId={selectedZoneId} onSelectZone={handleSelectZone} />
            )}
          />
          <Route
            path="/people"
            element={(
              <PeoplePanel
                users={users}
                zones={['Garage', 'Bird Building', 'Back Porch']}
                assignmentMap={assignmentMap}
                zoneSessions={zoneSessions}
                tasks={tasks}
                canManage={canManageOperations}
                onToggleAssignment={(userId, zoneName) => setAssignmentMap((current) => ({
                  ...current,
                  [userId]: {
                    ...(current[userId] ?? {}),
                    [zoneName]: !current[userId]?.[zoneName],
                  },
                }))}
                onAddUser={canManageOperations ? (newUser) => setUsers((currentUsers) => [...currentUsers, newUser]) : undefined}
                onUpdateUser={canManageOperations ? (updatedUser) => setUsers((currentUsers) => currentUsers.map((user) => user.id === updatedUser.id ? updatedUser : user)) : undefined}
                onDeactivateUser={canManageOperations ? (userId) => setUsers((currentUsers) => currentUsers.map((user) => user.id === userId ? { ...user, status: 'inactive' } : user)) : undefined}
              />
            )}
          />
          <Route
            path="/tasks"
            element={canManageOperations ? (
              <TasksPanel
                tasks={tasks}
                selectedZoneName={selectedZone.name}
                onOpenTaskModal={openTaskModal}
              />
            ) : <DashboardScreen zones={zones} selectedZoneId={selectedZoneId} onSelectZone={handleSelectZone} />}
          />
          <Route
            path="/animals"
            element={canManageOperations ? (
              <AnimalDetailPanel
                animals={animals}
                activeUser={activeUser}
                onAnimalChange={updateAnimal}
              />
            ) : <DashboardScreen zones={zones} selectedZoneId={selectedZoneId} onSelectZone={handleSelectZone} />}
          />
          <Route
            path="/settings"
            element={canManageOperations ? <SettingsPanel onReset={handleResetDemo} /> : <DashboardScreen zones={zones} selectedZoneId={selectedZoneId} onSelectZone={handleSelectZone} />}
          />
        </Routes>

      </main>

      {showTaskModal && (
        <TaskFormModal
          taskType={taskModalType}
          action={taskModalAction}
          zoneName={selectedZone.name}
          taskTitle={selectedZone[taskModalType === 'feeding_drop' ? 'feedingDrop' : 'cleaning']?.find((task) => task.id === taskModalTaskId)?.title}
          task={selectedZone[taskModalType === 'feeding_drop' ? 'feedingDrop' : 'cleaning']?.find((item) => item.id === taskModalTaskId)}
          onClose={() => setShowTaskModal(false)}
          onSave={handleTaskSave}
        />
      )}
    </div>
  );
}
