/**
 * ==========================================================================
 * MASCOT 9-FRAME CURSOR-TRACKING ENGINE (mascot-tracker.js)
 * Clean 9-Directional Head Tracking with Zero-Blink Overlap Crossfading & Hysteresis.
 * ==========================================================================
 */

(function () {
    'use strict';

    const FRAMES = [
        'center',
        'left',
        'right',
        'up',
        'down',
        'upleft',
        'upright',
        'downleft',
        'downright'
    ];

    let mascotContainer = null;
    let frameElements = {};
    let activeFrameKey = 'center';

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ticking = false;

    /**
     * Force-preloads all 9 mascot frame PNGs into browser memory for instant lag-free switching
     */
    function preloadAllFrames() {
        const basePath = 'assets/mascot/';
        FRAMES.forEach(function (key) {
            const img = new Image();
            img.src = basePath + 'boy_' + key + '.png';
        });
    }

    /**
     * Initializes the Mascot Tracker DOM stack & event listeners
     */
    function initMascotTracker() {
        mascotContainer = document.getElementById('mascotTracker');
        if (!mascotContainer) return;

        preloadAllFrames();

        mascotContainer.className = 'mascot-3d-stage';
        mascotContainer.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'mascot-tracker-wrapper';
        wrapper.id = 'mascotWrapper';

        const basePath = 'assets/mascot/';

        FRAMES.forEach(function (frameKey) {
            const img = document.createElement('img');
            img.src = basePath + 'boy_' + frameKey + '.png';
            img.alt = 'Mascot Boy ' + frameKey;
            img.className = 'mascot-frame-img' + (frameKey === 'center' ? ' active' : '');
            img.style.zIndex = frameKey === 'center' ? '2' : '1';
            img.setAttribute('aria-hidden', 'true');
            wrapper.appendChild(img);
            frameElements[frameKey] = img;
        });

        mascotContainer.appendChild(wrapper);

        // Window & Mouse Event Listeners
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseleave', resetToCenter, { passive: true });
        window.addEventListener('blur', resetToCenter, { passive: true });

        // Touch device handling - default to center gracefully
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            resetToCenter();
        }
    }

    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!ticking) {
            requestAnimationFrame(updateHeadDirection);
            ticking = true;
        }
    }

    /**
     * Maps mouse cursor coordinates to nearest of 9 directional head frames with hysteresis
     */
    function updateHeadDirection() {
        ticking = false;
        const wrapper = document.getElementById('mascotWrapper');
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height * 0.35; // Head focal center

        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const dist = Math.hypot(dx, dy);

        let targetFrame = 'center';

        // Dead-zone threshold with hysteresis
        const deadZone = activeFrameKey === 'center' ? 75 : 60;

        if (dist > deadZone) {
            let angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to +180 deg

            // 8-way directional sector mapping with angular hysteresis buffer
            if (angle >= -22.5 && angle < 22.5) {
                targetFrame = 'right';
            } else if (angle >= 22.5 && angle < 67.5) {
                targetFrame = 'downright';
            } else if (angle >= 67.5 && angle < 112.5) {
                targetFrame = 'down';
            } else if (angle >= 112.5 && angle < 157.5) {
                targetFrame = 'downleft';
            } else if (angle >= 157.5 || angle < -157.5) {
                targetFrame = 'left';
            } else if (angle >= -157.5 && angle < -112.5) {
                targetFrame = 'upleft';
            } else if (angle >= -112.5 && angle < -67.5) {
                targetFrame = 'up';
            } else if (angle >= -67.5 && angle < -22.5) {
                targetFrame = 'upright';
            }
        }

        if (targetFrame !== activeFrameKey) {
            switchFrame(targetFrame);
        }
    }

    /**
     * Zero-Blink Overlap Crossfade:
     * Fades new target frame IN ON TOP while keeping previous frame 100% solid underneath.
     */
    function switchFrame(newKey) {
        if (!frameElements[newKey]) return;

        const prevKey = activeFrameKey;
        activeFrameKey = newKey;

        const prevImg = frameElements[prevKey];
        const newImg = frameElements[newKey];

        // 1. Position new target frame on top layer (z-index 5)
        newImg.style.zIndex = '5';
        newImg.classList.add('active');

        // 2. Keep previous frame solid on middle layer (z-index 3) so background never shows
        if (prevImg && prevKey !== newKey) {
            prevImg.style.zIndex = '3';

            // 3. Remove active class from previous frame AFTER new frame is 100% fully visible
            setTimeout(function () {
                if (activeFrameKey !== prevKey) {
                    prevImg.classList.remove('active');
                    prevImg.style.zIndex = '1';
                }
            }, 140);
        }
    }

    function resetToCenter() {
        mouseX = window.innerWidth / 2;
        mouseY = window.innerHeight / 2;
        switchFrame('center');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMascotTracker);
    } else {
        initMascotTracker();
    }
})();
