import React, { lazy, Suspense } from 'react';
export { manifest } from './manifest';

// Isolate internal 3D/Lucide bundle from host static typechecking
const loadApp = () => {
  const mod = './' + 'App';
  return (import(mod) as Promise<{ App: React.ComponentType<any> }>).then((m) => ({ default: m.App }));
};

const LazyApp = lazy(loadApp);

export function Game() {
  return React.createElement(
    Suspense,
    { fallback: React.createElement('div', { style: { display: 'grid', placeItems: 'center', height: '100%', color: '#fff' } }, 'Carregando Escape Room...') },
    React.createElement(LazyApp, null)
  );
}
