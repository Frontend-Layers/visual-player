class FractalAudioAnalyzer {

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

    // Canvas dimensions
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;

    // Fractal parameters
    this.zoom = 1.0;
    this.zoomSpeed = 0.02;
    this.maxIterations = 100;
    this.centerX = 0;
    this.centerY = 0;
    this.offset = 0;
    this.hueOffset = 0;
    this.rotationAngle = 0;

    // Create offscreen canvas for better performance
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.width;
    this.offscreenCanvas.height = this.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');

    // Initialize image data
    this.imageData = this.offscreenCtx.createImageData(this.width, this.height);
  }

  mapToComplex(x, y, zoom, centerX, centerY) {
    const aspectRatio = this.width / this.height;

    // Apply rotation
    const cos = Math.cos(this.rotationAngle);
    const sin = Math.sin(this.rotationAngle);
    const rotatedX = cos * (x - this.width / 2) - sin * (y - this.height / 2);
    const rotatedY = sin * (x - this.width / 2) + cos * (y - this.height / 2);

    return {
      re: (rotatedX - this.width / 2) * aspectRatio / (this.width * zoom) + centerX,
      im: (rotatedY - this.height / 2) / (this.height * zoom) + centerY
    };
  }

  iterateMandelbrot(re, im) {
    let zr = 0;
    let zi = 0;
    let iteration = 0;

    while (iteration < this.maxIterations && zr * zr + zi * zi < 4) {
      const newZr = zr * zr - zi * zi + re;
      const newZi = 2 * zr * zi + im;
      zr = newZr;
      zi = newZi;
      iteration++;
    }

    return iteration;
  }

  getColor(iteration) {
    if (iteration === this.maxIterations) return [0, 0, 0, 255];

    const hue = ((iteration / this.maxIterations * 360 + this.hueOffset) % 360) / 360;
    const saturation = 1;
    const value = iteration < this.maxIterations ? 1 : 0;

    // HSV to RGB conversion
    const h = hue * 6;
    const c = value * saturation;
    const x = c * (1 - Math.abs((h % 2) - 1));
    const m = value - c;

    let r, g, b;
    if (h <= 1) { r = c; g = x; b = 0; } else if (h <= 2) { r = x; g = c; b = 0; } else if (h <= 3) { r = 0; g = c; b = x; } else if (h <= 4) { r = 0; g = x; b = c; } else if (h <= 5) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
      255
    ];
  }

  renderFractal() {
    const data = this.imageData.data;

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const complex = this.mapToComplex(x, y, this.zoom, this.centerX, this.centerY);
        const iteration = this.iterateMandelbrot(complex.re, complex.im);
        const color = this.getColor(iteration);

        const index = (y * this.width + x) * 4;
        data[index] = color[0]; // R
        data[index + 1] = color[1]; // G
        data[index + 2] = color[2]; // B
        data[index + 3] = color[3]; // A
      }
    }

    this.offscreenCtx.putImageData(this.imageData, 0, 0);
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  drawFractal() {
    requestAnimationFrame(() => this.drawFractal());

    // Get audio data
    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate audio intensity
    let bassIntensity = 0;
    let trebleIntensity = 0;

    // Split frequency range
    const midPoint = Math.floor(this.bufferLength / 2);

    // Calculate bass and treble intensities
    for (let i = 0; i < midPoint; i++) {
      bassIntensity += this.dataArray[i];
    }
    for (let i = midPoint; i < this.bufferLength; i++) {
      trebleIntensity += this.dataArray[i];
    }

    bassIntensity /= (midPoint * 255);
    trebleIntensity /= ((this.bufferLength - midPoint) * 255);

    // Apply audio reactivity
    this.zoom *= 1 + this.zoomSpeed * (1 + bassIntensity * 0.5);
    this.hueOffset += trebleIntensity * 5;
    this.rotationAngle += bassIntensity * 0.02;

    // Reset zoom to create infinite effect
    if (this.zoom > 1000) {
      this.zoom = 1;
    }

    // Render the fractal
    this.renderFractal();
  }

  initAudio() {
    this.drawFractal();
  }

}

export default FractalAudioAnalyzer;
