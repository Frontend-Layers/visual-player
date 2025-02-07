class Visualizer {

  constructor(ctx, audio) {
    this.ctx = ctx;
    this.audio = audio;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    // Configure analyser for better resolution
    this.analyser.fftSize = 512; // Increased FFT size for better frequency resolution
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    // Visualization properties
    this.barSpacing = 2;
    this.minHeight = 2;
    this.peakDecayRate = 0.9; // Slow down peak decay for smoother visuals
    this.peakHoldTime = 30;

    // Set default color scheme
    this.setColorScheme(Visualizer.COLOR_SCHEMES.CLASSIC);

    // Initial values for dynamic sizing
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Store peak values and hold times
    this.peaks = new Array(this.barCount).fill(0);
    this.peakHolds = new Array(this.barCount).fill(0);
  }

  resizeCanvas() {
    const canvasWidth = this.ctx.canvas.width;
    this.barWidth = Math.max(6, canvasWidth / 100);
    this.barCount = Math.floor(canvasWidth / (this.barWidth + this.barSpacing));

    this.peaks = new Array(this.barCount).fill(0);
    this.peakHolds = new Array(this.barCount).fill(0);
    this.initializeGradient();
  }

  initializeGradient() {
    this.gradient = this.ctx.createLinearGradient(0, this.ctx.canvas.height, 0, 0);
    this.gradientColors.forEach(({ stop, color }) => {
      this.gradient.addColorStop(stop, color);
    });
  }

  drawBars() {
    requestAnimationFrame(() => this.drawBars());
    this.analyser.getByteFrequencyData(this.dataArray);

    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    const barTotalWidth = this.barWidth + this.barSpacing;
    const scale = this.ctx.canvas.height / 255;
    const startX = (this.ctx.canvas.width - this.barCount * barTotalWidth) / 2;

    for (let i = 0; i < this.barCount; i++) {
      // Fix: Correct calculation of the index for each bar
      const dataIndex = Math.floor(i * (this.bufferLength / this.barCount));
      let value = this.dataArray[dataIndex] * scale * (this.audio.volume || 1);

      // Apply peak decay and hold
      if (value > this.peaks[i]) {
        this.peaks[i] = value;
        this.peakHolds[i] = this.peakHoldTime;
      } else if (this.peakHolds[i] > 0) {
        this.peakHolds[i]--;
      } else {
        this.peaks[i] *= this.peakDecayRate;
      }

      const x = startX + i * barTotalWidth;
      const height = Math.max(value, this.minHeight);
      this.ctx.fillStyle = this.gradient;
      this.ctx.fillRect(x, this.ctx.canvas.height - height, this.barWidth, height);

      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(x, this.ctx.canvas.height - this.peaks[i] - 2, this.barWidth, 2);
    }

    this.drawScanlines();
  }

  drawScanlines() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < this.ctx.canvas.height; i += 4) {
      this.ctx.fillRect(0, i, this.ctx.canvas.width, 1);
    }
  }

  setColorScheme(colors) {
    this.gradientColors = colors;
    this.initializeGradient();
  }

  static get COLOR_SCHEMES() {
    return {
      CLASSIC: [
        { stop: 0.0, color: '#1e45cb' },
        { stop: 0.5, color: '#4a9eff' },
        { stop: 0.8, color: '#c4e0ff' },
        { stop: 1.0, color: '#ffffff' }
      ],
      FIRE: [
        { stop: 0.0, color: '#ff3000' },
        { stop: 0.5, color: '#ff8000' },
        { stop: 0.8, color: '#ffff00' },
        { stop: 1.0, color: '#ffffff' }
      ],
      MATRIX: [
        { stop: 0.0, color: '#003300' },
        { stop: 0.5, color: '#008800' },
        { stop: 0.8, color: '#00ff00' },
        { stop: 1.0, color: '#ffffff' }
      ]
    };
  }

  initAudio() {
    this.drawBars();
  }

}

export default Visualizer;
