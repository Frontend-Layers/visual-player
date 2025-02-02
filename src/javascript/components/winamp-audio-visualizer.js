class WinampAudioAnalyzer {

  constructor(ctx, audio) {
    this.ctx = ctx;
    this.audio = audio;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    // Set up analyser
    this.analyser.fftSize = 256;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    // Visualization properties
    this.barWidth = 6;
    this.barSpacing = 2;
    this.barCount = 48;
    this.minHeight = 2;
    this.peakDecayRate = 0.8;
    this.peakHoldTime = 30;

    // Store peak values and hold times
    this.peaks = new Array(this.barCount).fill(0);
    this.peakHolds = new Array(this.barCount).fill(0);

    // Color gradient
    this.gradientColors = [
      { stop: 0.0, color: '#1e45cb' }, // Deep blue
      { stop: 0.5, color: '#4a9eff' }, // Light blue
      { stop: 0.8, color: '#c4e0ff' }, // Very light blue
      { stop: 1.0, color: '#ffffff' } // White
    ];

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

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);

    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    const barTotalWidth = this.barWidth + this.barSpacing;
    const scale = this.ctx.canvas.height / 255;

    // Calculate starting x position to center the bars
    const totalWidth = this.barCount * barTotalWidth;
    const startX = (this.ctx.canvas.width - totalWidth) / 2;

    // Draw frequency bars
    for (let i = 0; i < this.barCount; i++) {
      // Get frequency value for this bar
      const dataIndex = Math.floor(i * (this.bufferLength / this.barCount));
      let value = this.dataArray[dataIndex] * scale;

      // Apply volume scaling
      value *= (this.audio.volume || 1);

      // Update peak value
      if (value > this.peaks[i]) {
        this.peaks[i] = value;
        this.peakHolds[i] = this.peakHoldTime;
      } else {
        if (this.peakHolds[i] > 0) {
          this.peakHolds[i]--;
        } else {
          this.peaks[i] *= this.peakDecayRate;
        }
      }

      const x = startX + i * barTotalWidth;
      const height = Math.max(value, this.minHeight);

      // Draw the main bar
      this.ctx.fillStyle = this.gradient;
      this.ctx.fillRect(x,
        this.ctx.canvas.height - height,
        this.barWidth,
        height);

      // Draw peak line
      const peakHeight = 2;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(x,
        this.ctx.canvas.height - this.peaks[i] - peakHeight,
        this.barWidth,
        peakHeight);
    }

    // Add scanline effect
    this.drawScanlines();
  }

  drawScanlines() {
    // Add subtle scanline effect
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < this.ctx.canvas.height; i += 4) {
      this.ctx.fillRect(0, i, this.ctx.canvas.width, 1);
    }
  }

  // Method to change color scheme
  setColorScheme(colors) {
    this.gradientColors = colors;
    this.initializeGradient();
  }

  // Classic Winamp color schemes
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

export default WinampAudioAnalyzer;
