import { AudioType, OfficeAudioType } from '../types';

interface PlayingTrack {
  id: string;
  gainNode: GainNode;
  sourceNode: AudioNode;
  volume: number;
}

class MultiTrackSynthesizer {
  private ctx: AudioContext | null = null;
  private activeSoundscapes: Map<string, PlayingTrack> = new Map();
  private activeOfficeAudio: Map<string, PlayingTrack> = new Map();
  private masterVolume: number = 0.6;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initCtx();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().then(() => {
            this.isUnlocked = true;
          }).catch(() => {});
        }
      };

      ['click', 'touchstart', 'keydown', 'pointerdown'].forEach((evt) => {
        window.addEventListener(evt, unlockAudio, { passive: true });
      });
    }
  }

  public initCtx() {
    try {
      if (!this.ctx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext unavailable
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  // --- LEGACY COMPATIBILITY METHODS ---
  public getIsPlaying(type: AudioType = 'brown'): boolean {
    return this.isSoundscapeActive(type);
  }

  public toggle(type: AudioType, volume: number = 0.5): boolean {
    return this.toggleSoundscape(type, volume);
  }

  public play(type: AudioType, volume: number = 0.5) {
    this.playSoundscape(type, volume);
  }

  public setVolume(volume: number, type: AudioType = 'brown') {
    this.setSoundscapeVolume(type, volume);
  }

  public triggerOfficePing(type: OfficeAudioType) {
    this.playOfficeAudio(type);
  }

  // --- TYPING / KEYBOARD CLICK SYNTHESIS ---
  public playKeyClickSound() {
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Randomized mechanical switch resonance
      const baseFreq = 2200 + (Math.random() - 0.5) * 900;
      const isSpace = Math.random() < 0.12; // Occasional deeper key thock

      const bufferSize = Math.floor(this.ctx.sampleRate * 0.02); // ~20ms short crisp snap
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const decay = Math.exp(-i / (bufferSize * 0.2));
        data[i] = (Math.random() * 2 - 1) * decay;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = isSpace ? 'lowpass' : 'bandpass';
      filter.frequency.value = isSpace ? 1100 : baseFreq;
      filter.Q.value = 2.8;

      const gainNode = this.ctx.createGain();
      const vol = (isSpace ? 0.06 : 0.035) * this.masterVolume;
      gainNode.gain.setValueAtTime(vol, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.035 : 0.02));

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      noiseSource.start(now);
    } catch {
      // Ignore audio context interruptions
    }
  }

  // --- SOUNDSCAPE MULTI-TRACK CONTROLS ---

  public isSoundscapeActive(type: AudioType): boolean {
    return this.activeSoundscapes.has(type);
  }

  public getSoundscapeVolume(type: AudioType): number {
    return this.activeSoundscapes.get(type)?.volume ?? 0.5;
  }

  public setSoundscapeVolume(type: AudioType, volume: number) {
    const track = this.activeSoundscapes.get(type);
    if (track && this.ctx) {
      track.volume = Math.max(0, Math.min(1, volume));
      track.gainNode.gain.setValueAtTime(track.volume * this.masterVolume, this.ctx.currentTime);
    }
  }

  public toggleSoundscape(type: AudioType, initialVol: number = 0.5): boolean {
    if (this.activeSoundscapes.has(type)) {
      this.stopSoundscape(type);
      return false;
    } else {
      this.playSoundscape(type, initialVol);
      return true;
    }
  }

  public playSoundscape(type: AudioType, volume: number = 0.5) {
    this.initCtx();
    if (!this.ctx) return;

    if (this.activeSoundscapes.has(type)) {
      this.stopSoundscape(type);
    }

    const gainNode = this.ctx.createGain();
    const finalVol = volume * this.masterVolume;
    gainNode.gain.setValueAtTime(finalVol, this.ctx.currentTime);
    gainNode.connect(this.ctx.destination);

    let sourceNode: AudioNode | null = null;

    switch (type) {
      case 'brown':
        sourceNode = this.createBrownNoise(this.ctx, gainNode);
        break;
      case 'pink':
        sourceNode = this.createPinkNoise(this.ctx, gainNode);
        break;
      case 'white':
        sourceNode = this.createWhiteNoise(this.ctx, gainNode);
        break;
      case 'rain':
        sourceNode = this.createRainNode(this.ctx, gainNode);
        break;
      case 'binaural':
        sourceNode = this.createBinauralNode(this.ctx, gainNode);
        break;
      case 'drone':
        sourceNode = this.createDroneNode(this.ctx, gainNode);
        break;
      case 'office':
        sourceNode = this.createOfficeNoise(this.ctx, gainNode);
        break;
      case 'cafe':
        sourceNode = this.createCafeNoise(this.ctx, gainNode);
        break;
      case 'keyboard':
        sourceNode = this.createKeyboardClicks(this.ctx, gainNode);
        break;
      case 'coffee':
        sourceNode = this.createCoffeeBrewNode(this.ctx, gainNode);
        break;
      case 'medieval':
        sourceNode = this.createMedievalStudyNode(this.ctx, gainNode);
        break;
      case 'lofi':
        sourceNode = this.createLofiBeatNode(this.ctx, gainNode);
        break;
      case 'cute_hyper':
        sourceNode = this.createCuteHyperNode(this.ctx, gainNode);
        break;
      case 'cute_chill':
        sourceNode = this.createCuteChillNode(this.ctx, gainNode);
        break;
      case 'asmr_tapping':
        sourceNode = this.createAsmrTappingNode(this.ctx, gainNode);
        break;
      case 'asmr_rustle':
        sourceNode = this.createAsmrRustleNode(this.ctx, gainNode);
        break;
      case 'asmr_scratch':
        sourceNode = this.createAsmrScratchNode(this.ctx, gainNode);
        break;
      case 'park':
        sourceNode = this.createParkSoundsNode(this.ctx, gainNode);
        break;
      case 'island_breeze':
        sourceNode = this.createIslandBreezeNode(this.ctx, gainNode);
        break;
      default:
        sourceNode = this.createBrownNoise(this.ctx, gainNode);
    }

    if (sourceNode) {
      this.activeSoundscapes.set(type, { id: type, gainNode, sourceNode, volume });
    }
  }

  public stopSoundscape(type: AudioType) {
    const track = this.activeSoundscapes.get(type);
    if (track) {
      try {
        if ('stop' in track.sourceNode && typeof (track.sourceNode as AudioBufferSourceNode).stop === 'function') {
          (track.sourceNode as AudioBufferSourceNode).stop();
        }
        track.sourceNode.disconnect();
        track.gainNode.disconnect();
      } catch {
        // ignore
      }
      this.activeSoundscapes.delete(type);
    }
  }

  public stopAllSoundscapes() {
    Array.from(this.activeSoundscapes.keys()).forEach((key) => this.stopSoundscape(key as AudioType));
  }

  // --- VIRTUAL OFFICE SOUND EFFECTS & AMBIENT LAYERS ---

  public isOfficeAudioActive(type: OfficeAudioType): boolean {
    return this.activeOfficeAudio.has(type);
  }

  public setOfficeAudioVolume(type: OfficeAudioType, volume: number) {
    const track = this.activeOfficeAudio.get(type);
    if (track && this.ctx) {
      track.volume = Math.max(0, Math.min(1, volume));
      track.gainNode.gain.setValueAtTime(track.volume * this.masterVolume, this.ctx.currentTime);
    }
  }

  public toggleOfficeAudio(type: OfficeAudioType, volume: number = 0.5): boolean {
    if (this.activeOfficeAudio.has(type)) {
      this.stopOfficeAudio(type);
      return false;
    } else {
      this.playOfficeAudio(type, volume);
      return true;
    }
  }

  public playOfficeAudio(type: OfficeAudioType, volume: number = 0.5) {
    this.initCtx();
    if (!this.ctx) return;

    // One-shot triggers
    if (type === 'teams_ping') {
      this.triggerTeamsPing(volume);
      return;
    }
    if (type === 'email_ping') {
      this.triggerEmailPing(volume);
      return;
    }

    // Continuous loopers
    if (this.activeOfficeAudio.has(type)) {
      this.stopOfficeAudio(type);
    }

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume * this.masterVolume, this.ctx.currentTime);
    gainNode.connect(this.ctx.destination);

    let sourceNode: AudioNode | null = null;

    switch (type) {
      case 'walking':
        sourceNode = this.createFootstepsNode(this.ctx, gainNode);
        break;
      case 'chair':
        sourceNode = this.createChairCreakNode(this.ctx, gainNode);
        break;
      case 'hvac':
        sourceNode = this.createHvacHumNode(this.ctx, gainNode);
        break;
      case 'office_keyboard':
        sourceNode = this.createKeyboardClicks(this.ctx, gainNode);
        break;
      case 'chatter':
        sourceNode = this.createOfficeChatterNode(this.ctx, gainNode);
        break;
      case 'page_flip':
        sourceNode = this.createPageFlipNode(this.ctx, gainNode);
        break;
      case 'printer':
        sourceNode = this.createPrinterNoiseNode(this.ctx, gainNode);
        break;
    }

    if (sourceNode) {
      this.activeOfficeAudio.set(type, { id: type, gainNode, sourceNode, volume });
    }
  }

  public stopOfficeAudio(type: OfficeAudioType) {
    const track = this.activeOfficeAudio.get(type);
    if (track) {
      try {
        if ('stop' in track.sourceNode && typeof (track.sourceNode as AudioBufferSourceNode).stop === 'function') {
          (track.sourceNode as AudioBufferSourceNode).stop();
        }
        track.sourceNode.disconnect();
        track.gainNode.disconnect();
      } catch {
        // ignore
      }
      this.activeOfficeAudio.delete(type);
    }
  }

  // --- CUTE SOUND EFFECTS ---

  public playClickSound(enabled: boolean = true) {
    if (!enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playSuccessSound(enabled: boolean = true) {
    if (!enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.12, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.25);
    });
  }

  public playLevelUpSound(enabled: boolean = true) {
    if (!enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760]; // A major fanfare
    arpeggio.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  }

  public playTabSound(enabled: boolean = true) {
    if (!enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playChime() {
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(264, this.ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.2);
  }

  // --- AUDIO SYNTHESIS GENERATOR HELPERS ---

  private createBrownNoise(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(dest);
    source.start();
    return source;
  }

  private createPinkNoise(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(dest);
    source.start();
    return source;
  }

  private createWhiteNoise(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(dest);
    source.start();
    return source;
  }

  private createRainNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.1 * white) / 1.1;
      data[i] = lastOut * 0.8;
      if (Math.random() < 0.0012) {
        data[i] += (Math.random() - 0.5) * 0.4;
      }
    }
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(dest);
    source.start();
    return source;
  }

  private createBinauralNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const oscLeft = ctx.createOscillator();
    const oscRight = ctx.createOscillator();
    const merger = ctx.createChannelMerger(2);
    oscLeft.frequency.value = 200;
    oscRight.frequency.value = 240; // 40Hz Gamma frequency focus
    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);
    const wrapper = ctx.createGain();
    merger.connect(wrapper);
    wrapper.connect(dest);
    oscLeft.start();
    oscRight.start();
    (wrapper as unknown as { stop: () => void }).stop = () => {
      oscLeft.stop();
      oscRight.stop();
      oscLeft.disconnect();
      oscRight.disconnect();
    };
    return wrapper as unknown as AudioNode;
  }

  private createDroneNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.frequency.value = 216;
    osc2.frequency.value = 216.5;
    const master = ctx.createGain();
    master.gain.value = 0.25;
    osc1.connect(master);
    osc2.connect(master);
    master.connect(dest);
    osc1.start();
    osc2.start();
    (master as unknown as { stop: () => void }).stop = () => {
      osc1.stop();
      osc2.stop();
    };
    return master as unknown as AudioNode;
  }

  private createKeyboardClicks(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.003) {
        for (let k = 0; k < 60 && i + k < bufferSize; k++) {
          data[i + k] = (Math.random() * 2 - 1) * Math.exp(-k / 10) * 0.5;
        }
      }
    }
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2200;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(dest);
    source.start();
    return source;
  }

  private createCoffeeBrewNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.05 * white) / 1.05;
      data[i] = lastOut * 0.4;
      if (Math.random() < 0.004) {
        data[i] += (Math.random() - 0.5) * 0.6;
      }
    }
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 850;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(dest);
    source.start();
    return source;
  }

  private createMedievalStudyNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.value = 220; // A3
    osc2.frequency.value = 329.63; // E4
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    const gain = ctx.createGain();
    gain.gain.value = 0.2;
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc1.start();
    osc2.start();
    (gain as unknown as { stop: () => void }).stop = () => {
      osc1.stop();
      osc2.stop();
    };
    return gain as unknown as AudioNode;
  }

  private createLofiBeatNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const osc = ctx.createOscillator();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.02; // Vinyl crackle
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    osc.type = 'sine';
    osc.frequency.value = 146.83; // D3 lofi bass chord
    const gain = ctx.createGain();
    gain.gain.value = 0.2;

    osc.connect(gain);
    noiseSource.connect(gain);
    gain.connect(dest);

    osc.start();
    noiseSource.start();

    (gain as unknown as { stop: () => void }).stop = () => {
      osc.stop();
      noiseSource.stop();
    };
    return gain as unknown as AudioNode;
  }

  private createCuteHyperNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const osc = ctx.createOscillator();
    osc.type = 'square'; // 8-bit chiptune
    osc.frequency.value = 523.25; // C5
    const gain = ctx.createGain();
    gain.gain.value = 0.08;

    osc.connect(gain);
    gain.connect(dest);
    osc.start();

    (gain as unknown as { stop: () => void }).stop = () => {
      osc.stop();
    };
    return gain as unknown as AudioNode;
  }

  private createCuteChillNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = 329.63; // E4
    osc2.frequency.value = 392.0; // G4
    const gain = ctx.createGain();
    gain.gain.value = 0.15;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(dest);

    osc1.start();
    osc2.start();

    (gain as unknown as { stop: () => void }).stop = () => {
      osc1.stop();
      osc2.stop();
    };
    return gain as unknown as AudioNode;
  }

  private createAsmrTappingNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.002) {
        for (let k = 0; k < 40 && i + k < bufferSize; k++) {
          data[i + k] = Math.sin(k * 0.4) * Math.exp(-k / 8) * 0.6;
        }
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(dest);
    source.start();
    return source;
  }

  private createAsmrRustleNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.03 * white) / 1.03;
      data[i] = lastOut * 0.25;
    }
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(dest);
    source.start();
    return source;
  }

  private createAsmrScratchNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4500;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(dest);
    source.start();
    return source;
  }

  private createParkSoundsNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 0.2;
      // Bird chirp simulation
      if (Math.random() < 0.0008) {
        for (let k = 0; k < 150 && i + k < bufferSize; k++) {
          data[i + k] += Math.sin(k * 0.8) * Math.exp(-k / 30) * 0.3;
        }
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(dest);
    source.start();
    return source;
  }

  private createIslandBreezeNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.012 * white) / 1.012;
      data[i] = lastOut * 0.4;
    }
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(dest);
    source.start();
    return source;
  }

  private createOfficeNoise(ctx: AudioContext, dest: AudioNode): AudioNode {
    return this.createHvacHumNode(ctx, dest);
  }

  private createCafeNoise(ctx: AudioContext, dest: AudioNode): AudioNode {
    return this.createOfficeChatterNode(ctx, dest);
  }

  // --- OFFICE SOUND BUILDERS ---

  private triggerTeamsPing(volume: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc2.frequency.setValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.3);
  }

  private triggerEmailPing(volume: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, now); // C6
    osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6

    gain.gain.setValueAtTime(volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  private createFootstepsNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.001) {
        for (let k = 0; k < 200 && i + k < bufferSize; k++) {
          data[i + k] = (Math.random() * 2 - 1) * Math.exp(-k / 20) * 0.4;
        }
      }
    }
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(dest);
    source.start();
    return source;
  }

  private createChairCreakNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.0004) {
        for (let k = 0; k < 300 && i + k < bufferSize; k++) {
          data[i + k] = Math.sin(k * 0.1) * Math.exp(-k / 50) * 0.3;
        }
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(dest);
    source.start();
    return source;
  }

  private createHvacHumNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.01 * white) / 1.01;
      data[i] = lastOut * 0.8;
    }
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(dest);
    source.start();
    return source;
  }

  private createOfficeChatterNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.98 * b0 + white * 0.04;
      b1 = 0.92 * b1 + white * 0.02;
      data[i] = (b0 + b1) * 0.15;
    }
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(dest);
    source.start();
    return source;
  }

  private createPageFlipNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.0006) {
        for (let k = 0; k < 120 && i + k < bufferSize; k++) {
          data[i + k] = (Math.random() * 2 - 1) * Math.exp(-k / 25) * 0.3;
        }
      }
    }
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2800;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(dest);
    source.start();
    return source;
  }

  private createPrinterNoiseNode(ctx: AudioContext, dest: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.001) {
        for (let k = 0; k < 80 && i + k < bufferSize; k++) {
          data[i + k] = Math.sin(k * 0.3) * 0.2;
        }
      }
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(dest);
    source.start();
    return source;
  }
}

export const audioSynth = new MultiTrackSynthesizer();
