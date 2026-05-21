(() => {
  function getNextData() {
    const raw = document.getElementById("__NEXT_DATA__")?.textContent;
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function getRecordMap() {
    return getNextData()?.props?.pageProps?.recordMap || null;
  }

  function getPageAndCollection(recordMap) {
    const blocks = recordMap?.block || {};
    const collections = recordMap?.collection || {};
    const pageId = Object.keys(blocks).find(
      id => blocks[id]?.value?.type === "page"
    );
    const page = pageId ? blocks[pageId]?.value : null;

    if (!page) {
      return { page: null, collection: null, pageId: null };
    }

    const collection = collections[page.parent_id]?.value || null;
    return { page, collection, pageId };
  }

  function flattenNotionText(value) {
    return Array.isArray(value)
      ? value
          .map(item => Array.isArray(item) ? (item[0] || "") : "")
          .filter(Boolean)
          .join("")
      : "";
  }

  function joinDisplayValues(values) {
    return values
      .filter(Boolean)
      .join(", ")
      .replace(/\s*,\s*/g, ", ")
      .trim();
  }

  function extractDateValue(value) {
    if (!Array.isArray(value)) return "";
    const allowedTypes = ["date", "datetime", "daterange", "datetimerange"];

    for (const item of value) {
      if (!Array.isArray(item)) continue;
      const [, decorations] = item;
      if (!Array.isArray(decorations)) continue;

      for (const deco of decorations) {
        if (!Array.isArray(deco)) continue;
        const [type, payload] = deco;

        if (type === "d" && allowedTypes.includes(payload?.type)) {
          const start = [payload.start_date, payload.start_time].filter(Boolean).join(" ");
          const end = [payload.end_date, payload.end_time].filter(Boolean).join(" ");
          return start && end ? `${start} → ${end}` : (start || end || "");
        }
      }
    }

    return "";
  }

  function extractRelationValue(value, recordMap) {
    if (!Array.isArray(value)) return "";
    const blocks = recordMap?.block || {};
    const names = [];

    for (const item of value) {
      if (!Array.isArray(item)) continue;
      const id = item[0];
      if (!id) continue;

      const relatedPage = blocks[id]?.value;
      const title = flattenNotionText(relatedPage?.properties?.title);
      names.push(title || id);
    }

    return joinDisplayValues(names);
  }

  function extractPersonValue(value, recordMap) {
    if (!Array.isArray(value)) return "";
    const notionUser = recordMap?.notion_user || {};
    const names = [];

    for (const item of value) {
      if (!Array.isArray(item)) continue;
      const id = item[0];
      if (!id) continue;

      const user = notionUser[id]?.value;
      names.push(user?.name || user?.email || id);
    }

    return joinDisplayValues(names);
  }

  function extractFileValue(value) {
    return Array.isArray(value)
      ? joinDisplayValues(
          value
            .map(item => Array.isArray(item) ? (item[0] || "") : "")
            .filter(Boolean)
        )
      : "";
  }

  function extractUrlValues(value) {
    if (!Array.isArray(value)) return [];
    const urls = [];

    for (const item of value) {
      if (!Array.isArray(item)) continue;

      const text = item[0] || "";
      let href = text;
      const decorations = item[1];

      if (Array.isArray(decorations)) {
        for (const deco of decorations) {
          if (!Array.isArray(deco)) continue;
          const [type, payload] = deco;
          if (type === "a" && typeof payload === "string") {
            href = payload;
          }
        }
      }

      if (href) urls.push({ text: text || href, href });
    }

    return urls;
  }

  function normalizePropertyValue(value, type, recordMap) {
    if (value == null) return "";

    if (type === "text" || type === "title") return flattenNotionText(value);
    if (type === "select") {
      return Array.isArray(value)
        ? joinDisplayValues(value.map(item => Array.isArray(item) ? (item[0] || "") : ""))
        : "";
    }
    if (type === "multi_select") {
      return Array.isArray(value)
        ? joinDisplayValues(
            value
              .map(item => Array.isArray(item) ? (item[0] || "") : "")
              .filter(Boolean)
              .map(v => v.split(",").map(x => x.trim()).filter(Boolean).join(", "))
          )
        : "";
    }
    if (type === "date") return extractDateValue(value);
    if (type === "relation") return extractRelationValue(value, recordMap);
    if (type === "person") return extractPersonValue(value, recordMap);
    if (type === "file") return extractFileValue(value);
    if (type === "status") {
      return Array.isArray(value)
        ? joinDisplayValues(value.map(item => Array.isArray(item) ? (item[0] || "") : ""))
        : "";
    }
    if (type === "checkbox") {
      return Array.isArray(value) && Array.isArray(value[0])
        ? (value[0][0] === "Yes" ? "Yes" : (value[0][0] || ""))
        : "";
    }
    if (type === "number") {
      return Array.isArray(value) && Array.isArray(value[0])
        ? (value[0][0] || "")
        : "";
    }
    if (type === "url") {
      const urls = extractUrlValues(value);
      return urls.map(item => item.href).join(", ");
    }

    return Array.isArray(value)
      ? joinDisplayValues(value.map(item => Array.isArray(item) ? (item[0] || "") : ""))
      : String(value || "");
  }

  function buildMaps() {
    const recordMap = getRecordMap();
    if (!recordMap) return { propertyMap: {}, urlMap: {} };

    const { page, collection } = getPageAndCollection(recordMap);
    if (!page || !collection?.schema) return { propertyMap: {}, urlMap: {} };

    const propertyMap = {};
    const urlMap = {};

    for (const [propId, schema] of Object.entries(collection.schema)) {
      const propName = (schema?.name || "").trim();
      if (!propName) continue;

      const schemaType = schema?.type || "";
      const rawValue = page.properties?.[propId];

      if (schemaType === "url") {
        const urls = extractUrlValues(rawValue);
        if (urls.length > 0) {
          urlMap[propName] = urls;
          propertyMap[propName] = urls.map(item => item.href).join(", ");
        } else {
          propertyMap[propName] = "";
        }
      } else {
        propertyMap[propName] = normalizePropertyValue(rawValue, schemaType, recordMap);
      }
    }

    propertyMap.page_title = document.title.trim();
    return { propertyMap, urlMap };
  }

  function injectLinkStyle() {
    if (document.getElementById("oopy-inline-link-style")) return;

    const style = document.createElement("style");
    style.id = "oopy-inline-link-style";
    style.textContent = ".oopy-inline-link,.oopy-inline-link:visited,.oopy-inline-link:hover,.oopy-inline-link:active,.oopy-inline-link:focus{color:inherit;text-decoration:none}";
    document.head.appendChild(style);
  }

  function shouldSkip(node) {
    const el = node.parentElement;
    return !el || ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(el.tagName);
  }

  function extractSingleToken(text) {
    const match = text.match(/^\s*\{%\s*(.*?)\s*%\}\s*$/);
    return match ? match[1].trim() : null;
  }

  function replaceTemplateTokens(text, propertyMap) {
    return text.replace(/\{%\s*(.*?)\s*%\}/g, (match, key) => {
      const normalizedKey = String(key || "").trim();
      if (!normalizedKey) return match;

      if (Object.prototype.hasOwnProperty.call(propertyMap, normalizedKey)) {
        const value = propertyMap[normalizedKey];
        return value == null || value === "" ? "" : String(value);
      }

      return match;
    });
  }

  function replaceAsLink(node, urls) {
    const parent = node.parentElement;
    if (!parent || parent.dataset.oopyUrlReplaced === "true") return false;

    const frag = document.createDocumentFragment();

    urls.forEach((item, index) => {
      if (index > 0) frag.appendChild(document.createTextNode(", "));

      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.text;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "oopy-inline-link";
      a.style.wordBreak = "break-all";
      a.style.color = "inherit";
      a.style.textDecoration = "none";
      frag.appendChild(a);
    });

    parent.replaceChild(frag, node);
    parent.dataset.oopyUrlReplaced = "true";
    return true;
  }

  function replaceTextNode(node, propertyMap, urlMap) {
    if (!node || !node.nodeValue || shouldSkip(node) || !/\{%\s*.*?\s*%\}/.test(node.nodeValue)) {
      return false;
    }

    const singleKey = extractSingleToken(node.nodeValue);
    if (singleKey && urlMap[singleKey]) {
      return replaceAsLink(node, urlMap[singleKey]);
    }

    const nextValue = replaceTemplateTokens(node.nodeValue, propertyMap);
    if (nextValue !== node.nodeValue) {
      node.nodeValue = nextValue;
      return true;
    }

    return false;
  }

  function scan(root, propertyMap, urlMap) {
    if (!root) return 0;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeValue &&
          node.nodeValue.trim() &&
          !shouldSkip(node) &&
          /\{%\s*.*?\s*%\}/.test(node.nodeValue)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    let current;
    while ((current = walker.nextNode())) nodes.push(current);

    let count = 0;
    for (const node of nodes) {
      if (replaceTextNode(node, propertyMap, urlMap)) count++;
    }

    return count;
  }

  function getSafeRoot() {
    return (
      document.querySelector(".notion-page-content") ||
      document.querySelector("[class*='notion-page-content']") ||
      document.querySelector("[class*='notion-page']") ||
      document.querySelector("main") ||
      document.body
    );
  }

  function runOnce() {
    injectLinkStyle();
    const root = getSafeRoot();
    const { propertyMap, urlMap } = buildMaps();
    scan(root, propertyMap, urlMap);
  }

  function boot() {
    const start = () => {
      setTimeout(() => {
        if (window.requestIdleCallback) {
          requestIdleCallback(() => {
            runOnce();
          }, { timeout: 2000 });
        } else {
          runOnce();
        }
      }, 3000);
    };

    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }
  }

  boot();
})();
