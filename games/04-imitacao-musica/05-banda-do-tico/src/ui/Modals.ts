// src/ui/Modals.ts
// Interactive UI Modals: Audio Settings, Interactive Latency Calibration,
// Rhythm Library Browser (30+ rhythms), Step Sequencer Overlay, and Celebration.

import { audioMixer } from '../audio/mixer';
import { latencyManager } from '../audio/latency';
import { rhythmJudge } from '../rhythm/scoring/judgment';
import { PATTERNS_LIBRARY, RhythmPattern } from '../rhythm/patterns/library';
import { beatSequencer } from '../composer/Sequencer';
import { storageManager } from '../save/storage';
import { soundSynth } from '../audio/synth';

export class ModalManager {
  private overlayContainer: HTMLElement;

  constructor() {
    this.overlayContainer = document.getElementById('modals-root') || document.body;
    this.listenToGlobalEvents();
  }

  private listenToGlobalEvents(): void {
    window.addEventListener('open-audio-settings', () => this.openAudioSettings());
    window.addEventListener('open-calibration', () => this.openCalibration());
    window.addEventListener('open-rhythm-library', () => this.openRhythmLibrary());
    window.addEventListener('open-sequencer', () => this.openSequencer());
  }

  // ==========================================
  // 1. AUDIO & ACCESSIBILITY SETTINGS MODAL
  // ==========================================
  public openAudioSettings(): void {
    const settings = storageManager.getSettings();

    const html = `
      <div class="modal-card">
        <div class="modal-header">
          <h2>⚙️ Configurações & Acessibilidade</h2>
          <button class="btn-close" id="btn-close-settings">✖</button>
        </div>
        <div class="modal-body">
          <div class="setting-group">
            <label>🔊 Volume Geral: <span id="val-master">${Math.round(settings.masterVolume * 100)}%</span></label>
            <input type="range" id="slider-master" min="0" max="1" step="0.05" value="${settings.masterVolume}">
          </div>

          <div class="setting-group">
            <label>🥁 Volume dos Instrumentos: <span id="val-instruments">${Math.round(settings.instrumentsVolume * 100)}%</span></label>
            <input type="range" id="slider-instruments" min="0" max="1" step="0.05" value="${settings.instrumentsVolume}">
          </div>

          <div class="setting-group">
            <label>🎵 Volume da Música de Fundo: <span id="val-music">${Math.round(settings.musicVolume * 100)}%</span></label>
            <input type="range" id="slider-music" min="0" max="1" step="0.05" value="${settings.musicVolume}">
          </div>

          <div class="setting-group">
            <label>⏱️ Compensação de Latência: <span id="val-latency">${latencyManager.offsetMs} ms</span></label>
            <input type="range" id="slider-latency" min="-150" max="150" step="5" value="${latencyManager.offsetMs}">
            <div style="margin-top: 6px;">
              <button class="btn-action-small" id="btn-start-calib">🎯 Calibrar Toque Automaticamente</button>
            </div>
          </div>

          <div class="setting-checkbox">
            <label>
              <input type="checkbox" id="chk-accessible" ${settings.accessibleTiming ? 'checked' : ''}>
              <span>🌟 <strong>Janela de Timing Acessível / Infantil</strong> (Mais tolerante, ±160ms)</span>
            </label>
          </div>

          <div class="setting-checkbox">
            <label>
              <input type="checkbox" id="chk-judgment-free" ${settings.judgmentFree ? 'checked' : ''}>
              <span>🎉 <strong>Modo Sem Julgamento</strong> (Dopamina pura, todo toque é perfeito!)</span>
            </label>
          </div>

          <div class="setting-checkbox">
            <label>
              <input type="checkbox" id="chk-reduced-motion" ${settings.reducedMotion ? 'checked' : ''}>
              <span>🦽 <strong>Movimento Reduzido</strong> (Suaviza tremores e confetes)</span>
            </label>
          </div>

          <div class="setting-checkbox">
            <label>
              <input type="checkbox" id="chk-high-contrast" ${settings.highContrast ? 'checked' : ''}>
              <span>👁️ <strong>Alto Contraste Visual</strong></span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-confirm" id="btn-save-settings">Salvar & Fechar</button>
        </div>
      </div>
    `;

    this.showModal(html, (modalEl) => {
      // Sliders listeners
      const sliderM = modalEl.querySelector('#slider-master') as HTMLInputElement;
      sliderM?.addEventListener('input', () => {
        const v = parseFloat(sliderM.value);
        audioMixer.setMasterVolume(v);
        modalEl.querySelector('#val-master')!.textContent = `${Math.round(v * 100)}%`;
      });

      const sliderI = modalEl.querySelector('#slider-instruments') as HTMLInputElement;
      sliderI?.addEventListener('input', () => {
        const v = parseFloat(sliderI.value);
        audioMixer.setInstrumentsVolume(v);
        modalEl.querySelector('#val-instruments')!.textContent = `${Math.round(v * 100)}%`;
      });

      const sliderMu = modalEl.querySelector('#slider-music') as HTMLInputElement;
      sliderMu?.addEventListener('input', () => {
        const v = parseFloat(sliderMu.value);
        audioMixer.setMusicVolume(v);
        modalEl.querySelector('#val-music')!.textContent = `${Math.round(v * 100)}%`;
      });

      const sliderL = modalEl.querySelector('#slider-latency') as HTMLInputElement;
      sliderL?.addEventListener('input', () => {
        const v = parseInt(sliderL.value, 10);
        latencyManager.offsetMs = v;
        modalEl.querySelector('#val-latency')!.textContent = `${v} ms`;
      });

      // Checkboxes
      const chkAcc = modalEl.querySelector('#chk-accessible') as HTMLInputElement;
      const chkJudg = modalEl.querySelector('#chk-judgment-free') as HTMLInputElement;
      const chkRed = modalEl.querySelector('#chk-reduced-motion') as HTMLInputElement;
      const chkCont = modalEl.querySelector('#chk-high-contrast') as HTMLInputElement;

      // Launch Calibration from settings
      modalEl.querySelector('#btn-start-calib')?.addEventListener('click', () => {
        this.closeModal();
        this.openCalibration();
      });

      // Save & Close
      const saveSettings = () => {
        storageManager.saveSettings({
          masterVolume: parseFloat(sliderM.value),
          instrumentsVolume: parseFloat(sliderI.value),
          musicVolume: parseFloat(sliderMu.value),
          latencyOffsetMs: parseInt(sliderL.value, 10),
          accessibleTiming: chkAcc.checked,
          judgmentFree: chkJudg.checked,
          reducedMotion: chkRed.checked,
          highContrast: chkCont.checked,
        });

        rhythmJudge.setAccessibleMode(chkAcc.checked);
        rhythmJudge.setJudgmentFreeMode(chkJudg.checked);

        if (chkCont.checked) {
          document.body.classList.add('high-contrast');
        } else {
          document.body.classList.remove('high-contrast');
        }

        this.closeModal();
      };

      modalEl.querySelector('#btn-save-settings')?.addEventListener('click', saveSettings);
      modalEl.querySelector('#btn-close-settings')?.addEventListener('click', () => this.closeModal());
    });
  }

