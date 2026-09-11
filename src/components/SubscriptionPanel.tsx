import { Crown, LockKeyhole, Sparkles, Star } from 'lucide-react';
import type { AccessStatus } from '@/hooks/useAccess';

interface SubscriptionPanelProps {
  access: AccessStatus;
  onSubscribe: () => void;
  purchaseLoading: boolean;
  purchaseError: string;
}

export function SubscriptionPanel({ access, onSubscribe, purchaseLoading, purchaseError }: SubscriptionPanelProps) {
  if (access.loading) return null;

  if (access.premium) {
    return (
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm"><Crown className="h-5 w-5" /></div>
          <div>
            <p className="font-bold text-emerald-950">Otto Premium активен</p>
            <p className="mt-1 text-sm leading-5 text-emerald-800">Полный доступ к заданиям, гайдам, пробному экзамену и AI-проверкам.</p>
          </div>
        </div>
        {access.premiumUntil && <span className="text-xs font-semibold text-emerald-700">до {new Date(access.premiumUntil).toLocaleDateString('ru-RU')}</span>}
      </div>
    );
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
      <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-700" />
            <h2 className="font-bold text-slate-950">Otto Premium</h2>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm leading-6 text-slate-600">
            <span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-4 w-4 text-slate-400" />Бесплатно — {access.freeContentPercent}% тренировок</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-slate-400" />AI: {access.freeAiDailyLimit} проверки в день</span>
            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-slate-400" />Premium — весь контент</span>
          </div>
        </div>

        {access.paymentsConfigured && access.authenticated ? (
          <button
            type="button"
            onClick={onSubscribe}
            disabled={purchaseLoading}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            <Star className="h-4 w-4 fill-current" />
            {purchaseLoading ? 'Открываю оплату…' : `${access.priceStars ?? ''} ⭐ · 30 дней`}
          </button>
        ) : (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-center text-xs font-semibold leading-5 text-slate-500">
            {access.authenticated ? 'Оплата будет доступна после настройки Stars' : 'Для оплаты откройте Otto в Telegram'}
          </div>
        )}
      </div>
      {purchaseError && <div className="border-t border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:px-5">{purchaseError}</div>}
    </div>
  );
}
