import type { FC } from 'react';
import { MessageSquare, Info, HelpCircle, Settings } from 'lucide-react';

export type ActiveTab = 'chat' | 'about' | 'faq' | 'settings';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const NavigationTabs: FC<NavigationTabsProps> = ({ activeTab, onChangeTab }) => {
  const tabs: { id: ActiveTab; label: string; icon: typeof MessageSquare }[] = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'about', label: 'About', icon: Info },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="nav-tabs-bar">
      <div className="nav-tabs-list">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`nav-tab-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={14} className="nav-tab-icon" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};