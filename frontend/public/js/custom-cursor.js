/**
 * ==========================================================================
 * CUSTOM CIRCULAR CURSOR MODEL (custom-cursor.js)
 * Smooth 60FPS fluid follower circle cursor with interactive hover scaling.
 * ==========================================================================
 */

(function () {
    'use strict';

    // Disable custom cursor on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    let cursorDot = null;
    let cursorRing = null;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    /**
     * Initializes custom circular cursor elements
     */
    function initCustomCursor() {
        // Create inner dot
        cursorDot = document.createElement('div');
        cursorDot.className = 'custom-cursor-dot';
        document.body.appendChild(cursorDot);

        // Create outer follower ring
        cursorRing = document.createElement('div');
        cursorRing.className = 'custom-cursor-ring';
        document.body.appendChild(cursorRing);

        // Listen for mousemove
        window.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Direct instant position for inner dot
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        }, { passive: true });

        // Hover scaling triggers for buttons, links, and cards
        const hoverSelectors = 'a, button, input, select, textarea, .btn, .card, .navbar-brand, .role-tab-btn, .theme-toggle-btn';

        document.addEventListener('mouseover', function (e) {
            if (e.target.closest(hoverSelectors)) {
                cursorRing.classList.add('cursor-hover');
                cursorDot.classList.add('cursor-hover');
            }
        });

        document.addEventListener('mouseout', function (e) {
            if (e.target.closest(hoverSelectors)) {
                cursorRing.classList.remove('cursor-hover');
                cursorDot.classList.remove('cursor-hover');
            }
        });

        document.addEventListener('mouseleave', function () {
            cursorDot.style.opacity = '0';
            cursorRing.style.opacity = '0';
        });

        document.addEventListener('mouseenter', function () {
            cursorDot.style.opacity = '1';
            cursorRing.style.opacity = '1';
        });

        // Start continuous 60FPS fluid lerp loop for outer ring
        requestAnimationFrame(renderRing);
    }

    /**
     * Continuous 60FPS Lerp loop for outer circular ring
     */
    function renderRing() {
        if (cursorRing) {
            // Linear Interpolation for liquid follower motion (lerp 0.18)
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;

            cursorRing.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0)`;
        }

        requestAnimationFrame(renderRing);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCustomCursor);
    } else {
        initCustomCursor();
    }
})();
