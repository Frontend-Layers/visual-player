class AudioVisualizer {

  constructor(ctx, audio) {
    this.ctx = ctx;
    this.audio = audio;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    // Adjust FFT size for smoother visualization
    this.analyser.fftSize = 512;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    // Animation properties
    this.phase = 0;
    this.animationSpeed = 0.05;
    this.waveHeight = ctx.canvas.height / 2;

    // Styling properties
    this.lineWidth = 3;
    this.waveColor = '#4a9eff';
    this.backgroundColor = '#1a1a1a';
    this.alpha = 0.6;
  }

  drawWave() {
    requestAnimationFrame(() => this.drawWave());

    // Clear canvas with semi-transparent background for trail effect
    this.ctx.fillStyle = `${this.backgroundColor}${Math.round(this.alpha * 255).toString(16).padStart(2, '0')}`;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.analyser.getByteTimeDomainData(this.dataArray);

    // Calculate average amplitude
    let averageAmplitude = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      averageAmplitude += Math.abs(this.dataArray[i] - 128);
    }
    averageAmplitude = (averageAmplitude / this.bufferLength) * 0.01;

    // Draw the wave
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = this.waveColor;
    this.ctx.beginPath();

    const width = this.ctx.canvas.width;
    const height = this.ctx.canvas.height;
    const centerY = height / 2;

    for (let x = 0; x <= width; x += 1) {
      // Create smooth sine wave
      const frequency = 2;
      const amplitude = (30 + averageAmplitude * 50) * Math.min(1, this.audio.volume + 0.3);

      // Combine multiple sine waves for more interesting motion
      const y = centerY +
               amplitude * Math.sin((x / width) * Math.PI * frequency + this.phase) +
               (amplitude * 0.5) * Math.sin((x / width) * Math.PI * frequency * 2 + this.phase * 1.5);

      if (x === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    // Apply smooth line rendering
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();

    // Update phase for animation
    this.phase += this.animationSpeed;
  }

  initAudio() {
    // Start the visualization
    this.drawWave();
  }

}

export default AudioVisualizer;