  // ==========================================
  // 2. INTERACTIVE CALIBRATION MODAL (8 BEATS)
  // ==========================================
  public openCalibration(): void {
    const html = `
      <div class="modal-card">
        <div class="modal-header">
          <h2>🎯 Calibração de Toque e Latência</h2>
          <button class="btn-close" id="btn-close-calib">✖</button>
        </div>
        <div class="modal-body text-center">
          <p>Ouça os 8 toques do bloco sonoro e <strong>toque no botão dourado exatamente junto com o som!</strong></p>
          
          <div class="calibration-display">
            <div class="calib-counter" id="calib-count">Toques: 0 / 8</div>
            <div class="calib-pulse" id="calib-visual-beat">🥁</div>
          </div>

          <div style="margin: 20px 0;">
            <button class="btn-calib-pad" id="btn-calib-tap">TOCAR AQUI NO RITMO!</button>
          </div>

          <div id="calib-results" style="display: none; padding: 12px; background: #FFF8E8; border-radius: 8px; color: #283B5B;">
            <h4 style="margin: 0 0 6px 0;">Resultado da Calibração:</h4>
            <div id="calib-result-text">Offset medido: 0 ms</div>
            <button class="btn-confirm" id="btn-apply-calib" style="margin-top: 10px;">Aplicar Correção</button>
          </div>
        </div>
      </div>
    `;

    this.showModal(html, (modalEl) => {
      const countEl = modalEl.querySelector('#calib-count')!;
      const beatVisualEl = modalEl.querySelector('#calib-visual-beat')!;
      const resultsEl = modalEl.querySelector('#calib-results') as HTMLElement;
      const resultTextEl = modalEl.querySelector('#calib-result-text')!;
      const tapBtn = modalEl.querySelector('#btn-calib-tap') as HTMLElement;

      let measuredOffset = 0;

      latencyManager.startCalibration((step, total) => {
        countEl.textContent = `Toques: ${step} / ${total}`;
        beatVisualEl.classList.add('pulse');
        setTimeout(() => beatVisualEl.classList.remove('pulse'), 150);
      });

      tapBtn?.addEventListener('pointerdown', () => {
        const audioTime = audioMixer.getContext().currentTime;
        const res = latencyManager.recordCalibrationTap(audioTime);

        tapBtn.classList.add('active-tap');
        setTimeout(() => tapBtn.classList.remove('active-tap'), 100);

        if (res) {
          measuredOffset = res.averageOffsetMs;
          resultsEl.style.display = 'block';
          resultTextEl.innerHTML = `
            <strong>Offset médio calculado:</strong> ${measuredOffset > 0 ? '+' : ''}${measuredOffset} ms<br>
            <strong>Consistência do ritmo:</strong> ${res.consistencyScore}%
          `;
          tapBtn.style.display = 'none';
        }
      });

      modalEl.querySelector('#btn-apply-calib')?.addEventListener('click', () => {
        latencyManager.offsetMs = measuredOffset;
        soundSynth.playUIStar();
        this.closeModal();
      });

      modalEl.querySelector('#btn-close-calib')?.addEventListener('click', () => {
        latencyManager.cancelCalibration();
        this.closeModal();
      });
    });
  }

