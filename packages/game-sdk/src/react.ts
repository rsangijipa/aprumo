import { useEffect, useMemo, useState } from 'react';
import type { SessionConfig } from '@aprumo/protocol';
import { createGameClient, type GameClient } from './client';

type Command = Parameters<Parameters<GameClient['onCommand']>[0]>[0];

/** Hook para jogos React: recebe a configuração e expõe o cliente do protocolo. */
export function useGameClient(appId: string, appVersion: string) {
  const client = useMemo(() => createGameClient({ appId, appVersion }), [appId, appVersion]);
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [lastCommand, setLastCommand] = useState<Command | null>(null);

  useEffect(() => {
    client.connect();
    const offC = client.onConfig(setConfig);
    const offK = client.onCommand((c) => {
      setLastCommand(c);
      if (c.kind === 'PAUSE') setPaused(true);
      if (c.kind === 'RESUME') setPaused(false);
      if (c.kind === 'END') setEnded(true);
    });
    return () => {
      offC();
      offK();
      client.disconnect();
    };
  }, [client]);

  return { client, config, paused, ended, lastCommand };
}

/** Respeita o perfil sensorial e a preferência do sistema. */
export function useMotion(config: SessionConfig | null): 'full' | 'reduced' | 'static' {
  const [sys, setSys] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const h = () => setSys(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  const m = config?.adaptation.motion ?? 'reduced';
  return sys && m === 'full' ? 'reduced' : m;
}
