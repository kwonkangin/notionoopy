/*
  notion-tab-engine.js (v15.1)
  ------------------------------------------------------------------
  Notion 순수 탭 + 콜아웃 + 갤러리 엔진
  변수 접미사: _R8w

  v15.1 변경점 (v15 대비)
  1) --tabRadius_R8w 가 Notion 자체 CSS의 !important 에 밀려 적용되지 않던 문제 수정
     -> border-radius 만 별도로 !important 로 강제 적용
  2) hover 끄기(--tabHoverOn_R8w: 0) 방식 변경
     -> 기존: :hover 규칙을 유지한 채 inherit 값으로 "취소" 시도 (부정확함)
     -> 변경: :not([data-tab-hover-off_R8w="1"]) 선택자로 hover 규칙 자체가
        아예 걸리지 않도록 변경. 취소용 별도 규칙 제거.
  나머지 로직은 v15과 100% 동일.
*/
(function notionTabEngineV15_1_R8w() {
  'use strict';

  const V = '_R8w';
  const MOBILE_BREAKPOINT = 768;
  const HOVER_STYLE_ID = 'notion-tab-engine-hover-style_R8w';
  const initialized = new WeakSet();
  const instances = new WeakMap();

  const css = (name, fallback) => `var(--${name}${V}, ${fallback})`;

  function setStyle(el, map, important = false) {
    if (!el) return;
    Object.entries(map).forEach(([property, value]) => {
      el.style.setProperty(property, value, important ? 'important' : '');
    });
  }

  function removeStyle(el, properties) {
    if (!el) return;
    properties.forEach(property => el.style.removeProperty(property));
  }

  function findParts(root) {
    const tablist = root.querySelector('[role="tablist"]');
    const panel = root.querySelector('[role="tabpanel"]');
    if (!tablist || !panel) return null;

    let wrap = tablist;
    while (wrap.parentElement && wrap.parentElement !== root) wrap = wrap.parentElement;

    const paddingWrap = wrap.firstElementChild || wrap;
    const firstTab = tablist.querySelector('[role="tab"]');
    const tabRow = firstTab ? firstTab.parentElement : tablist;

    return { root, wrap, paddingWrap, tablist, tabRow, panel };
  }

  function getTabs(inst) {
    return Array.from(inst.tablist.querySelectorAll('[role="tab"]'));
  }

  function readConfig(root) {
    let config = { default: 'scroll' };
    try {
      if (root.dataset.tabOverflowConfig) {
        config = Object.assign(config, JSON.parse(root.dataset.tabOverflowConfig));
      }
    } catch (error) {
      console.warn('[notion-tab-engine v15.1] data-tab-overflow-config 파싱 실패:', error);
    }
    const threshold = Number(root.dataset.tabOverflowThreshold || 0);
    return { config, threshold: Number.isFinite(threshold) ? threshold : 0 };
  }

  function getMode(inst) {
    const { config, threshold } = readConfig(inst.root);
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    let mode = isMobile && config.mobile ? config.mobile : config.default;

    if (threshold > 0 && getTabs(inst).length > threshold && config.overThreshold) {
      mode = config.overThreshold;
    }
    return ['scroll', 'wrap', 'more-dropdown', 'select'].includes(mode) ? mode : 'scroll';
  }

  function addHoverCss() {
    if (document.getElementById(HOVER_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = HOVER_STYLE_ID;
    /*
      v15.1: hover 규칙 자체를 :not([data-tab-hover-off_R8w="1"]) 로 감싸서,
      hover 끄기 상태에서는 이 규칙이 매칭되지 않도록 함.
      (v15 처럼 inherit 로 "취소"하는 별도 규칙이 필요 없어짐)
    */
    style.textContent = `
      .notion-tab-block .tabEngine-tab_R8w {
        transition: var(--tabHoverTransition_R8w, 160ms ease) !important;
        will-change: transform, background-color, color, border-color, box-shadow;
      }
      .notion-tab-block .tabEngine-tab_R8w[aria-selected="false"]:not([data-tab-hover-off_R8w="1"]):hover {
        background: var(--tabHoverBg_R8w, transparent) !important;
        color: var(--tabHoverText_R8w, inherit) !important;
        border: var(--tabHoverBorder_R8w, none) !important;
        box-shadow: var(--tabHoverShadow_R8w, none) !important;
        transform: translateY(calc(-1 * var(--tabHoverLift_R8w, 0px))) !important;
      }
      .notion-tab-block .tabEngine-tab_R8w[aria-selected="false"]:not([data-tab-hover-off_R8w="1"]):hover > * {
        color: inherit !important;
      }
    `;
    document.head.appendChild(style);
  }

  function applyContainer(inst) {
    const { root, wrap, paddingWrap, tablist, tabRow, panel } = inst;

    setStyle(wrap, {
      border: css('tabWrapBorderFinal', 'none'),
      background: css('tabWrapBgFinal', 'transparent'),
      'border-radius': css('tabWrapRadius', '0px'),
      'box-shadow': css('tabWrapShadow', 'none'),
      'box-sizing': 'border-box',
      position: 'relative'
    });

    [root, wrap, paddingWrap, tablist, tabRow].forEach(el => {
      setStyle(el, {
        width: '100%',
        'max-width': 'none',
        'min-width': '0',
        'box-sizing': 'border-box'
      });
    });

    setStyle(paddingWrap, { padding: css('tabListPadding', '0px 16px 16px') });
    setStyle(panel, {
      padding: css('tabPanelPadding', '0px 16px 16px'),
      'box-sizing': 'border-box'
    });
  }

  function isTabFillEnabled(inst) {
    return getComputedStyle(inst.root).getPropertyValue(`--tabFill${V}`).trim() === '1';
  }

  function isHoverEnabled(inst) {
    const value = getComputedStyle(inst.root).getPropertyValue(`--tabHoverOn${V}`).trim();
    return value !== '0';
  }

  function applyTabs(inst) {
    const fill = isTabFillEnabled(inst);
    const hoverEnabled = isHoverEnabled(inst);

    setStyle(inst.tabRow, {
      gap: `${css('tabGapY', '8px')} ${css('tabGapX', '12px')}`,
      'justify-content': css('tabJustify', 'flex-start'),
      'align-items': 'center'
    });

    getTabs(inst).forEach(tab => {
      const active = tab.getAttribute('aria-selected') === 'true';
      tab.classList.add('tabEngine-tab_R8w');
      if (hoverEnabled) delete tab.dataset.tabHoverOff_R8w;
      else tab.dataset.tabHoverOff_R8w = '1';

      setStyle(tab, {
        flex: fill ? '1 1 0px' : '0 0 auto',
        'min-width': css('tabMinWidth', '0px'),
        'min-inline-size': '0px',
        'max-width': 'none',
        padding: css('tabPad', '6px 10px'),
        'box-sizing': 'border-box',
        background: active ? css('activeTabBg', 'rgba(55,53,47,0.06)') : css('tabBg', 'transparent'),
        color: active ? css('activeTabText', 'inherit') : css('tabText', 'inherit'),
        'font-family': active ? css('activeTabFontFamily', 'inherit') : css('tabFontFamily', 'inherit'),
        'font-size': active ? css('activeTabFontSize', 'inherit') : css('tabFontSize', 'inherit'),
        'font-weight': active ? css('activeTabFontWeight', 'inherit') : css('tabFontWeight', 'inherit'),
        'line-height': '1.45',
        'white-space': css('tabWrapLong', 'nowrap'),
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        transition: css('tabHoverTransition', '160ms ease')
      });

      /* v15.1: border-radius 는 Notion 기본 CSS의 !important 를 이기기 위해 별도로 강제 적용 */
      tab.style.setProperty('border-radius', css('tabRadius', '999px'), 'important');

      const inner = tab.firstElementChild || tab;
      setStyle(inner, {
        color: 'inherit',
        font: 'inherit',
        'white-space': 'inherit',
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        'min-width': '0'
      });
    });
  }

  function applyPanel(inst) {
    const children = Array.from(inst.panel.children);
    let previous = null;

    children.forEach(child => {
      const blank = child.matches?.('.notion-text-block') && !child.textContent.trim();
      if (blank) return;
      if (previous) previous.style.setProperty('margin-bottom', css('panelBlockGap', '28px'));
      previous = child;
    });
    if (previous) previous.style.setProperty('margin-bottom', '0px');

    inst.panel.querySelectorAll('.notion-callout-block').forEach(callout => {
      setStyle(callout, {
        display: css('calloutDisplay', 'block'),
        'margin-top': '0px',
        'margin-bottom': '0px'
      });

      const content = callout.querySelector('[class*="CalloutBlock-module"][class*="content"]') || callout.firstElementChild?.firstElementChild || callout;
      setStyle(content, {
        background: css('calloutBg', 'transparent'),
        border: css('calloutBorder', 'none'),
        'border-radius': css('calloutRadius', '20px'),
        'box-shadow': css('calloutShadow', 'none'),
        padding: css('calloutPad', '22px'),
        'box-sizing': 'border-box'
      });

      callout.querySelectorAll('.notion-sub_sub_header-block, .notion-sub_sub_header-block h4').forEach(title => {
        setStyle(title, {
          'font-family': css('calloutTitleFamily', 'inherit'),
          'font-size': css('calloutTitleSize', 'inherit'),
          'font-weight': css('calloutTitleWeight', 'inherit'),
          color: css('calloutTitleColor', 'inherit'),
          'line-height': '1.35'
        });
      });

      Array.from(callout.querySelectorAll('.notion-text-block')).forEach(desc => {
        if (desc.closest('.notion-sub_sub_header-block')) return;
        setStyle(desc, {
          'font-family': css('calloutDescFamily', 'inherit'),
          'font-size': css('calloutDescSize', 'inherit'),
          'font-weight': css('calloutDescWeight', 'inherit'),
          color: css('calloutDescColor', 'inherit'),
          'line-height': '1.6'
        });
      });
    });
  }

  function wheelAllowed(inst) {
    return inst.root.dataset.tabWheelScroll !== '0';
  }

  function wheelMultiplier(inst) {
    const value = Number(inst.root.dataset.tabWheelSpeed || 1);
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  function bindWheel(inst) {
    if (inst.wheelBound) return;
    inst.tablist.addEventListener('wheel', event => {
      if (!wheelAllowed(inst)) return;
      if (!['scroll', 'more-dropdown'].includes(inst.mode)) return;
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!delta) return;
      event.preventDefault();
      inst.tablist.scrollLeft += delta * wheelMultiplier(inst);
    }, { passive: false });
    inst.wheelBound = true;
  }

  function resetModeStyle(inst) {
    const tablistProps = ['overflow', 'overflow-x', 'overflow-y', 'height', 'max-height', 'min-height', 'width', 'min-width'];
    const tabRowProps = ['display', 'flex-wrap', 'height', 'max-height', 'min-height', 'width', 'min-width'];

    removeStyle(inst.tablist, tablistProps);
    removeStyle(inst.tabRow, tabRowProps);

    getTabs(inst).forEach(tab => tab.style.removeProperty('display'));

    if (inst.moreButton) inst.moreButton.remove();
    if (inst.moreMenu) inst.moreMenu.remove();
    if (inst.selectButton) inst.selectButton.remove();
    if (inst.selectMenu) inst.selectMenu.remove();

    inst.moreButton = null;
    inst.moreMenu = null;
    inst.selectButton = null;
    inst.selectMenu = null;

    inst.tablist.style.removeProperty('display');
  }

  function applyPopupStyle(el) {
    setStyle(el, {
      background: css('overflowMenuBg', '#ffffff'),
      border: css('overflowMenuBorder', '1px solid rgba(55,53,47,0.16)'),
      'border-radius': css('overflowMenuRadius', '6px'),
      'box-shadow': css('overflowMenuShadow', 'none'),
      color: css('overflowTextColor', '#37352f'),
      'font-family': css('overflowFontFamily', 'inherit'),
      'font-size': css('overflowFontSize', '14px'),
      'font-weight': css('overflowFontWeight', '400'),
      'box-sizing': 'border-box'
    });
  }

  function applyPopupButtonStyle(el) {
    setStyle(el, {
      background: css('overflowBtnBg', '#ffffff'),
      border: css('overflowBtnBorder', '1px solid rgba(55,53,47,0.16)'),
      'border-radius': css('overflowBtnRadius', '6px'),
      color: css('overflowTextColor', '#37352f'),
      'font-family': css('overflowFontFamily', 'inherit'),
      'font-size': css('overflowFontSize', '14px'),
      'font-weight': css('overflowFontWeight', '400'),
      'box-sizing': 'border-box',
      cursor: 'pointer'
    });
  }

  function addPopupItem(menu, tab, active, onSelect) {
    const item = document.createElement('div');
    item.textContent = tab.textContent.trim();

    setStyle(item, {
      padding: css('overflowItemPad', '8px 12px'),
      cursor: 'pointer',
      'border-radius': '4px',
      color: css('overflowTextColor', '#37352f'),
      font: 'inherit',
      'white-space': 'nowrap',
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      background: active ? css('overflowActive', 'rgba(35,131,226,0.08)') : 'transparent',
      'font-weight': active ? '600' : 'inherit'
    });

    item.addEventListener('mouseenter', () => {
      if (!active) item.style.setProperty('background', css('overflowHover', 'rgba(55,53,47,0.06)'));
    });
    item.addEventListener('mouseleave', () => {
      if (!active) item.style.setProperty('background', 'transparent');
    });
    item.addEventListener('pointerdown', event => {
      event.preventDefault();
      event.stopPropagation();
      onSelect();
    });
    menu.appendChild(item);
  }

  function getContentBounds(inst) {
    const candidate = inst.panel.querySelector('.notion-callout-block, .notion-collection_view-block, .notion-text-block');
    if (candidate) {
      const rect = candidate.getBoundingClientRect();
      if (rect.width > 0) return { left: rect.left, right: rect.right };
    }

    const rect = inst.panel.getBoundingClientRect();
    const styles = getComputedStyle(inst.panel);
    return {
      left: rect.left + (parseFloat(styles.paddingLeft) || 0),
      right: rect.right - (parseFloat(styles.paddingRight) || 0)
    };
  }

  function positionFullWidthMenu(inst, button, menu) {
    const buttonRect = button.getBoundingClientRect();
    const wrapRect = inst.wrap.getBoundingClientRect();
    const bounds = getContentBounds(inst);

    setStyle(menu, {
      top: `${buttonRect.bottom - wrapRect.top + 4}px`,
      left: `${bounds.left - wrapRect.left}px`,
      width: `${bounds.right - bounds.left}px`,
      right: 'auto'
    });
  }

  function positionSelectMenu(inst, button, menu) {
    const buttonRect = button.getBoundingClientRect();
    const wrapRect = inst.wrap.getBoundingClientRect();

    setStyle(menu, {
      top: `${buttonRect.bottom - wrapRect.top + 4}px`,
      left: `${buttonRect.left - wrapRect.left}px`,
      width: `${buttonRect.width}px`,
      right: 'auto'
    });
  }

  function applyScrollMode(inst) {
    setStyle(inst.tablist, {
      'overflow-x': 'auto',
      'overflow-y': 'hidden',
      height: 'auto'
    }, true);
    setStyle(inst.tabRow, {
      display: 'flex',
      'flex-wrap': 'nowrap',
      width: 'max-content',
      'min-width': '100%'
    }, true);
    bindWheel(inst);
  }

  function applyWrapMode(inst) {
    setStyle(inst.tablist, {
      display: 'block',
      overflow: 'visible',
      'overflow-x': 'visible',
      'overflow-y': 'visible',
      width: '100%',
      'min-width': '0',
      height: 'auto',
      'min-height': '0',
      'max-height': 'none'
    }, true);

    setStyle(inst.tabRow, {
      display: 'flex',
      'flex-wrap': 'wrap',
      width: '100%',
      'min-width': '0',
      height: 'auto',
      'min-height': '0',
      'max-height': 'none'
    }, true);
  }

  function applyMoreMode(inst) {
    applyScrollMode(inst);

    const tabs = getTabs(inst);
    const availableWidth = inst.tablist.getBoundingClientRect().width;
    let usedWidth = 0;
    const hiddenTabs = [];

    tabs.forEach(tab => {
      const tabWidth = tab.getBoundingClientRect().width;
      if (usedWidth + tabWidth <= availableWidth * 0.84) usedWidth += tabWidth;
      else hiddenTabs.push(tab);
    });
    if (!hiddenTabs.length) return;

    hiddenTabs.forEach(tab => tab.style.setProperty('display', 'none'));

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${inst.root.dataset.tabMoreLabel || '더보기'} ▾`;
    setStyle(button, {
      'margin-left': '4px',
      padding: '6px 12px',
      'white-space': 'nowrap',
      'flex-shrink': '0'
    });
    applyPopupButtonStyle(button);

    const menu = document.createElement('div');
    setStyle(menu, {
      position: 'absolute',
      display: 'none',
      'z-index': '1000',
      padding: '6px',
      'max-height': css('overflowMenuMaxHeight', '280px'),
      'overflow-y': 'auto'
    });
    applyPopupStyle(menu);

    hiddenTabs.forEach(tab => {
      addPopupItem(menu, tab, false, () => {
        tab.click();
        menu.style.display = 'none';
      });
    });

    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      event.stopPropagation();
      if (menu.style.display === 'none') {
        positionFullWidthMenu(inst, button, menu);
        menu.style.display = 'block';
      } else {
        menu.style.display = 'none';
      }
    });

    inst.tabRow.appendChild(button);
    inst.wrap.appendChild(menu);
    inst.moreButton = button;
    inst.moreMenu = menu;
  }

  function applySelectMode(inst) {
    setStyle(inst.tablist, { display: 'none' }, true);

    const tabs = getTabs(inst);
    const activeTab = tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0];

    const button = document.createElement('button');
    button.type = 'button';
    setStyle(button, {
      width: '100%',
      height: '35px',
      padding: '0 12px',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'space-between',
      gap: '8px'
    });
    applyPopupButtonStyle(button);

    const label = document.createElement('span');
    label.textContent = activeTab ? activeTab.textContent.trim() : '';
    setStyle(label, {
      'min-width': '0',
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      'white-space': 'nowrap'
    });

    const icon = document.createElement('span');
    icon.textContent = '▾';
    setStyle(icon, { 'flex-shrink': '0', opacity: '0.7' });
    button.append(label, icon);

    const menu = document.createElement('div');
    setStyle(menu, {
      position: 'absolute',
      display: 'none',
      'z-index': '1000',
      padding: '6px',
      'max-height': css('overflowMenuMaxHeight', '280px'),
      'overflow-y': 'auto'
    });
    applyPopupStyle(menu);

    tabs.forEach(tab => {
      addPopupItem(menu, tab, tab === activeTab, () => {
        tab.click();
        label.textContent = tab.textContent.trim();
        menu.style.display = 'none';
      });
    });

    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      event.stopPropagation();
      if (menu.style.display === 'none') {
        positionSelectMenu(inst, button, menu);
        menu.style.display = 'block';
      } else {
        menu.style.display = 'none';
      }
    });

    inst.tablist.parentElement.insertBefore(button, inst.tablist);
    inst.wrap.appendChild(menu);
    inst.selectButton = button;
    inst.selectMenu = menu;
  }

  function applyMode(inst) {
    resetModeStyle(inst);
    applyTabs(inst);
    inst.mode = getMode(inst);

    if (inst.mode === 'wrap') applyWrapMode(inst);
    else if (inst.mode === 'more-dropdown') applyMoreMode(inst);
    else if (inst.mode === 'select') applySelectMode(inst);
    else applyScrollMode(inst);
  }

  function applyAll(inst) {
    const fresh = findParts(inst.root);
    if (!fresh) return;

    Object.assign(inst, fresh);
    applyContainer(inst);
    applyPanel(inst);
    applyMode(inst);
  }

  function scheduleApply(inst) {
    if (inst.frame) cancelAnimationFrame(inst.frame);
    inst.frame = requestAnimationFrame(() => {
      inst.frame = 0;
      applyAll(inst);
    });
  }

  function init(root) {
    if (initialized.has(root)) return;

    const parts = findParts(root);
    if (!parts) return;

    const inst = {
      ...parts,
      mode: 'scroll',
      wheelBound: false,
      moreButton: null,
      moreMenu: null,
      selectButton: null,
      selectMenu: null,
      frame: 0
    };

    initialized.add(root);
    instances.set(root, inst);
    addHoverCss();
    applyAll(inst);

    const resizeObserver = new ResizeObserver(() => scheduleApply(inst));
    resizeObserver.observe(root);

    const attrObserver = new MutationObserver(() => scheduleApply(inst));
    attrObserver.observe(root, {
      attributes: true,
      attributeFilter: [
        'data-tab-overflow-config',
        'data-tab-overflow-threshold',
        'data-tab-wheel-scroll',
        'data-tab-wheel-speed',
        'data-tab-more-label'
      ]
    });

    const contentObserver = new MutationObserver(records => {
      const shouldApply = records.some(record => {
        if (record.type === 'childList') return true;
        return record.type === 'attributes' && record.attributeName === 'aria-selected';
      });
      if (shouldApply) scheduleApply(inst);
    });
    contentObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-selected']
    });

    document.addEventListener('pointerdown', event => {
      const menus = [inst.moreMenu, inst.selectMenu].filter(Boolean);
      const buttons = [inst.moreButton, inst.selectButton].filter(Boolean);
      const onButton = buttons.some(button => button === event.target || button.contains(event.target));

      menus.forEach(menu => {
        if (menu.style.display !== 'none' && !menu.contains(event.target) && !onButton) {
          menu.style.display = 'none';
        }
      });
    });
  }

  function scan(scope = document) {
    if (scope.matches?.('.notion-tab-block')) init(scope);
    scope.querySelectorAll?.('.notion-tab-block').forEach(init);
  }

  function boot() {
    addHoverCss();
    scan(document);

    const observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if (node.nodeType === 1) scan(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();