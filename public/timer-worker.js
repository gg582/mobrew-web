// Simple timer Web Worker for the MoBrew standalone timer.
// Messages from main thread:
//   { type: 'start', durationSec: number, elapsedMs?: number }
//   { type: 'pause' }
//   { type: 'reset', durationSec?: number }
// Messages to main thread:
//   { type: 'tick', elapsedMs: number, remainingSec: number }
//   { type: 'complete' }

const TICK_MS = 100;

let timerId = null;
let durationSec = 0;
let startTime = 0;
let elapsedBefore = 0;
let running = false;

function post(type, payload = {}) {
  self.postMessage({ type, ...payload });
}

function tick() {
  if (!running) return;
  const now = performance.now();
  const elapsedMs = Math.min(elapsedBefore + (now - startTime), durationSec * 1000);
  const remainingSec = Math.max(0, durationSec - elapsedMs / 1000);
  post('tick', { elapsedMs, remainingSec });
  if (remainingSec <= 0) {
    running = false;
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    post('complete', {});
  }
}

self.onmessage = (event) => {
  const msg = event.data;
  if (!msg || typeof msg !== 'object' || !msg.type) return;

  switch (msg.type) {
    case 'start': {
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
      if (typeof msg.durationSec === 'number' && msg.durationSec > 0) {
        durationSec = msg.durationSec;
      }
      elapsedBefore = typeof msg.elapsedMs === 'number' && msg.elapsedMs > 0 ? msg.elapsedMs : 0;
      startTime = performance.now();
      running = true;
      tick();
      timerId = setInterval(tick, TICK_MS);
      break;
    }
    case 'pause': {
      if (running) {
        running = false;
        if (timerId !== null) {
          clearInterval(timerId);
          timerId = null;
        }
        elapsedBefore += performance.now() - startTime;
      }
      break;
    }
    case 'reset': {
      running = false;
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
      if (typeof msg.durationSec === 'number' && msg.durationSec > 0) {
        durationSec = msg.durationSec;
      }
      elapsedBefore = 0;
      post('tick', { elapsedMs: 0, remainingSec: durationSec });
      break;
    }
    default:
      break;
  }
};
