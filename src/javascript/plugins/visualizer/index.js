import tpl from './templates/visualizer.html';
import css from './styles/visualizer.css';

export default function Visualizer(options = {}) {
  let cfg = {};
  cfg = { ...cfg, ...options };

  return {
    id: 'visualizer',
    run: function($, bFirst) {
      $.addStyles(css);

      $.addTpl(tpl, {
        priority: 'none',
        selector: ''
      });

      // Get the container
      $.container = $.shadow.querySelector('.visualizer');

      // Create and append canvas
      $.canvas = document.createElement('canvas');
      $.canvas.width = $.container.clientWidth || 800;
      $.canvas.height = $.container.clientHeight || 200;
      $.container.appendChild($.canvas);

      // Get canvas context
      $.ctx = $.canvas.getContext('2d');

      // Audio setup
      $.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      $.analyser = $.audioContext.createAnalyser();
      $.source = $.audioContext.createMediaElementSource($.audio);

      // Add gain node for smoother volume transitions
      $.gainNode = $.audioContext.createGain();
      $.source.connect($.gainNode);
      $.gainNode.connect($.analyser);
      $.analyser.connect($.audioContext.destination);

      // Configure analyser for better frequency resolution
      $.analyser.fftSize = 2048; // Increased for better resolution
      $.analyser.smoothingTimeConstant = 0.85; // Smoother transitions
      $.bufferLength = $.analyser.frequencyBinCount;
      $.dataArray = new Uint8Array($.bufferLength);

      // Visualization properties
      $.barSpacing = 2;
      $.minHeight = 2;
      $.peakDecayRate = 0.95; // Slower decay
      $.peakHoldTime = 45; // Longer hold time

      // Add smoothing for values
      $.smoothedArray = new Float32Array($.bufferLength);
      $.smoothingFactor = 0.3; // Adjust for more/less smoothing

      // Set default color scheme
      setColorScheme(colorSchemes());

      // Setup resize handling
      resizeCanvas();
      window.addEventListener('resize', () => resizeCanvas());

      // Initialize peaks arrays
      $.peaks = new Array($.barCount).fill(0);
      $.peakHolds = new Array($.barCount).fill(0);
      $.prevValues = new Array($.barCount).fill(0);

      function resizeCanvas() {
        $.canvas.width = $.container.clientWidth || 800;
        $.canvas.height = $.container.clientHeight || 200;
        $.barWidth = Math.max(4, $.canvas.width / 120); // More bars
        $.barCount = Math.floor($.canvas.width / ($.barWidth + $.barSpacing));

        $.peaks = new Array($.barCount).fill(0);
        $.peakHolds = new Array($.barCount).fill(0);
        $.prevValues = new Array($.barCount).fill(0);
        initializeGradient();
      }

      function initializeGradient() {
        $.gradient = $.ctx.createLinearGradient(0, $.canvas.height, 0, 0);
        $.gradientColors.forEach(({ stop, color }) => {
          $.gradient.addColorStop(stop, color);
        });
      }

      // Improved frequency mapping function
      function mapFrequencyToBar(i, barCount) {
        // Use logarithmic scaling for frequency distribution
        const minFreq = 20;
        const maxFreq = 20000;
        const exp = Math.log(maxFreq / minFreq);
        const freq = minFreq * Math.exp(exp * (i / barCount));
        return Math.floor((freq / maxFreq) * $.bufferLength);
      }

      function smoothValue(current, previous, smoothingFactor) {
        return previous + (current - previous) * smoothingFactor;
      }

      function drawBars() {
        requestAnimationFrame(() => drawBars());
        $.analyser.getByteFrequencyData($.dataArray);

        // Clear background with slight fade effect
        $.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        $.ctx.fillRect(0, 0, $.canvas.width, $.canvas.height);

        const barTotalWidth = $.barWidth + $.barSpacing;
        const scale = $.canvas.height / 255;
        const startX = ($.canvas.width - $.barCount * barTotalWidth) / 2;

        // Update gain node for volume changes
        $.gainNode.gain.value = $.audio.volume || 1;

        for (let i = 0; i < $.barCount; i++) {
          // Improved frequency mapping
          const dataIndex = mapFrequencyToBar(i, $.barCount);

          // Get frequency value and apply volume scaling
          let value = $.dataArray[dataIndex] * scale;

          // Smooth the value
          value = smoothValue(value, $.prevValues[i], $.smoothingFactor);
          $.prevValues[i] = value;

          // Apply volume scaling with smoother transition
          value *= $.gainNode.gain.value;

          // Peak handling with improved decay
          if (value > $.peaks[i]) {
            $.peaks[i] = value;
            $.peakHolds[i] = $.peakHoldTime;
          } else if ($.peakHolds[i] > 0) {
            $.peakHolds[i]--;
          } else {
            $.peaks[i] *= $.peakDecayRate;
            // Add slight randomization to peak decay
            $.peaks[i] += (Math.random() - 0.5) * 0.5;
          }

          const x = startX + i * barTotalWidth;
          const height = Math.max(value, $.minHeight);

          // Draw main bar with gradient
          $.ctx.fillStyle = $.gradient;
          $.ctx.fillRect(x, $.canvas.height - height, $.barWidth, height);

          // Draw peak with glow effect
          $.ctx.fillStyle = '#fff';
          $.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
          $.ctx.shadowBlur = 2;
          $.ctx.fillRect(x, $.canvas.height - $.peaks[i] - 2, $.barWidth, 2);
          $.ctx.shadowBlur = 0;
        }

        drawScanlines();
      }

      function drawScanlines() {
        $.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        for (let i = 0; i < $.canvas.height; i += 4) {
          // Add slight randomization to scanlines
          const opacity = 0.02 + Math.random() * 0.01;
          $.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          $.ctx.fillRect(0, i, $.canvas.width, 1);
        }
      }

      function setColorScheme(colors) {
        $.gradientColors = colors;
        initializeGradient();
      }

      function colorSchemes() {
        return [
          { stop: 0.0, color: '#1e45cb' },
          { stop: 0.3, color: '#4a9eff' }, // Adjusted color stops
          { stop: 0.6, color: '#c4e0ff' },
          { stop: 1.0, color: '#ffffff' }
        ];
      }

      // Start visualization
      drawBars();
    }
  };
}
