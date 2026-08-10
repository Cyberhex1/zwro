import { AudioType } from '../types';

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentType: AudioType = 'brown';
  private volume: number = 0.2;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentType(): AudioType {
    return this.currentType;
  }

  public stop() {
    if (this.noiseNode) {
      try {
        if ('stop' in this.noiseNode && typeof (this.noiseNode as AudioBufferSourceNode).stop === 'function') {
          (this.noiseNode as AudioBufferSourceNode).stop();
        }
        this.noiseNode.disconnect();
      } catch {
        // ignore disconnect errors
      }
      this.noiseNode = null;
    }
    this.isPlaying = false;
  }

  public play(type: AudioType = 'brown') {
    this.stop();
    this.initCtx();

    if (!this.ctx) return;
    this.currentType = type;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (type === 'brown') {
      this.noiseNode = this.createBrownNoiseNode(this.ctx, this.gainNode);
    } else if (type === 'pink') {
      this.noiseNode = this.createPinkNoiseNode(this.ctx, this.gainNode);
    } else if (type === 'white') {
      this.noiseNode = this.createWhiteNoiseNode(this.ctx, this.gainNode);
    } else if (type === 'rain') {
      this.noiseNode = this.createRainNode(this.ctx, this.gainNode);
    } else if (type === 'binaural') {
      this.noiseNode = this.createBinauralNode(this.ctx, this.gainNode);
    } else if (type === 'drone') {
      this.noiseNode = this.createDroneNode(this.ctx, this.gainNode);
    } else if (type === 'office') {
      this.noiseNode = this.createOfficeNode(this.ctx, this.gainNode);
    } else if (type === 'cafe') {
      this.noiseNode = this.createCafeNode(this.ctx, this.gainNode);
    }

    this.isPlaying = true;
  }

  public toggle(type?: AudioType): boolean {
    if (this.isPlaying && (!type || type === this.currentType)) {
      this.stop();
      return false;
    } else {
      this.play(type || this.currentType);
      return true;
    }
  }

  private createBrownNoiseNode(ctx: AudioContext, destination: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain adjustment
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(destination);
    source.start();
    return source;
  }

  private createPinkNoiseNode(ctx: AudioContext, destination: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(destination);
    source.start();
    return source;
  }

  private createBinauralNode(ctx: AudioContext, destination: AudioNode): AudioNode {
    const oscLeft = ctx.createOscillator();
    const oscRight = ctx.createOscillator();
    const merger = ctx.createChannelMerger(2);

    oscLeft.frequency.value = 200; // Left ear
    oscRight.frequency.value = 240; // Right ear (40Hz difference = Gamma focus)

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);

    merger.connect(destination);

    oscLeft.start();
    oscRight.start();

    // Create a wrapper object that matches AudioNode interface for stopping
    const wrapperNode = ctx.createGain();
    merger.connect(wrapperNode);
    (wrapperNode as unknown as { stop: () => void }).stop = () => {
      oscLeft.stop();
      oscRight.stop();
      oscLeft.disconnect();
      oscRight.disconnect();
    };

    return wrapperNode as unknown as AudioNode;
  }

  private createDroneNode(ctx: AudioContext, destination: AudioNode): AudioNode {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc1.frequency.value = 216; // 432Hz harmonic half
    osc2.frequency.value = 216.5; // Slightly detuned for rich warm texture

    lfo.frequency.value = 0.15; // Slow 0.15Hz breathing LFO
    lfoGain.gain.value = 0.05;

    lfo.connect(lfoGain);

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;

    osc1.connect(masterGain);
    osc2.connect(masterGain);
    lfoGain.connect(masterGain.gain);

    masterGain.connect(destination);

    osc1.start();
    osc2.start();
    lfo.start();

    (masterGain as unknown as { stop: () => void }).stop = () => {
      osc1.stop();
      osc2.stop();
      lfo.stop();
    };

    return masterGain as unknown as AudioNode;
  }

  private createWhiteNoiseNode(ctx: AudioContext, destination: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(destination);
    source.start();
    return source;
  }

  private createRainNode(ctx: AudioContext, destination: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Gentle low pass rain patter
      lastOut = (lastOut + 0.1 * white) / 1.1;
      data[i] = lastOut * 0.8;
      // Random droplet clicks
      if (Math.random() < 0.001) {
        data[i] += (Math.random() - 0.5) * 0.4;
      }
    }

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(destination);
    source.start();
    return source;
  }

  private createOfficeNode(ctx: AudioContext, destination: AudioNode): AudioNode {
    // Soft low hum (HVAC) + occasional typing clicks simulation
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.015 * white) / 1.015;
      data[i] = lastOut * 1.5;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 450;
    bandpass.Q.value = 0.8;

    source.connect(bandpass);
    bandpass.connect(destination);
    source.start();
    return source;
  }

  private createCafeNode(ctx: AudioContext, destination: AudioNode): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.03;
      b2 = 0.90 * b2 + white * 0.02;
      data[i] = (b0 + b1 + b2) * 0.15;
    }

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(filter);
    filter.connect(destination);
    source.start();
    return source;
  }

  public playChime() {
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, this.ctx.currentTime); // 528Hz Solfeggio tone
    osc.frequency.exponentialRampToValueAtTime(264, this.ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.2);
  }
}

export const audioSynth = new AudioSynthesizer();
