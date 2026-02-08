
import { AppState } from "../types";

// Helper to load image
const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
};

// Apply Brightness/Contrast/Saturation/Hue
const applyColorAdjustments = (data: Uint8ClampedArray, settings: AppState['separationSettings']) => {
    const { contrast, brightness, saturation } = settings;
    const contrastFactor = (contrast / 100) ** 2; 

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i+1];
        let b = data[i+2];

        // Brightness
        r *= (brightness / 100);
        g *= (brightness / 100);
        b *= (brightness / 100);

        // Contrast
        r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255;
        g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255;
        b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255;

        // Saturation
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        r = gray + (r - gray) * (saturation / 100);
        g = gray + (g - gray) * (saturation / 100);
        b = gray + (b - gray) * (saturation / 100);

        data[i] = Math.min(255, Math.max(0, r));
        data[i+1] = Math.min(255, Math.max(0, g));
        data[i+2] = Math.min(255, Math.max(0, b));
    }
};

// Heuristic Background Removal
const removeBackground = (ctx: CanvasRenderingContext2D, w: number, h: number, tolerance: number = 30) => {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    
    // Sample top-left corner as background color
    const br = data[0];
    const bg = data[1];
    const bb = data[2];
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        // Euclidean distance
        const dist = Math.sqrt((r-br)**2 + (g-bg)**2 + (b-bb)**2);

        if (dist < tolerance) {
            data[i+3] = 0; // Transparent
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

// Unsharp Masking
const applySmartEnhance = (ctx: CanvasRenderingContext2D, w: number, h: number, strength: number = 1.0) => {
    const originalData = ctx.getImageData(0, 0, w, h);
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = w;
    blurCanvas.height = h;
    const blurCtx = blurCanvas.getContext('2d')!;
    blurCtx.filter = 'blur(2px)'; 
    blurCtx.drawImage(ctx.canvas, 0, 0);
    const blurredData = blurCtx.getImageData(0, 0, w, h);

    const outputData = ctx.createImageData(w, h);
    const src = originalData.data;
    const blur = blurredData.data;
    const dst = outputData.data;

    for (let i = 0; i < src.length; i += 4) {
        if (src[i+3] === 0) continue; 

        for (let c = 0; c < 3; c++) {
            const original = src[i+c];
            const blurred = blur[i+c];
            const detail = original - blurred;
            let val = original + (detail * strength); 
            if (Math.abs(detail) < 5) val = original;
            dst[i+c] = Math.min(255, Math.max(0, val));
        }
        dst[i+3] = src[i+3]; 
    }

    ctx.putImageData(outputData, 0, 0);
};


export const processLocalEffect = async (
    base64Image: string,
    tool: string,
    sepSettings: AppState['separationSettings'],
    effSettings: AppState['effectSettings'],
    enhanceSettings: AppState['enhanceSettings']
): Promise<string> => {
    const img = await loadImage(base64Image);
    const canvas = document.createElement('canvas');
    
    const scale = enhanceSettings.upscale || 1;
    
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    
    if (enhanceSettings.removeBg) {
        removeBackground(ctx, w, h, 30);
    }

    if (scale > 1) {
         const strength = scale === 2 ? 1.5 : 2.5; 
         applySmartEnhance(ctx, w, h, strength);
    }

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    applyColorAdjustments(data, sepSettings);
    
    if (['halftone', 'stippling', 'engraving'].includes(tool)) {
        ctx.clearRect(0, 0, w, h);
    } else {
        ctx.putImageData(imageData, 0, 0); 
    }

    // --- EFFECT LOGIC ---
    
    if (tool === 'enhance') {
        // Pass
    }

    else if (tool === 'halftone') {
        const gridSize = Math.max(2, effSettings.scale * scale); 
        
        for (let y = 0; y < h; y += gridSize) {
            for (let x = 0; x < w; x += gridSize) {
                const iy = Math.min(h-1, Math.floor(y + gridSize/2));
                const ix = Math.min(w-1, Math.floor(x + gridSize/2));
                const i = (iy * w + ix) * 4;
                
                if (data[i+3] < 50) continue; 

                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                const brightness = (r + g + b) / 3 / 255; 

                const maxRadius = gridSize / 1.5;
                const radius = (effSettings.intensity / 100) * maxRadius * (0.4 + (1-brightness) * 0.6 + 0.2); 
                
                ctx.fillStyle = `rgba(${r},${g},${b}, ${data[i+3]/255})`;
                ctx.beginPath();
                ctx.arc(x + gridSize/2, y + gridSize/2, Math.max(0.5, radius), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } 
    
    else if (tool === 'stippling') {
        const density = (effSettings.intensity / 100) * 0.8; 
        const dotSize = Math.max(1, effSettings.scale * scale / 3);
        const count = w * h * density / (scale*scale); 
        
        for (let k = 0; k < count; k++) {
            const x = Math.floor(Math.random() * w);
            const y = Math.floor(Math.random() * h);
            const i = (y * w + x) * 4;

            if (data[i+3] < 20) continue;

            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            
            ctx.fillStyle = `rgba(${r},${g},${b}, ${data[i+3]/255})`;
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    else if (tool === 'engraving') {
        const gap = Math.max(3, effSettings.scale * scale); 
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const step = 2 * scale;
        const waveFreq = 0.2 / scale;
        const waveAmp = gap * 0.25;

        for (let y = 0; y < h; y += gap) {
            for (let x = 0; x < w; x += step) {
                 const iy = Math.min(h-1, Math.floor(y));
                 const ix = Math.min(w-1, Math.floor(x));
                 const i = (iy * w + ix) * 4;

                 if (data[i+3] < 20) continue;

                 const r = data[i];
                 const g = data[i+1];
                 const b = data[i+2];
                 const alpha = data[i+3] / 255;

                 const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
                 const density = 1.0 - lum;
                 const thickness = gap * (effSettings.intensity / 50) * density * 1.2;

                 if (thickness < 0.2) continue;

                 const yOff1 = Math.sin(x * waveFreq) * waveAmp;
                 const yOff2 = Math.sin((x + step) * waveFreq) * waveAmp;

                 ctx.lineWidth = thickness;
                 ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
                 
                 ctx.beginPath();
                 ctx.moveTo(x, y + yOff1);
                 ctx.lineTo(x + step, y + yOff2);
                 ctx.stroke();
            }
        }
    }

    else if (tool === 'dithering') {
        const imageDataDither = ctx.getImageData(0,0,w,h);
        const d = imageDataDither.data;
        const levels = Math.max(2, Math.floor((effSettings.intensity / 100) * 8)); 
        const step = 255 / (levels - 1);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                if (d[i+3] === 0) continue;

                const oldR = d[i];
                const oldG = d[i+1];
                const oldB = d[i+2];

                const newR = Math.round(oldR / step) * step;
                const newG = Math.round(oldG / step) * step;
                const newB = Math.round(oldB / step) * step;

                d[i] = newR;
                d[i+1] = newG;
                d[i+2] = newB;

                const errR = oldR - newR;
                const errG = oldG - newG;
                const errB = oldB - newB;

                if (x + 1 < w) {
                   const ni = (y * w + x + 1) * 4;
                   d[ni] += errR * 7 / 16; d[ni+1] += errG * 7 / 16; d[ni+2] += errB * 7 / 16;
                }
                if (x - 1 >= 0 && y + 1 < h) {
                   const ni = ((y + 1) * w + x - 1) * 4;
                   d[ni] += errR * 3 / 16; d[ni+1] += errG * 3 / 16; d[ni+2] += errB * 3 / 16;
                }
                if (y + 1 < h) {
                   const ni = ((y + 1) * w + x) * 4;
                   d[ni] += errR * 5 / 16; d[ni+1] += errG * 5 / 16; d[ni+2] += errB * 5 / 16;
                }
                if (x + 1 < w && y + 1 < h) {
                   const ni = ((y + 1) * w + x + 1) * 4;
                   d[ni] += errR * 1 / 16; d[ni+1] += errG * 1 / 16; d[ni+2] += errB * 1 / 16;
                }
            }
        }
        ctx.putImageData(imageDataDither, 0, 0);
    }

    else if (tool === 'grain') {
        const noiseImg = ctx.getImageData(0,0,w,h);
        const d = noiseImg.data;
        const amount = effSettings.intensity * 1.5;

        for (let i = 0; i < d.length; i += 4) {
            if (d[i+3] === 0) continue;
            
            const noise = (Math.random() - 0.5) * amount;
            d[i] = Math.max(0, Math.min(255, d[i] + noise));
            d[i+1] = Math.max(0, Math.min(255, d[i+1] + noise));
            d[i+2] = Math.max(0, Math.min(255, d[i+2] + noise));
        }
        ctx.putImageData(noiseImg, 0, 0);
    }
    
    else if (tool === 'separation') {
        ctx.putImageData(imageData, 0, 0);
    }

    return canvas.toDataURL('image/png');
};
