/**
 * 表情包切割工具 - 核心逻辑
 * 完全浏览器端运行，无服务端依赖
 */

// ==================== State ====================
let currentImage = null;
let originalImageSrc = null;
let fileName = 'stickers';
let slicedBlobs = []; // Array<{ blob: Blob, name: string, url: string }>

// Grid lines (percentage values 0.01 - 0.99)
let rowLines = [];
let colLines = [];

// Interaction state
let activeLine = null; // { type: 'row'|'col', index: number }
let isDragging = false;

// Selection state
let selectedSlices = new Set();

// ==================== DOM Elements ====================
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const editorZone = document.getElementById('editorZone');
const sourceImage = document.getElementById('sourceImage');
const gridOverlay = document.getElementById('gridOverlay');
const rowsInput = document.getElementById('rowsInput');
const colsInput = document.getElementById('colsInput');
const sliceBtn = document.getElementById('sliceBtn');
const resetUploadBtn = document.getElementById('resetUploadBtn');
const reloadBtn = document.getElementById('reloadBtn');
const resultsGrid = document.getElementById('resultsGrid');
const downloadBtn = document.getElementById('downloadBtn');
const clearResultsBtn = document.getElementById('clearResultsBtn');
const resultsActions = document.getElementById('resultsActions');
const selectionInfo = document.getElementById('selectionInfo');
const selectionCount = document.getElementById('selectionCount');
const countBadge = document.getElementById('countBadge');

// ==================== Upload Handlers ====================
uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

// ==================== File Processing ====================
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
    }

    // Extract filename without extension
    fileName = file.name.replace(/\.[^/.]+$/, '') || 'stickers';

    const reader = new FileReader();
    reader.onload = (e) => {
        originalImageSrc = e.target.result;
        
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            sourceImage.src = originalImageSrc;
            
            // Show editor, hide upload
            uploadZone.style.display = 'none';
            editorZone.style.display = 'block';
            
            // Initialize grid after image loads (delay for overlay sizing)
            setTimeout(() => {
                initGrid();
                renderGrid();
            }, 100);
            
            // Remove placeholder if first upload
            const placeholder = resultsGrid.querySelector('.placeholder');
            if (placeholder) {
                placeholder.remove();
            }
            
            updateUI();
        };
        img.src = originalImageSrc;
    };
    reader.readAsDataURL(file);
}

// ==================== Grid Management ====================
function initGrid() {
    const rows = parseInt(rowsInput.value) || 4;
    const cols = parseInt(colsInput.value) || 4;
    
    // Generate evenly distributed lines
    rowLines = [];
    colLines = [];
    
    for (let i = 1; i < rows; i++) {
        rowLines.push(i / rows);
    }
    
    for (let i = 1; i < cols; i++) {
        colLines.push(i / cols);
    }
}

function renderGrid() {
    gridOverlay.innerHTML = '';
    
    // Render horizontal lines (rows)
    rowLines.forEach((pos, index) => {
        const line = document.createElement('div');
        line.className = 'grid-line grid-line-h';
        line.style.top = `${pos * 100}%`;
        line.dataset.type = 'row';
        line.dataset.index = index;
        
        line.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startDrag('row', index, line);
        });
        
        gridOverlay.appendChild(line);
    });
    
    // Render vertical lines (columns)
    colLines.forEach((pos, index) => {
        const line = document.createElement('div');
        line.className = 'grid-line grid-line-v';
        line.style.left = `${pos * 100}%`;
        line.dataset.type = 'col';
        line.dataset.index = index;
        
        line.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startDrag('col', index, line);
        });
        
        gridOverlay.appendChild(line);
    });
}

// ==================== Drag Interaction ====================
function startDrag(type, index, lineElement) {
    isDragging = true;
    activeLine = { type, index };
    lineElement.classList.add('dragging');
    document.body.style.cursor = type === 'row' ? 'row-resize' : 'col-resize';
}

document.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeLine) return;
    
    const rect = gridOverlay.getBoundingClientRect();
    
    if (activeLine.type === 'row') {
        let percentage = (e.clientY - rect.top) / rect.height;
        percentage = Math.max(0.01, Math.min(0.99, percentage));
        rowLines[activeLine.index] = percentage;
    } else {
        let percentage = (e.clientX - rect.left) / rect.width;
        percentage = Math.max(0.01, Math.min(0.99, percentage));
        colLines[activeLine.index] = percentage;
    }
    
    renderGrid();
    
    // Re-apply dragging class to active line
    const activeEl = gridOverlay.querySelector(`[data-type="${activeLine.type}"][data-index="${activeLine.index}"]`);
    if (activeEl) activeEl.classList.add('dragging');
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        activeLine = null;
        document.body.style.cursor = '';
        
        // Remove all dragging classes
        gridOverlay.querySelectorAll('.dragging').forEach(el => {
            el.classList.remove('dragging');
        });
    }
});

