// lock-scroll.js
class ScrollLock {
  constructor() {
    this.locked = false;
    this.initialClientY = 0;
    this.enable();
  }

  enable() {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Touch devices
    document.addEventListener('touchstart', this.handleTouchStart, {passive: false});
    document.addEventListener('touchmove', this.handleTouchMove, {passive: false});
    
    // Desktop
    document.addEventListener('wheel', this.handleWheel, {passive: false});
    
    this.locked = true;
  }

  handleTouchStart = (e) => {
    this.initialClientY = e.touches[0].clientY;
  };

  handleTouchMove = (e) => {
    if (e.target.closest('.allow-scroll')) return;
    
    const clientY = e.touches[0].clientY - this.initialClientY;
    
    // Bloquea scroll vertical
    if (Math.abs(clientY) > 10) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  handleWheel = (e) => {
    if (e.target.closest('.allow-scroll')) return;
    if (e.ctrlKey) return; // Permite zoom
    
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
}

// Inicialización automática
new ScrollLock();
