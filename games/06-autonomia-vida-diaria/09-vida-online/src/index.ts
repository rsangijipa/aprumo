import type { ComponentType } from 'react';
import { App } from './App';

export const Game: ComponentType<any> = App as unknown as ComponentType<any>;
export { manifest } from './manifest';
