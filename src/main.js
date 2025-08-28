
const getKey = () => {
    try {
        
        if (typeof config === 'object' && config && typeof config.key === 'string' && config.key.trim()) {
            return config.key.trim();
        }
    } catch (_) { /* ignore */ }
    return '...';
};

document.addEventListener('DOMContentLoaded', () => {
  const key = (window.config && window.config.key) || '...';
  const keyEl = document.getElementById('overlay-key');
  if (keyEl) keyEl.textContent = key;

  const pill = document.getElementById('overlay-text');
  const btn = document.getElementById('copy-ca');

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      if (btn) {
        const old = btn.textContent;
        btn.textContent = 'Copied';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 1200);
      }
    } catch {
      
      if (window.getSelection && keyEl) {
        const range = document.createRange();
        range.selectNodeContents(keyEl);
        const sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(range);
      }
      alert('Copy failed. Please copy manually.');
    }
  }

  if (btn && keyEl) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      copy(keyEl.textContent || '');
    });
  }
  if (pill && keyEl) {
    pill.addEventListener('click', () => copy(keyEl.textContent || ''));
    pill.title = 'Click to copy CA';
  }

  
  const video = document.getElementById('main-video');
  const soundBtn = document.getElementById('sound-toggle');
  if (video && soundBtn) {
    
    const updateSoundUI = (hint) => {
      const muted = !!video.muted;
      soundBtn.textContent = muted ? '🔇' : '🔊';
      soundBtn.setAttribute('aria-pressed', String(!muted));
      soundBtn.title = muted ? 'Unmute' : 'Mute';
      if (hint) {
        const old = soundBtn.textContent;
        soundBtn.textContent = hint;
        setTimeout(() => { soundBtn.textContent = muted ? '🔇' : '🔊'; }, 900);
      }
    };

    
    video.muted = true; 
    const playOverlay = document.getElementById('play-overlay');
    video.play().then(() => {
      
      if (playOverlay) playOverlay.style.display = 'none';
    }).catch(() => {
      
      console.warn('Autoplay blocked or play failed on load');
      if (playOverlay) playOverlay.style.display = 'flex';
    });

    
    if (playOverlay) {
      video.addEventListener('playing', () => { playOverlay.style.display = 'none'; });
      playOverlay.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        
        try {
          video.muted = false;
          await video.play();
          playOverlay.style.display = 'none';
          updateSoundUI();
          return;
        } catch (err) {
          console.warn('Play with sound blocked; falling back to muted play', err);
        }
        
        try {
          video.muted = true;
          await video.play();
          playOverlay.style.display = 'none';
          updateSoundUI();
        } catch (err2) {
          console.error('Play failed entirely', err2);
        }
      });
      
      playOverlay.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); playOverlay.click(); }
      });
    }

    
    updateSoundUI();

    soundBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (video.muted) {
        
        video.muted = false;
        try {
          await video.play();
        } catch (err) {
          
          console.warn('Play with sound blocked:', err);
          video.muted = true;
          updateSoundUI('Click to enable');
          return;
        }
      } else {
        video.muted = true;
      }
      updateSoundUI();
    });
  }
});