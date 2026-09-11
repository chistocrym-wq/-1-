import { BookOpen, Compass, Home, Settings, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BottomTab = 'home' | 'modules' | 'guides' | 'account' | 'settings';

interface Props {
  active: BottomTab;
  onNavigate: (tab: BottomTab) => void;
}

const items = [
  { id: 'home' as const, label: 'Главная', icon: Home },
  { id: 'modules' as const, label: 'Модули', icon: BookOpen },
  { id: 'guides' as const, label: 'Гайды', icon: Compass },
  { id: 'account' as const, label: 'Личный кабинет', icon: UserRound },
  { id: 'settings' as const, label: 'Настройки', icon: Settings },
];

export function BottomNav({ active, onNavigate }: Props) {
  return (
    <nav className="otto-bottom-nav" aria-label="Основная навигация">
      <div className="otto-bottom-nav-inner">
        {items.map(({ id, label, icon: Icon }) => {
          const selected = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={cn('otto-bottom-nav-item', selected && 'is-active')}
              aria-current={selected ? 'page' : undefined}
            >
              <Icon className="otto-bottom-nav-icon" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
