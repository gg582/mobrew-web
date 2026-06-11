import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { i18n } from '@/core/i18n/TranslationManager';
import { useAuthStore } from '@/stores/authStore';
import type { TranslationKey } from '@/core/i18n/ITranslationStrategy';
import type { LucideIcon } from 'lucide-react';
import {
  Leaf,
  Globe,
  Menu,
  X,
  Home,
  ScrollText,
  Package,
  Clock,
  Bookmark,
  Trophy,
  PenTool,
  Users,
  UserCircle,
} from 'lucide-react';

const navItems: Array<{ to: string; labelKey: TranslationKey | string; icon: LucideIcon }> = [
  { to: '/', labelKey: 'navHome', icon: Home },
  { to: '/brew-log', labelKey: 'navBrewLog', icon: ScrollText },
  { to: '/inventory', labelKey: 'navInventory', icon: Package },
  { to: '/timer', labelKey: 'navTimer', icon: Clock },
  { to: '/presets', labelKey: 'navPresets', icon: Bookmark },
  { to: '/trophy', labelKey: 'navTrophies', icon: Trophy },
  { to: '/curve', labelKey: 'navCurve', icon: PenTool },
  { to: '/community', labelKey: 'navCommunity', icon: Users },
];

const bottomItems: Array<{ to: string; labelKey: TranslationKey | string; icon: LucideIcon }> = [
  { to: '/', labelKey: 'navHome', icon: Home },
  { to: '/brew-log', labelKey: 'navBrewLog', icon: ScrollText },
  { to: '/timer', labelKey: 'navTimer', icon: Clock },
  { to: '/presets', labelKey: 'navPresets', icon: Bookmark },
  { to: '/community', labelKey: 'navCommunity', icon: Users },
];

export default function AppLayout() {
  const [, setLocale] = useState(i18n.getLocale());
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const unsub = i18n.subscribe(() => setLocale(i18n.getLocale()));
    return unsub;
  }, []);

  const linkBase =
    'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors';
  const linkInactive = 'text-slate-400 hover:text-slate-200 hover:bg-white/5';
  const linkActive = 'text-tea-green bg-tea-green/10';

  return (
    <div className="min-h-screen bg-noise relative pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Leaf className="w-6 h-6 text-tea-green" />
            <span className="text-xl font-bold tracking-tight text-glow group-hover:text-tea-green transition-colors">
              {i18n.t('appName')}
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                <item.icon className="w-4 h-4" />
                {i18n.t(item.labelKey)}
              </NavLink>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-2">
            <div className="flex items-center gap-1">
              {i18n.getAvailableLocales().map((loc) => (
                <button
                  key={loc.locale}
                  onClick={() => i18n.setLocale(loc.locale)}
                  className={`px-2 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1 ${
                    i18n.getLocale() === loc.locale
                      ? 'bg-tea-green/20 border-tea-green/40 text-tea-green'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  {loc.displayName}
                </button>
              ))}
            </div>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                {i18n.t('navSignOut')}
              </button>
            ) : (
              <NavLink
                to="/auth"
                className={({ isActive }) =>
                  `flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    isActive
                      ? 'bg-tea-green/20 border-tea-green/40 text-tea-green'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                  }`
                }
              >
                <UserCircle className="w-4 h-4" />
                {i18n.t('navSignIn')}
              </NavLink>
            )}
          </div>

          <button
            className="xl:hidden p-2 rounded-lg hover:bg-white/5 text-slate-300"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="xl:hidden border-t border-white/10 px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? linkActive : linkInactive
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {i18n.t(item.labelKey)}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
              {i18n.getAvailableLocales().map((loc) => (
                <button
                  key={loc.locale}
                  onClick={() => i18n.setLocale(loc.locale)}
                  className={`px-2 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1 ${
                    i18n.getLocale() === loc.locale
                      ? 'bg-tea-green/20 border-tea-green/40 text-tea-green'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  {loc.displayName}
                </button>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="ml-auto text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  {i18n.t('navSignOut')}
                </button>
              ) : (
                <NavLink
                  to="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border bg-white/5 border-white/10 text-slate-300 hover:text-white"
                >
                  <UserCircle className="w-4 h-4" />
                  {i18n.t('navSignUp')}
                </NavLink>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="hidden sm:block relative z-10 text-center mt-16 mb-6 text-xs text-slate-600">
        <p>MoBrew · More than a brewer</p>
      </footer>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center py-1.5 px-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-2 min-h-[48px] min-w-[48px] rounded-xl transition-all ${
                  isActive
                    ? 'text-tea-green bg-tea-green/15 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-110' : ''
                    }`}
                  />
                  <span className="text-[10px] leading-tight max-w-[3.5rem] truncate">
                    {i18n.t(item.labelKey)}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
