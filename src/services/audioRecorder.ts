export interface AudioRecordingOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  sampleRate?: number;
}

export interface AudioRecordingResult {
  blob: Blob;
  duration: number;
  size: number;
  mimeType: string;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private stream: MediaStream | null = null;

  /**
   * Check if audio recording is supported
   */
  static isSupported(): boolean {
    return 'mediaDevices' in navigator && 'MediaRecorder' in window;
  }

  /**
   * Get available audio input devices
   */
  static async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    if (!AudioRecorder.isSupported()) {
      throw new Error('Audio recording not supported');
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === 'audioinput');
  }

  /**
   * Start recording audio
   */
  async start(options: AudioRecordingOptions = {}): Promise<void> {
    if (!AudioRecorder.isSupported()) {
      throw new Error('Audio recording not supported');
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      throw new Error('Recording already in progress');
    }

    try {
      // Request microphone permission and get stream
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: options.sampleRate ?? 16000, // 16kHz for Whisper
        },
      });

      // Determine MIME type
      const mimeType = this.getSupportedMimeType(options.mimeType);

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: options.audioBitsPerSecond ?? 128000,
      });

      // Reset chunks
      this.audioChunks = [];
      this.startTime = Date.now();

      // Handle data available event
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      this.cleanup();
      if (error instanceof Error) {
        throw new Error(`Failed to start recording: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Stop recording and return the audio data
   */
  async stop(): Promise<AudioRecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const duration = Date.now() - this.startTime;
        const mimeType = this.mediaRecorder?.mimeType ?? 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });

        const result: AudioRecordingResult = {
          blob,
          duration,
          size: blob.size,
          mimeType,
        };

        this.cleanup();
        resolve(result);
      };

      this.mediaRecorder.onerror = (event) => {
        this.cleanup();
        const errorMessage = event instanceof ErrorEvent ? event.message : 'Unknown error';
        reject(new Error(`Recording error: ${errorMessage}`));
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Pause recording
   */
  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  /**
   * Resume recording
   */
  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  /**
   * Get current recording state
   */
  getState(): 'inactive' | 'recording' | 'paused' {
    return this.mediaRecorder?.state ?? 'inactive';
  }

  /**
   * Get recording duration in milliseconds
   */
  getDuration(): number {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      return Date.now() - this.startTime;
    }
    return 0;
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.startTime = 0;
  }

  /**
   * Get supported MIME type
   */
  private getSupportedMimeType(preferred?: string): string {
    const types = [
      preferred,
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ].filter(Boolean) as string[];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    // Fallback to default
    return '';
  }

  /**
   * Convert audio blob to WAV format (required for Whisper)
   */
  static async convertToWav(blob: Blob): Promise<Blob> {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get audio data as Float32Array
    const channelData = audioBuffer.getChannelData(0);

    // Convert to WAV format
    const wavBuffer = AudioRecorder.encodeWav(channelData, audioBuffer.sampleRate);

    await audioContext.close();

    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  /**
   * Encode audio data as WAV format
   */
  private static encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write audio samples
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sampleValue = samples[i] ?? 0;
      const sample = Math.max(-1, Math.min(1, sampleValue));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }

    return buffer;
  }
}
