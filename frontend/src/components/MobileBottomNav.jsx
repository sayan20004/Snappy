import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiTarget, FiInbox, FiCalendar, FiCopy } from 'react-icons/fi';
import { useIsMobile } from '../hooks/useMobile';

export default function MobileBottomNav() {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/inbox', icon: FiInbox, label: 'Inbox' },
    { path: '/focus', icon: FiTarget, label: 'Focus' },
    { path: '/timeline', icon: FiCalendar, label: 'Timeline' },
    { path: '/templates', icon: FiCopy, label: 'More' }
  ];

  return (
    <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe z-50">
      <div className="flex justify-around items-center px-2 py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors mobile-tap-target ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
