class WinampFireAnalyzer {

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

    // Fire effect settings
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.fireWidth = Math.floor(this.width / 2);
    this.fireHeight = Math.floor(this.height / 2);

    // Create fire arrays
    this.firePixels = new Array(this.fireWidth * this.fireHeight).fill(0);
    this.palette = this.createFirePalette();

    // Create offscreen canvas for fire
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.fireWidth;
    this.offscreenCanvas.height = this.fireHeight;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    this.imageData = this.offscreenCtx.createImageData(this.fireWidth, this.fireHeight);
  }

  createFirePalette() {
    const palette = new Array(128); // Fixed size palette

    // Generate color palette
    for (let i = 0; i < 32; i++) {
      // Black to red
      palette[i] = [i << 1, 0, 0, 255];

      // Red to yellow
      palette[i + 32] = [64 + (i << 1), i << 3, 0, 255];

      // Yellow to white
      palette[i + 64] = [128 + (i << 1), 128 + (i << 1), i << 3, 255];

      // White with fade
      palette[i + 96] = [255, 255, Math.max(0, 255 - (i << 3)), 255];
    }

    return palette;
  }

  spreadFire(src) {
    // Create a copy of the current fire state
    const nextPixels = [...this.firePixels];

    for (let x = 0; x < this.fireWidth; x++) {
      for (let y = 1; y < this.fireHeight; y++) {
        const decay = Math.floor(Math.random() * 3);
        const idx = y * this.fireWidth + x;

        // Calculate spread
        let spread = Math.floor(Math.random() * 3) - 1;
        const newX = Math.min(Math.max(x + spread, 0), this.fireWidth - 1);
        const newY = Math.max(y - decay, 0);
        const newIdx = newY * this.fireWidth + newX;

        // Update with bounds checking
        if (newIdx >= 0 && newIdx < nextPixels.length) {
          const value = Math.max(0, this.firePixels[idx] - decay);
          nextPixels[newIdx] = value;
        }
      }
    }

    this.firePixels = nextPixels;
  }

  updateFireSource(intensity) {
    const bottomRow = (this.fireHeight - 1) * this.fireWidth;
    const maxIntensity = this.palette.length - 1;

    for (let x = 0; x < this.fireWidth; x++) {
      // Scale intensity to palette range
      const value = Math.min(maxIntensity, Math.floor(intensity * maxIntensity));
      this.firePixels[bottomRow + x] = value;
    }
  }

  renderFire() {
    const maxColorIndex = this.palette.length - 1;

    for (let y = 0; y < this.fireHeight; y++) {
      for (let x = 0; x < this.fireWidth; x++) {
        const idx = y * this.fireWidth + x;
        const imgDataIdx = idx * 4;

        // Ensure color index is within bounds
        const colorIdx = Math.min(Math.max(0, this.firePixels[idx]), maxColorIndex);
        const color = this.palette[colorIdx];

        // Set pixel data
        this.imageData.data[imgDataIdx] = color[0]; // R
        this.imageData.data[imgDataIdx + 1] = color[1]; // G
        this.imageData.data[imgDataIdx + 2] = color[2]; // B
        this.imageData.data[imgDataIdx + 3] = color[3]; // A
      }
    }

    // Render to offscreen canvas
    this.offscreenCtx.putImageData(this.imageData, 0, 0);

    // Scale and draw to main canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Use better scaling
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(
      this.offscreenCanvas,
      0, 0, this.fireWidth, this.fireHeight,
      0, 0, this.width, this.height
    );
  }

  drawFire() {
    try {
      // Get frequency data
      this.analyser.getByteFrequencyData(this.dataArray);

      // Calculate average intensity
      let intensity = 0;
      for (let i = 0; i < this.bufferLength; i++) {
        intensity += this.dataArray[i];
      }
      intensity = (intensity / this.bufferLength) / 255;
      intensity *= (this.audio.volume || 1);

      // Update and render fire
      this.updateFireSource(intensity);
      this.spreadFire();
      this.renderFire();

      // Continue animation
      requestAnimationFrame(() => this.drawFire());
    } catch (error) {
      console.error('Error in fire animation:', error);
      // Attempt to recover
      requestAnimationFrame(() => this.drawFire());
    }
  }

  initAudio() {
    // Reset fire state
    this.firePixels.fill(0);
    // Start animation
    this.drawFire();
  }

}

export default WinampFireAnalyzer;
