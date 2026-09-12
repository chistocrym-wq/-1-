import { Bell, Globe2, Smartphone, Volume2 } from 'lucide-react';
import { OttoScene } from '@/components/OttoScene';

export function SettingsPage() {
  return (
    <div className="otto-hub-screen animate-fade-in">
      <section className="otto-page-hero">
        <div><p className="otto-kicker">Настройки</p><h1>Тренажёр OTTO</h1><p className="mt-1 max-w-lg text-sm text-slate-600">Основные параметры приложения и подсказки по использованию.</p></div>
        <div className="otto-page-hero-character" aria-hidden="true"><OttoScene scene="guide" className="otto-page-hero-scene" /></div>
      </section>
      <section className="otto-settings-list">
        <div className="otto-setting-row"><span><Globe2 /></span><div><strong>Язык интерфейса</strong><small>Выбор языка доступен на главной странице</small></div></div>
        <div className="otto-setting-row"><span><Volume2 /></span><div><strong>Звук и микрофон</strong><small>Используются в Hören и Sprechen</small></div></div>
        <div className="otto-setting-row"><span><Bell /></span><div><strong>Уведомления</strong><small>Настраиваются средствами Telegram или браузера</small></div></div>
        <div className="otto-setting-row"><span><Smartphone /></span><div><strong>Установка приложения</strong><small>OTTO можно установить как приложение на экран телефона</small></div></div>
      </section>
    </div>
  );
}
