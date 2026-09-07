import { useEffect, useState } from 'react';
import { AnimalDetailPanel } from './components/AnimalDetailPanel';
import { ApprovalReviewPanel } from './components/ApprovalReviewPanel';
import { DashboardScreen } from './components/DashboardScreen';
import { EmployeeLocationPanel } from './components/EmployeeLocationPanel';
import { ManagerApprovalQueue } from './components/ManagerApprovalQueue';
import { NavigationTabs } from './components/NavigationTabs';
import { PeoplePanel } from './components/PeoplePanel';
import { SignInScreen } from './components/SignInScreen';
import { TaskFormModal } from './components/TaskFormModal';
import { TasksPanel } from './components/TasksPanel';
import { ZoneAssignmentPanel } from './components/ZoneAssignmentPanel';
import { ZoneDetailScreen } from './components/ZoneDetailScreen';
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

export default function App() {
  const savedState = readSavedState();
  const [activeTab, setActiveTab] = useState('Dashboard');
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
  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? zones[0] ?? sampleZone;

  useEffect(() => {
    const appState = { zones, approvals, tasks, selectedZoneId, assignmentMap };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [zones, approvals, tasks, selectedZoneId, assignmentMap]);

  const updateZone = (nextZone) => {
    setZones((currentZones) =>
      currentZones.map((zone) => (zone.id === nextZone.id ? nextZone : zone))
    );
  };

  const handleApprovalDecision = (approvalId, decision) => {
    setApprovals((currentApprovals) =>
      currentApprovals.filter((approval) => approval.id !== approvalId)
    );

    if (decision === 'approve') {
      setZones((currentZones) =>
        currentZones.map((zone) =>
          zone.id === selectedZoneId
            ? { ...zone, urgentTasks: Math.max(zone.urgentTasks - 1, 0) }
            : zone
        )
      );
    }
  };

  const openTaskModal = (type = 'feeding_drop') => {
    setTaskModalType(type);
    setShowTaskModal(true);
  };

  const handleTaskSave = ({ notes, initials }) => {
    setZones((currentZones) =>
      currentZones.map((zone) => {
        if (zone.id !== selectedZoneId) {
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Mischief Manager</h1>
      </header>

      <NavigationTabs activeTab={activeTab} onSelect={setActiveTab} />

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

        <div className="dashboard-panel">
          {activeTab === 'Dashboard' && <>
            <DashboardScreen
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
            <ZoneMapLegend />
            <ZoneMapView
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
            <EmployeeLocationPanel users={sampleUsers} />
          </>}
          {activeTab === 'People' && <PeoplePanel users={sampleUsers} />}
          {activeTab === 'Tasks' && (
            <TasksPanel
              tasks={tasks}
              selectedZoneName={selectedZone.name}
              onOpenTaskModal={openTaskModal}
            />
          )}
          {activeTab === 'Animals' && <AnimalDetailPanel animal={sampleAnimals[1]} />}
          {activeTab === 'Settings' && <div className="placeholder-panel">Settings panel</div>}
        </div>

        <div className="content-panel">
          <ZoneDetailScreen zone={selectedZone} onZoneChange={updateZone} onOpenTaskModal={openTaskModal} />
          <ApprovalReviewPanel task={sampleApprovalReview} />
        </div>
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