  // ==========================================
  // 3. RHYTHM LIBRARY BROWSER (30+ RHYTHMS)
  // ==========================================
  public openRhythmLibrary(): void {
    const cardsHtml = PATTERNS_LIBRARY.map((pat, idx) => `
      <div class="rhythm-item-card">
        <div class="rhythm-item-header">
          <strong>${pat.name}</strong>
          <span class="rhythm-badge">${pat.style}</span>
        </div>
        <div class="rhythm-item-desc">${pat.description}</div>
        <div class="rhythm-item-meta">
          <span>⚡ ${pat.defaultBpm} BPM</span>
          <span>⭐ Nível ${pat.difficulty}/5</span>
          <span>🥁 ${pat.primaryInstrument.toUpperCase()}</span>
        </div>
        <button class="btn-play-rhythm" data-idx="${idx}">▶ Ouvir Demonstração</button>
      </div>
    `).join('');

    const html = `
      <div class="modal-card modal-large">
        <div class="modal-header">
          <h2>📚 Biblioteca de Ritmos (32 Estilos)</h2>
          <button class="btn-close" id="btn-close-library">✖</button>
        </div>
        <div class="modal-body rhythm-grid">
          ${cardsHtml}
        </div>
      </div>
    `;

    this.showModal(html, (modalEl) => {
      modalEl.querySelectorAll('.btn-play-rhythm').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt((e.currentTarget as HTMLElement).dataset.idx || '0', 10);
          const pat = PATTERNS_LIBRARY[idx];
          this.previewPattern(pat);
        });
      });

      modalEl.querySelector('#btn-close-library')?.addEventListener('click', () => this.closeModal());
    });
  }

  private previewPattern(pat: RhythmPattern): void {
    soundSynth.playUIPop();
    const ctx = audioMixer.getContext();
    const now = ctx.currentTime + 0.1;
    const secPerBeat = 60 / pat.defaultBpm;

    pat.steps.forEach((step) => {
      const stepTime = now + step.beat * secPerBeat;
      soundSynth.playInstrument(step.instrumentId, {
        time: stepTime,
        velocity: step.velocity ?? 0.85,
        noteIndex: step.noteIndex,
      });
    });
  }

  // ==========================================
  // 4. STEP SEQUENCER MODAL (CRIE SEU BEAT)
  // ==========================================
  public openSequencer(): void {
    const buildTrackRows = () => {
      return beatSequencer.tracks.map((track, trackIdx) => {
        const stepButtons = track.steps.map((active, stepIdx) => `
          <button class="seq-step ${active ? 'active' : ''} ${stepIdx % 4 === 0 ? 'downbeat' : ''}"
                  data-track="${trackIdx}" data-step="${stepIdx}"
                  style="${active ? `background-color: ${track.color}; border-color: #FFF;` : ''}">
          </button>
        `).join('');

        return `
          <div class="seq-row">
            <div class="seq-track-label">
              <span class="seq-track-name" style="color: ${track.color}; font-weight: bold;">${track.name}</span>
              <div class="seq-track-actions">
                <button class="btn-seq-mute ${track.muted ? 'on' : ''}" data-track="${trackIdx}">M</button>
                <button class="btn-seq-solo ${track.solo ? 'on' : ''}" data-track="${trackIdx}">S</button>
              </div>
            </div>
            <div class="seq-steps-grid">
              ${stepButtons}
            </div>
          </div>
        `;
      }).join('');
    };

    const html = `
      <div class="modal-card modal-large">
        <div class="modal-header">
          <h2>🎛️ Crie Seu Beat — Sequenciador Visual</h2>
          <button class="btn-close" id="btn-close-seq">✖</button>
        </div>
        <div class="modal-toolbar">
          <button class="btn-seq-action" id="btn-seq-play">▶ Tocar</button>
          <button class="btn-seq-action" id="btn-seq-clear">🗑️ Limpar</button>
          <div class="seq-preset-selector">
            <span>Predefinições:</span>
            <button class="btn-preset" data-preset="Samba Pop">Samba</button>
            <button class="btn-preset" data-preset="Baião Astral">Baião</button>
            <button class="btn-preset" data-preset="Funk Alegria">Funk</button>
            <button class="btn-preset" data-preset="Banda Rock">Rock</button>
          </div>
          <button class="btn-seq-save" id="btn-seq-save">💾 Salvar Beat</button>
        </div>

        <div class="modal-body seq-container" id="seq-grid-root">
          ${buildTrackRows()}
        </div>
      </div>
    `;

    this.showModal(html, (modalEl) => {
      const gridRoot = modalEl.querySelector('#seq-grid-root')!;
      const playBtn = modalEl.querySelector('#btn-seq-play') as HTMLElement;

      const refreshGrid = () => {
        gridRoot.innerHTML = buildTrackRows();
        bindGridEvents();
      };

      const bindGridEvents = () => {
        // Toggle Steps
        gridRoot.querySelectorAll('.seq-step').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const el = e.currentTarget as HTMLElement;
            const t = parseInt(el.dataset.track!, 10);
            const s = parseInt(el.dataset.step!, 10);
            const state = beatSequencer.toggleStep(t, s);
            el.classList.toggle('active', state);
            el.style.backgroundColor = state ? beatSequencer.tracks[t].color : '';
            el.style.borderColor = state ? '#FFF' : '';
          });
        });

        // Mute & Solo
        gridRoot.querySelectorAll('.btn-seq-mute').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const t = parseInt((e.currentTarget as HTMLElement).dataset.track!, 10);
            beatSequencer.toggleMute(t);
            (e.currentTarget as HTMLElement).classList.toggle('on', beatSequencer.tracks[t].muted);
          });
        });

        gridRoot.querySelectorAll('.btn-seq-solo').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const t = parseInt((e.currentTarget as HTMLElement).dataset.track!, 10);
            beatSequencer.toggleSolo(t);
            refreshGrid();
          });
        });
      };

      bindGridEvents();

      // Play / Pause
      playBtn?.addEventListener('click', () => {
        beatSequencer.toggle();
        playBtn.textContent = beatSequencer.isRunning ? '⏸ Pausar' : '▶ Tocar';
      });

      // Clear
      modalEl.querySelector('#btn-seq-clear')?.addEventListener('click', () => {
        beatSequencer.clearAll();
        refreshGrid();
      });

      // Presets
      modalEl.querySelectorAll('.btn-preset').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const presetName = (e.currentTarget as HTMLElement).dataset.preset as
            | 'Samba Pop'
            | 'Baião Astral'
            | 'Funk Alegria'
            | 'Banda Rock';
          beatSequencer.loadPreset(presetName);
          refreshGrid();
        });
      });

      // Save
      modalEl.querySelector('#btn-seq-save')?.addEventListener('click', () => {
        const beat = beatSequencer.saveToStorage('Meu Beat Maravilhoso');
        soundSynth.playUIStar();
        alert(`🎉 Beat "${beat.name}" salvo com sucesso!`);
      });

      modalEl.querySelector('#btn-close-seq')?.addEventListener('click', () => {
        this.closeModal();
      });
    });
  }

  // ==========================================
  // MODAL CORE HELPERS
  // ==========================================
  private showModal(contentHtml: string, setupFn: (el: HTMLElement) => void): void {
    this.closeModal();

    const backdrop = document.createElement('div');
    backdrop.id = 'active-modal-backdrop';
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = contentHtml;

    this.overlayContainer.appendChild(backdrop);
    setupFn(backdrop);
  }

  public closeModal(): void {
    const existing = document.getElementById('active-modal-backdrop');
    if (existing) {
      existing.remove();
    }
  }
}

export const modalManager = new ModalManager();
