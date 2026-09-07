export function NavigationTabs({ activeTab, onSelect }) {
  const tabs = ['Dashboard', 'People', 'Animals', 'Tasks', 'Settings'];

  return (
    <nav className="nav-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={activeTab === tab ? 'nav-tab active' : 'nav-tab'}
          onClick={() => onSelect(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}
