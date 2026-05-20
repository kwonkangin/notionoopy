(function () {
  'use strict';

  const CONFIG = {
    debug: true,
    maxRetries: 24,
    retryDelay: 400,
    observerDuration: 12000,
    settleDelay: 120,
    rootSelectors: [
      '.notion-page-content',
      '.notion-page-content-inner',
      '[class*="notion-page"]',
      'main',
      'body'
    ],
    itemSelectors: [
      '[data-merge-key]',
      '[data-oopy-merge]',
      '[data-merge-group]'
    ]
  };

  const STATE = {
    started: false,
    done: false,
    retries: 0,
    observer: null,
    retryTimer: null,
    settleTimer: null,
    stopObserverTimer: null,
    processing: false,
    lastSignature: ''
  };

  function log() {
    if (!CONFIG.debug) return;
    console.log('[oopy-merge]', ...arguments);
  }

  function getRoot() {
    for (const selector of CONFIG.rootSelectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return document.body || document.documentElement;
  }

  function getMergeItems(root) {
    return root.querySelectorAll(CONFIG.itemSelectors.join(','));
  }

  function getMergeKey(el) {
    return (
      el.getAttribute('data-merge-key') ||
      el.getAttribute('data-oopy-merge') ||
      el.getAttribute('data-merge-group') ||
      ''
    ).trim();
  }

  function isReady(root) {
    if (!root) return false;
    return document.readyState === 'interactive' || document.readyState === 'complete';
  }

  function cleanup() {
    if (STATE.observer) {
      STATE.observer.disconnect();
      STATE.observer = null;
    }

    if (STATE.retryTimer) {
      clearTimeout(STATE.retryTimer);
      STATE.retryTimer = null;
    }

    if (STATE.settleTimer) {
      clearTimeout(STATE.settleTimer);
      STATE.settleTimer = null;
    }

    if (STATE.stopObserverTimer) {
      clearTimeout(STATE.stopObserverTimer);
      STATE.stopObserverTimer = null;
    }
  }

  function makeSignature(items) {
    const parts = [];
    items.forEach((el) => {
      const key = getMergeKey(el);
      if (!key) return;
      parts.push(key + ':' + (el.textContent || '').trim().slice(0, 50));
    });
    return parts.join('|');
  }

  function markMerged(container, key) {
    container.dataset.oopyMergeDone = 'true';
    container.dataset.oopyMergeKey = key;
  }

  function isMerged(container, key) {
    return (
      container.dataset.oopyMergeDone === 'true' &&
      container.dataset.oopyMergeKey === key
    );
  }

  function createWrapper(key) {
    const wrap = document.createElement('div');
    wrap.className = 'oopy-merged-group';
    wrap.dataset.oopyMergedGroup = key;
    wrap.style.display = 'block';
    wrap.style.width = '100%';
    return wrap;
  }

  function createSectionTitle(sourceEl, key) {
    const title = document.createElement('div');
    title.className = 'oopy-merged-title';
    title.dataset.oopyMergedTitle = key;
    title.textContent = sourceEl.getAttribute('data-merge-title') || key;
    title.style.fontWeight = '700';
    title.style.margin = '0 0 8px';
    title.style.display = 'block';
    return title;
  }

  function createBodyWrap() {
    const body = document.createElement('div');
    body.className = 'oopy-merged-body';
    body.style.display = 'block';
    body.style.width = '100%';
    return body;
  }

  function cloneChildrenForMerge(el) {
    const frag = document.createDocumentFragment();

    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const cloned = node.cloneNode(true);
        frag.appendChild(cloned);
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) frag.appendChild(document.createTextNode(text));
      }
    });

    return frag;
  }

  function mergeGroup(group, key) {
    if (!group || group.length < 2) return false;

    const first = group[0];
    const parent = first.parentElement;
    if (!parent) return false;

    if (isMerged(first, key)) {
      log('already merged key =', key);
      return false;
    }

    const wrapper = createWrapper(key);
    const title = createSectionTitle(first, key);
    const body = createBodyWrap();

    wrapper.appendChild(title);
    wrapper.appendChild(body);

    group.forEach((item, index) => {
      if (item.dataset.oopyMergeSourceHandled === 'true') return;

      const block = document.createElement('div');
      block.className = 'oopy-merged-item';
      block.dataset.oopyMergedItem = key;
      block.style.display = 'block';
      block.style.margin = index === 0 ? '0' : '12px 0 0';

      const content = cloneChildrenForMerge(item);
      if (!content.childNodes.length) return;

      block.appendChild(content);
      body.appendChild(block);
      item.dataset.oopyMergeSourceHandled = 'true';
    });

    if (!body.childNodes.length) return false;

    first.innerHTML = '';
    first.appendChild(wrapper);
    markMerged(first, key);

    for (let i = 1; i < group.length; i += 1) {
      group[i].style.display = 'none';
      group[i].dataset.oopyMergeHidden = 'true';
    }

    return true;
  }

  function renderMerge(root) {
    const items = Array.from(getMergeItems(root)).filter((el) => {
      const key = getMergeKey(el);
      return !!key && el.dataset.oopyMergeHidden !== 'true';
    });

    if (!items.length) {
      log('merge targets not found');
      return false;
    }

    const signature = makeSignature(items);
    if (signature && signature === STATE.lastSignature) {
      log('same signature, skip');
      return false;
    }

    const groups = new Map();

    items.forEach((el) => {
      const key = getMergeKey(el);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });

    let mergedCount = 0;

    groups.forEach((group, key) => {
      if (group.length < 2) return;
      const ok = mergeGroup(group, key);
      if (ok) mergedCount += 1;
    });

    STATE.lastSignature = signature;

    if (mergedCount > 0) {
      log('merged group count =', mergedCount);
      return true;
    }

    log('nothing merged');
    return false;
  }

  function tryRender(source) {
    if (STATE.processing) return false;

    const root = getRoot();
    if (!isReady(root)) {
      log('not ready from', source, 'readyState=', document.readyState);
      return false;
    }

    STATE.processing = true;

    try {
      log('try render from', source);
      const changed = renderMerge(root);

      if (changed) {
        STATE.done = true;
        cleanup();
        log('render complete from', source);
        return true;
      }
    } catch (err) {
      console.error('[oopy-merge] render error:', err);
    } finally {
      STATE.processing = false;
    }

    return false;
  }

  function scheduleRetry() {
    if (STATE.done) return;
    if (STATE.retries >= CONFIG.maxRetries) {
      log('max retries reached');
      return;
    }

    STATE.retries += 1;

    STATE.retryTimer = setTimeout(() => {
      if (!tryRender('retry-' + STATE.retries)) {
        scheduleRetry();
      }
    }, CONFIG.retryDelay);
  }

  function scheduleSettledRender(source) {
    if (STATE.done) return;

    if (STATE.settleTimer) clearTimeout(STATE.settleTimer);

    STATE.settleTimer = setTimeout(() => {
      tryRender(source + '-settled');
    }, CONFIG.settleDelay);
  }

  function startObserver() {
    if (STATE.observer || STATE.done) return;

    STATE.observer = new MutationObserver(() => {
      scheduleSettledRender('mutation');
    });

    STATE.observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    STATE.stopObserverTimer = setTimeout(() => {
      if (STATE.observer && !STATE.done) {
        STATE.observer.disconnect();
        STATE.observer = null;
        log('observer stopped by timeout');
      }
    }, CONFIG.observerDuration);

    log('observer started');
  }

  function injectStyle() {
    if (document.getElementById('oopy-merge-style')) return;

    const style = document.createElement('style');
    style.id = 'oopy-merge-style';
    style.textContent = `
      .oopy-merged-group {
        display: block;
        width: 100%;
      }
      .oopy-merged-title {
        font-weight: 700;
        margin-bottom: 8px;
      }
      .oopy-merged-body {
        display: block;
        width: 100%;
      }
      .oopy-merged-item {
        display: block;
        width: 100%;
      }
    `;
    document.head.appendChild(style);
  }

  function boot() {
    if (STATE.started) return;
    STATE.started = true;

    injectStyle();
    log('boot start / readyState =', document.readyState);

    if (tryRender('boot-immediate')) return;

    startObserver();
    scheduleRetry();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  document.addEventListener('readystatechange', function () {
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      scheduleSettledRender('readystatechange');
    }
  });

  window.addEventListener('load', function () {
    tryRender('window-load');
  }, { once: true });

})();
