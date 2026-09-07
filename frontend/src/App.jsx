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
import { TaskFormModal } from './components/TaskFormModal';
import { TasksPanel } from './components/TasksPanel';
import { ZoneAssignmentPanel } from './components/ZoneAssignmentPanel';
import { ZoneDetailScreen } from './components/ZoneDetailScreen';
import { ZoneDirectoryScreen } from './components/ZoneDirectoryScreen';
import { ZoneMapLegend } from './components/ZoneMapLegend';
import { ZoneMapView } from './components/ZoneMapView';
import { sampleAnimals } from './data/sampleAnimals';
import { sampleApprovalReview } from './data/sampleApprovalReview';
import { sampleApprovals } from './data/sampleApprovals';
import { sampleDashboard } from './data/sampleDashboard';
import { sampleTasks } from './data/sampleTasks';
import { sampleUsers } from './data/sampleUsers';
import { sampleZone } from './data/sampleZone';

const activeUser = {
  id: 'u3',
  name: 'Morgan Tate',
  role: 'Manager',
};

const STORAGE_KEY = 'mischief-manager-state-v1';

const readSavedState = () => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) {
      return null;
    }

    const parsed = JSON.parse(savedState);
    if (!parsed || !Array.isArray(parsed.zones)) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Unable to read saved app state', error);
    return null;
  }
};

