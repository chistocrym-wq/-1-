import { Bell, Globe2, Smartphone, Volume2 } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="animate-fade-in pb-28">
      <section className="otto-page-hero">
        <div><p className="otto-kicker">Настройки</p><h1>Тренажёр OTTO</h1><p className="mt-2 max-w-lg text-sm text-slate-600">Основные параметры приложения и подсказки по использованию.</p></div>
        <div className="otto-page-hero-character" aria-hidden="true"><img src="/otto.png" alt="" /></div>
      </section>
      <section className="space-y-3">
        <div className="otto-setting-row"><span><Globe2 /></span><div><strong>Язык интерфейса</strong><small>Выбор языка доступен на главной странице</small></div></div>
        <div className="otto-setting-row"><span><Volume2 /></span><div><strong>Звук и микрофон</strong><small>Используются в Hören и Sprechen</small></div></div>
        <div className="otto-setting-row"><span><Bell /></span><div><strong>Уведомления</strong><small>Настраиваются средствами Telegram или браузера</small></div></div>
        <div className="otto-setting-row"><span><Smartphone /></span><div><strong>Установка приложения</strong><small>OTTO можно установить как приложение на экран телефона</small></div></div>
      </section>
    </div>
  );
}