// ==================== Grid Controls ====================
rowsInput.addEventListener('change', () => {
    initGrid();
    renderGrid();
});

colsInput.addEventListener('change', () => {
    initGrid();
    renderGrid();
});

// ==================== Slicing Algorithm ====================
async function sliceImage() {
    if (!currentImage) return;
    
    const naturalWidth = currentImage.naturalWidth;
    const naturalHeight = currentImage.naturalHeight;
    
    // Sort lines and create boundaries
    const sortedRowLines = [...rowLines].sort((a, b) => a - b);
    const sortedColLines = [...colLines].sort((a, b) => a - b);
    
    const yBoundaries = [0, ...sortedRowLines, 1];
    const xBoundaries = [0, ...sortedColLines, 1];
    
    let sliceIndex = slicedBlobs.length + 1; // Continue numbering from previous slices
    
    // Iterate through grid cells
    for (let row = 0; row < yBoundaries.length - 1; row++) {
        for (let col = 0; col < xBoundaries.length - 1; col++) {
            const x = Math.round(xBoundaries[col] * naturalWidth);
            const y = Math.round(yBoundaries[row] * naturalHeight);
            const w = Math.round((xBoundaries[col + 1] - xBoundaries[col]) * naturalWidth);
            const h = Math.round((yBoundaries[row + 1] - yBoundaries[row]) * naturalHeight);
            
            // Skip zero-size cells
            if (w <= 0 || h <= 0) continue;
            
            // Create canvas and draw slice
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(currentImage, x, y, w, h, 0, 0, w, h);
            
            // Convert to blob
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/png');
            });
            
            const url = URL.createObjectURL(blob);
            const name = `${fileName}_${sliceIndex}.png`;
            
            slicedBlobs.push({ blob, name, url });
            createSliceCard(url, slicedBlobs.length - 1);
            
            sliceIndex++;
        }
    }
    
    updateUI();
}

sliceBtn.addEventListener('click', sliceImage);

// ==================== Results Management ====================
function createSliceCard(url, index) {
    const card = document.createElement('div');
    card.className = 'slice-card';
    card.dataset.index = index;
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = `Slice ${index + 1}`;
    
    const check = document.createElement('div');
    check.className = 'slice-check';
    
    card.appendChild(img);
    card.appendChild(check);
    
    card.addEventListener('click', () => {
        toggleSelection(index, card);
    });
    
    resultsGrid.appendChild(card);
}

function toggleSelection(index, card) {
    if (selectedSlices.has(index)) {
        selectedSlices.delete(index);
        card.classList.remove('selected');
    } else {
        selectedSlices.add(index);
        card.classList.add('selected');
    }
    updateUI();
}

// ==================== Download ====================
async function downloadSlices() {
    const zip = new JSZip();
    
    let items, zipName;
    
    if (selectedSlices.size > 0) {
        // Download selected
        const sortedIndices = [...selectedSlices].sort((a, b) => a - b);
        items = sortedIndices.map(i => slicedBlobs[i]);
        zipName = `${fileName}_selected.zip`;
    } else {
        // Download all
        items = slicedBlobs;
        zipName = `${fileName}_sliced.zip`;
    }
    
    items.forEach(item => {
        zip.file(item.name, item.blob);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, zipName);
}

downloadBtn.addEventListener('click', downloadSlices);

// ==================== Clear & Reset ====================
function clearResults() {
    slicedBlobs = [];
    selectedSlices.clear();
    resultsGrid.innerHTML = `
        <div class="placeholder">
            <div class="placeholder-icon">📷</div>
            <div class="placeholder-text">暂无结果<br>请上传图片并点击切割</div>
        </div>
    `;
    updateUI();
}

clearResultsBtn.addEventListener('click', clearResults);

resetUploadBtn.addEventListener('click', () => {
    // Return to upload view without clearing results
    uploadZone.style.display = 'flex';
    editorZone.style.display = 'none';
    fileInput.value = '';
    currentImage = null;
    originalImageSrc = null;
});

reloadBtn.addEventListener('click', () => {
    location.reload();
});

// ==================== UI Updates ====================
function updateUI() {
    // Update count badge
    countBadge.textContent = slicedBlobs.length;
    
    // Show/hide actions
    if (slicedBlobs.length > 0) {
        resultsActions.classList.remove('hidden');
    } else {
        resultsActions.classList.add('hidden');
    }
    
    // Update selection info
    if (selectedSlices.size > 0) {
        selectionInfo.style.display = 'inline';
        selectionCount.textContent = selectedSlices.size;
        downloadBtn.textContent = `📥 下载已选 (${selectedSlices.size})`;
    } else {
        selectionInfo.style.display = 'none';
        downloadBtn.textContent = '📥 下载全部';
    }
}

// Initialize
updateUI();

