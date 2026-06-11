import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuthStore } from '@/stores/authStore';
import { i18n } from '@/core/i18n/TranslationManager';
import { Loader2, Mail, Lock, User, AlertCircle, Check } from 'lucide-react';

type Tab = 'signin' | 'signup';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);

  const auth = useAuthStore();

  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showMigrate, setShowMigrate] = useState(false);
  const [migrateSuccess, setMigrateSuccess] = useState(false);

  useEffect(() => {
    const unsub = i18n.subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated && !showMigrate && !migrateSuccess) {
      navigate('/', { replace: true });
    }
  }, [auth.isAuthenticated, showMigrate, migrateSuccess, navigate]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'signin', label: i18n.t('navSignIn') },
    { key: 'signup', label: i18n.t('navSignUp') },
  ];

  const handleTabChange = (next: Tab) => {
    setTab(next);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError(i18n.t('errorGeneric'));
      return;
    }
    try {
      if (tab === 'signup') {
        await auth.register(email, password, username.trim() || undefined);
      } else {
        await auth.login(email, password);
      }
      setShowMigrate(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : i18n.t('errorGeneric');
      setError(message);
    }
  };

  const handleMigrate = async () => {
    try {
      await auth.migrateGuestData();
      setMigrateSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : i18n.t('errorGeneric');
      setError(message);
    } finally {
      setShowMigrate(false);
    }
  };

  const skipMigrate = () => {
    setShowMigrate(false);
    navigate('/', { replace: true });
  };

  const continueAsGuest = () => {
    auth.setGuest(true);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-glow">{i18n.t('appName')}</h1>
          <p className="text-sm text-slate-400">{i18n.t('appSubtitle')}</p>
        </div>

        <GlassCard hover={false} className="p-0 overflow-hidden">
          <div className="flex border-b border-white/10">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTabChange(t.key)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? 'text-tea-green border-b-2 border-tea-green bg-white/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs text-slate-400 uppercase tracking-wider">
                {i18n.t('authEmail')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="glass-input w-full pl-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-slate-400 uppercase tracking-wider">
                {i18n.t('authPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="glass-input w-full pl-10"
                />
              </div>
            </div>

            {tab === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs text-slate-400 uppercase tracking-wider">
                  {i18n.t('authUsername')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={i18n.t('authUsername')}
                    className="glass-input w-full pl-10"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={auth.loading}
              className="w-full glass-button-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {auth.loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {i18n.t('loading')}
                </>
              ) : tab === 'signup' ? (
                i18n.t('authRegister')
              ) : (
                i18n.t('authLogin')
              )}
            </button>
          </form>

          <div className="px-6 pb-6 text-center">
            <button
              type="button"
              onClick={continueAsGuest}
              className="text-sm text-slate-400 hover:text-slate-200 underline underline-offset-4"
            >
              {i18n.t('authGuestMode')}
            </button>
          </div>
        </GlassCard>

        {showMigrate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <GlassCard hover={false} className="w-full max-w-sm space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-glow">
                  {i18n.t('authConfirmMigrateTitle')}
                </h3>
                <p className="text-sm text-slate-300">
                  {i18n.t('authConfirmMigrateDesc')}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={skipMigrate}
                  className="glass-button text-sm"
                >
                  {i18n.t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleMigrate}
                  disabled={auth.loading}
                  className="glass-button-primary text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {auth.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {i18n.t('authMigrateData')}
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {migrateSuccess && (
          <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="glass-strong rounded-full px-4 py-2 text-sm text-tea-green flex items-center gap-2">
              <Check className="w-4 h-4" />
              {i18n.t('authMigrationSuccess')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
