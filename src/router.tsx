import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/HomePage';
import { SimpleModePanel } from '@/components/SimpleModePanel';
import { AdvancedModePanel } from '@/components/AdvancedModePanel';
import { BrewDashboard } from '@/components/BrewDashboard';
import { useBrewStore } from '@/stores/brewStore';
import { i18n } from '@/core/i18n/TranslationManager';

function LazyBrewLog() {
  const BrewLogPage = lazy(() => import('@/features/brewLog/BrewLogPage'));
  return (
    <Suspense fallback={<Fallback />}>
      <BrewLogPage />
    </Suspense>
  );
}
function LazyInventory() {
  const InventoryPage = lazy(() => import('@/features/inventory/InventoryPage'));
  return (
    <Suspense fallback={<Fallback />}>
      <InventoryPage />
    </Suspense>
  );
}
function LazyTimer() {
  const TimerPage = lazy(() => import('@/features/timer/TimerPage'));
  return (
    <Suspense fallback={<Fallback />}>
      <TimerPage />
    </Suspense>
  );
}
function LazyPresets() {
  const PresetsPage = lazy(() => import('@/features/presets/PresetsPage'));
  return (
    <Suspense fallback={<Fallback />}>
      <PresetsPage />
    </Suspense>
  );
}
function LazyTrophy() {
  const TrophyPage = lazy(() => import('@/features/trophy/TrophyPage'));
  return (
    <Suspense fallback={<Fallback />}>
      <TrophyPage />
    </Suspense>
  );
}
function LazyCurve() {
  const CurvePage = lazy(() => import('@/features/curve/CurvePage'));
  return (
    <Suspense fallback={<Fallback />}>
      <CurvePage />
    </Suspense>
  );
}
function LazyCommunity() {
  const CommunityPage = lazy(() => import('@/features/community/CommunityPage'));
  return (
    <Suspense fallback={<Fallback />}>
      <CommunityPage />
    </Suspense>
  );
}
function LazyAuth() {
  const AuthPage = lazy(() => import('@/features/auth/AuthPage'));
  return (
    <Suspense fallback={<Fallback />}>
      <AuthPage />
    </Suspense>
  );
}

function SimpleRoute() {
  const navigate = useNavigate();
  const { reset } = useBrewStore();
  return (
    <div className="space-y-6">
      <SimpleModePanel onStart={() => navigate('/brew', { replace: true })} />
      <div className="text-center">
        <button
          onClick={() => {
            reset();
            navigate('/');
          }}
          className="glass-button text-sm"
        >
          {i18n.t('backToMenu')}
        </button>
      </div>
    </div>
  );
}

function AdvancedRoute() {
  const navigate = useNavigate();
  const { reset } = useBrewStore();
  return (
    <div className="space-y-6">
      <AdvancedModePanel onStart={() => navigate('/brew', { replace: true })} />
      <div className="text-center">
        <button
          onClick={() => {
            reset();
            navigate('/');
          }}
          className="glass-button text-sm"
        >
          {i18n.t('backToMenu')}
        </button>
      </div>
    </div>
  );
}

function BrewRouteGuard() {
  const navigate = useNavigate();
  const mode = useBrewStore((s) => s.mode);
  const isBrewing =
    mode === 'brewing' || mode === 'paused' || mode === 'complete' || mode === 'exhausted';

  useEffect(() => {
    if (!isBrewing) {
      navigate('/', { replace: true });
    }
  }, [isBrewing, navigate]);

  if (!isBrewing) return null;
  return <BrewDashboard />;
}

function Fallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-400">{i18n.t('loading')}</div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/simple" element={<SimpleRoute />} />
        <Route path="/advanced" element={<AdvancedRoute />} />
        <Route
          path="/brew"
          element={
            <Suspense fallback={<Fallback />}>
              <BrewRouteGuard />
            </Suspense>
          }
        />
        <Route path="/brew-log" element={<LazyBrewLog />} />
        <Route path="/inventory" element={<LazyInventory />} />
        <Route path="/timer" element={<LazyTimer />} />
        <Route path="/presets" element={<LazyPresets />} />
        <Route path="/trophy" element={<LazyTrophy />} />
        <Route path="/curve" element={<LazyCurve />} />
        <Route path="/community" element={<LazyCommunity />} />
        <Route path="/auth" element={<LazyAuth />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