function ZoneDetailRoute({ zones, selectedZoneId, updateZone, openTaskModal, onSelectZone, recentTasks, onReviewAction, onZoneLifecycleChange }) {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const effectiveZoneId = zoneId ?? selectedZoneId;
  const zone = zones.find((item) => item.id === effectiveZoneId) ?? zones[0] ?? sampleZone;
  const reviewTask = recentTasks[0] ?? sampleApprovalReview;

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
        onApprove={() => onReviewAction?.(reviewTask.id, 'approve')}
        onReject={() => onReviewAction?.(reviewTask.id, 'reject')}
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
  const savedState = readSavedState();
  const location = useLocation();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalType, setTaskModalType] = useState('feeding_drop');
  const [zones, setZones] = useState(savedState?.zones ?? sampleDashboard);
  const [approvals, setApprovals] = useState(savedState?.approvals ?? sampleApprovals);
  const [tasks, setTasks] = useState(savedState?.tasks ?? sampleTasks);
  const [selectedZoneId, setSelectedZoneId] = useState(savedState?.selectedZoneId ?? sampleDashboard[0]?.id ?? 'garage');
  const [assignmentMap, setAssignmentMap] = useState(savedState?.assignmentMap ?? {
    'Garage': true,
    'Bird Building': true,
    'Back Porch': false,
  });
  const routeZoneId = location.pathname.match(/^\/zones\/([^/]+)/)?.[1];
  const activeZoneId = routeZoneId ?? selectedZoneId;
  const selectedZone = zones.find((zone) => zone.id === activeZoneId) ?? zones[0] ?? sampleZone;
  const recentZoneTasks = tasks.filter((task) => task.zone === selectedZone.name).slice(0, 3);
  const navigate = useNavigate();

  useEffect(() => {
    const appState = { zones, approvals, tasks, selectedZoneId, assignmentMap };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [zones, approvals, tasks, selectedZoneId, assignmentMap]);

  const updateZone = (nextZone) => {
    setZones((currentZones) =>
      currentZones.map((zone) => (zone.id === nextZone.id ? nextZone : zone))
    );
  };

  const handleZoneLifecycleChange = ({ status, initials, notes }) => {
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

  const handleApprovalDecision = (approvalId, decision) => {
    setApprovals((currentApprovals) =>
      currentApprovals.filter((approval) => approval.id !== approvalId)
    );

    if (decision === 'approve') {
      setZones((currentZones) =>
        currentZones.map((zone) =>
          zone.id === activeZoneId
            ? { ...zone, urgentTasks: Math.max(zone.urgentTasks - 1, 0) }
            : zone
        )
      );
    }
  };

  const handleSelectZone = (zoneId) => {
    setSelectedZoneId(zoneId);
    navigate(`/zones/${zoneId}`);
  };

  const openTaskModal = (type = 'feeding_drop') => {
    setTaskModalType(type);
    setShowTaskModal(true);
  };

  const handleTaskSave = ({ notes, initials }) => {
    setZones((currentZones) =>
      currentZones.map((zone) => {
        if (zone.id !== activeZoneId) {
          return zone;
        }

        const taskKey = taskModalType === 'feeding_drop' ? 'feedingDrop' : 'cleaning';
        const nextTasks = zone[taskKey].map((task) => {
          if (task.state === 'complete') {
            return task;
          }

          return {
            ...task,
            state: 'complete',
            initials: taskModalType === 'feeding_drop' ? initials || task.initials : task.initials,
            notes: notes || task.notes,
          };
        });

        return {
          ...zone,
          [taskKey]: nextTasks,
          lastTaskNote: notes || zone.lastTaskNote,
        };
      })
    );

    setTasks((currentTasks) => [
      {
        id: `task-${Date.now()}`,
        title: taskModalType === 'feeding_drop'
          ? `Dropping bowls · ${selectedZone.name}`
          : `Cleaning check · ${selectedZone.name}`,
        priority: taskModalType === 'feeding_drop' ? 'urgent' : 'normal',
        zone: selectedZone.name,
        initials: initials || null,
        notes: notes || '',
      },
      ...currentTasks,
    ]);

    setShowTaskModal(false);
  };

  const handleReviewAction = (taskId, action) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    if (action === 'approve') {
      setZones((currentZones) =>
        currentZones.map((zone) =>
          zone.id === activeZoneId
            ? { ...zone, urgentTasks: Math.max(zone.urgentTasks - 1, 0) }
            : zone
        )
      );
    }
  };

  const navItems = [
    { label: 'Dashboard', to: '/' },
    { label: 'Zones', to: '/zones' },
    { label: 'Overview', to: '/overview' },
    { label: 'People', to: '/people' },
    { label: 'Tasks', to: '/tasks' },
    { label: 'Animals', to: '/animals' },
    { label: 'Settings', to: '/settings' },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Mischief Manager</h1>
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

      <main className="app-main">
        <div className="left-column">
          <SignInScreen />
          <ZoneAssignmentPanel
            user={activeUser}
            zones={['Garage', 'Bird Building', 'Back Porch']}
            assignmentMap={assignmentMap}
            onToggleAssign={(zoneName) => {
              setAssignmentMap((current) => ({
                ...current,
                [zoneName]: !current[zoneName],
              }));
            }}
          />
          <ManagerApprovalQueue
            trainees={approvals}
            onApprove={(approvalId) => handleApprovalDecision(approvalId, 'approve')}
            onReject={(approvalId) => handleApprovalDecision(approvalId, 'reject')}
          />
        </div>

        <Routes>
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
                onZoneLifecycleChange={handleZoneLifecycleChange}
              />
            }
          />
          <Route path="/overview" element={<ManagerDailyOverview zones={zones} />} />
          <Route path="/people" element={<PeoplePanel users={sampleUsers} />} />
          <Route
            path="/tasks"
            element={
              <TasksPanel
                tasks={tasks}
                selectedZoneName={selectedZone.name}
                onOpenTaskModal={openTaskModal}
              />
            }
          />
          <Route path="/animals" element={<AnimalDetailPanel animal={sampleAnimals[1]} />} />
          <Route path="/settings" element={<div className="placeholder-panel">Settings panel</div>} />
        </Routes>

      </main>

      {showTaskModal && (
        <TaskFormModal
          taskType={taskModalType}
          zoneName={selectedZone.name}
          onClose={() => setShowTaskModal(false)}
          onSave={handleTaskSave}
        />
      )}
    </div>
  );
}
