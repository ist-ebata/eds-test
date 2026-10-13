const HUBSPOT_SCRIPT_SRC = 'https://js.hsforms.net/forms/embed/v2.js';

const PORTAL_ID_PATTERN = /^\d+$/;
const FORM_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REGION_PATTERN = /^[a-z]{2,3}\d+$/i;

let scriptPromise;

function loadHubSpotScript() {
  if (window.hbspt?.forms) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = HUBSPOT_SCRIPT_SRC;
      script.charset = 'utf-8';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        scriptPromise = undefined;
        script.remove();
        reject(new Error('Failed to load the HubSpot forms script'));
      };
      document.head.append(script);
    });
  }
  return scriptPromise;
}

/**
 * Reads authored key/value rows, e.g. | Portal ID | 12345678 |
 * Keys are lowercased with spaces, hyphens and underscores removed.
 * @param {Element} block The block element
 * @returns {Object} config
 */
function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const [keyCell, valueCell] = row.children;
    if (!keyCell || !valueCell) return;
    const key = keyCell.textContent.trim().toLowerCase().replace(/[\s_-]+/g, '');
    const value = valueCell.textContent.trim();
    if (key && value) config[key] = value;
  });
  return config;
}

function showError(block, message) {
  block.textContent = '';
  const p = document.createElement('p');
  p.className = 'hubspot-form-error';
  p.setAttribute('role', 'alert');
  p.textContent = message;
  block.append(p);
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const config = readConfig(block);
  const { portalid: portalId, formid: formId, region } = config;

  if (!PORTAL_ID_PATTERN.test(portalId || '') || !FORM_ID_PATTERN.test(formId || '')) {
    showError(block, 'HubSpot form is not configured correctly. Please set a valid Portal ID and Form ID.');
    return;
  }
  if (region && !REGION_PATTERN.test(region)) {
    showError(block, 'HubSpot form region is invalid.');
    return;
  }

  const target = document.createElement('div');
  target.className = 'hubspot-form-container';
  target.id = `hubspot-form-${formId}-${Math.random().toString(36).slice(2, 8)}`;
  block.textContent = '';
  block.append(target);

  const options = {
    portalId,
    formId,
    target: `#${target.id}`,
  };
  if (region) options.region = region.toLowerCase();
  if (config.redirecturl) options.redirectUrl = config.redirecturl;
  if (config.successmessage) options.inlineMessage = config.successmessage;

  let started = false;
  const render = async () => {
    if (started) return;
    started = true;
    try {
      await loadHubSpotScript();
      window.hbspt.forms.create(options);
    } catch (e) {
      showError(block, 'The form could not be loaded. Please try again later.');
    }
  };

  // Defer the third-party script until the form is near the viewport.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        render();
      }
    }, { rootMargin: '200px' });
    observer.observe(block);
  } else {
    render();
  }
}
