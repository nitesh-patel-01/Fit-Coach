// modules/voiceEngine.js
// Wrapper around the browser's Web Speech API (speechSynthesis).
// - Queues messages so they don't overlap
// - Supports English + Hindi (basic)
// - Can be muted via setMuted(true) — useful when user prefers silent workouts
// - Selects best available voice for each language
// Note: Web Speech support varies — Chrome/Edge work great, Firefox is hit-or-miss.

class VoiceEngine {
  constructor() {
    this.muted = false;
    this.lang = 'en-IN';     // Indian English default
    this.rate = 1.0;
    this.pitch = 1.0;
    this.voicesReady = false;
    this.voices = [];
    this.preferredVoices = { en: null, hi: null };
    this.queue = [];
    this.speaking = false;

    this._init();
  }

  _init() {
    if (!('speechSynthesis' in window)) {
      console.warn('[Voice] speechSynthesis not supported in this browser');
      return;
    }
    // Voices may load asynchronously
    const loadVoices = () => {
      this.voices = window.speechSynthesis.getVoices();
      if (this.voices.length) {
        this.voicesReady = true;
        // Prefer Indian English voices: en-IN > any voice with "India" or "Indian" > en-GB > any en
        this.preferredVoices.en =
          this.voices.find(v => /en[-_]IN/i.test(v.lang)) ||
          this.voices.find(v => /india|indian|rishi|veena|neerja|prabhat|aarav/i.test(v.name)) ||
          this.voices.find(v => /en[-_]GB/i.test(v.lang)) ||  // British fallback (similar accent)
          this.voices.find(v => /en[-_]AU/i.test(v.lang)) ||  // Australian fallback
          this.voices.find(v => v.lang.startsWith('en'));     // Any English
        this.preferredVoices.hi =
          this.voices.find(v => /hi[-_]IN/i.test(v.lang)) ||
          this.voices.find(v => v.lang.startsWith('hi'));
        console.log('[Voice] Selected:', this.preferredVoices.en?.name || 'default', '(' + (this.preferredVoices.en?.lang || 'unknown') + ')');
      }
    };
    loadVoices();
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  setMuted(m) {
    this.muted = !!m;
    if (this.muted) this.cancel();
  }

  setLang(code) {
    this.lang = code.includes('-') ? code : (code === 'hi' ? 'hi-IN' : 'en-IN');
  }

  cancel() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    this.queue = [];
    this.speaking = false;
  }

  speak(text, opts = {}) {
    if (this.muted || !text || !('speechSynthesis' in window)) return;
    const lang = opts.lang || this.lang;
    if (opts.priority === 'now') this.cancel();
    this.queue.push({ text, lang });
    this._drain();
  }

  _drain() {
    if (this.speaking || !this.queue.length) return;
    const { text, lang } = this.queue.shift();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = this.rate;
    u.pitch = this.pitch;
    const langKey = lang.startsWith('hi') ? 'hi' : 'en';
    if (this.preferredVoices[langKey]) u.voice = this.preferredVoices[langKey];
    u.onend = () => { this.speaking = false; this._drain(); };
    u.onerror = () => { this.speaking = false; this._drain(); };
    this.speaking = true;
    window.speechSynthesis.speak(u);
  }

  countdown(n) {
    for (let i = n; i >= 1; i--) this.speak(String(i));
    this.speak('Go!');
  }
  announceRep(n) {
    if (n > 0 && n % 5 === 0) this.speak(`${n} reps done`);
  }
  formCue(text) { this.speak(text); }
  rest(seconds) { this.speak(`Rest for ${seconds} seconds`); }
  done() { this.speak('Set complete. Great work!'); }
}

export const Voice = new VoiceEngine();
