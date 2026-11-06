/**
 * SleekFlow WhatsApp Button — placement-configurable build
 * --------------------------------------------------------
 * Drop-in replacement for https://sleekflow.io/whatsapp-button.js with support
 * for all four viewport corners.
 *
 *   <script src="https://jabircode.github.io/sleekflow-whatsapp-widget/whatsapp-button.js"
 *           async
 *           onload="whatsappButton({ position: 'top-left', ... })"></script>
 *
 * position: 'bottom-right' (default) | 'bottom-left' | 'top-right' | 'top-left'
 * aliases:  'right' | 'left' | 'br' | 'bl' | 'tr' | 'tl'
 * legacy:   buttonPosition: 'left' | 'right'  (maps to the bottom corners)
 *
 * Optional: offsetX (default 40px desktop / 24px mobile), offsetY (default 0),
 *           zIndex (default 99999).
 *
 * Everything else is unchanged from the official widget.
 */
(function () {
  'use strict';

  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof HTMLElement === 'undefined') {
    return;
  }

  var TAG = 'sleekflow-whatsapp-widget';

  if (customElements.get(TAG)) {
    console.warn('[whatsapp-button] <' + TAG + '> is already defined — is the official script also on the page?');
    return;
  }

  /* ---------------------------------------------------------------- icons */

  var WHATSAPP_ICON =
    '<svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">' +
    '<path d="m.76 21.24 1.412-5.12A10.324 10.324 0 0 1 .76 10.93C.76 5.35 5.35.76 10.964.76 16.58.76 21.24 5.35 21.24 10.93c0 5.578-4.661 10.31-10.276 10.31-1.765 0-3.46-.565-4.978-1.413L.76 21.24Z" fill="#EDEDED"/>' +
    '<path d="m6.268 17.991.318.177c1.307.812 2.825 1.306 4.414 1.306 4.626 0 8.474-3.848 8.474-8.545 0-4.696-3.848-8.404-8.51-8.404-4.66 0-8.439 3.743-8.439 8.404 0 1.624.46 3.213 1.307 4.555l.212.318-.812 2.966 3.036-.777Z" fill="#25D366"/>' +
    '<path d="m8.245 6.198-.671-.036a.802.802 0 0 0-.565.212c-.318.283-.848.812-.989 1.519-.247 1.059.141 2.33 1.06 3.601.918 1.271 2.683 3.32 5.79 4.202.989.283 1.766.106 2.402-.282.494-.318.812-.812.918-1.342l.105-.494a.355.355 0 0 0-.176-.389l-2.225-1.024a.337.337 0 0 0-.423.106l-.883 1.13a.275.275 0 0 1-.283.07c-.6-.211-2.613-1.059-3.707-3.177-.036-.106-.036-.212.035-.283l.848-.953c.07-.106.105-.247.07-.353L8.527 6.41a.308.308 0 0 0-.282-.212Z" fill="#FEFEFE"/>' +
    '</svg>';

  var CLOSE_ICON =
    '<svg viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">' +
    '<path d="m2.674.569.106.093 4.754 4.754L12.288.662a1.12 1.12 0 0 1 1.678 1.48l-.094.105L9.118 7l4.754 4.753a1.12 1.12 0 0 1-1.479 1.678l-.105-.093-4.754-4.754-4.754 4.754a1.12 1.12 0 0 1-1.678-1.479l.093-.105L5.95 7 1.195 2.247A1.12 1.12 0 0 1 2.675.569Z" fill="currentColor"/>' +
    '</svg>';

  var BOLT_ICON =
    '<svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M5.84653 0.0360377C6.13974 0.138097 6.33912 0.438354 6.33912 0.777828V4.66669L9.15651 4.66669C9.41915 4.66669 9.65997 4.82804 9.78125 5.08527C9.90254 5.34251 9.88415 5.65289 9.73354 5.89048L4.80311 13.6682C4.62681 13.9463 4.30753 14.066 4.01433 13.964C3.72113 13.8619 3.52174 13.5616 3.52174 13.2222L3.52174 9.33331H0.704349C0.441715 9.33331 0.200895 9.17196 0.0796083 8.91473C-0.0416787 8.65749 -0.0232851 8.34711 0.127325 8.10952L5.05775 0.331805C5.23405 0.0536972 5.55333 -0.0660216 5.84653 0.0360377Z" fill="#FFA800"/>' +
    '</svg>';

  /* --------------------------------------------------------------- styles */

  var STYLES = `
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  @font-face {
    font-family: 'Matter';
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url(https://sleekflow.io/fonts/Matter-SemiBold.woff2) format('woff2'),
         url(https://sleekflow.io/fonts/Matter-SemiBold.woff) format('woff');
  }

  /* ------------------------------------------------------------ host ---- */
  /*
   * The host is the fixed anchor. It is positioned from one horizontal edge
   * (left/right) and one vertical edge (top/bottom) via the [position]
   * attribute, so the widget never depends on the host page's layout.
   */
  :host {
    --sf-offset-x: 40px;
    --sf-offset-y: 0px;
    --sf-z-index: 99999;
    --sf-green: hsl(142, 70%, 49%);
    --sf-green-dark: hsl(173, 86%, 20%);
    --sf-ink: hsl(230, 54%, 11%);
    --sf-ink-soft: hsl(240, 1%, 31%);
    --sf-panel-max: calc(100vh - var(--sf-offset-y) - 141px);

    display: block !important;
    position: fixed !important;
    z-index: var(--sf-z-index) !important;
    top: auto !important;
    left: auto !important;
    right: var(--sf-offset-x) !important;   /* bottom-right is the default */
    bottom: var(--sf-offset-y) !important;

    width: auto !important;
    height: auto !important;
    max-width: none !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;

    font-family: 'Inter', 'Noto Sans TC', 'Noto Sans SC', 'Helvetica', 'Arial', sans-serif !important;
    font-size: 16px !important;
    line-height: 1.5 !important;
    color: #000 !important;
    text-transform: none !important;
    letter-spacing: normal !important;
    text-decoration: none !important;
  }

  :host([hidden]) {
    display: none !important;
  }

  @supports (height: 100dvh) {
    :host { --sf-panel-max: calc(100dvh - var(--sf-offset-y) - 141px); }
  }

  :host([position="bottom-left"]) {
    left: var(--sf-offset-x) !important;
    right: auto !important;
    bottom: var(--sf-offset-y) !important;
    top: auto !important;
  }
  :host([position="top-right"]) {
    right: var(--sf-offset-x) !important;
    left: auto !important;
    top: var(--sf-offset-y) !important;
    bottom: auto !important;
  }
  :host([position="top-left"]) {
    left: var(--sf-offset-x) !important;
    right: auto !important;
    top: var(--sf-offset-y) !important;
    bottom: auto !important;
  }

  @media screen and (max-width: 640px) {
    :host { --sf-offset-x: 24px; }
  }

  /* ------------------------------------------------------------ reset ---- */
  *,
  *::before,
  *::after {
    box-sizing: border-box !important;
    font-family: inherit;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    text-decoration: none;
    text-transform: none;
    letter-spacing: normal;
  }
  a { cursor: pointer; }
  button { font: inherit; }

  /* ------------------------------------------------------------ layout --- */
  .sf-root {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    background: transparent;
  }
  :host([position$="-left"]) .sf-root { align-items: flex-start; }

  .sf-panel {
    order: 1;
    display: none;
    height: 453px;
    max-height: var(--sf-panel-max);
    width: calc(100vw - 60px);
    max-width: 498px;
    margin: 0 0 16px;
    overflow: hidden;
    border-radius: 24px !important;
    background-color: #fff !important;
    box-shadow: 0 24px 50px 10px rgba(0, 102, 255, 0.07);
    grid-template-rows: 81px minmax(0px, 1fr);
    font-family: 'Inter', 'Noto Sans TC', 'Noto Sans SC', 'Helvetica', 'Arial', sans-serif;
  }
  .sf-panel.open { display: grid; }

  /* Top placements: the launcher sits above the panel, so swap their order
     and move the 16px gap from the panel's bottom edge to its top edge. */
  :host([position^="top"]) .sf-panel { order: 2; margin: 16px 0 0; }
  :host([position^="top"]) .sf-actions { order: 1; }

  .sf-actions {
    order: 2;
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: flex-end;
  }
  :host([position$="-left"]) .sf-actions { align-items: flex-start; }

  /* ------------------------------------------------------------ header --- */
  .sf-header {
    padding: 16px 24px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    background-color: var(--sf-green-dark) !important;
  }
  .sf-brand { display: flex; width: 100%; }
  .sf-avatar {
    width: 48px;
    height: 48px;
    border-radius: 500px;
    object-fit: cover;
  }
  .sf-brand-text {
    padding-left: 8px;
    display: flex;
    flex-direction: column;
    color: #fff;
  }
  .sf-brand-name {
    font-family: 'Matter', 'Inter', 'Noto Sans TC', 'Noto Sans SC', 'Helvetica', 'Arial', sans-serif;
    font-size: 20px !important;
    font-weight: 600 !important;
    line-height: 25px !important;
    margin: 0 !important;
    padding: 0 !important;
    color: #fff !important;
  }
  .sf-brand-subtitle {
    font-size: 14px !important;
    line-height: 18px !important;
    margin: 0;
    color: #fff !important;
  }
  .sf-close {
    cursor: pointer;
    color: #fff;
    background: transparent;
    line-height: 0;
    flex: 0 0 auto;
  }

  /* -------------------------------------------------------------- body --- */
  .sf-body {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 24px;
    background-color: #fff !important;
    background-image: url(https://sleekflow.io/static/images/wts-bg.jpg) !important;
    background-repeat: no-repeat !important;
    background-position: center top !important;
    background-size: cover !important;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .sf-bubble {
    z-index: 10;
    display: flex;
    flex: 0 0 auto;
    height: max-content;
    max-width: 80%;
    flex-direction: column;
    overflow: auto;
    border-radius: 16px;
    background-color: #fff !important;
    padding: 10px 18px;
  }
  .sf-bubble pre {
    font-family: 'Inter', 'Noto Sans TC', 'Noto Sans SC', 'Helvetica', 'Arial', sans-serif !important;
    white-space: pre-wrap !important;
    background: #fff !important;
    color: var(--sf-ink-soft) !important;
    margin: 0 !important;
    font-size: 16px !important;
    font-weight: normal !important;
    padding: 0 !important;
  }
  .sf-bubble-title {
    font-family: 'Inter', 'Noto Sans TC', 'Noto Sans SC', 'Helvetica', 'Arial', sans-serif;
    font-size: 16px !important;
    font-weight: 700 !important;
    margin: 0 0 8px !important;
    color: var(--sf-ink) !important;
    min-height: 17px !important;
  }
  .sf-prefill-row {
    z-index: 10;
    flex: 0 0 auto;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: auto;
  }
  .sf-prefill-bubble {
    display: flex;
    background-color: #dcf7c5 !important;
    margin-top: 16px;
    padding: 18px;
    border-radius: 16px;
    width: 80%;
    overflow: auto;
    max-height: 80px;
    font-size: 16px !important;
    font-weight: normal !important;
    color: var(--sf-ink) !important;
  }

  /* ------------------------------------------------------------- footer -- */
  .sf-footer {
    z-index: 50;
    display: flex;
    width: 100%;
    background-color: #fff !important;
    padding: 20px 24px;
    flex-direction: column;
  }
  .sf-cta-link {
    display: block;
    width: 100%;
    text-decoration: none !important;
  }
  .sf-cta {
    cursor: pointer;
    justify-content: center;
    display: flex;
    height: 56px;
    width: 100%;
    align-items: center;
    align-self: end;
    border-radius: 500px !important;
    background-color: var(--sf-green) !important;
    transition: opacity 0.3s;
  }
  .sf-cta:hover { opacity: 80%; }
  .sf-cta-inner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sf-cta-label {
    font-family: 'Matter', 'Inter', 'Noto Sans TC', 'Noto Sans SC', 'Helvetica', 'Arial', sans-serif;
    color: #fff !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    padding-left: 8px;
    margin: 0;
  }

  /* ---------------------------------------------------------- launcher --- */
  .sf-launcher {
    cursor: pointer;
    justify-content: center;
    display: flex;
    width: auto;
    align-items: center;
    border-radius: 500px !important;
    background-color: var(--sf-green) !important;
    height: auto;
    transition: opacity 0.3s;
  }
  .sf-launcher:hover { opacity: 80%; }
  .sf-launcher--sm { padding: 9px; }
  .sf-launcher--md { padding: 13px; }
  .sf-launcher--lg { padding: 17px; }
  .sf-launcher--labelled {
    padding-right: 40px !important;
    padding-left: 40px !important;
  }
  .sf-launcher-inner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sf-launcher-icon { display: flex; align-items: center; justify-content: center; }
  .sf-launcher-label {
    font-family: 'Matter', 'Inter', 'Noto Sans TC', 'Noto Sans SC', 'Helvetica', 'Arial', sans-serif;
    color: #fff !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    margin-left: 8px;
    margin-top: 0;
    margin-bottom: 0;
    line-height: 22px;
    white-space: nowrap;
  }
  .sf-launcher-label:empty { display: none; }

  /* ------------------------------------------------------- powered by ---- */
  .sf-powered {
    align-self: stretch;
    width: 100%;
    min-width: 180px;
    background: transparent;
    font-family: 'Inter', 'Noto Sans TC', 'Noto Sans SC', 'Helvetica', 'Arial', sans-serif;
  }
  .sf-powered-line {
    margin: 14px 0;
    text-align: right;
    padding-right: 12px;
    font-size: 14px !important;
    color: #888;
    background: transparent;
  }
  :host([position$="-left"]) .sf-powered-line {
    text-align: left;
    padding-right: 0;
    padding-left: 12px;
  }
  .sf-powered-line a { color: hsl(209 77% 60%) !important; }
  .sf-bolt {
    position: relative;
    display: inline-block;
    top: 1px;
  }
  .sf-bolt svg { margin-right: 6px; margin-bottom: 1px; }
  .sf-powered-by { margin-inline-end: 0.25rem; }

  .sf-panel-powered {
    margin-top: 12px;
    text-align: center;
    font-size: 16px !important;
  }
  .sf-panel-powered a { color: hsl(209 77% 60%) !important; }
  .sf-panel-powered .sf-bolt svg { margin-right: 6px; margin-bottom: 1px; }

  /* --------------------------------------------------------- scrollbars -- */
  .sf-bubble::-webkit-scrollbar,
  .sf-prefill-bubble::-webkit-scrollbar { width: 4px !important; border-radius: 20px !important; }
  .sf-bubble::-webkit-scrollbar-track,
  .sf-prefill-bubble::-webkit-scrollbar-track { border-radius: 10px !important; }
  .sf-bubble::-webkit-scrollbar-thumb,
  .sf-prefill-bubble::-webkit-scrollbar-thumb { background: #c8c8c8 !important; border-radius: 10px !important; }
  `;

  /* -------------------------------------------------------------- markup -- */

  var TEMPLATE = document.createElement('template');
  TEMPLATE.innerHTML =
    '<style>' + STYLES + '</style>' +
    '<div class="sf-root">' +
      '<div class="sf-panel" id="panel" role="dialog" aria-label="Chat on WhatsApp">' +
        '<div class="sf-header">' +
          '<div class="sf-brand">' +
            '<img class="sf-avatar" id="brand-image" alt="" />' +
            '<div class="sf-brand-text">' +
              '<p class="sf-brand-name" id="brand-name-header"></p>' +
              '<p class="sf-brand-subtitle" id="brand-subtitle"></p>' +
            '</div>' +
          '</div>' +
          '<button class="sf-close" id="close" type="button" aria-label="Close chat">' + CLOSE_ICON + '</button>' +
        '</div>' +
        '<div class="sf-body">' +
          '<div class="sf-bubble">' +
            '<p class="sf-bubble-title" id="chat-title"></p>' +
            '<pre id="welcome-message"></pre>' +
          '</div>' +
          '<div class="sf-prefill-row" id="prefill-section" style="display:none">' +
            '<div class="sf-prefill-bubble" id="prefill-message"></div>' +
          '</div>' +
        '</div>' +
        '<div class="sf-footer">' +
          '<a class="sf-cta-link" id="whatsapp-link" rel="noopener noreferrer" target="_blank">' +
            '<button class="sf-cta" type="button">' +
              '<span class="sf-cta-inner">' + WHATSAPP_ICON +
                '<span class="sf-cta-label" id="call-to-action"></span>' +
              '</span>' +
            '</button>' +
          '</a>' +
          '<p class="sf-panel-powered" data-nosnippet>' +
            '<span class="sf-bolt">' + BOLT_ICON + '</span>' +
            '<span class="sf-powered-by" id="panel-powered-by">Powered by</span>' +
            '<a rel="noopener noreferrer nofollow" target="_blank" href="https://sleekflow.io/?utm_source=tool&utm_medium=whatsapp-button&utm_campaign=webbutton">SleekFlow AI</a>' +
          '</p>' +
        '</div>' +
      '</div>' +
      '<div class="sf-actions">' +
        '<button class="sf-launcher sf-launcher--lg" id="launcher" type="button" aria-expanded="false">' +
          '<span class="sf-launcher-inner">' +
            '<span class="sf-launcher-icon" id="launcher-icon">' + WHATSAPP_ICON + '</span>' +
            '<span class="sf-launcher-label" id="launcher-label"></span>' +
          '</span>' +
        '</button>' +
        '<div class="sf-powered">' +
          '<p class="sf-powered-line" data-nosnippet>' +
            '<span class="sf-bolt">' + BOLT_ICON + '</span>' +
            '<span class="sf-powered-by">Powered by</span>' +
            '<a rel="noopener noreferrer nofollow" target="_blank" href="https://sleekflow.io/?utm_source=tool&utm_medium=whatsapp-button&utm_campaign=webbutton">SleekFlow AI</a>' +
          '</p>' +
        '</div>' +
      '</div>' +
    '</div>';

  /* -------------------------------------------------------------- widget -- */

  var SIZE_CLASS = {
    small: 'sf-launcher--sm',
    regular: 'sf-launcher--md',
    medium: 'sf-launcher--md',
    large: 'sf-launcher--lg',
  };

  function sizeClass(size) {
    return SIZE_CLASS[String(size || 'large').toLowerCase()] || SIZE_CLASS.large;
  }

  class SleekFlowWhatsAppWidget extends HTMLElement {
    static get observedAttributes() {
      return [
        'brand-name',
        'button-name',
        'brand-subtitle',
        'welcome-message',
        'phone-number',
        'brand-image-url',
        'call-to-action',
        'button-size',
        'button-icon-size',
        'prefill-message',
        'position',
        'powered-by-color',
      ];
    }

    constructor() {
      super();
      this.isOpen = false;
      this._onToggle = this.toggle.bind(this);
      this._onClose = this.close.bind(this);
      this._onKeydown = (event) => {
        if (event.key === 'Escape' && this.isOpen) this.close();
      };
      this.attachShadow({ mode: 'open' }).appendChild(TEMPLATE.content.cloneNode(true));
    }

    connectedCallback() {
      this._bindRefs();
      if (!this._bound) {
        this._cta.addEventListener('click', this._onToggle);
        this._close.addEventListener('click', this._onClose);
        document.addEventListener('keydown', this._onKeydown);
        this._bound = true;
      }
      this._render();
    }

    disconnectedCallback() {
      if (this._bound) {
        this._cta.removeEventListener('click', this._onToggle);
        this._close.removeEventListener('click', this._onClose);
        document.removeEventListener('keydown', this._onKeydown);
        this._bound = false;
      }
    }

    attributeChangedCallback(_name, oldValue, newValue) {
      if (oldValue !== newValue && this._cta) this._render();
    }

    _bindRefs() {
      var root = this.shadowRoot;
      this._panel = root.querySelector('#panel');
      this._cta = root.querySelector('#launcher');
      this._close = root.querySelector('#close');
      this._link = root.querySelector('#whatsapp-link');
      this._brandImage = root.querySelector('#brand-image');
      this._brandNameHeader = root.querySelector('#brand-name-header');
      this._brandSubtitle = root.querySelector('#brand-subtitle');
      this._chatTitle = root.querySelector('#chat-title');
      this._welcome = root.querySelector('#welcome-message');
      this._prefillSection = root.querySelector('#prefill-section');
      this._prefill = root.querySelector('#prefill-message');
      this._ctaLabel = root.querySelector('#call-to-action');
      this._launcherLabel = root.querySelector('#launcher-label');
      this._launcherIcon = root.querySelector('#launcher-icon');
      this._panelPoweredBy = root.querySelector('#panel-powered-by');
    }

    _render() {
      if (!this._cta) return;
      var attr = (name) => this.getAttribute(name) || '';

      var brandName = attr('brand-name');
      var buttonName = attr('button-name');
      var brandSubtitle = attr('brand-subtitle');
      var welcomeMessage = attr('welcome-message');
      var phoneNumber = attr('phone-number');
      var brandImageUrl = attr('brand-image-url');
      var callToAction = attr('call-to-action');
      var prefillMessage = attr('prefill-message');
      var poweredByColor = attr('powered-by-color');
      var iconSize = attr('button-icon-size') || '22';

      if (brandImageUrl) {
        this._brandImage.src = brandImageUrl;
        this._brandImage.alt = brandName;
        this._brandImage.style.display = '';
      } else {
        this._brandImage.style.display = 'none';
      }

      this._brandNameHeader.textContent = brandName;
      this._chatTitle.textContent = brandName;
      this._brandSubtitle.textContent = brandSubtitle;
      this._welcome.textContent = welcomeMessage;
      this._ctaLabel.textContent = callToAction;
      this._launcherLabel.textContent = buttonName;
      this._panel.setAttribute('aria-label', brandName ? 'Chat with ' + brandName + ' on WhatsApp' : 'Chat on WhatsApp');
      this._cta.setAttribute('aria-label', buttonName || 'Chat on WhatsApp');

      this._cta.classList.remove('sf-launcher--sm', 'sf-launcher--md', 'sf-launcher--lg', 'sf-launcher--labelled');
      this._cta.classList.add(sizeClass(attr('button-size')));
      if (buttonName) this._cta.classList.add('sf-launcher--labelled');

      this._launcherIcon.style.width = iconSize + 'px';
      this._launcherIcon.style.height = iconSize + 'px';
      var icon = this._launcherIcon.querySelector('svg');
      if (icon) {
        icon.setAttribute('width', iconSize);
        icon.setAttribute('height', iconSize);
      }

      if (prefillMessage) {
        this._prefillSection.style.display = '';
        this._prefill.textContent = prefillMessage;
      } else {
        this._prefillSection.style.display = 'none';
      }

      var text = encodeURIComponent(prefillMessage || welcomeMessage).replace(/%0A/g, '%0a');
      this._link.href = 'https://api.whatsapp.com/send?phone=' + phoneNumber + '&text=' + text;

      if (poweredByColor) {
        this._panelPoweredBy.style.color = poweredByColor;
      } else {
        this._panelPoweredBy.style.color = '';
      }
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      this.isOpen = true;
      this._panel.classList.add('open');
      if (this._cta) this._cta.setAttribute('aria-expanded', 'true');
      this.dispatchEvent(new CustomEvent('widget-opened', { bubbles: true, composed: true }));
    }

    close() {
      this.isOpen = false;
      this._panel.classList.remove('open');
      if (this._cta) this._cta.setAttribute('aria-expanded', 'false');
      this.dispatchEvent(new CustomEvent('widget-closed', { bubbles: true, composed: true }));
    }

    show() { this.removeAttribute('hidden'); }
    hide() { this.setAttribute('hidden', ''); }
  }

  customElements.define(TAG, SleekFlowWhatsAppWidget);

  /* ---------------------------------------------------------------- API -- */

  var POSITIONS = {
    'bottom-right': true,
    'bottom-left': true,
    'top-right': true,
    'top-left': true,
  };

  var POSITION_ALIASES = {
    right: 'bottom-right',
    left: 'bottom-left',
    br: 'bottom-right',
    bl: 'bottom-left',
    tr: 'top-right',
    tl: 'top-left',
    bottomright: 'bottom-right',
    bottomleft: 'bottom-left',
    topright: 'top-right',
    topleft: 'top-left',
  };

  function resolvePosition(options) {
    var raw = String(options.position || '').trim().toLowerCase().replace(/[\s_]+/g, '-');
    if (POSITIONS[raw]) return raw;
    if (POSITION_ALIASES[raw]) return POSITION_ALIASES[raw];

    // 'topLeft', 'top right', 'TOP_LEFT' — ignore separators entirely.
    var compact = raw.replace(/-/g, '');
    if (POSITION_ALIASES[compact]) return POSITION_ALIASES[compact];

    // Backwards compatibility with the official option name / values.
    var legacy = String(options.buttonPosition || '').trim().toLowerCase();
    if (legacy === 'left') return 'bottom-left';
    return 'bottom-right';
  }

  // A number is treated as px; a string is passed through (any CSS length).
  function cssLength(value) {
    if (value === undefined || value === null || value === '') return null;
    return typeof value === 'number' ? value + 'px' : String(value).trim();
  }

  function applyOptions(element, options) {
    var set = function (attribute, value) {
      if (value !== undefined && value !== null && value !== '') {
        element.setAttribute(attribute, String(value));
      }
    };

    set('brand-name', options.brandName);
    set('button-name', options.buttonName);
    set('brand-subtitle', options.brandSubtitleText);
    set('welcome-message', options.welcomeMessage);
    set('phone-number', options.phoneNumber);
    set('brand-image-url', options.brandImageUrl);
    set('call-to-action', options.callToAction);
    set('button-size', options.buttonSize);
    set('button-icon-size', options.buttonIconSize);
    set('prefill-message', options.prefillMessage);
    set('powered-by-color', options.poweredByColor);

    element.setAttribute('position', resolvePosition(options));

    var offsetX = cssLength(options.offsetX);
    var offsetY = cssLength(options.offsetY);
    if (offsetX !== null) element.style.setProperty('--sf-offset-x', offsetX);
    if (offsetY !== null) element.style.setProperty('--sf-offset-y', offsetY);
    if (options.zIndex !== undefined && options.zIndex !== null) {
      element.style.setProperty('--sf-z-index', String(options.zIndex));
    }
  }

  var deferredOptions = null;

  function mount(options) {
    var existing = document.querySelectorAll(TAG);
    for (var i = 0; i < existing.length; i++) existing[i].remove();

    var element = document.createElement(TAG);
    applyOptions(element, options);
    document.body.appendChild(element);
    return element;
  }

  window.whatsappButton = function (options) {
    var opts = options || {};

    if (!document.body) {
      deferredOptions = opts;
      document.addEventListener(
        'DOMContentLoaded',
        function () {
          if (deferredOptions) {
            var pending = deferredOptions;
            deferredOptions = null;
            mount(pending);
          }
        },
        { once: true },
      );
      return undefined;
    }

    return mount(opts);
  };
})();
