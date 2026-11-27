import { VectorCoreOptimizer } from './core-optimizer.js';

const optimizer = new VectorCoreOptimizer();
let loadedSvgData = '';

// DOM Node References
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const canvasViewport = document.getElementById('canvasViewport');
const canvasPlaceholder = document.getElementById('canvasPlaceholder');
const codeOutput = document.getElementById('codeOutput');

// Settings Sliders
const paramPrecision = document.getElementById('paramPrecision');
const valPrecision = document.getElementById('valPrecision');
const paramSimplify = document.getElementById('paramSimplify');
const valSimplify = document.getElementById('valSimplify');

// Stats Counters
const statOriginal = document.getElementById('statOriginal');
const statOptimized = document.getElementById('statOptimized');
const statSaving = document.getElementById('statSaving');
const statNodes = document.getElementById('statNodes');

// Drag and Drop Pipeline Events
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('border-indigo-500'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('border-indigo-500'));
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-indigo-500');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'image/svg+xml') processFile(file);
});
fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) processFile(e.target.files[0]);
});

function processFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        loadedSvgData = event.target.result;
        triggerExecution();
    };
    reader.readAsText(file);
}

// Live-render execution loop
function triggerExecution() {
    if (!loadedSvgData) return;

    const precision = parseInt(paramPrecision.value);
    const settings = { decimalPrecision: precision };

    const result = optimizer.optimize(loadedSvgData, settings);

    // Update Telemetry Metrics
    canvasPlaceholder.style.display = 'none';
    canvasViewport.innerHTML = result.cleanSVG;
    
    // Scale container cleanly 
    const svgNode = canvasViewport.querySelector('svg');
    if (svgNode) {
        svgNode.setAttribute('class', 'w-64 h-64 object-contain transition-all');
    }

    // Code and Compression Stats Calculation
    codeOutput.textContent = result.cleanSVG;
    const origSize = new Blob([loadedSvgData]).size;
    const optSize = new Blob([result.cleanSVG]).size;
    const savings = Math.max(0, ((origSize - optSize) / origSize) * 100);

    statOriginal.textContent = `${(origSize / 1024).toFixed(2)} KB`;
    statOptimized.textContent = `${(optSize / 1024).toFixed(2)} KB`;
    statSaving.textContent = `-${savings.toFixed(1)}%`;
    statNodes.textContent = result.nodeCount;
}

// Real-time Event Hooks
paramPrecision.addEventListener('input', (e) => {
    valPrecision.textContent = e.target.value;
    triggerExecution();
});
paramSimplify.addEventListener('input', (e) => {
    valSimplify.textContent = `${e.target.value}%`;
    triggerExecution();
});
