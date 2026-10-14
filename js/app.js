/* =========================================================
   app.js —— 界面与交互
   ========================================================= */

(function () {
  'use strict';

  /* ---------------- 工具函数 ---------------- */

  function $(id) { return document.getElementById(id); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function svgIcon(name) {
    var wrap = el('span', 'ico');
    wrap.innerHTML = ICONS[name] || '';
    var svg = wrap.firstChild;
    return svg || wrap;
  }

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  function timeLabel(ts) {
    var d = new Date(ts);
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    return hh + ':' + mm;
  }

  var ICONS = {
    redraw: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 3.5V9H15"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M5.5 15.5V6.5a1.5 1.5 0 0 1 1.5-1.5h9"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
    del: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4.8h6V7"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.6h3.1l1.5 3.9-2.1 1.4a12.4 12.4 0 0 0 6.1 6.1l1.4-2.1 3.9 1.5v3.1a1.9 1.9 0 0 1-2.1 1.9A16.6 16.6 0 0 1 4.6 5.7a1.9 1.9 0 0 1 1.9-2.1z"/></svg>',
    video: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="12.5" height="12" rx="2.6"/><path d="M15.5 10.6 21 7.4v9.2l-5.5-3.2z"/></svg>',
    hangup: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.6 13.6c0-1.6 4.3-3.1 9.4-3.1s9.4 1.5 9.4 3.1c0 .9-.7 1.6-1.5 1.6l-4.6-.4c-.8 0-1.4-.7-1.4-1.6v-.8a13.6 13.6 0 0 0-3.8 0v.8c0 .9-.6 1.6-1.4 1.6l-4.6.4c-.8 0-1.5-.7-1.5-1.6z"/></svg>',
    speak: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4"/><path d="M8 7v10"/><path d="M12 4v16"/><path d="M16 7v10"/><path d="M20 10v4"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3l4-3.6v12.2l-4-3.6H4z"/><path d="M14.8 9.2a4 4 0 0 1 0 5.6"/><path d="M17.6 6.6a7.8 7.8 0 0 1 0 10.8"/></svg>',
    music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17.5V6.2l10-2.2v11.3"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.3" r="2.5"/></svg>',
  };

  /* ---------------- 内置表情包（纯 SVG 绘制，无需图片文件） ---------------- */

  var STICKERS = (function () {
    var FEATURE = '#6b53a8';
    var FACE_FILL = '#efe7fd';
    var FACE_LINE = '#cdbcf0';
    var BLUSH = '#f0aec8';

    var STAR_PATH = 'M12 2l2.9 6.3 6.8.8-5 4.7 1.3 6.8L12 17.4 5.9 20.6 7.2 13.8 2.2 9.1l6.8-.8z';
    var HEART_PATH = 'M12 21s-7.5-4.7-9.5-9A5.6 5.6 0 0 1 12 6.5 5.6 5.6 0 0 1 21.5 12c-2 4.3-9.5 9-9.5 9z';

    function shape(cx, cy, size, path, fill) {
      var s = size / 24;
      return '<g transform="translate(' + (cx - 12 * s).toFixed(2) + ',' + (cy - 12 * s).toFixed(2) +
             ') scale(' + s.toFixed(3) + ')"><path d="' + path + '" fill="' + fill + '"/></g>';
    }

    function eye(kind, cx) {
      var cy = 55;
      if (kind === 'dot') return '<circle cx="' + cx + '" cy="' + cy + '" r="5.2" fill="' + FEATURE + '"/>';
      if (kind === 'arc') return '<path d="M' + (cx - 7) + ' ' + cy + ' q7 -9 14 0" fill="none" stroke="' + FEATURE + '" stroke-width="3.4" stroke-linecap="round"/>';
      if (kind === 'closed') return '<path d="M' + (cx - 7) + ' ' + cy + ' q7 7 14 0" fill="none" stroke="' + FEATURE + '" stroke-width="3.4" stroke-linecap="round"/>';
      if (kind === 'wide') return '<circle cx="' + cx + '" cy="' + cy + '" r="7.5" fill="#fff" stroke="' + FEATURE + '" stroke-width="2.4"/>' +
                                  '<circle cx="' + cx + '" cy="' + cy + '" r="3.4" fill="' + FEATURE + '"/>';
      if (kind === 'xx') return '<path d="M' + (cx - 6) + ' ' + (cy - 6) + ' l12 12 M' + (cx + 6) + ' ' + (cy - 6) + ' l-12 12" stroke="' + FEATURE + '" stroke-width="3.2" stroke-linecap="round"/>';
      if (kind === 'heart') return shape(cx, cy, 20, HEART_PATH, '#e58fb0');
      if (kind === 'star') return shape(cx, cy, 22, STAR_PATH, '#f2c14e');
      return '';
    }

    function mouth(kind) {
      var st = 'fill="none" stroke="' + FEATURE + '" stroke-width="3.2" stroke-linecap="round"';
      if (kind === 'smile') return '<path d="M50 76 q10 9 20 0" ' + st + '/>';
      if (kind === 'openSmile') return '<path d="M47 72 q13 20 26 0 Z" fill="' + FEATURE + '"/>';
      if (kind === 'small') return '<path d="M55 78 q5 5 10 0" ' + st + '/>';
      if (kind === 'frown') return '<path d="M50 83 q10 -10 20 0" ' + st + '/>';
      if (kind === 'o') return '<ellipse cx="60" cy="79" rx="6.5" ry="8" fill="' + FEATURE + '"/>';
      if (kind === 'wavy') return '<path d="M50 79 q5 -6 10 0 q5 6 10 0" ' + st + '/>';
      if (kind === 'flat') return '<path d="M51 79 h18" ' + st + '/>';
      if (kind === 'cat') return '<path d="M54 77 q6 7 12 0" ' + st + '/>';
      return '';
    }

    function build(spec) {
      var out = [];
      out.push('<ellipse cx="60" cy="108" rx="26" ry="5" fill="rgba(140,110,200,0.10)"/>');

      if (spec.ears) {
        out.push('<path d="M30 34 L22 10 L48 22 Z" fill="' + FACE_FILL + '" stroke="' + FACE_LINE + '" stroke-width="2.5" stroke-linejoin="round"/>');
        out.push('<path d="M90 34 L98 10 L72 22 Z" fill="' + FACE_FILL + '" stroke="' + FACE_LINE + '" stroke-width="2.5" stroke-linejoin="round"/>');
      }
      out.push('<circle cx="60" cy="60" r="42" fill="' + FACE_FILL + '" stroke="' + FACE_LINE + '" stroke-width="2.5"/>');

      if (spec.blush) {
        out.push('<ellipse cx="35" cy="72" rx="9" ry="6" fill="' + BLUSH + '" opacity="0.8"/>');
        out.push('<ellipse cx="85" cy="72" rx="9" ry="6" fill="' + BLUSH + '" opacity="0.8"/>');
      }

      var eyes = spec.eyes || 'dot';
      if (eyes === 'wink') {
        out.push(eye('arc', 45));
        out.push(eye('closed', 75));
      } else {
        out.push(eye(eyes, 45));
        out.push(eye(eyes, 75));
      }

      if (spec.brows) {
        out.push('<path d="M37 40 L53 47" stroke="' + FEATURE + '" stroke-width="3.2" stroke-linecap="round" fill="none"/>');
        out.push('<path d="M83 40 L67 47" stroke="' + FEATURE + '" stroke-width="3.2" stroke-linecap="round" fill="none"/>');
      }

      out.push(mouth(spec.mouth || 'smile'));

      if (spec.tears) {
        out.push('<path d="M41 63 q-4 11 0 15 q5 -5 0 -15Z" fill="#8fc4ee"/>');
        out.push('<path d="M79 63 q-4 11 0 15 q5 -5 0 -15Z" fill="#8fc4ee"/>');
      }
      if (spec.whiskers) {
        out.push('<path d="M26 68 h12 M26 76 h12 M94 68 h-12 M94 76 h-12" stroke="' + FACE_LINE + '" stroke-width="2.4" stroke-linecap="round" fill="none"/>');
      }
      if (spec.zzz) {
        out.push('<text x="92" y="32" font-size="18" font-weight="700" fill="#a894e0" font-family="sans-serif">z</text>');
        out.push('<text x="101" y="19" font-size="13" font-weight="700" fill="#c2b2f2" font-family="sans-serif">z</text>');
      }
      if (spec.mark === 'question') {
        out.push('<text x="93" y="36" font-size="27" font-weight="700" fill="#b79cf0" font-family="sans-serif">?</text>');
      }
      if (spec.sparkles) {
        out.push(shape(21, 33, 14, STAR_PATH, '#dccdf8'));
        out.push(shape(101, 44, 11, STAR_PATH, '#e9e0fb'));
        out.push(shape(95, 15, 8, STAR_PATH, '#dccdf8'));
      }
      if (spec.heartTop) {
        out.push(shape(96, 24, 22, HEART_PATH, '#ef9fbe'));
      }

      return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + out.join('') + '</svg>';
    }

    var LIST = [
      { id: 'smile',   name: '微笑',   eyes: 'dot',    mouth: 'smile' },
      { id: 'happy',   name: '开心',   eyes: 'arc',    mouth: 'openSmile', blush: true },
      { id: 'blush',   name: '害羞',   eyes: 'closed', mouth: 'small', blush: true },
      { id: 'love',    name: '喜欢',   eyes: 'heart',  mouth: 'smile', blush: true },
      { id: 'star',    name: '星星眼', eyes: 'star',   mouth: 'openSmile' },
      { id: 'sparkle', name: '闪闪',   eyes: 'dot',    mouth: 'smile', sparkles: true },
      { id: 'wink',    name: '眨眼',   eyes: 'wink',   mouth: 'smile' },
      { id: 'cry',     name: '哭了',   eyes: 'closed', mouth: 'wavy', tears: true },
      { id: 'sad',     name: '难过',   eyes: 'dot',    mouth: 'frown' },
      { id: 'angry',   name: '生气',   eyes: 'dot',    mouth: 'frown', brows: true },
      { id: 'shock',   name: '惊讶',   eyes: 'wide',   mouth: 'o' },
      { id: 'sleep',   name: '困了',   eyes: 'closed', mouth: 'small', zzz: true },
      { id: 'think',   name: '思考',   eyes: 'dot',    mouth: 'flat', mark: 'question' },
      { id: 'tired',   name: '累瘫',   eyes: 'xx',     mouth: 'flat' },
      { id: 'cat',     name: '猫猫',   eyes: 'arc',    mouth: 'cat', ears: true, whiskers: true },
      { id: 'hearts',  name: '比心',   eyes: 'arc',    mouth: 'smile', blush: true, heartTop: true },
    ];

    var cache = {};
    function svg(id) {
      if (cache[id]) return cache[id];
      var spec = null;
      for (var i = 0; i < LIST.length; i++) if (LIST[i].id === id) spec = LIST[i];
      if (!spec) return '';
      cache[id] = build(spec);
      return cache[id];
    }

    return { list: LIST, svg: svg };
  })();

  /* ---------------- 黄脸 emoji ---------------- */
  var EMOJI_RAW =
    '😀😃😄😁😆😅😂🤣🥲🙂🙃😉😊😇🥰😍🤩😘😗😚😙😋😛😜🤪😝🤗🤭🤫🤔' +
    '😐😑😶😏😒🙄😬😮😯😲🥺😢😭😤😠😡🤬😳🥵🥶😱😨😰😥😓🤒🤕🤢🤮🥴😵🤯' +
    '🤠🥳😎🤓🧐😴😪🤤😷🫠🫢🫣🫡😌😔😞😟😕🙁☹️😣😖😫😩🥱😶‍🌫️' +
    '👍👎👌✌️🤞🤟🤘🤙👏🙌🙏💪👋🤝✍️👀' +
    '❤️🧡💛💚💙💜🖤🤍🤎💕💞💓💗💖💘💝💟💔❣️' +
    '✨⭐🌟💫⚡🔥🎉🎊🎁🌙☁️🌸🌷🌿🍀🕊️🐰🐈🐈‍⬛🧸🍬🍭🎀🎐';

  // 按「字素簇」切分，保证 ❤️ / 😶‍🌫️ / 🐈‍⬛ 这类组合不会被拆散
  var EMOJI_LIST = (function () {
    try {
      if (window.Intl && Intl.Segmenter) {
        var seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        return Array.from(seg.segment(EMOJI_RAW), function (s) { return s.segment; });
      }
    } catch (e) { /* 退回按码位切分 */ }
    return Array.from(EMOJI_RAW);
  })();

  /* ---------------- 颜文字 ---------------- */
  var KAOMOJI_LIST = [
    '(＾▽＾)', '(＾ω＾)', '(・∀・)', '(´▽｀)', '(*´▽｀*)', '(￣▽￣)', '(｡･ω･｡)', '(・ω・)',
    '(◕‿◕)', '(◍•ᴗ•◍)', '(*´꒳`*)', '(๑>ᴗ<๑)', '(≧▽≦)', '(๑•̀ㅂ•́)و✧', '(ᵔᴥᵔ)', 'ʕ•ᴥ•ʔ',
    '(；ω；)', '(இ﹏இ`｡)', '(つ﹏⊂)', '(｡•́︿•̀｡)', '(ᵕ̣̣﹏ᵕ̣̣)', '(｡╯︵╰｡)', '(´；ω；`)',
    '(°ロ°)', '(ﾟдﾟ)', '(⊙_⊙)', '(◉_◉)', '°◇°', '(o_O)', '(◎_◎;)', '(°○°)',
    '(¬‿¬)', '(￣ω￣)', '(¬_¬)', '(￢_￢)', '(⇀‸↼‶)', '(￣ヘ￣)', '(¬‿¬ )',
    'ヽ(•‿•)ノ', '¯\\_(ツ)_/¯', '(ノ°∀°)ノ', '(๑•̀ㅂ•́)و', '(ง •̀_•́)ง', 'ᕦ(ò_óˇ)ᕤ',
    '(*/ω＼*)', '(⁄ ⁄•⁄ω⁄•⁄ ⁄)', '(๑´ㅂ`๑)', '(〃▽〃)',
    '(´･ω･`)', '(´-ω-`)', '(っ˘ω˘ς)', '(˘ω˘)', '(ᵕ—ᴗ—)', '(´•ω•`)',
    '(｀・ω・´)', '(๑•́ ₃ •̀๑)', '(•ˋ _ ˊ•)', '(•̀ᴗ•́)و', '(๑’ᵕ’๑)⸝*', '(⁀ᗢ⁀)',
    '(づ｡◕‿‿◕｡)づ', '┬─┬ノ( º _ ºノ)', '(￣▽￣)ゞ', '(＾◡＾)っ',
  ];

  var messagesEl = $('messages');
  var emptyStateEl = $('emptyState');
  var inputEl = $('input');
  var composerEl = $('composer');
  var sendBtn = $('sendBtn');
  var searchInput = $('searchInput');
  var cardListEl = $('cardList');
  var cardCountEl = $('cardCount');
  var peerStatus = $('peerStatus');
  var statusBtn = $('statusBtn');
  var statusMenu = $('statusMenu');

  /* ---------------- 通用 Toast ---------------- */

  function toast(message, kind) {
    var wrap = $('toastWrap');
    var node = el('div', 'toast' + (kind ? ' ' + kind : ''), message);
    wrap.appendChild(node);
    setTimeout(function () {
      node.classList.add('out');
      setTimeout(function () { node.remove(); }, 260);
    }, 2000);
  }

  function copyText(text) {
    var done = function () { toast('已复制到剪贴板', 'ok'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else {
      fallback();
    }
    function fallback() {
      var ta = el('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); }
      catch (e) { toast('复制失败，请手动选择文字', 'warn'); }
      ta.remove();
    }
  }

  /* ---------------- 弹窗控制 ---------------- */

  function openModal(node) {
    node.hidden = false;
    var focusable = node.querySelector('input:not([type=file]), textarea, button');
    if (focusable) setTimeout(function () { focusable.focus(); }, 60);
  }

  function closeModal(node) {
    node.hidden = true;
  }

  document.querySelectorAll('.modal').forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeModal(modal);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('photoView').hidden) return;   // 图片层自己处理
    var open = document.querySelector('.modal:not([hidden])');
    if (open) { closeModal(open); return; }
    if (!$('callMenu').hidden) { closeCallMenu(); return; }
    if (!$('emojiPanel').hidden) { closeEmojiPanel(); return; }
    if (call.state !== 'idle') return;   // 通话中不响应 Esc
    if (currentView !== 'chat' && currentView !== 'home') { goHome(); return; }
  });

  /* 确认弹窗 */
  var confirmResolve = null;
  function confirmDialog(title, desc, okText) {
    var modal = $('confirmModal');
    $('confirmTitle').textContent = title;
    $('confirmDesc').textContent = desc;
    $('confirmOkBtn').textContent = okText || '确定';
    openModal(modal);
    return new Promise(function (resolve) { confirmResolve = resolve; });
  }
  $('confirmOkBtn').addEventListener('click', function () {
    closeModal($('confirmModal'));
    if (confirmResolve) confirmResolve(true);
    confirmResolve = null;
  });
  $('confirmModal').addEventListener('click', function (e) {
    if (e.target.closest('[data-close]') && confirmResolve) {
      confirmResolve(false);
      confirmResolve = null;
    }
  });

  /* ---------------- 梦角资料 ---------------- */

  function paintAvatar(node, className) {
    if (!node) return;
    var p = Store.state.profile;
    node.className = 'avatar ' + className;
    node.innerHTML = '';
    if (p.avatarImage) {
      var img = el('img');
      img.src = p.avatarImage;
      img.alt = p.name || '';
      node.appendChild(img);
    } else {
      node.textContent = p.avatar || '🌙';
    }
  }

  function renderProfile() {
    var p = Store.state.profile;
    document.title = p.name ? (p.name + ' · 字卡传讯') : '字卡传讯';

    paintAvatar($('profileAvatar'), 'avatar-md');
    paintAvatar($('peerAvatar'), 'avatar-sm');

    $('profileName').textContent = p.name || '梦角';
    $('profileSign').textContent = p.sign || '';
    $('peerName').textContent = p.name || '梦角';
    updateStatus();
  }

  /* ---------------- 梦角状态：在线 / 在忙 / 离线 / 自动 ---------------- */

  var STATUS_LABEL = { auto: '自动', online: '在线', busy: '在忙', offline: '离线' };

  /** 自动模式下由「梦角」自己决定：深夜睡了，白天偶尔在忙 */
  function autoStatusValue() {
    var now = new Date();
    var h = now.getHours();
    if (h < 7 || h >= 23) return 'offline';
    var block = Math.floor(now.getTime() / (15 * 60 * 1000));
    return block % 5 === 0 ? 'busy' : 'online';
  }

  function statusMode() {
    var v = Store.state.settings.dreamStatus;
    return (v === 'online' || v === 'busy' || v === 'offline') ? v : 'auto';
  }

  function statusValue() {
    var mode = statusMode();
    return mode === 'auto' ? autoStatusValue() : mode;
  }

  /** 顶栏那个状态点 + 文字 */
  function updateStatus() {
    var mode = statusMode();
    var value = statusValue();

    statusBtn.dataset.status = value;
    statusBtn.dataset.mode = mode;
    peerStatus.textContent = STATUS_LABEL[value];
    statusBtn.title = '梦角状态：' + STATUS_LABEL[value]
      + (mode === 'auto' ? '（自动，由梦角自己决定）' : '')
      + ' · 点一下可以改';
    $('statusHint').textContent = Store.countCards() ? '' : '· 字卡库是空的';

    [].slice.call(statusMenu.querySelectorAll('button')).forEach(function (b) {
      b.classList.toggle('active', b.dataset.status === mode);
    });
  }

  function openStatusMenu() {
    updateStatus();
    statusMenu.hidden = false;
    statusBtn.setAttribute('aria-expanded', 'true');
  }

  function closeStatusMenu() {
    statusMenu.hidden = true;
    statusBtn.setAttribute('aria-expanded', 'false');
  }

  statusBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (statusMenu.hidden) openStatusMenu();
    else closeStatusMenu();
  });

  statusMenu.addEventListener('click', function (e) {
    var pick = e.target.closest('button[data-status]');
    if (!pick) return;
    var next = pick.dataset.status;
    Store.updateSettings({ dreamStatus: next });
    Store.save();
    closeStatusMenu();
    updateStatus();
    toast(next === 'auto'
      ? '好，之后由梦角自己决定状态'
      : '梦角状态已设为「' + STATUS_LABEL[next] + '」', 'ok');
  });

  /* 点别处、按 Esc 都收起来 */
  document.addEventListener('click', function (e) {
    if (statusMenu.hidden) return;
    if (e.target.closest('#statusMenu') || e.target.closest('#statusBtn')) return;
    closeStatusMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !statusMenu.hidden) closeStatusMenu();
  });

  /* 自动模式下状态会自己变，每分钟对一次表 */
  setInterval(function () {
    if (statusMenu.hidden && statusMode() === 'auto') updateStatus();
  }, 60000);

  /* ---------------- 字卡列表 ---------------- */

  function renderCards() {
    var query = searchInput.value;
    var list = Store.searchCards(query);

    cardListEl.innerHTML = '';

    if (!list.length) {
      var hint = el('div', 'sys',
        Store.countCards() === 0
          ? '字卡库还是空的，点上面的「新增字卡」开始吧。'
          : '没有找到匹配的字卡。');
      hint.style.margin = '18px auto';
      cardListEl.appendChild(hint);
    } else if (Store.state.settings.cardsGrouped) {
      renderCardsGrouped(list, !!query.trim());
    } else {
      list.forEach(function (card) {
        cardListEl.appendChild(cardItemEl(card));
      });
    }

    cardCountEl.textContent = Store.countCards() + ' 张';
    renderCardsViewBar();
    updateStatus();
    renderTagSuggestions();
  }

  /** 按标签分组渲染（搜索时强制展开，免得结果被折叠藏起来） */
  function renderCardsGrouped(list, searching) {
    var groups = {};
    list.forEach(function (c) {
      if (!c.tags.length) {
        (groups[''] = groups[''] || []).push(c);
        return;
      }
      c.tags.forEach(function (t) {
        (groups[t] = groups[t] || []).push(c);
      });
    });

    var keys = Object.keys(groups).sort(function (a, b) {
      if (a === '') return 1;
      if (b === '') return -1;
      return groups[b].length - groups[a].length;
    });

    var collapsed = Store.state.settings.collapsedGroups || [];

    keys.forEach(function (k) {
      var items = groups[k];
      var isCollapsed = !searching && collapsed.indexOf(k) !== -1;

      var sec = el('div', 'card-group' + (isCollapsed ? ' collapsed' : ''));

      var head = el('button', 'card-group-head');
      head.type = 'button';
      head.appendChild(el('span', 'card-group-name', k || '无标签'));
      head.appendChild(el('span', 'card-group-count', items.length + ' 张'));
      if (k) {
        var ren = el('button', 'card-group-edit');
        ren.type = 'button';
        ren.title = '重命名这个标签';
        ren.appendChild(svgIcon('edit'));
        ren.addEventListener('click', function (e) {
          e.stopPropagation();
          renameTagFlow(k);
        });
        head.appendChild(ren);
      }
      head.appendChild(el('span', 'card-group-chevron', '›'));
      head.dataset.tag = k;
      head.addEventListener('click', function () { toggleCardGroup(k); });
      sec.appendChild(head);

      if (!isCollapsed) {
        var body = el('div', 'card-group-body');
        items.forEach(function (card) {
          var node = cardItemEl(card);
          if (k) bindCardDrag(node, card);
          body.appendChild(node);
        });
        sec.appendChild(body);
      }
      cardListEl.appendChild(sec);
    });
  }

  function toggleCardGroup(tag) {
    var cur = (Store.state.settings.collapsedGroups || []).slice();
    var i = cur.indexOf(tag);
    if (i === -1) cur.push(tag);
    else cur.splice(i, 1);
    Store.updateSettings({ collapsedGroups: cur });
    Store.save();
    renderCards();
  }

  /** 当前所有分组名（含空标签） */
  function allCardGroups() {
    var seen = {};
    var out = [];
    Store.allCards().forEach(function (c) {
      if (!c.tags.length) {
        if (!seen['']) { seen[''] = 1; out.push(''); }
        return;
      }
      c.tags.forEach(function (t) {
        if (!seen[t]) { seen[t] = 1; out.push(t); }
      });
    });
    return out;
  }

  function renderCardsViewBar() {
    var grouped = !!Store.state.settings.cardsGrouped;
    document.querySelectorAll('#cardsViewSeg [data-mode]').forEach(function (b) {
      b.classList.toggle('active', (b.dataset.mode === 'group') === grouped);
    });
    var btn = $('groupToggleAllBtn');
    var collapsed = Store.state.settings.collapsedGroups || [];
    var keys = allCardGroups();
    var allCollapsed = keys.length > 0 && keys.every(function (k) { return collapsed.indexOf(k) !== -1; });
    btn.textContent = allCollapsed ? '全部展开' : '全部收起';
    btn.hidden = !grouped;
  }

  function setCardsGrouped(grouped) {
    Store.updateSettings({ cardsGrouped: !!grouped });
    Store.save();
    renderCards();
  }

  function toggleAllCardGroups() {
    var keys = allCardGroups();
    var collapsed = Store.state.settings.collapsedGroups || [];
    var allCollapsed = keys.length > 0 && keys.every(function (k) { return collapsed.indexOf(k) !== -1; });
    Store.updateSettings({ collapsedGroups: allCollapsed ? [] : keys.slice() });
    Store.save();
    renderCards();
  }

  document.querySelectorAll('#cardsViewSeg [data-mode]').forEach(function (b) {
    b.addEventListener('click', function () { setCardsGrouped(b.dataset.mode === 'group'); });
  });
  $('groupToggleAllBtn').addEventListener('click', toggleAllCardGroups);

  /* ---- 拖动卡片：换组 / 加标签 ---- */
  function bindCardDrag(node, card) {
    node.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.card-item-actions')) return;

      var box = cardListEl.parentNode;      // .sp-body 滚动容器
      var lastX = e.clientX, lastY = e.clientY;
      var moved = false;
      var autoTimer = null;

      function clearTargets() {
        document.querySelectorAll('.drop-target').forEach(function (n) { n.classList.remove('drop-target'); });
      }
      function highlight() {
        var under = document.elementFromPoint(lastX, lastY);
        var group = under && under.closest ? under.closest('.card-group') : null;
        clearTargets();
        if (group) {
          var h = group.querySelector('.card-group-head');
          if (h) h.classList.add('drop-target');
        }
      }
      // 拖到边缘时自动滚动，否则够不到远处分组
      function autoScroll() {
        if (!moved) return;
        var r = box.getBoundingClientRect();
        var edge = 64;
        var before = box.scrollTop;
        if (lastY < r.top + edge) box.scrollTop -= 14;
        else if (lastY > r.bottom - edge) box.scrollTop += 14;
        if (box.scrollTop !== before) highlight();
      }

      node.classList.add('dragging');
      try { node.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
      autoTimer = setInterval(autoScroll, 50);

      function move(ev) {
        lastX = ev.clientX;
        lastY = ev.clientY;
        if (Math.abs(ev.movementX || 0) + Math.abs(ev.movementY || 0) > 0) moved = true;
        if (!moved) moved = true;
        highlight();
      }
      function up(ev) {
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerup', up);
        node.removeEventListener('pointercancel', up);
        clearInterval(autoTimer);
        try { node.releasePointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }

        var under = document.elementFromPoint(ev.clientX, ev.clientY);
        var group = under && under.closest ? under.closest('.card-group') : null;
        var head = group ? group.querySelector('.card-group-head') : null;
        var targetTag = head ? (head.dataset.tag || '') : null;

        node.classList.remove('dragging');
        clearTargets();

        // 没真正拖动 = 普通点击，什么都不做
        if (!moved || targetTag === null) return;
        handleCardDrop(card, targetTag);
      }
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerup', up);
      node.addEventListener('pointercancel', up);
    });
  }

  function handleCardDrop(card, targetTag) {
    var changed = false;
    if (!targetTag) {
      changed = Store.clearCardTags(card.id);
    } else if (card.tags.indexOf(targetTag) === -1) {
      changed = Store.addTagToCard(card.id, targetTag);
    } else {
      toast('这张卡已经在这一组里了', 'warn');
      return;
    }
    if (!changed) return;
    Store.save();
    renderCards();
    toast(targetTag ? ('已加上「' + targetTag + '」标签') : '已清空这张卡的标签', 'ok');
  }

  /* ---- 通用输入弹窗 ---- */
  var promptResolve = null;

  function promptDialog(title, desc, value, okText) {
    var modal = $('promptModal');
    $('promptTitle').textContent = title;
    $('promptDesc').textContent = desc || '';
    $('promptInput').value = value || '';
    $('promptOkBtn').textContent = okText || '确定';
    openModal(modal);
    setTimeout(function () {
      $('promptInput').focus();
      $('promptInput').select();
    }, 60);
    return new Promise(function (resolve) { promptResolve = resolve; });
  }

  function closePrompt(result) {
    closeModal($('promptModal'));
    if (promptResolve) promptResolve(result);
    promptResolve = null;
  }

  $('promptOkBtn').addEventListener('click', function () { closePrompt($('promptInput').value); });
  $('promptInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); closePrompt(this.value); }
  });
  $('promptModal').addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) closePrompt(null);
  });

  function cardItemEl(card) {
    var item = el('div', 'card-item');
    item.dataset.id = card.id;

    item.appendChild(el('div', 'card-item-text', card.text));

    var foot = el('div', 'card-item-foot');
    var tagWrap = el('div', 'tag-wrap');
    if (!card.tags.length) {
      tagWrap.appendChild(el('span', 'tag empty', ''));
    } else {
      card.tags.forEach(function (t) {
        tagWrap.appendChild(el('span', 'tag', t));
      });
    }
    foot.appendChild(tagWrap);

    var actions = el('div', 'card-item-actions');

    var editBtn = el('button', 'icon-btn');
    editBtn.type = 'button';
    editBtn.title = '编辑';
    editBtn.dataset.action = 'edit-card';
    editBtn.appendChild(svgIcon('edit'));

    var delBtn = el('button', 'icon-btn del');
    delBtn.type = 'button';
    delBtn.title = '删除';
    delBtn.dataset.action = 'del-card';
    delBtn.appendChild(svgIcon('del'));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    foot.appendChild(actions);

    item.appendChild(foot);
    return item;
  }

  function renderTagSuggestions() {
    var dl = $('tagSuggestions');
    dl.innerHTML = '';
    Store.allTags().forEach(function (t) {
      var opt = el('option');
      opt.value = t;
      dl.appendChild(opt);
    });
  }

  /* ---- 分组标题栏上的重命名 ---- */
  function renameTagFlow(tag) {
    promptDialog('重命名标签', '这一组下的所有字卡都会一起改。留空等于删掉这个标签。', tag, '保存')
      .then(function (val) {
        if (val === null) return;
        var next = val.trim();
        if (next === tag) return;
        if (next && Store.allTags().indexOf(next) !== -1) {
          confirmDialog('合并到「' + next + '」？', '已经存在同名标签，这一组会被合并进去。', '合并')
            .then(function (ok) {
              if (!ok) return;
              doRenameTag(tag, next);
            });
          return;
        }
        doRenameTag(tag, next);
      });
  }

  function doRenameTag(tag, next) {
    var n = Store.renameTag(tag, next);
    // 折叠状态跟着搬过去
    var collapsed = (Store.state.settings.collapsedGroups || []).filter(function (k) { return k !== tag; });
    Store.updateSettings({ collapsedGroups: collapsed });
    Store.save();
    renderCards();
    toast(n ? ('已整理 ' + n + ' 张字卡的标签') : '没有改动', n ? 'ok' : 'warn');
  }

  /* ---------------- 消息列表 ---------------- */

  function updateEmptyState() {
    if (Store.state.messages.length) {
      if (emptyStateEl.parentNode) emptyStateEl.remove();
    } else if (!emptyStateEl.parentNode) {
      messagesEl.appendChild(emptyStateEl);
    }
  }

  function isNearBottom() {
    return messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 140;
  }

  function scrollToBottom(force) {
    if (force || isNearBottom()) {
      requestAnimationFrame(function () {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      });
    }
  }

  function messageEl(msg, animate) {
    if (msg.role === 'call' || msg.role === 'sys') {
      var record = el('div', 'sys sys-call' + (animate ? ' pop' : ''), msg.text);
      record.dataset.id = msg.id;
      return record;
    }

    // 拍一拍
    if (msg.role === 'pat') {
      var line = el('div', 'pat-line' + (animate ? ' pop' : ''));
      line.dataset.id = msg.id;
      line.appendChild(el('span', 'pat-hand', '👉'));
      line.appendChild(el('span', 'pat-text', msg.text));
      return line;
    }

    // 表情包消息
    if (msg.sticker) {
      var sRow = el('div', 'msg ' + msg.role + (animate ? ' pop' : ''));
      sRow.dataset.id = msg.id;
      var sStack = el('div', 'msg-stack');
      var sBubble = el('div', 'bubble sticker-bubble');
      sBubble.appendChild(stickerNode(msg.sticker));
      sStack.appendChild(sBubble);
      var sMeta = el('div', 'msg-meta');
      sMeta.appendChild(el('span', null, timeLabel(msg.time)));
      sStack.appendChild(sMeta);
      sRow.appendChild(sStack);
      return sRow;
    }

    var row = el('div', 'msg ' + msg.role + (animate ? ' pop' : ''));
    row.dataset.id = msg.id;

    var stack = el('div', 'msg-stack');

    var bubble = el('div', 'bubble');
    var isExpr = msg.kind === 'emoji' || msg.kind === 'kao';

    if (msg.role === 'dream' && msg.tag && !isExpr) {
      bubble.classList.add('card-bubble');
      var tag = el('span', 'card-tag', msg.tag);
      bubble.appendChild(tag);
      var body = el('div', 'card-body', msg.text);
      bubble.appendChild(body);
    } else {
      if (msg.role === 'dream') {
        bubble.classList.add(isExpr ? ('kind-' + msg.kind) : 'card-bubble');
      }
      bubble.appendChild(el('div', 'card-body', msg.text));
    }
    stack.appendChild(bubble);

    var meta = el('div', 'msg-meta');
    meta.appendChild(el('span', null, timeLabel(msg.time)));

    if (msg.role === 'dream') {
      var tools = el('div', 'card-tools');

      var redraw = el('button', 'mini-btn');
      redraw.type = 'button';
      redraw.dataset.action = 'redraw';
      redraw.title = '重新抽一张';
      redraw.appendChild(svgIcon('redraw'));
      redraw.appendChild(el('span', null, '换一张'));

      var copy = el('button', 'mini-btn');
      copy.type = 'button';
      copy.dataset.action = 'copy';
      copy.title = '复制';
      copy.appendChild(svgIcon('copy'));
      copy.appendChild(el('span', null, '复制'));

      tools.appendChild(redraw);
      tools.appendChild(copy);
      meta.appendChild(tools);
    }

    stack.appendChild(meta);
    row.appendChild(stack);
    return row;
  }

  function appendMessage(msg, animate) {
    updateEmptyState();

    var near = isNearBottom();
    var node = messageEl(msg, animate);
    messagesEl.appendChild(node);
    if (near) scrollToBottom(true);
    return node;
  }

  function renderMessages() {
    messagesEl.innerHTML = '';
    Store.state.messages.forEach(function (msg) {
      messagesEl.appendChild(messageEl(msg, false));
    });
    updateEmptyState();
    scrollToBottom(true);
  }

  function appendSystem(text) {
    messagesEl.appendChild(el('div', 'sys', text));
    scrollToBottom(true);
  }

  /* ---- 正在输入气泡（梦角挑字卡 / 读信时显示） ---- */
  var typingEl = null;
  function showTyping(text) {
    hideTyping();
    typingEl = el('div', 'msg dream');
    var stack = el('div', 'msg-stack');
    var bubble = el('div', 'bubble typing-bubble');
    bubble.appendChild(el('span', 'typing-text', text || '正在输入中'));
    bubble.appendChild(el('i'));
    bubble.appendChild(el('i'));
    bubble.appendChild(el('i'));
    stack.appendChild(bubble);
    typingEl.appendChild(stack);
    messagesEl.appendChild(typingEl);
    scrollToBottom(true);
  }
  function hideTyping() {
    if (typingEl) { typingEl.remove(); typingEl = null; }
  }

  /* ---------------- 抽卡回复队列 ---------------- */

  var queue = [];
  var replying = false;

  /* 梦角"打字"的间隔 */
  var REPLY_DELAY = {
    fast: [200, 500],
    normal: [620, 1400],
    slow: [1600, 3200],
  };

  function replyDelayMs() {
    var s = Store.state.settings;
    if (s.replyDelay === 'custom') {
      var sec = typeof s.replyDelaySec === 'number' ? s.replyDelaySec : 1;
      return Math.max(60, sec * 1000 * (0.65 + Math.random() * 0.7));
    }
    var r = REPLY_DELAY[s.replyDelay] || REPLY_DELAY.normal;
    return r[0] + Math.random() * (r[1] - r[0]);
  }

  function enqueueReply() {
    queue.push(1);
    if (!replying) runQueue();
  }

  function runQueue() {
    replying = true;
    var step = function () {
      if (!queue.length) { replying = false; return; }
      queue.shift();
      showTyping();
      sleep(replyDelayMs()).then(function () {
        hideTyping();
        deliverReply();
        step();
      });
    };
    step();
  }

  /* 梦角回复时用表情的概率 */
  var EXPR_RATE = { off: 0, less: 0.18, often: 0.35, half: 0.5 };

  /* 按时段优先抽卡：不同时间偏向不同标签 */
  var TIME_TAGS = [
    { from: 5,  to: 11, tags: ['早晨', '问候'] },
    { from: 11, to: 18, tags: ['日常', '闲聊', '食物', '天气', '关心', '反问', '状态'] },
    { from: 18, to: 23, tags: ['问候', '加班', '计划', '旅行', '和解', '心情'] },
    { from: 23, to: 5,  tags: ['深夜', '睡前', '晚安', '思念', '心情', '感叹'] },
  ];

  function currentPeriodTags() {
    var h = new Date().getHours();
    for (var i = 0; i < TIME_TAGS.length; i++) {
      var p = TIME_TAGS[i];
      if (p.from < p.to) {
        if (h >= p.from && h < p.to) return p.tags;
      } else if (h >= p.from || h < p.to) {
        return p.tags;
      }
    }
    return [];
  }

  /** 抽一张字卡：开启时段感知时，约 3/4 概率优先从当前时段的标签里抽 */
  function drawCard() {
    if (Store.state.settings.timeAware) {
      var tags = currentPeriodTags();
      if (tags.length) {
        var pool = Store.allCards().filter(function (c) {
          return c.tags.length && (function () {
        for (var i = 0; i < c.tags.length; i++) {
          if (tags.indexOf(c.tags[i]) !== -1) return true;
        }
        return false;
      })();
        });
        if (pool.length && Math.random() < 0.75) {
          return pool[Math.floor(Math.random() * pool.length)];
        }
      }
    }
    return Store.randomCard();
  }

  function allStickerRefs() {
    var pool = STICKERS.list.map(function (s) { return 'builtin:' + s.id; });
    customStickers.forEach(function (s) { pool.push('img:' + s.id); });
    return pool;
  }

  /* 梦角主动拍你的频率 */
  var PAT_RATE = { off: 0, less: 0.08, often: 0.18, half: 0.35 };

  /**
   * 从「字卡 + 黄脸 + 颜文字 + 表情包 + 拍一拍」里挑一条回复。
   * 返回 { kind:'card'|'emoji'|'kao'|'sticker'|'pat', text?, tag?, ref? } 或 null
   */
  function pickReply() {
    var cards = Store.allCards();
    var pools = [];

    var emoji = EMOJI_LIST.concat(Store.state.extra.face);
    var kao = KAOMOJI_LIST.concat(Store.state.extra.kao);
    var stickers = allStickerRefs();

    if (emoji.length) pools.push({ kind: 'emoji', w: 40, list: emoji });
    if (kao.length) pools.push({ kind: 'kao', w: 38, list: kao });
    if (stickers.length) pools.push({ kind: 'sticker', w: 22, list: stickers });

    if (!cards.length && !pools.length) return null;

    // 1) 梦角主动拍你：独立频率，只在字卡库不空时生效
    var patP = PAT_RATE[Store.state.settings.patRate];
    if (typeof patP !== 'number') patP = PAT_RATE.less;
    if (cards.length && patP > 0 && Math.random() < patP) {
      return { kind: 'pat' };
    }

    // 2) 字卡 还是 表情
    var p = EXPR_RATE[Store.state.settings.exprRate];
    if (typeof p !== 'number') p = EXPR_RATE.less;
    if (!cards.length) p = 1;        // 没有字卡时全用表情
    if (!pools.length) p = 0;        // 没有表情时全用字卡

    if (pools.length && Math.random() < p) {
      var total = 0;
      pools.forEach(function (x) { total += x.w; });
      var r = Math.random() * total;
      var chosen = pools[pools.length - 1];
      for (var i = 0; i < pools.length; i++) {
        r -= pools[i].w;
        if (r <= 0) { chosen = pools[i]; break; }
      }
      var val = chosen.list[Math.floor(Math.random() * chosen.list.length)];
      if (chosen.kind === 'sticker') return { kind: 'sticker', ref: val };
      return { kind: chosen.kind, text: val };
    }

    var card = drawCard();
    if (card) return { kind: 'card', text: card.text, tag: card.tags.join(' / ') };
    return null;
  }

  function deliverReply() {
    var pick = pickReply();
    if (!pick) {
      appendSystem('字卡和表情都还是空的，先去「字卡库」添加一些吧～');
      return;
    }

    var msg;
    if (pick.kind === 'pat') {
      addPat(false);
      replayAnim($('composer'), 'shake');
      return;
    }
    if (pick.kind === 'sticker') {
      msg = Store.addSticker('dream', pick.ref);
    } else if (pick.kind === 'card') {
      msg = Store.addMessage('dream', pick.text, pick.tag);
    } else {
      msg = Store.addMessage('dream', pick.text, '', pick.kind);
    }
    Store.save();
    appendMessage(msg, true);
  }

  /* ---------------- 发送消息 ---------------- */

  /* 梦角回你消息的概率 */
  var REPLY_RATE = { rare: 0.25, half: 0.5, often: 0.85, always: 1 };

  /* 梦角"已读不回"时，在消息下面留一个小标记 */
  function markRead(row) {
    if (!row) return;
    setTimeout(function () {
      if (!row.isConnected) return;
      var meta = row.querySelector('.msg-meta');
      if (!meta || meta.querySelector('.read-mark')) return;
      meta.appendChild(el('span', 'read-mark', '已读'));
    }, 700 + Math.random() * 900);
  }

  /** 掷一次骰子决定梦角这次回不回 */
  function maybeReply(row) {
    var rate = REPLY_RATE[Store.state.settings.replyRate];
    if (typeof rate !== 'number') rate = 1;
    if (Math.random() < rate) {
      enqueueReply();
      return true;
    }
    markRead(row);
    return false;
  }

  function send() {
    var value = inputEl.value.trim();
    if (!value) return;

    var msg = Store.addMessage('user', value);
    Store.save();
    var row = appendMessage(msg, true);

    inputEl.value = '';
    autoGrow();
    maybeReply(row);
  }

  function autoGrow() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 150) + 'px';
  }

  composerEl.addEventListener('submit', function (e) {
    e.preventDefault();
    send();
  });

  inputEl.addEventListener('input', autoGrow);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      send();
    }
  });

  /* ---------------- 表情（黄脸 / 颜文字 / 表情包） ---------------- */

  var emojiPanel = $('emojiPanel');
  var emojiBtn = $('emojiBtn');
  var stickerURLs = {};      // id -> objectURL
  var customStickers = [];   // [{ id, name, createdAt }]

  function pickPane(name) {
    return document.querySelector('.emoji-pane[data-pane="' + name + '"]');
  }

  /* ---- 把 sticker 引用变成可视节点 ---- */
  function stickerNode(ref) {
    var box = el('div', 'sticker');
    if (ref.indexOf('builtin:') === 0) {
      box.innerHTML = STICKERS.svg(ref.slice(8));
      return box;
    }
    if (ref.indexOf('img:') === 0) {
      var url = stickerURLs[ref.slice(4)];
      if (url) {
        var img = el('img', 'sticker-img');
        img.src = url;
        img.alt = '表情包';
        box.appendChild(img);
      } else {
        box.appendChild(el('div', 'sticker-missing', '表情已丢失'));
      }
      return box;
    }
    return box;
  }

  /* ---- 把文字插入到输入框光标处 ---- */
  function insertAtCursor(text) {
    var v = inputEl.value;
    var start = inputEl.selectionStart;
    var end = inputEl.selectionEnd;
    if (start === null || start === undefined) { start = v.length; end = v.length; }
    inputEl.value = v.slice(0, start) + text + v.slice(end);
    var pos = start + text.length;
    inputEl.focus();
    try { inputEl.setSelectionRange(pos, pos); } catch (e) { /* 忽略 */ }
    autoGrow();
  }

  /* ---- 分页标题与"我添加的"行 ---- */
  function paneHead(title, hint) {
    var h = el('div', 'pane-head');
    h.appendChild(el('span', 'pane-title', title));
    h.appendChild(el('span', 'pane-hint', hint));
    return h;
  }

  function paneSub(text) {
    var s = el('div', 'pane-sub');
    s.appendChild(el('span', null, text));
    return s;
  }

  /* 带删除按钮的自定义条目 */
  function removable(kind, value, onClick) {
    var wrap = el('div', 'cell-wrap');
    var cell = el('button', kind === 'face' ? 'emoji-cell' : 'kao-cell', value);
    cell.type = 'button';
    cell.title = value;
    cell.addEventListener('click', onClick);
    wrap.appendChild(cell);

    var del = el('button', 'cell-del', '×');
    del.type = 'button';
    del.title = '删除';
    del.addEventListener('click', function (ev) {
      ev.stopPropagation();
      Store.removeExtra(kind, value);
      Store.save();
      renderPane(kind);
      toast('已删除', 'ok');
    });
    wrap.appendChild(del);
    return wrap;
  }

  /* 底部「添加」输入行 */
  function addRow(kind, placeholder, onAdded) {
    var row = el('div', 'emoji-add');
    var inp = el('input', 'emoji-add-input');
    inp.type = 'text';
    inp.placeholder = placeholder;
    inp.setAttribute('aria-label', placeholder);

    var btn = el('button', 'emoji-add-btn', '添加');
    btn.type = 'button';

    function submit() {
      var raw = inp.value.trim();
      if (!raw) { inp.focus(); return; }
      // 黄脸：把粘贴进来的内容按字素拆开，一次可以加好几个
      var values = kind === 'face' ? splitGraphemes(raw) : [raw];
      var n = Store.addExtra(kind, values);
      Store.save();
      inp.value = '';
      inp.focus();
      renderPane(kind);
      if (onAdded) onAdded();
      toast(n ? '已添加 ' + n + ' 个' : '这个已经在列表里了', n ? 'ok' : 'warn');
    }

    btn.addEventListener('click', submit);
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });

    row.appendChild(inp);
    row.appendChild(btn);
    return row;
  }

  function splitGraphemes(str) {
    try {
      if (window.Intl && Intl.Segmenter) {
        var seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        return Array.from(seg.segment(str), function (s) { return s.segment; });
      }
    } catch (e) { /* 退回按码位拆 */ }
    return Array.from(str);
  }

  /* ---- 三个分页，各自独立渲染 ---- */
  function renderPane(kind) {
    if (kind === 'face') return renderFacePane();
    if (kind === 'kao') return renderKaoPane();
    if (kind === 'sticker') return renderStickerPane();
  }

  function renderFacePane() {
    var pane = pickPane('face');
    if (!pane) return;
    pane.innerHTML = '';
    pane.appendChild(paneHead('黄脸表情', '共 ' + EMOJI_LIST.length + ' 个 · 点击插入到输入框'));

    var grid = el('div', 'tile-grid face');
    EMOJI_LIST.forEach(function (e) {
      var b = el('button', 'emoji-cell', e);
      b.type = 'button';
      b.title = e;
      b.addEventListener('click', function () { insertAtCursor(e); });
      grid.appendChild(b);
    });
    pane.appendChild(grid);

    var extras = Store.state.extra.face;
    pane.appendChild(paneSub('我添加的 · ' + extras.length + ' 个'));

    var cgrid = el('div', 'tile-grid face');
    extras.forEach(function (e) {
      cgrid.appendChild(removable('face', e, function () { insertAtCursor(e); }));
    });
    var add = el('button', 'emoji-cell add-tile', '＋');
    add.type = 'button';
    add.title = '添加到输入框下方';
    add.addEventListener('click', function () {
      var inp = pane.querySelector('.emoji-add-input');
      if (inp) inp.focus();
    });
    cgrid.appendChild(add);
    pane.appendChild(cgrid);

    pane.appendChild(addRow('face', '粘贴表情，如 😺🐰（可一次多个）'));
  }

  function renderKaoPane() {
    var pane = pickPane('kao');
    if (!pane) return;
    pane.innerHTML = '';
    pane.appendChild(paneHead('颜文字', '共 ' + KAOMOJI_LIST.length + ' 个 · 点击插入到输入框'));

    var grid = el('div', 'tile-grid kao');
    KAOMOJI_LIST.forEach(function (k) {
      var b = el('button', 'kao-cell', k);
      b.type = 'button';
      b.title = k;
      b.addEventListener('click', function () { insertAtCursor(k); });
      grid.appendChild(b);
    });
    pane.appendChild(grid);

    var extras = Store.state.extra.kao;
    pane.appendChild(paneSub('我添加的 · ' + extras.length + ' 个'));

    var cgrid = el('div', 'tile-grid kao');
    extras.forEach(function (k) {
      cgrid.appendChild(removable('kao', k, function () { insertAtCursor(k); }));
    });
    var add = el('button', 'kao-cell add-tile', '＋ 添加颜文字');
    add.type = 'button';
    add.addEventListener('click', function () {
      var inp = pane.querySelector('.emoji-add-input');
      if (inp) inp.focus();
    });
    cgrid.appendChild(add);
    pane.appendChild(cgrid);

    pane.appendChild(addRow('kao', '输入颜文字，如 (｡・ω・｡)'));
  }

  function renderStickerPane() {
    var pane = pickPane('sticker');
    if (!pane) return;
    pane.innerHTML = '';
    pane.appendChild(paneHead('表情包', '共 ' + (STICKERS.list.length + customStickers.length) + ' 个 · 点击直接发送'));
    pane.appendChild(paneSub('内置表情 · ' + STICKERS.list.length + ' 个'));

    var grid = el('div', 'tile-grid sticker');
    STICKERS.list.forEach(function (item) {
      var b = el('button', 'sticker-cell');
      b.type = 'button';
      b.title = item.name;
      b.innerHTML = STICKERS.svg(item.id);
      b.addEventListener('click', function () {
        sendSticker('builtin:' + item.id);
        closeEmojiPanel();
      });
      grid.appendChild(b);
    });
    pane.appendChild(grid);

    pane.appendChild(paneSub('我导入的 · ' + customStickers.length + ' 个'));

    var cgrid = el('div', 'tile-grid sticker');
    customStickers.forEach(function (s) {
      var b = el('button', 'sticker-cell');
      b.type = 'button';
      b.title = s.name;

      var img = el('img', 'sticker-img');
      img.src = stickerURLs[s.id] || '';
      img.alt = s.name;
      b.appendChild(img);

      var del = el('button', 'sticker-del', '×');
      del.type = 'button';
      del.title = '删除';
      del.addEventListener('click', function (ev) {
        ev.stopPropagation();
        deleteSticker(s.id);
      });
      b.appendChild(del);

      b.addEventListener('click', function () {
        sendSticker('img:' + s.id);
        closeEmojiPanel();
      });
      cgrid.appendChild(b);
    });

    var addImg = el('button', 'sticker-cell add');
    addImg.type = 'button';
    addImg.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>导入图片</span>';
    addImg.addEventListener('click', function () { $('stickerFile').click(); });
    cgrid.appendChild(addImg);

    pane.appendChild(cgrid);
    pane.appendChild(el('div', 'pane-empty', '支持 PNG / JPG / GIF，单个小于 2MB，可多选；刷新后依然在。'));
  }

  /* ---- 面板开关 ---- */
  function selectEmojiTab(tab) {
    document.querySelectorAll('.emoji-tabs button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.querySelectorAll('.emoji-pane').forEach(function (p) {
      p.hidden = p.dataset.pane !== tab;
    });
    // 每次切页都只渲染当前这一页，三块互不干扰
    renderPane(tab);
  }

  function openEmojiPanel(tab) {
    emojiPanel.hidden = false;
    emojiBtn.classList.add('active');
    selectEmojiTab(tab || 'face');
  }

  function closeEmojiPanel() {
    emojiPanel.hidden = true;
    emojiBtn.classList.remove('active');
  }

  emojiBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (emojiPanel.hidden) openEmojiPanel('face');
    else closeEmojiPanel();
  });

  document.querySelectorAll('.emoji-tabs button').forEach(function (b) {
    b.addEventListener('click', function () { selectEmojiTab(b.dataset.tab); });
  });

  document.addEventListener('click', function (e) {
    if (emojiPanel.hidden) return;
    if (e.target.closest('#emojiPanel') || e.target.closest('#emojiBtn')) return;
    closeEmojiPanel();
  });

  /* ---- 发送表情包 ---- */
  function sendSticker(ref) {
    var msg = Store.addSticker('user', ref);
    Store.save();
    var row = appendMessage(msg, true);
    maybeReply(row);
  }

  /* ---- 导入 / 删除自己的表情包 ---- */
  function deleteSticker(id) {
    MediaStore.delSticker(id).catch(function () { /* 忽略 */ });
    invalidateMediaCache();
    var stillUsed = Store.state.messages.some(function (m) { return m.sticker === 'img:' + id; });
    if (!stillUsed && stickerURLs[id]) {
      URL.revokeObjectURL(stickerURLs[id]);
      delete stickerURLs[id];
    }
    customStickers = customStickers.filter(function (s) { return s.id !== id; });
    renderStickerPane();
    toast('已删除表情包', 'ok');
  }

  $('stickerFile').addEventListener('change', function (e) {
    var files = Array.prototype.slice.call(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    var added = 0;
    var chain = Promise.resolve();

    files.forEach(function (file) {
      if (!/^image\//.test(file.type)) return;
      if (file.size > 2 * 1024 * 1024) return;
      var id = Store.uid();
      var name = file.name.replace(/\.[^.]+$/, '') || '表情';
      var rec = { id: id, name: name, blob: file, createdAt: Date.now() };
      stickerURLs[id] = URL.createObjectURL(file);
      customStickers.push({ id: id, name: name, createdAt: rec.createdAt });
      chain = chain.then(function () { return MediaStore.putSticker(rec); });
      added++;
    });

    chain.then(function () {
      invalidateMediaCache();
      customStickers.sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
      renderStickerPane();
      if (added) toast('已导入 ' + added + ' 个表情包', 'ok');
      else toast('没有可用的图片（请选 2MB 以内的图片）', 'warn');
    }).catch(function () {
      renderStickerPane();
      toast('表情包已加入，但没能持久保存', 'warn');
    });
  });

  function loadStickers() {
    return MediaStore.getStickers().then(function (list) {
      customStickers = [];
      (list || []).forEach(function (rec) {
        if (!rec || !rec.blob || !rec.id) return;
        stickerURLs[rec.id] = URL.createObjectURL(rec.blob);
        customStickers.push({ id: rec.id, name: rec.name || '表情', createdAt: rec.createdAt || 0 });
      });
      customStickers.sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
    }).catch(function () { /* 没有自定义表情包 */ });
  }

  /* ---------------- 备份与恢复 ---------------- */

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () {
        var s = String(fr.result);
        var i = s.indexOf(',');
        resolve(i === -1 ? '' : s.slice(i + 1));
      };
      fr.onerror = function () { reject(fr.error); };
      fr.readAsDataURL(blob);
    });
  }

  function base64ToBlob(b64, mime) {
    var bin = atob(b64);
    var len = bin.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime || 'application/octet-stream' });
  }

  /** 把表情包图片与背景音乐打包成 base64（体积大，单独缓存复用） */
  var mediaCache = null;

  function buildMedia() {
    if (mediaCache) return Promise.resolve(mediaCache);
    var out = { stickers: [], music: null };
    return MediaStore.getStickers().catch(function () { return []; }).then(function (list) {
      list = list || [];
      var chain = Promise.resolve();
      list.forEach(function (rec) {
        if (!rec || !rec.blob) return;
        chain = chain.then(function () {
          return blobToBase64(rec.blob).then(function (data) {
            out.stickers.push({
              id: rec.id, name: rec.name, createdAt: rec.createdAt,
              mime: rec.blob.type || 'image/png', data: data,
            });
          });
        });
      });
      return chain;
    }).then(function () {
      return MediaStore.get().catch(function () { return null; });
    }).then(function (m) {
      if (!m || !m.blob) return out;
      return blobToBase64(m.blob).then(function (data) {
        out.music = { name: m.name, mime: m.blob.type || 'audio/mpeg', data: data };
        return out;
      });
    }).then(function (r) {
      mediaCache = r;
      return r;
    });
  }

  function invalidateMediaCache() { mediaCache = null; }

  /** 组装完整备份对象 */
  function buildFullBackup() {
    var payload = Store.exportObject({ full: true });
    payload.media = { stickers: [], music: null };
    payload.hasMedia = true;
    return buildMedia().then(function (media) {
      payload.media = media;
      return payload;
    });
  }

  function fullBackupStats(data) {
    var cards = Array.isArray(data.cards) ? data.cards.length : 0;
    var msgs = Array.isArray(data.messages) ? data.messages.length : 0;
    var st = data.media && Array.isArray(data.media.stickers) ? data.media.stickers.length : 0;
    var mu = data.media && data.media.music ? 1 : 0;
    return '字卡 ' + cards + ' 张 · 聊天 ' + msgs + ' 条 · 表情包 ' + st + ' 个' +
           (mu ? ' · 含背景音乐' : '');
  }

  function downloadJSON(obj, filename) {
    var blob = new Blob([JSON.stringify(obj)], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = el('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function stamp() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }

  /** 把备份里的图片 / 音乐写回 IndexedDB */
  function applyMedia(media) {
    if (!media) return Promise.resolve(0);

    return MediaStore.getStickers().then(function (list) {
      var chain = Promise.resolve();
      (list || []).forEach(function (r) {
        chain = chain.then(function () { return MediaStore.delSticker(r.id).catch(function () {}); });
      });
      return chain;
    }).then(function () {
      var chain = Promise.resolve();
      (media.stickers || []).forEach(function (s) {
        if (!s || !s.data) return;
        chain = chain.then(function () {
          return MediaStore.putSticker({
            id: s.id || Store.uid(),
            name: s.name || '表情',
            blob: base64ToBlob(s.data, s.mime),
            createdAt: s.createdAt || Date.now(),
          }).catch(function () {});
        });
      });
      return chain;
    }).then(function () {
      invalidateMediaCache();
      if (media.music && media.music.data) {
        return MediaStore.put({
          name: media.music.name || 'music',
          blob: base64ToBlob(media.music.data, media.music.mime),
        }).catch(function () {});
      }
      return MediaStore.del().catch(function () {});
    });
  }

  function reloadMediaIntoUI() {
    Object.keys(stickerURLs).forEach(function (k) { URL.revokeObjectURL(stickerURLs[k]); });
    stickerURLs = {};
    customStickers = [];
    return loadStickers().then(function () {
      renderPane('sticker');
    }).then(function () {
      return MediaStore.get().catch(function () { return null; });
    }).then(function (rec) {
      if (rec && rec.blob) Music.loadCustom(rec.blob, rec.name);
      else Music.clearCustom();
      syncMenuUI();
    });
  }

  /* ---- 自动备份到文件（File System Access API，桌面端） ---- */
  var AutoBackup = {
    handle: null,
    timer: null,
    supported: !!(window.showSaveFilePicker && window.isSecureContext !== false),
    writing: false,

    setState: function (text, cls) {
      var n = $('autoBackupState');
      if (!n) return;
      n.textContent = text;
      n.className = 'ba-state' + (cls ? ' ' + cls : '');
    },

    init: function () {
      if (!this.supported) {
        this.setState('此浏览器不支持', 'warn');
        $('autoBackupOnBtn').disabled = true;
        $('autoBackupNowBtn').disabled = true;
        return;
      }
      MediaStore.metaGet('backupHandle').then(function (h) {
        if (!h || !h.handle) { AutoBackup.setState('未开启'); return; }
        AutoBackup.handle = h.handle;
        AutoBackup.setState('已开启 · ' + (h.name || '备份文件'), 'on');
        return h.handle.queryPermission({ mode: 'readwrite' }).then(function (perm) {
          if (perm !== 'granted') AutoBackup.setState('需要重新授权', 'warn');
        });
      }).catch(function () {});
    },

    choose: function () {
      if (!this.supported) { toast('当前浏览器不支持自动备份，请用「完整备份」手动导出', 'warn'); return; }
      window.showSaveFilePicker({
        suggestedName: '字卡传讯-备份-' + stamp() + '.json',
        types: [{ description: '字卡传讯备份', accept: { 'application/json': ['.json'] } }],
      }).then(function (handle) {
        AutoBackup.handle = handle;
        return MediaStore.metaPut('backupHandle', { handle: handle, name: handle.name });
      }).then(function () {
        AutoBackup.setState('已开启 · ' + AutoBackup.handle.name, 'on');
        toast('自动备份已开启', 'ok');
        return AutoBackup.write(true);
      }).catch(function (e) {
        if (e && e.name === 'AbortError') return;
        toast('无法开启自动备份', 'warn');
      });
    },

    disable: function () {
      clearTimeout(this.timer);
      this.handle = null;
      MediaStore.metaDel('backupHandle').catch(function () {});
      this.setState('未开启');
      toast('已关闭自动备份', 'ok');
    },

    schedule: function () {
      if (!this.handle) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(function () { AutoBackup.write(); }, 5000);
    },

    write: function (silent) {
      var h = this.handle;
      if (!h) { if (!silent) toast('还没有选择备份文件', 'warn'); return Promise.resolve(); }
      if (this.writing) return Promise.resolve();
      this.writing = true;

      return h.queryPermission({ mode: 'readwrite' }).then(function (perm) {
        if (perm !== 'granted') return h.requestPermission({ mode: 'readwrite' });
        return perm;
      }).then(function (perm) {
        if (perm !== 'granted') {
          AutoBackup.setState('需要重新授权', 'warn');
          if (!silent) toast('浏览器需要你重新授权这个文件', 'warn');
          return null;
        }
        return buildFullBackup();
      }).then(function (payload) {
        if (!payload) return null;
        return h.createWritable().then(function (w) {
          return w.write(new Blob([JSON.stringify(payload)], { type: 'application/json' })).then(function () {
            return w.close();
          });
        });
      }).then(function () {
        if (AutoBackup.handle === h) {
          AutoBackup.setState('已开启 · ' + h.name + ' · ' + timeLabel(Date.now()), 'on');
          if (!silent) toast('已写入备份文件', 'ok');
        }
      }).catch(function () {
        AutoBackup.setState('写入失败', 'warn');
        if (!silent) toast('写入失败，请重新选择文件', 'warn');
      }).then(function () {
        AutoBackup.writing = false;
      });
    },
  };

  /* 每次保存数据后，顺带安排一次自动备份 */
  (function hookAutoBackup() {
    var orig = Store.save;
    Store.save = function () {
      var ok = orig.apply(Store, arguments);
      AutoBackup.schedule();
      return ok;
    };
  })();

  /* ---------------- 拍一拍 ---------------- */

  var PAT_COOLDOWN = 900;
  var lastPatAt = 0;

  /** 从某一侧的「拍一拍内容」里随机抽一条：byMe = 我拍梦角，否则梦角拍我 */
  function pickPatSuffix(byMe) {
    var list = byMe ? Store.state.profile.patMine : Store.state.profile.patTheirs;
    if (!Array.isArray(list) || !list.length) return '';
    return list[Math.floor(Math.random() * list.length)];
  }

  /** tail 传了就固定用这一条，不传就随机抽一条 */
  function patText(byMe, tail) {
    var who = Store.state.profile.name || '梦角';
    var t = tail === undefined ? pickPatSuffix(byMe) : String(tail || '');
    return byMe
      ? ('你拍了拍「' + who + '」' + t)
      : (who + ' 拍了拍你' + t);
  }

  function addPat(byMe, tail) {
    var msg = Store.addMessage('pat', patText(byMe, tail));
    Store.save();
    return appendMessage(msg, true);
  }

  /* 双次点击（同时兼容鼠标双击和手机双击） */
  function onDoubleTap(node, handler) {
    if (!node) return;
    var last = 0;
    node.addEventListener('click', function (e) {
      var now = Date.now();
      if (now - last < 340) {
        last = 0;
        e.preventDefault();
        handler(e);
      } else {
        last = now;
      }
    });
  }

  function replayAnim(node, cls) {
    if (!node) return;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    setTimeout(function () { node.classList.remove(cls); }, 720);
  }

  /** 真的拍一下：tail 指定内容，省略就随机抽一条 */
  function doPat(tail) {
    addPat(true, tail);
    replayAnim($('peerAvatar'), 'shake');
    if (call.state !== 'idle') replayAnim($('callAvatar'), 'shake');

    // 一半概率梦角立刻回拍，否则抽一张卡回应
    if (Math.random() < 0.5) {
      setTimeout(function () {
        addPat(false);
        replayAnim($('composer'), 'shake');
      }, 550 + Math.random() * 500);
    } else {
      enqueueReply();
    }
  }

  /* 双击头像：带 0.9 秒冷却，随手拍不会刷屏 */
  function patDream(tail) {
    if (typeof tail !== 'string') tail = undefined;   // onDoubleTap 会把事件对象塞进来
    var now = Date.now();
    if (now - lastPatAt < PAT_COOLDOWN) return false;
    lastPatAt = now;
    doPat(tail);
    return true;
  }

  onDoubleTap($('peerAvatar'), patDream);
  onDoubleTap($('profileAvatar'), patDream);

  /* 输入栏里的拍一拍按钮：打开挑内容的弹窗 */
  $('patBtn').addEventListener('click', function () { openPatModal(); });

  /* ---------------- 拍一拍弹窗 ---------------- */

  function renderPatPicker() {
    var box = $('patPicker');
    box.innerHTML = '';
    var list = Store.state.profile.patMine;
    if (!Array.isArray(list) || !list.length) {
      box.appendChild(el('div', 'pat-empty', '列表还是空的，直接写在下面那条里就行。'));
      return;
    }
    list.forEach(function (tail) {
      var pick = el('button', 'pat-pick-item', '👉 ' + patText(true, tail));
      pick.type = 'button';
      pick.addEventListener('click', function () { sendPat(tail); });
      box.appendChild(pick);
    });
  }

  function renderPatPreview() {
    var v = $('patNewInput').value;
    var box = $('patPreview');
    box.innerHTML = '';
    box.appendChild(el('div', 'pv-mine', '你发出去：👉 ' + patText(true, v)));
    box.appendChild(el('div', 'pv-theirs', '梦角主动用（主体自动换）：👉 ' + patText(false, v)));
  }

  function openPatModal() {
    $('patNewInput').value = '';
    renderPatPicker();
    renderPatPreview();
    openModal($('patModal'));
  }

  /** 弹窗里是明确选的一条，不受双击那 0.9 秒冷却限制 */
  function sendPat(tail) {
    lastPatAt = Date.now();
    doPat(tail);
    closeModal($('patModal'));
  }

  $('patNewInput').addEventListener('input', renderPatPreview);

  $('patSendBtn').addEventListener('click', function () {
    var tail = $('patNewInput').value.trim().slice(0, 40);
    if (!tail) { toast('先写点什么吧', 'warn'); $('patNewInput').focus(); return; }

    var mine = Array.isArray(Store.state.profile.patMine) ? Store.state.profile.patMine.slice() : [];
    var theirs = Array.isArray(Store.state.profile.patTheirs) ? Store.state.profile.patTheirs.slice() : [];
    var isNew = mine.indexOf(tail) === -1;
    if (isNew) mine.push(tail);
    // 梦角那边也放一份：它主动拍你 / 回拍你时会用上，主体自动换成「你」
    if (theirs.indexOf(tail) === -1) theirs.push(tail);
    Store.updateProfile({ patMine: mine, patTheirs: theirs, patSuffix: mine[0] || '' });
    Store.save();

    sendPat(tail);
    toast(isNew ? '已发出，梦角那边也能用了' : '已发出', 'ok');
  });

  /* 跳去改「梦角拍我」的那一份 */
  $('patToProfileBtn').addEventListener('click', function () {
    closeModal($('patModal'));
    openProfileModal();
  });

  /* ---------------- 消息交互（重新抽卡 / 复制） ---------------- */

  messagesEl.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var row = btn.closest('.msg');
    if (!row) return;
    var msg = Store.getMessage(row.dataset.id);
    if (!msg) return;

    if (btn.dataset.action === 'copy') {
      copyText(msg.text);
      return;
    }

    if (btn.dataset.action === 'redraw') {
      var pick = pickReply();
      if (!pick) { toast('字卡和表情都还是空的', 'warn'); return; }

      var guard = 0;
      while (pick.kind !== 'sticker' && pick.text === msg.text && guard++ < 12) {
        var again = pickReply();
        if (!again) break;
        pick = again;
      }

      if (pick.kind === 'sticker') {
        msg.text = ''; msg.tag = ''; msg.kind = ''; msg.sticker = pick.ref;
      } else if (pick.kind === 'card') {
        msg.text = pick.text; msg.tag = pick.tag || ''; msg.kind = ''; msg.sticker = '';
      } else {
        msg.text = pick.text; msg.tag = ''; msg.kind = pick.kind; msg.sticker = '';
      }
      msg.time = Date.now();
      Store.save();
      var fresh = messageEl(msg, true);
      fresh.classList.add('pop');
      row.replaceWith(fresh);
      scrollToBottom(true);
      return;
    }
  });

  /* ---- 字卡标签编辑 ---- */
  var draftTags = [];

  function renderTagChips() {
    var box = $('cardTagChips');
    box.innerHTML = '';
    draftTags.forEach(function (t, i) {
      var chip = el('span', 'tag-chip');
      chip.appendChild(el('span', null, t));
      var x = el('button', null, '×');
      x.type = 'button';
      x.title = '移除';
      x.addEventListener('click', function () {
        draftTags.splice(i, 1);
        renderTagChips();
      });
      chip.appendChild(x);
      box.appendChild(chip);
    });
  }

  function addDraftTag(raw) {
    var parts = String(raw || '').split(/[\s,，、|/]+/);
    var added = 0;
    parts.forEach(function (t) {
      t = t.trim();
      if (!t || draftTags.indexOf(t) !== -1 || draftTags.length >= 8) return;
      draftTags.push(t);
      added++;
    });
    renderTagChips();
    return added;
  }

  $('cardTag').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
      e.preventDefault();
      if (addDraftTag(this.value)) this.value = '';
      else this.value = '';
    } else if (e.key === 'Backspace' && !this.value && draftTags.length) {
      e.preventDefault();
      draftTags.pop();
      renderTagChips();
    }
  });
  $('cardTag').addEventListener('blur', function () {
    if (addDraftTag(this.value)) this.value = '';
  });

  /* ---- 新增 / 编辑字卡 ---- */

  var editingCardId = null;

  function openCardModal(card) {
    editingCardId = card ? card.id : null;
    $('cardModalTitle').textContent = card ? '编辑字卡' : '新增字卡';
    $('cardText').value = card ? card.text : '';
    $('cardTag').value = '';
    draftTags = card ? card.tags.slice() : [];
    renderTagChips();
    openModal($('cardModal'));
  }

  function saveCard() {
    var text = $('cardText').value.trim();
    addDraftTag($('cardTag').value);
    $('cardTag').value = '';
    var tags = draftTags.slice();

    if (!text) {
      toast('字卡内容不能为空', 'warn');
      $('cardText').focus();
      return;
    }

    if (editingCardId) {
      Store.updateCard(editingCardId, { text: text, tags: tags });
      toast('字卡已更新', 'ok');
    } else {
      Store.addCard(text, tags);
      toast('已添加 1 张字卡', 'ok');
    }
    Store.save();
    closeModal($('cardModal'));
    renderCards();
  }

  $('addCardBtn').addEventListener('click', function () { openCardModal(null); });
  $('cardSaveBtn').addEventListener('click', saveCard);
  $('cardText').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveCard(); }
  });

  /* 列表内的编辑 / 删除 / 双击编辑 */
  cardListEl.addEventListener('click', function (e) {
    var item = e.target.closest('.card-item');
    if (!item) return;
    var card = Store.getCard(item.dataset.id);
    if (!card) return;

    var btn = e.target.closest('[data-action]');
    if (!btn) return;

    if (btn.dataset.action === 'edit-card') {
      openCardModal(card);
    } else if (btn.dataset.action === 'del-card') {
      confirmDialog('删除这张字卡？', '「' + card.text.slice(0, 28) + (card.text.length > 28 ? '…' : '') + '」删除后无法恢复。', '删除')
        .then(function (ok) {
          if (!ok) return;
          Store.removeCard(card.id);
          Store.save();
          renderCards();
          toast('已删除', 'ok');
        });
    }
  });

  cardListEl.addEventListener('dblclick', function (e) {
    var item = e.target.closest('.card-item');
    if (!item) return;
    var card = Store.getCard(item.dataset.id);
    if (card) openCardModal(card);
  });

  searchInput.addEventListener('input', renderCards);

  $('clearCardsBtn').addEventListener('click', function () {
    var n = Store.countCards();
    if (!n) { toast('字卡库已经是空的', 'warn'); return; }
    confirmDialog('清空字卡库？', '将删除全部 ' + n + ' 张字卡，此操作不可撤销。', '确认清空')
      .then(function (ok) {
        if (!ok) return;
        Store.clearCards();
        Store.save();
        renderCards();
        toast('字卡库已清空', 'ok');
      });
  });

  /* ---------------- 批量导入 ---------------- */

  function updateBulkCount() {
    var list = Store.parseText($('bulkText').value);
    var r = splitDuplicates(list, $('bulkAppend').checked ? libraryTextSet() : {});
    $('bulkCount').textContent = '识别到 ' + list.length + ' 张'
      + (r.dup ? '（跳过 ' + r.dup + ' 张重复，实际导入 ' + r.fresh.length + ' 张）' : '');
    return r.fresh.length;
  }

  $('bulkBtn').addEventListener('click', function () {
    $('bulkText').value = '';
    updateBulkCount();
    openModal($('bulkModal'));
  });
  $('bulkText').addEventListener('input', updateBulkCount);
  $('bulkAppend').addEventListener('change', updateBulkCount);

  $('bulkSaveBtn').addEventListener('click', function () {
    var append = $('bulkAppend').checked;
    var list = Store.parseText($('bulkText').value);
    if (!list.length) { toast('没识别到任何字卡', 'warn'); return; }
    if (!append) Store.clearCards();
    var r = splitDuplicates(list, libraryTextSet());     // 内容重复的自动跳过
    if (!r.fresh.length) {
      closeModal($('bulkModal'));
      renderCards();
      toast('这 ' + r.dup + ' 张字卡库里都有了', 'warn');
      return;
    }
    var added = Store.addMany(r.fresh);
    Store.save();
    closeModal($('bulkModal'));
    renderCards();
    toast('成功导入 ' + added + ' 张字卡' + (r.dup ? '（跳过 ' + r.dup + ' 张重复）' : ''), 'ok');
  });

  /* ---------------- 从文件导入字卡 ---------------- */

  function stripBom(s) {
    return String(s == null ? '' : s).replace(/^\uFEFF/, '');
  }

  /** 先按 UTF-8 解；出现替换符（多半是 Windows 记事本存的 GBK 文本）就再按 GBK 解一次 */
  function decodeBytes(buf) {
    var txt = stripBom(new TextDecoder('utf-8').decode(buf));
    if (txt.indexOf('\uFFFD') === -1) return txt;
    try {
      var gbk = stripBom(new TextDecoder('gbk').decode(buf));
      if (gbk.indexOf('\uFFFD') === -1) return gbk;
    } catch (e) { /* 浏览器没有 GBK 码表就维持 UTF-8 的结果 */ }
    return txt;
  }

  function readFileText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('读取失败')); };
      if (typeof TextDecoder === 'undefined') {
        reader.onload = function () { resolve(stripBom(reader.result)); };
        reader.readAsText(file);
        return;
      }
      reader.onload = function () { resolve(decodeBytes(reader.result)); };
      reader.readAsArrayBuffer(file);
    });
  }

  /** 从 JSON 里抽出字卡；不是字卡文件则返回 null */
  function cardsFromJson(data) {
    var arr = null;
    if (Array.isArray(data)) arr = data;
    else if (data && Array.isArray(data.cards)) arr = data.cards;
    else if (data && typeof data === 'object' && (data.text || data.content || data.value)) arr = [data];
    if (!arr) return null;
    var out = [];
    arr.forEach(function (c) {
      if (typeof c === 'string') {
        if (c.trim()) out.push({ text: c, tags: [] });
        return;
      }
      if (!c || typeof c !== 'object') return;
      var text = c.text || c.content || c.value || '';
      if (String(text).trim()) out.push({ text: text, tags: c.tags !== undefined ? c.tags : c.tag });
    });
    return out;
  }

  /** 认一个文件：.json 走 JSON，其余按「一行一张」的老规矩解析 */
  function parseCardFile(file) {
    var isJsonName = /\.json$/i.test(file.name);
    return readFileText(file).then(function (txt) {
      var looksJson = isJsonName || /^\s*[\[{]/.test(txt);
      if (looksJson) {
        var data = null;
        try { data = JSON.parse(txt); } catch (e) { data = null; }
        var cards = cardsFromJson(data);
        if (cards) return { name: file.name, cards: cards };
        if (isJsonName) return { name: file.name, error: true };
      }
      return { name: file.name, cards: Store.parseText(txt) };
    }).catch(function () {
      return { name: file.name, error: true };
    });
  }

  /** 库里现有字卡的文本集合（用于去重） */
  function libraryTextSet() {
    var seen = {};
    Store.allCards().forEach(function (c) { seen[String(c.text).trim()] = 1; });
    return seen;
  }

  /** 按内容去重：seen 里已有的算重复，空白行直接丢掉 */
  function splitDuplicates(list, seen) {
    var fresh = [];
    var dup = 0;
    list.forEach(function (item) {
      var text = String(item && item.text != null ? item.text : '').trim();
      if (!text) return;
      if (seen[text]) { dup++; return; }
      seen[text] = 1;
      fresh.push({ text: text, tags: item.tags !== undefined ? item.tags : item.tag });
    });
    return { fresh: fresh, dup: dup };
  }

  /** 数一数库里自己有多少张重复卡 */
  function libraryDupCount() {
    var seen = {};
    var dup = 0;
    Store.allCards().forEach(function (c) {
      var text = String(c.text).trim();
      if (seen[text]) dup++;
      else seen[text] = 1;
    });
    return dup;
  }

  /** 把解析好的字卡并进字卡库（全库去重，不会产生重复卡） */
  function importCardList(list) {
    var r = splitDuplicates(list, libraryTextSet());

    if (!r.fresh.length) {
      toast(r.dup ? '这 ' + r.dup + ' 张字卡库里都有了' : '没在文件里找到字卡', 'warn');
      return;
    }

    var desc = '会追加到现有字卡库，已有字卡不受影响。'
      + (r.dup ? '其中 ' + r.dup + ' 张内容重复，会自动跳过。' : '');
    var libDup = libraryDupCount();
    if (libDup) desc += '另外库里本来就有 ' + libDup + ' 张重复，可以用底部的「清理重复」合并掉。';

    confirmDialog('导入 ' + r.fresh.length + ' 张字卡？', desc, '导入').then(function (ok) {
      if (!ok) return;
      var added = Store.addMany(r.fresh);
      Store.save();
      renderCards();
      toast('成功导入 ' + added + ' 张字卡' + (r.dup ? '（跳过 ' + r.dup + ' 张重复）' : ''), 'ok');
    });
  }

  $('importFileBtn').addEventListener('click', function () { $('cardFile').click(); });

  $('cardFile').addEventListener('change', function (e) {
    var files = [].slice.call(e.target.files || []);
    e.target.value = '';            // 清空之后才能重复选同一个文件
    if (!files.length) return;
    if (files.length > 1) toast('正在读取 ' + files.length + ' 个文件…', 'ok');

    Promise.all(files.map(parseCardFile)).then(function (results) {
      var list = [];
      var bad = [];
      results.forEach(function (r) {
        if (r.error) { bad.push(r.name); return; }
        list = list.concat(r.cards || []);
      });
      if (bad.length) toast('读不了：' + bad.join('、'), 'warn');
      if (!list.length) {
        if (!bad.length) toast('没在文件里找到字卡', 'warn');
        return;
      }
      importCardList(list);
    });
  });

  /* ---------------- 清理重复字卡 ---------------- */

  /** 内容完全一样的卡只留最早的一张，其余标签并到留下的那张上 */
  function dedupeLibrary() {
    var seen = {};
    var losers = [];
    var mergedTags = 0;

    Store.allCards().slice().forEach(function (c) {
      var text = String(c.text).trim();
      var keep = seen[text];
      if (!keep) { seen[text] = c; return; }

      var tags = keep.tags.slice();
      c.tags.forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });
      if (tags.length !== keep.tags.length) {
        Store.updateCard(keep.id, { tags: tags });
        mergedTags++;
      }
      losers.push(c.id);
    });

    losers.forEach(function (id) { Store.removeCard(id); });
    if (losers.length) Store.save();
    return { removed: losers.length, mergedTags: mergedTags };
  }

  $('dedupeCardsBtn').addEventListener('click', function () {
    var dup = libraryDupCount();
    if (!dup) { toast('没有发现重复的字卡', 'ok'); return; }
    confirmDialog('清理 ' + dup + ' 张重复字卡？',
      '内容完全一样时只保留一张，其它卡上的标签会并到保留的那张上，不会丢标签。',
      '清理').then(function (ok) {
      if (!ok) return;
      var r = dedupeLibrary();
      renderCards();
      toast('已清理 ' + r.removed + ' 张重复' + (r.mergedTags ? '，合并了 ' + r.mergedTags + ' 张的标签' : ''), 'ok');
    });
  });

  /* ---------------- 备份：导出 / 导入 ---------------- */

  function openBackupModal() {
    AutoBackup.init();
    openModal($('backupModal'));
  }

  $('exportBtn').addEventListener('click', openBackupModal);

  $('backupCardsBtn').addEventListener('click', function () {
    var data = Store.exportObject({ full: false });
    downloadJSON(data, '字卡库-' + stamp() + '.json');
    closeModal($('backupModal'));
    toast('已导出 ' + data.cards.length + ' 张字卡', 'ok');
  });

  $('backupFullBtn').addEventListener('click', function () {
    toast('正在打包…', 'ok');
    buildFullBackup().then(function (payload) {
      downloadJSON(payload, '字卡传讯-完整备份-' + stamp() + '.json');
      closeModal($('backupModal'));
      toast('完整备份已导出（' + fullBackupStats(payload) + '）', 'ok');
    }).catch(function () {
      toast('打包失败', 'warn');
    });
  });

  $('autoBackupOnBtn').addEventListener('click', function () { AutoBackup.choose(); });
  $('autoBackupOffBtn').addEventListener('click', function () { AutoBackup.disable(); });
  $('autoBackupNowBtn').addEventListener('click', function () { AutoBackup.write(); });

  $('importBtn').addEventListener('click', function () { $('jsonFile').click(); });

  $('jsonFile').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var raw = String(reader.result);
      var data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        toast('不是有效的 JSON 文件', 'warn');
        return;
      }

      // 完整备份：覆盖式恢复，用来让两台设备一致
      if (data && data.kind === 'full') {
        var sizeMB = file.size / 1024 / 1024;
        var sizeText = sizeMB < 1
          ? Math.max(1, Math.round(file.size / 1024)) + ' KB'
          : sizeMB.toFixed(1) + ' MB';
        confirmDialog(
          '导入完整备份？',
          '将用这份备份覆盖当前全部数据（' + fullBackupStats(data) + '，文件 ' + sizeText + '）。' +
          '当前的聊天记录与设置会被替换，请确认这是你想要的版本。',
          '覆盖导入'
        ).then(function (ok) {
          if (!ok) return;
          return applyMedia(data.media).then(function () {
            Store.importFull(data);
            Store.save();
            renderProfile();
            renderCards();
            renderMessages();
            applyI18n();
            syncMenuUI();
            renderPane('face');
            renderPane('kao');
            return reloadMediaIntoUI();
          }).then(function () {
            closeModal($('backupModal'));
            toast('已恢复：' + fullBackupStats(data), 'ok');
          });
        }).catch(function () {
          toast('恢复失败', 'warn');
        });
        return;
      }

      // 否则按「只含字卡」的备份追加导入
      try {
        var result = Store.parseJSON(raw);
        var n = result.cards.length;
        confirmDialog('导入 ' + n + ' 张字卡？', '将追加到现有字卡库；文件名：' + file.name, '导入')
          .then(function (ok) {
            if (!ok) return;
            var added = Store.addMany(result.cards);
            if (result.profile) {
              Store.updateProfile({
                name: typeof result.profile.name === 'string' ? result.profile.name : undefined,
                avatar: typeof result.profile.avatar === 'string' ? result.profile.avatar : undefined,
                sign: typeof result.profile.sign === 'string' ? result.profile.sign : undefined,
              });
              renderProfile();
            }
            if (result.extra) {
              Store.addExtra('face', result.extra.face);
              Store.addExtra('kao', result.extra.kao);
              renderPane('face');
              renderPane('kao');
            }
            Store.save();
            renderCards();
            toast('成功导入 ' + added + ' 张字卡', 'ok');
          });
      } catch (err) {
        toast(err.message || '导入失败', 'warn');
      }
    };
    reader.onerror = function () { toast('读取文件失败', 'warn'); };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  });

  /* ---------------- 梦角资料弹窗 ---------------- */

  var draftAvatar = '';
  var draftAvatarImage = '';

  /* ---------------- 梦角频率 ---------------- */

  var draftRates = {
    reply: 'always', expr: 'less', call: 'normal',
    delay: 'normal', delaySec: 1, callLo: 5, callHi: 12, time: '1', pat: 'less',
  };

  var RATE_SEGS = [
    { seg: 'replyRateSeg', key: 'reply', attr: 'rate' },
    { seg: 'replyDelaySeg', key: 'delay', attr: 'delay' },
    { seg: 'exprRateSeg', key: 'expr', attr: 'rate' },
    { seg: 'patRateSeg', key: 'pat', attr: 'rate' },
    { seg: 'timeAwareSeg', key: 'time', attr: 'on' },
    { seg: 'callRateSeg', key: 'call', attr: 'rate' },
  ];

  function renderFreqModal() {
    RATE_SEGS.forEach(function (item) {
      document.querySelectorAll('#' + item.seg + ' [data-' + item.attr + ']').forEach(function (b) {
        b.classList.toggle('active', b.dataset[item.attr] === draftRates[item.key]);
      });
    });
    $('replyDelayCustom').hidden = draftRates.delay !== 'custom';
    $('callRangeCustom').hidden = draftRates.call !== 'custom';
    $('replyDelaySec').value = draftRates.delaySec;
    $('callRangeMin').value = draftRates.callLo;
    $('callRangeMax').value = draftRates.callHi;
  }

  RATE_SEGS.forEach(function (item) {
    document.querySelectorAll('#' + item.seg + ' [data-' + item.attr + ']').forEach(function (b) {
      b.addEventListener('click', function () {
        draftRates[item.key] = b.dataset[item.attr];
        renderFreqModal();
      });
    });
  });

  $('replyDelaySec').addEventListener('input', function () {
    draftRates.delaySec = this.value;
  });
  $('callRangeMin').addEventListener('input', function () {
    draftRates.callLo = this.value;
  });
  $('callRangeMax').addEventListener('input', function () {
    draftRates.callHi = this.value;
  });

  /* 来电这一项：「关闭」由 autoCall 表示，其余由 callRate 表示 */
  function currentCallOption() {
    var s = Store.state.settings;
    return s.autoCall ? (s.callRate || 'normal') : 'off';
  }

  function clampNum(v, min, max, fallback) {
    var n = Number(v);
    if (!isFinite(n) || n <= 0) n = fallback;
    return Math.min(max, Math.max(min, n));
  }

  function openFreqModal() {
    var s = Store.state.settings;
    draftRates = {
      reply: s.replyRate || 'always',
      expr: s.exprRate || 'less',
      call: currentCallOption(),
      delay: s.replyDelay || 'normal',
      delaySec: s.replyDelaySec || 1,
      callLo: typeof s.callMinMinutes === 'number' ? s.callMinMinutes : 5,
      callHi: typeof s.callMaxMinutes === 'number' ? s.callMaxMinutes : 12,
      time: s.timeAware === false ? '0' : '1',
      pat: s.patRate || 'less',
    };
    renderFreqModal();
    openModal($('freqModal'));
  }

  $('freqBtn').addEventListener('click', openFreqModal);

  $('freqResetBtn').addEventListener('click', function () {
    draftRates = {
      reply: 'always', expr: 'less', call: 'normal',
      delay: 'normal', delaySec: 1, callLo: 5, callHi: 12, time: '1', pat: 'less',
    };
    renderFreqModal();
  });

  $('freqSaveBtn').addEventListener('click', function () {
    var delaySec = clampNum(draftRates.delaySec, 0.1, 10, 1);
    var lo = clampNum(draftRates.callLo, 0.5, 720, 5);
    var hi = clampNum(draftRates.callHi, 0.5, 720, 12);
    if (hi < lo) { var t = lo; lo = hi; hi = t; }

    Store.updateSettings({
      replyRate: draftRates.reply,
      exprRate: draftRates.expr,
      patRate: draftRates.pat,
      replyDelay: draftRates.delay,
      replyDelaySec: delaySec,
      callMinMinutes: lo,
      callMaxMinutes: hi,
      timeAware: draftRates.time !== '0',
    });

    if (draftRates.call === 'off') {
      Store.updateSettings({ autoCall: false });
    } else {
      Store.updateSettings({ callRate: draftRates.call, autoCall: true });
    }

    Store.save();
    syncMenuUI();
    scheduleAutoCall();
    closeModal($('freqModal'));
    toast('频率已保存', 'ok');
  });

  function renderAvatarPicker() {
    var picker = $('avatarPicker');
    picker.innerHTML = '';
    var presets = window.AVATAR_PRESETS || ['🌙'];
    if (draftAvatar && presets.indexOf(draftAvatar) === -1 && !draftAvatarImage) {
      presets = [draftAvatar].concat(presets);
    }
    presets.forEach(function (emoji) {
      var btn = el('button', 'avatar-pick' + (emoji === draftAvatar && !draftAvatarImage ? ' active' : ''), emoji);
      btn.type = 'button';
      btn.dataset.emoji = emoji;
      picker.appendChild(btn);
    });
  }

  $('avatarPicker').addEventListener('click', function (e) {
    var btn = e.target.closest('.avatar-pick');
    if (!btn) return;
    draftAvatar = btn.dataset.emoji;
    draftAvatarImage = '';
    renderAvatarPicker();
  });

  $('avatarFile').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast('图片请小于 2MB', 'warn'); e.target.value = ''; return; }
    var reader = new FileReader();
    reader.onload = function () {
      draftAvatarImage = String(reader.result);
      renderAvatarPicker();
      toast('头像已选择，保存后生效', 'ok');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  $('avatarClearBtn').addEventListener('click', function () {
    draftAvatarImage = '';
    renderAvatarPicker();
    toast('已移除头像图片', 'ok');
  });

  function openProfileModal() {
    var p = Store.state.profile;
    $('profileNameInput').value = p.name;
    $('profileSignInput').value = p.sign;
    $('profilePatMineInput').value = (Array.isArray(p.patMine) ? p.patMine : []).join('\n');
    $('profilePatTheirsInput').value = (Array.isArray(p.patTheirs) ? p.patTheirs : []).join('\n');
    draftAvatar = p.avatar;
    draftAvatarImage = p.avatarImage;
    renderAvatarPicker();
    openModal($('profileModal'));
  }

  $('editProfileBtn').addEventListener('click', openProfileModal);

  /** 把一个多行输入框读成「一行一条」的列表（去空行、去重复） */
  function patLines(input) {
    return input.value
      .split(/\r?\n/)
      .map(function (s) { return s.trim(); })
      .filter(function (s, i, arr) { return s && arr.indexOf(s) === i; });
  }

  $('profileSaveBtn').addEventListener('click', function () {
    var mine = patLines($('profilePatMineInput'));
    var theirs = patLines($('profilePatTheirsInput'));

    Store.updateProfile({
      name: $('profileNameInput').value.trim(),
      sign: $('profileSignInput').value.trim(),
      avatar: draftAvatar,
      avatarImage: draftAvatarImage,
      patSuffix: mine[0] || '',        // 更老版本的单条字段，跟着我这边第一条走
      patMine: mine,
      patTheirs: theirs,
    });
    Store.save();
    closeModal($('profileModal'));
    renderProfile();
    toast('已保存梦角资料', 'ok');
  });

  /* ---------------- 清空对话 ---------------- */

  $('clearChatBtn').addEventListener('click', function () {
    if (!Store.state.messages.length) { toast('还没有对话记录', 'warn'); return; }
    confirmDialog('清空对话记录？', '将删除当前所有聊天消息，字卡库不受影响。', '清空')
      .then(function (ok) {
        if (!ok) return;
        Store.clearMessages();
        Store.save();
        renderMessages();
        toast('对话已清空', 'ok');
      });
  });

  /* ---------------- 页面路由 ---------------- */
  /* 所有「整页」的操作入口（字卡库 / 写信 / 信箱 / 朋友圈）在这里统一切换 */

  var currentView = 'home';
  var atHome = true;
  var lastMainView = 'chat';

  function setView(name) {
    currentView = name;
    atHome = (name === 'home');
    document.body.dataset.view = name;
  }

  function backToHome() { setView('home'); goHome(); }

  document.querySelectorAll('[data-back]').forEach(function (b) {
    b.addEventListener('click', backToHome);
  });

  /* ================= 通话 ================= */

  /* ---------------- 多语言（仅通话相关文案） ---------------- */

  var I18N = {
    'zh-Hans': {
      langShort: '简',
      voiceCall: '语音通话', videoCall: '视频通话',
      dialing: '正在呼叫…', inCall: '通话中',
      incomingVoice: '邀请你语音通话', incomingVideo: '邀请你视频通话',
      cancel: '取消', decline: '拒绝', accept: '接听', hangup: '挂断',
      toVideo: '切到视频', toVoice: '切到语音',
      letSpeak: '让梦角说', handsfree: '免提', music: '音乐',
      duration: '通话时长', spoken: '梦角说了 {n} 句', declined: '已拒绝',
      autoCall: '允许梦角主动来电',
      askCall: '让梦角打给我', askCallDesc: '由梦角决定要不要打',
      voiceDesc: '安静地听梦角说话', videoDesc: '看看梦角现在的样子',
      subtitleLang: '字幕语言',
      bgm: '背景音乐', bgmPlay: '播放背景音乐',
      bgmBuiltin: '内置生成', bgmCustom: '自己的文件',
      timbre: '音色', bgmNoise: '氛围白噪音', bgmRain: '雨声', bgmWind: '风声', bgmPad: '柔和和声',
      chooseFile: '选择音乐文件', clearFile: '清除', noFile: '未选择音乐文件',
      vol: '音量',
      toastSwitch: '已切换为{type}',
      toastAutoOn: '已开启：梦角可能会主动打来', toastAutoOff: '已关闭梦角主动来电',
      toastIncoming: '梦角正在打给你…',
      toastLang: '字幕语言已切换为 {lang}',
      toastFileLoaded: '已载入音乐文件', toastFileCleared: '已清除音乐文件',
      toastNoFile: '还没有选择音乐文件，先用内置生成的音乐',
      toastHandsfreeOn: '已开启免提（大字幕）', toastHandsfreeOff: '已关闭免提',
      toastMusicOn: '已开启背景音乐', toastMusicOff: '已关闭背景音乐',
      emptyLib: '字卡库是空的，梦角不知道说什么',
      captionEmpty: '（字卡库是空的，先去添加一些字卡吧）',
    },
    'zh-Hant': {
      langShort: '繁',
      voiceCall: '語音通話', videoCall: '視訊通話',
      dialing: '正在撥號…', inCall: '通話中',
      incomingVoice: '邀請你語音通話', incomingVideo: '邀請你視訊通話',
      cancel: '取消', decline: '拒絕', accept: '接聽', hangup: '掛斷',
      toVideo: '切到視訊', toVoice: '切到語音',
      letSpeak: '讓夢角說', handsfree: '免持', music: '音樂',
      duration: '通話時長', spoken: '夢角說了 {n} 句', declined: '已拒絕',
      autoCall: '允許夢角主動來電',
      askCall: '讓夢角打給我', askCallDesc: '由夢角決定要不要打',
      voiceDesc: '安靜地聽夢角說話', videoDesc: '看看夢角現在的樣子',
      subtitleLang: '字幕語言',
      bgm: '背景音樂', bgmPlay: '播放背景音樂',
      bgmBuiltin: '內建生成', bgmCustom: '自己的檔案',
      timbre: '音色', bgmNoise: '氛圍白噪音', bgmRain: '雨聲', bgmWind: '風聲', bgmPad: '柔和和聲',
      chooseFile: '選擇音樂檔案', clearFile: '清除', noFile: '未選擇音樂檔案',
      vol: '音量',
      toastSwitch: '已切換為{type}',
      toastAutoOn: '已開啟：夢角可能會主動打來', toastAutoOff: '已關閉夢角主動來電',
      toastIncoming: '夢角正在打給你…',
      toastLang: '字幕語言已切換為 {lang}',
      toastFileLoaded: '已載入音樂檔案', toastFileCleared: '已清除音樂檔案',
      toastNoFile: '還沒有選擇音樂檔案，先用內建生成的音樂',
      toastHandsfreeOn: '已開啟免持（大字幕）', toastHandsfreeOff: '已關閉免持',
      toastMusicOn: '已開啟背景音樂', toastMusicOff: '已關閉背景音樂',
      emptyLib: '字卡庫是空的，夢角不知道說什麼',
      captionEmpty: '（字卡庫是空的，先去新增一些字卡吧）',
    },
    'en': {
      langShort: 'EN',
      voiceCall: 'Voice call', videoCall: 'Video call',
      dialing: 'Calling…', inCall: 'In call',
      incomingVoice: 'Incoming voice call', incomingVideo: 'Incoming video call',
      cancel: 'Cancel', decline: 'Decline', accept: 'Accept', hangup: 'Hang up',
      toVideo: 'Video', toVoice: 'Voice',
      letSpeak: 'Speak', handsfree: 'Speaker', music: 'Music',
      duration: 'Duration', spoken: '{n} lines from them', declined: 'Declined',
      autoCall: 'Allow incoming calls',
      askCall: 'Ask them to call me', askCallDesc: 'They decide whether to call',
      voiceDesc: 'Just listen quietly', videoDesc: 'See how they are now',
      subtitleLang: 'Subtitles',
      bgm: 'Background music', bgmPlay: 'Play background music',
      bgmBuiltin: 'Generated', bgmCustom: 'My file',
      timbre: 'Timbre', bgmNoise: 'Ambient noise', bgmRain: 'Rain', bgmWind: 'Wind', bgmPad: 'Soft chords',
      chooseFile: 'Choose audio', clearFile: 'Clear', noFile: 'No audio chosen',
      vol: 'Volume',
      toastSwitch: 'Switched to {type}',
      toastAutoOn: 'Incoming calls enabled', toastAutoOff: 'Incoming calls disabled',
      toastIncoming: 'They are calling you…',
      toastLang: 'Subtitle language: {lang}',
      toastFileLoaded: 'Audio loaded', toastFileCleared: 'Audio cleared',
      toastNoFile: 'No audio file yet — using generated music',
      toastHandsfreeOn: 'Speaker on (large subtitles)', toastHandsfreeOff: 'Speaker off',
      toastMusicOn: 'Background music on', toastMusicOff: 'Background music off',
      emptyLib: 'Your card library is empty.',
      captionEmpty: '(Card library is empty — add some cards first)',
    },
  };

  var LANG_NAMES = { 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文', 'en': 'English' };
  var LANG_CYCLE = ['zh-Hans', 'zh-Hant', 'en'];

  function curLang() {
    var l = Store.state.settings.subtitleLang;
    return I18N[l] ? l : 'zh-Hans';
  }

  function tt(key, vars) {
    var pack = I18N[curLang()] || I18N['zh-Hans'];
    var s = pack[key];
    if (s === undefined) s = I18N['zh-Hans'][key];
    if (s === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split('{' + k + '}').join(vars[k]);
      });
    }
    return s;
  }

  /* ---------------- 背景音乐 / 通话音效（Web Audio 实时合成） ---------------- */

  var Music = (function () {
    var ctx = null, master = null, padBus = null, bellBus = null, comp = null, fx = null;
    var chordTimer = null, bellTimer = null, ringTimer = null;
    var mode = 'builtin';       // builtin | custom
    var timbre = 'noise';       // noise（氛围白噪音）| pad（柔和和声）
    var playing = false;
    var volume = 0.7;
    var customEl = null, customUrl = null, customTitle = '';
    var chordIndex = 0;
    var noiseBuf = null;
    var noiseNodes = [];

    // 各音色的噪声层次配置
    //   type/freq/q  = 滤波器；gain = 音量；lfo/depth = 极慢的音量起伏
    //   sweep/sweepRate = 给滤波器截止频率叠加一个很慢的扫动（做"一阵阵的风"）
    var TIMBRE_LAYERS = {
      // 氛围白噪音：低频暖噪 / 中频身体 / 高频空气
      noise: [
        { type: 'lowpass',  freq: 240,  q: 0.5, gain: 0.55,  lfo: 0.047, depth: 0.40 },
        { type: 'lowpass',  freq: 1150, q: 0.7, gain: 0.30,  lfo: 0.029, depth: 0.45 },
        { type: 'bandpass', freq: 3400, q: 0.8, gain: 0.085, lfo: 0.019, depth: 0.55 },
      ],
      // 雨声：低频雨幕 + 明亮的高频沙沙，另加随机雨点颗粒
      rain: [
        { type: 'lowpass',  freq: 320,  q: 0.5, gain: 0.34, lfo: 0.041, depth: 0.32 },
        { type: 'highpass', freq: 850,  q: 0.6, gain: 0.15, lfo: 0.067, depth: 0.30 },
        { type: 'bandpass', freq: 2600, q: 0.6, gain: 0.11, lfo: 0.105, depth: 0.34 },
      ],
      // 风声：起伏更慢更大 + 低通缓慢扫动
      wind: [
        { type: 'lowpass',  freq: 430, q: 0.8, gain: 0.52, lfo: 0.019, depth: 0.62, sweep: 190, sweepRate: 0.026 },
        { type: 'bandpass', freq: 640, q: 0.5, gain: 0.22, lfo: 0.012, depth: 0.68, sweep: 280, sweepRate: 0.017 },
        { type: 'highpass', freq: 1900, q: 0.5, gain: 0.030, lfo: 0.015, depth: 0.80, sweep: 500, sweepRate: 0.021 },
      ],
    };

    // 和声走向：Cmaj7 - Am7 - Fmaj7 - G6（MIDI 音高）
    var CHORDS = [
      [48, 55, 59, 64, 67],
      [45, 52, 57, 60, 64],
      [41, 48, 53, 57, 60],
      [43, 50, 55, 59, 62],
    ];
    var PENTA = [72, 74, 76, 79, 81, 84];

    function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

    function ensure() {
      if (ctx) return ctx;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }

      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2400;

      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 24;
      comp.ratio.value = 6;
      comp.attack.value = 0.02;
      comp.release.value = 0.3;

      master = ctx.createGain();
      master.gain.value = 0;

      padBus = ctx.createGain();
      padBus.gain.value = 0.42;
      bellBus = ctx.createGain();
      bellBus.gain.value = 0.5;

      padBus.connect(lp);
      lp.connect(comp);
      bellBus.connect(comp);
      comp.connect(master);
      master.connect(ctx.destination);

      fx = ctx.createGain();
      fx.gain.value = 0.5;
      fx.connect(ctx.destination);

      return ctx;
    }

    function fadeMaster(to, dur) {
      if (!master || !ctx) return;
      var now = ctx.currentTime;
      var g = master.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(Math.max(0.0001, g.value), now);
      g.linearRampToValueAtTime(Math.max(0, to), now + dur);
    }

    /* ---- 粉红噪声（Paul Kellet 近似），比纯白噪声柔和不刺耳 ---- */
    function makeNoiseBuffer(seconds) {
      var len = Math.floor(ctx.sampleRate * seconds);
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = buf.getChannelData(0);
      var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (var i = 0; i < len; i++) {
        var w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.1;
        b6 = w * 0.115926;
      }
      return buf;
    }

    function startAmbientBed(key) {
      var layers = TIMBRE_LAYERS[key] || TIMBRE_LAYERS.noise;
      if (!noiseBuf) noiseBuf = makeNoiseBuffer(4);
      fadeMaster(volume * 0.75, 2.5);

      layers.forEach(function (cfg) {
        var src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        src.loop = true;

        var flt = ctx.createBiquadFilter();
        flt.type = cfg.type;
        flt.frequency.value = cfg.freq;
        flt.Q.value = cfg.q;

        var g = ctx.createGain();
        g.gain.value = cfg.gain;

        src.connect(flt);
        flt.connect(g);
        g.connect(padBus);

        // 极慢的音量起伏，像呼吸一样自然
        var lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = cfg.lfo;
        var lfoGain = ctx.createGain();
        lfoGain.gain.value = cfg.gain * cfg.depth;
        lfo.connect(lfoGain);
        lfoGain.connect(g.gain);
        lfo.start();

        src.start();
        noiseNodes.push(src, lfo);

        // 可选：给滤波器做缓慢扫动（风声的"一阵阵"感）
        if (cfg.sweep) {
          var slfo = ctx.createOscillator();
          slfo.type = 'sine';
          slfo.frequency.value = cfg.sweepRate || 0.025;
          var sGain = ctx.createGain();
          sGain.gain.value = cfg.sweep;
          slfo.connect(sGain);
          sGain.connect(flt.frequency);
          slfo.start();
          noiseNodes.push(slfo);
        }
      });

      stopDrops();
      if (key === 'rain') startDrops();
    }

    /* ---- 雨点：随机调度的短促高频颗粒，制造"细碎"的雨感 ---- */
    var dropTimer = null;
    var dropNext = 0;

    function startDrops() {
      stopDrops();
      dropNext = ctx.currentTime + 0.05;
      scheduleDrops();
      dropTimer = setInterval(scheduleDrops, 130);
    }

    function stopDrops() {
      clearInterval(dropTimer);
      dropTimer = null;
    }

    function scheduleDrops() {
      if (!ctx || !playing) return;
      var horizon = ctx.currentTime + 0.4;
      if (dropNext < ctx.currentTime) dropNext = ctx.currentTime + 0.02;
      while (dropNext < horizon) {
        drop(dropNext);
        dropNext += 0.032 + Math.random() * 0.115;   // 约每秒 7 ~ 25 滴
      }
    }

    function drop(when) {
      var src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;
      var offset = Math.random() * 3;

      var bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1500 + Math.random() * 5400;
      bp.Q.value = 1.1 + Math.random() * 3.2;

      var g = ctx.createGain();
      var peak = 0.010 + Math.random() * 0.030;
      var dur = 0.045 + Math.random() * 0.1;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(peak, when + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);

      src.connect(bp);
      bp.connect(g);

      if (ctx.createStereoPanner) {
        var pan = ctx.createStereoPanner();
        pan.pan.value = Math.random() * 2 - 1;
        g.connect(pan);
        pan.connect(bellBus);
      } else {
        g.connect(bellBus);
      }

      src.start(when, offset);
      src.stop(when + dur + 0.05);
    }

    function stopNoiseBed() {
      stopDrops();
      if (!noiseNodes.length) return;
      var nodes = noiseNodes;
      noiseNodes = [];
      // 等主音量淡出后再停，避免戛然而止
      setTimeout(function () {
        nodes.forEach(function (n) {
          try { n.stop(); } catch (e) { /* 已停止 */ }
        });
      }, 1100);
    }

    /* ---- 柔和的"呼吸"声：无尖锐起音，用于回铃与来电铃声 ---- */
    function makeSwell(when, opts) {
      if (!noiseBuf) noiseBuf = makeNoiseBuffer(4);

      var src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;
      var flt = ctx.createBiquadFilter();
      flt.type = 'bandpass';
      flt.frequency.value = opts.freq;
      flt.Q.value = 0.8;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(opts.peak, when + opts.attack);
      g.gain.linearRampToValueAtTime(0.0001, when + opts.dur);
      src.connect(flt);
      flt.connect(g);
      g.connect(fx);
      src.start(when);
      src.stop(when + opts.dur + 0.1);

      // 一层很轻的低音垫底，让声音更厚更舒服
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = opts.tone;
      var og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, when);
      og.gain.linearRampToValueAtTime(opts.peak * 0.55, when + opts.attack);
      og.gain.linearRampToValueAtTime(0.0001, when + opts.dur);
      osc.connect(og);
      og.connect(fx);
      osc.start(when);
      osc.stop(when + opts.dur + 0.1);
    }

    function voice(freq, when, dur, peak, cents) {
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = cents || 0;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(peak, when + 2.6);
      g.gain.linearRampToValueAtTime(0.0001, when + dur);
      osc.connect(g);
      g.connect(padBus);
      osc.start(when);
      osc.stop(when + dur + 0.15);
    }

    function scheduleChord() {
      if (!ctx || !playing) return;
      var chord = CHORDS[chordIndex % CHORDS.length];
      chordIndex++;
      var when = ctx.currentTime + 0.12;
      var dur = 9;
      for (var i = 0; i < chord.length; i++) {
        var f = mtof(chord[i]);
        voice(f, when, dur, 0.075, -3 + i * 1.6);
        voice(f * 1.003, when, dur, 0.045, 3 - i * 1.3);
      }
      chordTimer = setTimeout(scheduleChord, 8000);
    }

    function bell() {
      var when = ctx.currentTime + 0.05;
      var m = PENTA[Math.floor(Math.random() * PENTA.length)];
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = mtof(m);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(0.042, when + 0.14);   // 柔和起音，不是"叮"
      g.gain.exponentialRampToValueAtTime(0.0001, when + 4.8);
      osc.connect(g);
      g.connect(bellBus);
      osc.start(when);
      osc.stop(when + 5.1);
    }

    function bellLoop() {
      if (!playing) return;
      if (Math.random() < 0.62) bell();
      bellTimer = setTimeout(bellLoop, 2800 + Math.random() * 5200);
    }

    // 回铃：一次很轻的"呼吸"声
    function ringbackPulse() {
      makeSwell(ctx.currentTime + 0.05, {
        freq: 720, tone: 174.6, peak: 0.042, attack: 1.2, dur: 2.6,
      });
    }

    // 来电铃声：两声交叠的柔和呼吸，不刺耳
    function ringtonePulse() {
      var now = ctx.currentTime + 0.05;
      makeSwell(now, { freq: 980, tone: 261.6, peak: 0.05, attack: 1.0, dur: 2.8 });
      makeSwell(now + 2.0, { freq: 780, tone: 220.0, peak: 0.04, attack: 0.9, dur: 2.3 });
    }

    function ring(on, kind) {
      clearInterval(ringTimer);
      ringTimer = null;
      if (!on) return;
      var c = ensure();
      if (!c) return;
      if (c.state === 'suspended') c.resume();
      var fire = kind === 'ringback' ? ringbackPulse : ringtonePulse;
      fire();
      // 间隔放宽，让每次响铃之间留出安静的间隙
      ringTimer = setInterval(fire, kind === 'ringback' ? 4400 : 5400);
    }

    return {
      /** 首次用户交互时调用，解锁音频 */
      unlock: function () {
        var c = ensure();
        if (c && c.state === 'suspended') c.resume();
      },
      hasCustom: function () { return !!customUrl; },
      customName: function () { return customTitle; },

      setMode: function (m) {
        var next = (m === 'custom' && customUrl) ? 'custom' : 'builtin';
        if (next === mode) return;
        var wasPlaying = playing;
        this.stop();
        mode = next;
        if (wasPlaying) this.start();
      },

      setTimbre: function (m) {
        var next = (m === 'pad' || TIMBRE_LAYERS[m]) ? m : 'noise';
        if (next === timbre) return;
        var wasPlaying = playing;
        this.stop();
        timbre = next;
        if (wasPlaying) this.start();
      },

      setVolume: function (v) {
        volume = Math.min(1, Math.max(0, v));
        if (customEl) customEl.volume = volume;
        if (playing && mode === 'builtin') fadeMaster(volume * 0.75, 0.25);
      },

      start: function () {
        if (playing) return;
        var c = ensure();
        if (!c) return;
        if (c.state === 'suspended') c.resume();
        playing = true;

        if (mode === 'custom' && customEl && customUrl) {
          customEl.volume = volume;
          var p = customEl.play();
          if (p && p.catch) p.catch(function () { /* 需用户手势 */ });
          return;
        }

        clearTimeout(chordTimer); chordTimer = null;
        clearTimeout(bellTimer); bellTimer = null;
        stopNoiseBed();

        if (timbre === 'pad') {
          fadeMaster(volume * 0.75, 1.8);
          scheduleChord();
          bellLoop();
        } else {
          startAmbientBed(timbre);
        }
      },

      stop: function () {
        playing = false;
        clearTimeout(chordTimer); chordTimer = null;
        clearTimeout(bellTimer); bellTimer = null;
        stopNoiseBed();
        if (master && ctx) fadeMaster(0, 0.9);
        if (customEl) { try { customEl.pause(); } catch (e) { /* 忽略 */ } }
      },

      ringback: function (on) { ring(on, 'ringback'); },
      ringtone: function (on) { ring(on, 'ringtone'); },

      stopAll: function () {
        this.stop();
        clearInterval(ringTimer);
        ringTimer = null;
      },

      loadCustom: function (blob, name) {
        if (!customEl) {
          customEl = new Audio();
          customEl.loop = true;
          customEl.preload = 'auto';
        }
        if (customUrl) URL.revokeObjectURL(customUrl);
        customUrl = URL.createObjectURL(blob);
        customTitle = name || '';
        customEl.src = customUrl;
        customEl.volume = volume;
      },

      clearCustom: function () {
        if (customUrl) URL.revokeObjectURL(customUrl);
        customUrl = null;
        customTitle = '';
        if (customEl) {
          try { customEl.pause(); } catch (e) { /* 忽略 */ }
          customEl.removeAttribute('src');
        }
        if (mode === 'custom') {
          this.stop();
          mode = 'builtin';
        }
      },
    };
  })();

  /* ---------------- 音乐文件的本地持久化（IndexedDB） ---------------- */

  var MediaStore = (function () {
    var DB = 'dreamCardChatMedia';
    var FILES = 'files';
    var STICKERS = 'stickers';
    var META = 'meta';
    var MUSIC_KEY = 'music';

    function open() {
      return new Promise(function (resolve, reject) {
        if (!window.indexedDB) { reject(new Error('indexedDB 不可用')); return; }
        var req = indexedDB.open(DB, 3);
        req.onupgradeneeded = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains(FILES)) db.createObjectStore(FILES);
          if (!db.objectStoreNames.contains(STICKERS)) db.createObjectStore(STICKERS, { keyPath: 'id' });
          if (!db.objectStoreNames.contains(META)) db.createObjectStore(META);
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
    }

    function run(store, mode, fn) {
      return open().then(function (db) {
        return new Promise(function (resolve, reject) {
          var tr = db.transaction(store, mode);
          var out = fn(tr.objectStore(store));
          tr.oncomplete = function () { resolve(out ? out.result : undefined); };
          tr.onerror = function () { reject(tr.error); };
          tr.onabort = function () { reject(tr.error); };
        });
      });
    }

    return {
      /* 背景音乐文件 */
      put: function (value) { return run(FILES, 'readwrite', function (s) { return s.put(value, MUSIC_KEY); }); },
      get: function () { return run(FILES, 'readonly', function (s) { return s.get(MUSIC_KEY); }); },
      del: function () { return run(FILES, 'readwrite', function (s) { return s.delete(MUSIC_KEY); }); },

      /* 自己导入的表情包图片 */
      putSticker: function (rec) { return run(STICKERS, 'readwrite', function (s) { return s.put(rec); }); },
      getStickers: function () { return run(STICKERS, 'readonly', function (s) { return s.getAll(); }); },
      delSticker: function (id) { return run(STICKERS, 'readwrite', function (s) { return s.delete(id); }); },

      /* 主页自定义壁纸 */
      putWallpaper: function (blob, name) {
        return run(FILES, 'readwrite', function (s) { return s.put({ blob: blob, name: name || '' }, 'wallpaper'); });
      },
      getWallpaper: function () { return run(FILES, 'readonly', function (s) { return s.get('wallpaper'); }); },
      delWallpaper: function () { return run(FILES, 'readwrite', function (s) { return s.delete('wallpaper'); }); },

      /* 杂项（自动备份的文件句柄等） */
      metaPut: function (key, value) { return run(META, 'readwrite', function (s) { return s.put(value, key); }); },
      metaGet: function (key) { return run(META, 'readonly', function (s) { return s.get(key); }); },
      metaDel: function (key) { return run(META, 'readwrite', function (s) { return s.delete(key); }); },
    };
  })();

  /* ---------------- 通话状态 ---------------- */

  var CALL_REACTIONS = {
    declined: [
      '……好，那我不打扰你了。',
      '唔，好吧。想我的时候再叫我。',
      '那我先回梦里等你。',
    ],
    refuse: [
      '现在吗？我还没准备好……再等我一会儿。',
      '你是不是太想我了？先陪我聊几句，我就打过去。',
      '唔，我正走到梦里很远的地方了，等会儿再打给你，好吗。',
    ],
  };

  var callLayer = $('callLayer');
  var callMenu = $('callMenu');

  var call = {
    state: 'idle',      // idle | outgoing | incoming | active
    type: 'voice',      // voice | video
    startAt: 0,
    spoken: 0,
    durationTimer: null,
    speakTimer: null,
    ringTimer: null,
    autoTimer: null,
  };

  function callTypeLabel(type) { return tt(type === 'video' ? 'videoCall' : 'voiceCall'); }
  function callTypeIcon(type) { return type === 'video' ? 'video' : 'phone'; }
  function callEmoji(type) { return type === 'video' ? '📹' : '📞'; }

  function fmtDuration(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(s / 60);
    var ss = s % 60;
    return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  }

  /* ---- 粒子装饰 ---- */
  (function buildDots() {
    var box = $('callDots');
    if (!box) return;
    for (var i = 0; i < 18; i++) {
      var d = document.createElement('span');
      var size = 2 + Math.random() * 4;
      d.style.left = (Math.random() * 100) + '%';
      d.style.top = (35 + Math.random() * 62) + '%';
      d.style.width = size + 'px';
      d.style.height = size + 'px';
      d.style.animationDuration = (5 + Math.random() * 6).toFixed(1) + 's';
      d.style.animationDelay = (-Math.random() * 8).toFixed(1) + 's';
      box.appendChild(d);
    }
  })();

  /* ---- 音频解锁：首次交互后即可自动播放 ---- */
  (function bindAudioUnlock() {
    function unlock() {
      Music.unlock();
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    }
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
    document.addEventListener('touchstart', unlock);
  })();

  /* ---------------- 语言 ---------------- */

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      node.textContent = tt(node.dataset.i18n);
    });
    document.querySelectorAll('#langSeg [data-lang]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === curLang());
    });
    $('callLangBtn').textContent = I18N[curLang()].langShort;
  }

  function setLang(lang) {
    if (!I18N[lang]) return;
    Store.updateSettings({ subtitleLang: lang });
    Store.save();
    applyI18n();
    if (call.state !== 'idle') renderCall();
    toast(tt('toastLang', { lang: LANG_NAMES[lang] }), 'ok');
  }

  $('callLangBtn').addEventListener('click', function () {
    var i = LANG_CYCLE.indexOf(curLang());
    setLang(LANG_CYCLE[(i + 1) % LANG_CYCLE.length]);
  });

  /* ---------------- 菜单 UI 同步 ---------------- */

  function currentMusicSource() {
    var s = Store.state.settings.musicSource;
    return (s === 'custom' && Music.hasCustom()) ? 'custom' : 'builtin';
  }

  function syncMenuUI() {
    var s = Store.state.settings;
    $('autoCallToggle').checked = !!s.autoCall;
    $('musicToggle').checked = !!s.music;
    $('musicVolume').value = String(Math.round(s.musicVolume * 100));
    document.querySelectorAll('#musicSourceSeg [data-src]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.src === s.musicSource);
    });
    document.querySelectorAll('#musicTimbreSeg [data-timbre]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.timbre === s.musicTimbre);
    });
    $('musicFileName').textContent = Music.customName() || tt('noFile');
    $('musicClearBtn').disabled = !Music.hasCustom();
  }

  function startMusic() {
    Music.setMode(currentMusicSource());
    Music.setTimbre(Store.state.settings.musicTimbre);
    Music.setVolume(Store.state.settings.musicVolume);
    Music.start();
  }

  /* ---------------- 免提（大字幕模式） ---------------- */

  function applyHandsfree() {
    callLayer.classList.toggle('handsfree', !!Store.state.settings.handsfree);
  }

  function toggleHandsfree() {
    var next = !Store.state.settings.handsfree;
    Store.updateSettings({ handsfree: next });
    Store.save();
    applyHandsfree();
    renderCallActions();
    toast(tt(next ? 'toastHandsfreeOn' : 'toastHandsfreeOff'), 'ok');
  }

  /* ---- 菜单 ---- */
  function openCallMenu() {
    syncMenuUI();
    callMenu.hidden = false;
  }
  function closeCallMenu() { callMenu.hidden = true; }

  $('callMenuBtn').addEventListener('click', function () {
    if (callMenu.hidden) openCallMenu();
    else closeCallMenu();
  });

  document.addEventListener('click', function (e) {
    if (callMenu.hidden) return;
    if (e.target.closest('#callMenu') || e.target.closest('#callMenuBtn')) return;
    closeCallMenu();
  });

  $('autoCallToggle').addEventListener('change', function () {
    Store.updateSettings({ autoCall: this.checked });
    Store.save();
    if (this.checked) scheduleAutoCall();
    else clearTimeout(call.autoTimer);
    toast(tt(this.checked ? 'toastAutoOn' : 'toastAutoOff'), 'ok');
  });

  $('askCallBtn').addEventListener('click', askDreamToCall);
  document.querySelectorAll('[data-call]').forEach(function (btn) {
    btn.addEventListener('click', function () { startCall(btn.dataset.call); });
  });

  /* ---- 语言 / 音乐 菜单交互 ---- */
  document.querySelectorAll('#langSeg [data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });

  $('musicToggle').addEventListener('change', function () {
    Store.updateSettings({ music: this.checked });
    Store.save();
    if (call.state === 'active') {
      if (this.checked) startMusic();
      else Music.stop();
    }
    renderCallActions();
    toast(tt(this.checked ? 'toastMusicOn' : 'toastMusicOff'), 'ok');
  });

  $('musicVolume').addEventListener('input', function () {
    var v = Number(this.value) / 100;
    Store.updateSettings({ musicVolume: v });
    Store.save();
    Music.setVolume(v);
  });

  document.querySelectorAll('#musicSourceSeg [data-src]').forEach(function (b) {
    b.addEventListener('click', function () {
      var src = b.dataset.src;
      Store.updateSettings({ musicSource: src });
      Store.save();
      if (src === 'custom' && !Music.hasCustom()) toast(tt('toastNoFile'), 'warn');
      if (call.state === 'active' && Store.state.settings.music) startMusic();
      syncMenuUI();
    });
  });

  document.querySelectorAll('#musicTimbreSeg [data-timbre]').forEach(function (b) {
    b.addEventListener('click', function () {
      Store.updateSettings({ musicTimbre: b.dataset.timbre });
      Store.save();
      if (call.state === 'active' && Store.state.settings.music) startMusic();
      syncMenuUI();
    });
  });

  $('musicPickBtn').addEventListener('click', function () { $('musicFile').click(); });

  $('musicFile').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { toast('音频文件请小于 25MB', 'warn'); return; }

    Music.loadCustom(file, file.name);
    Store.updateSettings({ musicSource: 'custom' });
    Store.save();
    invalidateMediaCache();
    MediaStore.put({ blob: file, name: file.name }).catch(function () { /* 仅本次有效 */ });
    if (call.state === 'active' && Store.state.settings.music) startMusic();
    syncMenuUI();
    toast(tt('toastFileLoaded'), 'ok');
  });

  $('musicClearBtn').addEventListener('click', function () {
    Music.clearCustom();
    invalidateMediaCache();
    MediaStore.del().catch(function () { /* 忽略 */ });
    Store.updateSettings({ musicSource: 'builtin' });
    Store.save();
    if (call.state === 'active' && Store.state.settings.music) startMusic();
    syncMenuUI();
    toast(tt('toastFileCleared'), 'ok');
  });

  /* ---- 渲染 ---- */
  function renderCall() {
    callLayer.dataset.state = call.state;
    callLayer.classList.toggle('mode-video', call.type === 'video');
    callLayer.classList.toggle('mode-voice', call.type === 'voice');

    $('callBadgeIcon').innerHTML = '';
    $('callBadgeIcon').appendChild(svgIcon(callTypeIcon(call.type)));
    $('callBadgeText').textContent = callTypeLabel(call.type);
    $('callLangBtn').textContent = I18N[curLang()].langShort;

    $('callName').textContent = Store.state.profile.name || '梦角';
    paintAvatar($('callAvatar'), 'avatar-xxl');

    var status = tt('dialing');
    if (call.state === 'incoming') status = tt(call.type === 'video' ? 'incomingVideo' : 'incomingVoice');
    else if (call.state === 'active') status = tt('inCall');
    $('callStatus').textContent = status;

    $('callDuration').textContent = call.state === 'active'
      ? fmtDuration(Date.now() - call.startAt)
      : '00:00';

    renderCallActions();
  }

  function callBtn(kind, label, icon, onClick, active) {
    var b = el('button', 'call-btn ' + kind + (active ? ' on' : ''));
    b.type = 'button';
    var ic = el('span', 'cb-ic');
    ic.appendChild(svgIcon(icon));
    b.appendChild(ic);
    b.appendChild(el('span', 'cb-lb', label));
    b.addEventListener('click', onClick);
    return b;
  }

  function renderCallActions() {
    var box = $('callActions');
    box.innerHTML = '';
    var s = Store.state.settings;

    if (call.state === 'outgoing') {
      box.appendChild(callBtn('hangup', tt('cancel'), 'hangup', endCall));
    } else if (call.state === 'incoming') {
      box.appendChild(callBtn('hangup', tt('decline'), 'hangup', declineCall));
      box.appendChild(callBtn('accept', tt('accept'), 'phone', answerCall));
    } else if (call.state === 'active') {
      var nextType = call.type === 'video' ? 'voice' : 'video';
      box.appendChild(callBtn('neutral', tt(nextType === 'video' ? 'toVideo' : 'toVoice'),
        callTypeIcon(nextType), toggleCallType));
      box.appendChild(callBtn('neutral', tt('handsfree'), 'speaker', toggleHandsfree, !!s.handsfree));
      box.appendChild(callBtn('neutral', tt('music'), 'music', toggleMusic, !!s.music));
      box.appendChild(callBtn('neutral', tt('letSpeak'), 'speak', function () {
        callLayer.classList.add('speaking');
        speakNext();
      }));
      box.appendChild(callBtn('hangup', tt('hangup'), 'hangup', endCall));
    }
  }

  function toggleMusic() {
    var next = !Store.state.settings.music;
    Store.updateSettings({ music: next });
    Store.save();
    if (next) startMusic();
    else Music.stop();
    syncMenuUI();
    renderCallActions();
    toast(tt(next ? 'toastMusicOn' : 'toastMusicOff'), 'ok');
  }

  /* ---- 打开 / 关闭 ---- */
  function showCall(type, state) {
    document.querySelectorAll('.modal:not([hidden])').forEach(function (m) { closeModal(m); });
    closeCallMenu();

    call.type = type;
    call.state = state;
    call.spoken = 0;
    callLayer.hidden = false;
    callLayer.classList.remove('speaking');
    $('callCaption').hidden = true;
    document.body.classList.add('call-open');
    applyHandsfree();
    renderCall();
  }

  function teardownCall() {
    clearTimeout(call.ringTimer);
    clearTimeout(call.speakTimer);
    clearInterval(call.durationTimer);
    Music.stopAll();
    call.state = 'idle';
    callLayer.hidden = true;
    callLayer.classList.remove('speaking');
    document.body.classList.remove('call-open');
  }

  /* ---- 用户发起呼叫 ---- */
  function startCall(type) {
    if (call.state !== 'idle') return;
    if (!Store.countCards()) {
      toast(tt('emptyLib'), 'warn');
      return;
    }
    showCall(type, 'outgoing');
    Music.ringback(true);
    call.ringTimer = setTimeout(function () {
      if (call.state !== 'outgoing') return;
      answerCall();
    }, 1600 + Math.random() * 1800);
  }

  /* ---- 梦角发起来电 ---- */
  function startIncoming(type) {
    if (call.state !== 'idle') return;
    if (!Store.countCards()) return;
    showCall(type, 'incoming');
    Music.ringtone(true);
    if (navigator.vibrate) {
      try { navigator.vibrate([120, 90, 120]); } catch (e) { /* 忽略 */ }
    }
  }

  function answerCall() {
    clearTimeout(call.ringTimer);
    Music.ringback(false);
    Music.ringtone(false);
    call.state = 'active';
    call.startAt = Date.now();
    call.spoken = 0;
    callLayer.classList.add('speaking');
    renderCall();

    if (Store.state.settings.music) startMusic();

    clearInterval(call.durationTimer);
    call.durationTimer = setInterval(function () {
      $('callDuration').textContent = fmtDuration(Date.now() - call.startAt);
    }, 1000);

    setTimeout(function () {
      if (call.state !== 'active') return;
      speakNext();
    }, 420);
  }

  function toggleCallType() {
    call.type = call.type === 'video' ? 'voice' : 'video';
    renderCall();
    toast(tt('toastSwitch', { type: callTypeLabel(call.type) }), 'ok');
  }

  /* ---- 梦角说一句字卡 ---- */
  function speakNext() {
    if (call.state !== 'active') return;
    clearTimeout(call.speakTimer);

    var card = drawCard();
    if (!card) {
      showCaption('', tt('captionEmpty'));
      call.speakTimer = setTimeout(function () {
        if (call.state === 'active') speakNext();
      }, 6000);
      return;
    }

    call.spoken++;
    showCaption(card.tags.join(' / '), card.text);

    var dur = Math.min(5200, 1700 + card.text.length * 115);
    call.speakTimer = setTimeout(function () {
      if (call.state !== 'active') return;
      callLayer.classList.remove('speaking');
      call.speakTimer = setTimeout(function () {
        if (call.state !== 'active') return;
        callLayer.classList.add('speaking');
        speakNext();
      }, 900 + Math.random() * 1200);
    }, dur);
  }

  function showCaption(tag, text) {
    var box = $('callCaption');
    var tagEl = $('captionTag');
    box.hidden = false;
    tagEl.textContent = tag || '';
    $('captionText').textContent = text;

    // 重播入场动画
    box.style.animation = 'none';
    void box.offsetWidth;
    box.style.animation = '';
  }

  /* ---- 结束 / 拒绝 ---- */
  function callRecordText(type, durMs, spoken) {
    var s = callEmoji(type) + ' ' + callTypeLabel(type);
    if (durMs !== null) s += ' · ' + tt('duration') + ' ' + fmtDuration(durMs);
    if (spoken) s += ' · ' + tt('spoken', { n: spoken });
    return s;
  }

  function endCall() {
    var wasActive = call.state === 'active';
    var type = call.type;
    var durMs = wasActive ? Date.now() - call.startAt : 0;
    var spoken = call.spoken;

    teardownCall();

    if (wasActive) {
      var msg = Store.addMessage('call', callRecordText(type, durMs, spoken));
      Store.save();
      appendMessage(msg, true);
    }
    scheduleAutoCall();
  }

  function declineCall() {
    var type = call.type;
    teardownCall();

    var rec = Store.addMessage('call', callEmoji(type) + ' ' + callTypeLabel(type) + ' · ' + tt('declined'));
    Store.save();
    appendMessage(rec, true);

    var line = CALL_REACTIONS.declined[Math.floor(Math.random() * CALL_REACTIONS.declined.length)];
    var dreamMsg = Store.addMessage('dream', line);
    Store.save();
    appendMessage(dreamMsg, true);

    scheduleAutoCall();
  }

  /* ---- "让梦角打给我"：由梦角决定 ---- */
  function askDreamToCall() {
    closeCallMenu();
    if (call.state !== 'idle') return;
    if (!Store.countCards()) {
      toast(tt('emptyLib'), 'warn');
      return;
    }

    if (Math.random() < 0.62) {
      toast(tt('toastIncoming'), 'ok');
      setTimeout(function () {
        startIncoming(Math.random() < 0.5 ? 'video' : 'voice');
      }, 900);
    } else {
      var line = CALL_REACTIONS.refuse[Math.floor(Math.random() * CALL_REACTIONS.refuse.length)];
      var msg = Store.addMessage('dream', line);
      Store.save();
      appendMessage(msg, true);
    }
  }

  /* ---- 随机主动来电 ---- */
  var CALL_INTERVAL = {
    rare:   [900000, 1800000],   // 15 ~ 30 分钟
    normal: [300000, 720000],    //  5 ~ 12 分钟
    often:  [90000,  240000],    //  1.5 ~ 4 分钟
  };

  function scheduleAutoCall(delay) {
    clearTimeout(call.autoTimer);
    if (!Store.state.settings.autoCall) return;

    var s = Store.state.settings;
    var range;
    if (s.callRate === 'custom') {
      var lo = typeof s.callMinMinutes === 'number' ? s.callMinMinutes : 5;
      var hi = typeof s.callMaxMinutes === 'number' ? s.callMaxMinutes : 12;
      if (hi < lo) { var tmp = lo; lo = hi; hi = tmp; }
      range = [lo * 60000, hi * 60000];
    } else {
      range = CALL_INTERVAL[s.callRate] || CALL_INTERVAL.normal;
    }
    if (range[0] < 20000) range = [20000, Math.max(20000, range[1])];

    var wait = delay || (range[0] + Math.random() * (range[1] - range[0]));
    call.autoTimer = setTimeout(function () {
      if (!Store.state.settings.autoCall) return;
      if (call.state !== 'idle' || document.hidden || !Store.countCards()) {
        scheduleAutoCall(60000 + Math.random() * 90000);
        return;
      }
      startIncoming(Math.random() < 0.5 ? 'video' : 'voice');
    }, wait);
  }

  /* ---------------- 主页（手机主屏） ---------------- */

  var HOME_ICONS = {
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12c0 4-3.8 7.2-8.5 7.2-1 0-2-.15-2.9-.42L4.5 20.2l1.3-3.5C4.6 15.4 3.5 13.8 3.5 12c0-4 3.8-7.2 8.5-7.2s8.5 3.2 8.5 7.2z"/></svg>',
    cards: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6.5" width="13" height="12" rx="2.4"/><path d="M7 3.6h13.2v12.6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.5v13M5.5 12h13"/></svg>',
    emoji: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6"/><path d="M8.7 14.1a4.3 4.3 0 0 0 6.6 0"/><path d="M9.5 9.9v.6"/><path d="M14.5 9.9v.6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.6h3.1l1.5 3.9-2.1 1.4a12.4 12.4 0 0 0 6.1 6.1l1.4-2.1 3.9 1.5v3.1a1.9 1.9 0 0 1-2.1 1.9A16.6 16.6 0 0 1 4.6 5.7a1.9 1.9 0 0 1 1.9-2.1z"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.6" r="3.8"/><path d="M4.8 20c.6-3.6 3.6-5.6 7.2-5.6s6.6 2 7.2 5.6"/></svg>',
    sliders: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h7M16.5 7.5H20"/><path d="M4 12h3M11.5 12H20"/><path d="M4 16.5h8M17 16.5H20"/><circle cx="13.5" cy="7.5" r="2.1"/><circle cx="9.2" cy="12" r="2.1"/><circle cx="14.6" cy="16.5" r="2.1"/></svg>',
    backup: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v10"/><path d="M8.2 9.8 12 13.6l3.8-3.8"/><path d="M4.8 15.5v3.4a1.6 1.6 0 0 0 1.6 1.6h11.2a1.6 1.6 0 0 0 1.6-1.6v-3.4"/></svg>',
    pat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11.4V5.6a1.6 1.6 0 0 1 3.2 0v5.6"/><path d="M12.2 11.2V4.4a1.6 1.6 0 0 1 3.2 0v6.8"/><path d="M15.4 11.2V6.6a1.6 1.6 0 0 1 3.2 0v5.9c0 4.7-2.6 8.1-6.5 8.1-3 0-5.1-1.5-6.5-4.1l-1.5-2.9c-.5-1 .1-2.1 1.2-2.1.5 0 .9.2 1.2.6L9 15"/></svg>',
    import: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v10"/><path d="M8.2 9.8 12 13.6l3.8-3.8"/><path d="M4.8 15.5v3.4a1.6 1.6 0 0 0 1.6 1.6h11.2a1.6 1.6 0 0 0 1.6-1.6v-3.4"/></svg>',
    broom: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4.8h6V7"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/></svg>',
    wallpaper: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2.4"/><circle cx="9" cy="10" r="1.6"/><path d="M4.5 17.2 9.8 12.4l3.4 3 3-2.4 3.3 3"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.4"/><path d="M12 7.9v.6"/></svg>',
    write: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/><path d="M17 3.8l3.2 3.2"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2.4"/><path d="M3.9 7.2 12 13l8.1-5.8"/></svg>',
    moment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.6h3l1.6-2.5h6.8L17 8.6h3v9.3a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 17.9z"/><circle cx="12" cy="13.2" r="3.2"/></svg>',
  };

  var HOME_GREETINGS = [
    { from: 5, to: 11, lines: ['早呀，今天想说什么？', '醒了就先来找我了呀。', '新的一天，慢慢来就好。'] },
    { from: 11, to: 18, lines: ['在的，随时找我。', '今天过得怎么样？', '忙里偷闲也可以跟我说说话。'] },
    { from: 18, to: 23, lines: ['今天辛苦啦。', '晚上的时间归我一会儿，好不好。', '回来啦，我一直在这儿。'] },
    { from: 23, to: 5, lines: ['这么晚还没睡？', '夜深了，说两句就睡吧。', '我陪你一会儿，然后你就去休息。'] },
  ];

  var HOME_APPS = [
    {
      id: 'chat', name: '传讯', tone: 'tone-chat', icon: 'chat',
      run: function () { /* 进入聊天本身就是动作 */ },
    },
    {
      id: 'cards', name: '字卡库', tone: 'tone-cards', icon: 'cards', page: 'cards',
      run: function () { renderCards(); },
    },
    {
      id: 'addcard', name: '新建字卡', tone: 'tone-add', icon: 'plus',
      run: function () { openCardModal(null); },
    },
    {
      id: 'emoji', name: '表情', tone: 'tone-emoji', icon: 'emoji',
      badge: function () {
        return customStickers.length + Store.state.extra.face.length + Store.state.extra.kao.length;
      },
      run: function () { openEmojiPanel('face'); },
    },
    {
      id: 'call', name: '通话', tone: 'tone-call', icon: 'phone',
      run: function () { openCallMenu(); },
    },
    {
      id: 'profile', name: '梦角', tone: 'tone-profile', icon: 'user',
      run: function () { openProfileModal(); },
    },
    {
      id: 'freq', name: '频率', tone: 'tone-freq', icon: 'sliders',
      run: function () { openFreqModal(); },
    },
    {
      id: 'backup', name: '备份', tone: 'tone-backup', icon: 'backup',
      run: function () { openBackupModal(); },
    },
    {
      id: 'bulk', name: '批量导入', tone: 'tone-bulk', icon: 'import',
      run: function () {
        $('bulkText').value = '';
        updateBulkCount();
        openModal($('bulkModal'));
      },
    },
    {
      id: 'import', name: '导入备份', tone: 'tone-import', icon: 'import',
      run: function () { $('jsonFile').click(); },
    },
    {
      id: 'clear', name: '清空对话', tone: 'tone-clear', icon: 'broom',
      run: function () {
        if (!Store.state.messages.length) { toast('还没有对话记录', 'warn'); return; }
        confirmDialog('清空对话记录？', '将删除当前所有聊天消息，字卡库不受影响。', '清空')
          .then(function (ok) {
            if (!ok) return;
            Store.clearMessages();
            Store.save();
            renderMessages();
            toast('对话已清空', 'ok');
          });
      },
    },
    {
      id: 'wallpaper', name: '壁纸', tone: 'tone-wallpaper', icon: 'wallpaper',
      run: function () { openWallpaperModal(); },
    },
    {
      id: 'write', name: '写信', tone: 'tone-write', icon: 'write', page: 'write',
      run: function () { openLetterCompose(); },
    },
    {
      id: 'mailbox', name: '信箱', tone: 'tone-mail', icon: 'mail', page: 'mail',
      badge: function () { return Store.unreadLetters(); },
      run: function () { renderMailList(); },
    },
    {
      id: 'moments', name: '朋友圈', tone: 'tone-moment', icon: 'moment', page: 'moments',
      badge: function () { return Store.unseenMoments(); },
      run: function () { openMoments(); },
    },
    {
      id: 'about', name: '关于', tone: 'tone-about', icon: 'info',
      run: function () { openAboutModal(); },
    },
  ];

  var HOME_PER_PAGE = 8;

  /* 内部顺序 + 隐藏列表；未存过就用默认顺序 */
  function homeOrder() {
    var saved = Store.state.settings.appOrder;
    var ids = HOME_APPS.map(function (a) { return a.id; });
    var order = [];
    (saved || []).forEach(function (id) { if (ids.indexOf(id) !== -1 && order.indexOf(id) === -1) order.push(id); });
    ids.forEach(function (id) { if (order.indexOf(id) === -1) order.push(id); });
    return order;
  }

  function homeVisibleApps() {
    var hidden = Store.state.settings.hiddenApps || [];
    var byId = {};
    HOME_APPS.forEach(function (a) { byId[a.id] = a; });
    return homeOrder()
      .filter(function (id) { return hidden.indexOf(id) === -1; })
      .map(function (id) { return byId[id]; })
      .filter(Boolean);
  }

  function saveHomeOrder(ids) {
    Store.updateSettings({ appOrder: ids });
    Store.save();
  }

  var homePage = 0;
  var homeEditing = false;

  function homePageCount() {
    return Math.max(1, Math.ceil(homeVisibleApps().length / HOME_PER_PAGE));
  }

  function renderHomeApps() {
    var box = $('homePages');
    if (!box) return;
    box.innerHTML = '';

    var apps = homeVisibleApps();
    var pages = Math.max(1, Math.ceil(apps.length / HOME_PER_PAGE));

    for (var p = 0; p < pages; p++) {
      var page = el('div', 'home-page');
      page.dataset.page = String(p);
      apps.slice(p * HOME_PER_PAGE, (p + 1) * HOME_PER_PAGE).forEach(function (app) {
        page.appendChild(homeAppTile(app));
      });
      box.appendChild(page);
    }

    if (homePage > pages - 1) homePage = pages - 1;
    applyPager(0, false);
    renderHomeDots(pages);
  }

  function homeAppTile(app) {
    var b = el('button', 'home-app' + (homeEditing ? ' jiggle' : ''));
    b.type = 'button';
    b.dataset.app = app.id;

    var ic = el('span', 'home-app-icon ' + app.tone);
    ic.innerHTML = HOME_ICONS[app.icon] || '';
    if (app.badge && !homeEditing) {
      var n = app.badge();
      if (n > 0) ic.appendChild(el('span', 'home-badge', String(n)));
    }
    b.appendChild(ic);
    b.appendChild(el('span', 'home-app-name', app.name));

    if (homeEditing) {
      var del = el('button', 'home-app-del', '×');
      del.type = 'button';
      del.title = '从主页收起';
      del.addEventListener('click', function (ev) {
        ev.stopPropagation();
        hideHomeApp(app.id);
      });
      b.appendChild(del);
      bindAppDrag(b, app);
    } else {
      b.addEventListener('click', function () { enterApp(app); });
      bindAppPress(b);
    }
    return b;
  }

  function renderHomeDots(pages) {
    var box = $('homeDots');
    if (!box) return;
    box.innerHTML = '';
    if (pages <= 1) { box.classList.add('empty'); return; }
    box.classList.remove('empty');
    for (var i = 0; i < pages; i++) {
      var b = el('button', 'dot' + (i === homePage ? ' active' : ''));
      b.type = 'button';
      b.setAttribute('aria-label', '第 ' + (i + 1) + ' 页');
      b.dataset.page = String(i);
      b.addEventListener('click', function (e) { goHomePage(Number(e.currentTarget.dataset.page)); });
      box.appendChild(b);
    }
  }

  function applyPager(extraPx, animate) {
    var box = $('homePages');
    if (!box) return;
    box.style.transition = animate ? '' : 'none';
    box.style.transform = 'translateX(calc(' + (-homePage * 100) + '% + ' + (extraPx || 0) + 'px))';
  }

  function goHomePage(p) {
    var max = homePageCount() - 1;
    homePage = Math.min(max, Math.max(0, p));
    applyPager(0, true);
    renderHomeDots(homePageCount());
  }

  /* ---- 长按进入编辑模式 ---- */
  var pressTimer = null;
  var pressMoved = false;

  function bindAppPress(node) {
    node.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pressMoved = false;
      clearTimeout(pressTimer);
      pressTimer = setTimeout(function () { enterHomeEdit(); }, 520);
    });
    node.addEventListener('pointermove', function () {
      pressMoved = true;
      clearTimeout(pressTimer);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
      node.addEventListener(ev, function () { clearTimeout(pressTimer); });
    });
    node.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      enterHomeEdit();
    });
  }

  function enterHomeEdit() {
    if (homeEditing) return;
    homeEditing = true;
    $('homeEditBar').hidden = false;
    renderHomeApps();
    toast('拖动排序，点 ✕ 收起', 'ok');
  }

  function exitHomeEdit() {
    if (!homeEditing) return;
    homeEditing = false;
    $('homeEditBar').hidden = true;
    renderHomeApps();
  }

  function hideHomeApp(id) {
    var hidden = (Store.state.settings.hiddenApps || []).slice();
    if (hidden.indexOf(id) === -1) hidden.push(id);
    Store.updateSettings({ hiddenApps: hidden });
    Store.save();
    renderHomeApps();
    $('homeRestoreBtn').textContent = '恢复隐藏' + (hidden.length ? '（' + hidden.length + '）' : '');
  }

  function restoreHomeApps() {
    Store.updateSettings({ hiddenApps: [] });
    Store.save();
    renderHomeApps();
    $('homeRestoreBtn').textContent = '恢复隐藏';
    toast('已恢复全部应用', 'ok');
  }

  /* ---- 拖动排序 ---- */
  var dragId = null;

  function bindAppDrag(node, app) {
    node.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      dragId = app.id;
      node.classList.add('dragging');
      try { node.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }

      function move(ev) {
        var under = document.elementFromPoint(ev.clientX, ev.clientY);
        var tile = under && under.closest ? under.closest('.home-app') : null;
        document.querySelectorAll('.home-app.drop-target').forEach(function (n) { n.classList.remove('drop-target'); });
        if (tile && tile !== node) tile.classList.add('drop-target');
      }

      function up(ev) {
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerup', up);
        node.removeEventListener('pointercancel', up);
        try { node.releasePointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }

        var under = document.elementFromPoint(ev.clientX, ev.clientY);
        var tile = under && under.closest ? under.closest('.home-app') : null;
        var targetId = tile && tile.dataset.app;
        dragId = null;
        node.classList.remove('dragging');
        document.querySelectorAll('.home-app.drop-target').forEach(function (n) { n.classList.remove('drop-target'); });

        if (targetId && targetId !== app.id) {
          var order = homeOrder();
          var from = order.indexOf(app.id);
          var to = order.indexOf(targetId);
          if (from !== -1 && to !== -1) {
            order.splice(from, 1);
            order.splice(to, 0, app.id);
            saveHomeOrder(order);
          }
        }
        renderHomeApps();
      }

      node.addEventListener('pointermove', move);
      node.addEventListener('pointerup', up);
      node.addEventListener('pointercancel', up);
    });
  }

  /* ---- 分页：触摸滑动 ---- */
  (function bindPagerSwipe() {
    var box = $('homePages');
    if (!box) return;
    var sx = 0, sy = 0, dx = 0, axis = null, active = false;

    box.addEventListener('touchstart', function (e) {
      if (homeEditing || e.touches.length !== 1) return;
      active = true;
      axis = null;
      dx = 0;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    }, { passive: true });

    box.addEventListener('touchmove', function (e) {
      if (!active) return;
      var cx = e.touches[0].clientX, cy = e.touches[0].clientY;
      dx = cx - sx;
      var dy = cy - sy;
      if (!axis) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (axis !== 'x') return;
      var limit = (homePage === 0 && dx > 0) || (homePage === homePageCount() - 1 && dx < 0) ? 0.32 : 1;
      applyPager(dx * limit, false);
    }, { passive: true });

    box.addEventListener('touchend', function () {
      if (!active) return;
      active = false;
      if (axis !== 'x') return;
      if (dx < -48) goHomePage(homePage + 1);
      else if (dx > 48) goHomePage(homePage - 1);
      else goHomePage(homePage);
    });
  })();

  document.addEventListener('keydown', function (e) {
    if (!atHome || homeEditing) return;
    if (e.key === 'ArrowRight') goHomePage(homePage + 1);
    else if (e.key === 'ArrowLeft') goHomePage(homePage - 1);
  });

  $('homeEditDone').addEventListener('click', exitHomeEdit);
  $('homeRestoreBtn').addEventListener('click', restoreHomeApps);

  /* ---- 壁纸 ---- */
  var WALLPAPERS = [
    { id: 'dream', name: '淡紫', css: 'radial-gradient(560px 420px at 50% 8%, #f6f1ff 0%, transparent 62%), linear-gradient(170deg, #ece3fd 0%, #ded0f9 46%, #f5f0ff 100%)' },
    { id: 'night', name: '星夜', css: 'radial-gradient(560px 420px at 50% 6%, rgba(150,130,220,.35) 0%, transparent 62%), linear-gradient(170deg, #2c2450 0%, #1d1838 52%, #2a2350 100%)' },
    { id: 'sakura', name: '樱花', css: 'radial-gradient(560px 420px at 50% 8%, #fff4f8 0%, transparent 62%), linear-gradient(170deg, #fbe4ef 0%, #f6d3e4 46%, #fdf0f6 100%)' },
    { id: 'mint', name: '薄荷', css: 'radial-gradient(560px 420px at 50% 8%, #f0fbfa 0%, transparent 62%), linear-gradient(170deg, #d9f2ee 0%, #c3e8e6 46%, #eefaf8 100%)' },
    { id: 'dusk', name: '暮色', css: 'radial-gradient(560px 420px at 50% 6%, rgba(255,190,150,.45) 0%, transparent 60%), linear-gradient(170deg, #f7d4c0 0%, #e0a8c0 50%, #b48ac8 100%)' },
    { id: 'aurora', name: '极光', css: 'radial-gradient(560px 420px at 30% 4%, rgba(120,240,220,.35) 0%, transparent 58%), radial-gradient(520px 400px at 78% 20%, rgba(170,130,255,.45) 0%, transparent 60%), linear-gradient(170deg, #21334a 0%, #26224a 52%, #1b2b40 100%)' },
  ];

  var wallpaperURL = null;
  var wallpaperName = '';

  function applyWallpaper() {
    var home = $('homeScreen');
    if (!home) return;
    var wp = Store.state.settings.wallpaper || 'dream';
    home.dataset.wallpaper = wp;
    var scene = document.querySelector('.home-scene');
    if (!scene) return;
    var preset = null;
    WALLPAPERS.forEach(function (w) { if (w.id === wp) preset = w; });
    scene.style.background = preset ? preset.css : '';
    scene.style.setProperty('--home-photo', wallpaperURL ? 'url("' + wallpaperURL + '")' : 'none');
    if (wp === 'custom' && !wallpaperURL) home.dataset.wallpaper = 'dream';
  }

  function renderWallpaperGrid() {
    var grid = $('wallpaperGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var cur = Store.state.settings.wallpaper || 'dream';
    WALLPAPERS.forEach(function (w) {
      var b = el('button', 'wp-swatch' + (w.id === cur ? ' active' : ''));
      b.type = 'button';
      b.title = w.name;
      b.style.background = w.css;
      b.appendChild(el('span', null, w.name));
      b.addEventListener('click', function () {
        Store.updateSettings({ wallpaper: w.id });
        Store.save();
        applyWallpaper();
        renderWallpaperGrid();
        $('wallpaperName').textContent = '当前：' + w.name;
      });
      grid.appendChild(b);
    });
    var custom = el('button', 'wp-swatch' + (cur === 'custom' ? ' active' : ''));
    custom.type = 'button';
    custom.title = '自定义图片';
    if (wallpaperURL) {
      custom.style.background = 'url("' + wallpaperURL + '") center / cover';
    } else {
      custom.style.background = 'repeating-linear-gradient(45deg, #efe9fb 0 8px, #e5ddf7 8px 16px)';
    }
    custom.appendChild(el('span', null, '自定义'));
    custom.addEventListener('click', function () {
      if (!wallpaperURL) { $('wallpaperFile').click(); return; }
      Store.updateSettings({ wallpaper: 'custom' });
      Store.save();
      applyWallpaper();
      renderWallpaperGrid();
      $('wallpaperName').textContent = '当前：自定义图片' + (wallpaperName ? '（' + wallpaperName + '）' : '');
    });
    grid.appendChild(custom);
  }

  function openWallpaperModal() {
    renderWallpaperGrid();
    $('wallpaperName').textContent = wallpaperURL
      ? (Store.state.settings.wallpaper === 'custom' ? '当前：自定义图片' : '已上传图片，点「自定义」使用')
      : '当前使用内置壁纸';
    openModal($('wallpaperModal'));
  }

  $('wallpaperPickBtn').addEventListener('click', function () { $('wallpaperFile').click(); });
  $('wallpaperClearBtn').addEventListener('click', function () {
    if (wallpaperURL) { URL.revokeObjectURL(wallpaperURL); wallpaperURL = null; }
    wallpaperName = '';
    MediaStore.delWallpaper().catch(function () {});
    Store.updateSettings({ wallpaper: 'dream' });
    Store.save();
    applyWallpaper();
    renderWallpaperGrid();
    $('wallpaperName').textContent = '已移除图片，回到内置壁纸';
    toast('已移除自定义壁纸', 'ok');
  });

  $('wallpaperFile').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\//.test(file.type)) { toast('请选择图片文件', 'warn'); return; }
    if (file.size > 5 * 1024 * 1024) { toast('图片请小于 5MB', 'warn'); return; }
    if (wallpaperURL) URL.revokeObjectURL(wallpaperURL);
    wallpaperURL = URL.createObjectURL(file);
    wallpaperName = file.name;
    Store.updateSettings({ wallpaper: 'custom' });
    Store.save();
    MediaStore.putWallpaper(file).catch(function () { /* 仅本次有效 */ });
    applyWallpaper();
    renderWallpaperGrid();
    $('wallpaperName').textContent = '当前：自定义图片（' + file.name + '）';
    toast('壁纸已更换', 'ok');
  });

  function restoreWallpaper() {
    return MediaStore.getWallpaper().then(function (rec) {
      if (rec && rec.blob) {
        wallpaperURL = URL.createObjectURL(rec.blob);
        wallpaperName = rec.name || '';
      }
      applyWallpaper();
    }).catch(function () { applyWallpaper(); });
  }

  /* ---- 纪念日组件 ---- */

  function ymdToDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  function todayDate() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function dayDiff(from, to) {
    return Math.round((to.getTime() - from.getTime()) / 86400000);
  }

  function fmtDate(s) {
    var d = ymdToDate(s);
    if (!d) return s;
    return d.getFullYear() + '.' + pad2(d.getMonth() + 1) + '.' + pad2(d.getDate());
  }

  /** 计算一条纪念日的展示信息 */
  function anniInfo(item) {
    var start = ymdToDate(item.date);
    if (!start) return null;
    var today = todayDate();

    // 总共过了多少天（日期在未来时为负）
    var since = dayDiff(start, today);

    // 距离下一次同月同日（今年的过了就顺延到明年）
    var next = new Date(today.getFullYear(), start.getMonth(), start.getDate());
    if (dayDiff(today, next) < 0) next = new Date(today.getFullYear() + 1, start.getMonth(), start.getDate());
    var toNext = dayDiff(today, next);
    var nth = next.getFullYear() - start.getFullYear();

    var sub;
    if (since < 0) {
      sub = '还有 ' + (-since) + ' 天开始';
    } else if (toNext === 0) {
      sub = (nth >= 1 ? ('第 ' + nth + ' 个 · ') : '') + '就是今天 🎉';
    } else {
      sub = (nth >= 1 ? ('第 ' + nth + ' 个 · ') : '') + '还有 ' + toNext + ' 天';
    }

    return {
      name: item.name,
      since: since,
      toNext: toNext,
      nth: nth,
      future: since < 0,
      isToday: !(since < 0) && toNext === 0,
      sub: sub,
      cap: since < 0 ? '还有' : '已经',
      num: Math.abs(since),
    };
  }

  var ANNI_MAX_ROWS = 3;

  function renderHomeAnni() {
    var list = Store.getAnniversaries();
    var box = $('anniLines');
    if (!box) return;
    box.innerHTML = '';
    $('anniMore').textContent = list.length ? ('共 ' + list.length + ' 个') : '';

    if (!list.length) {
      var empty = el('button', 'anni-line empty', '点这里添加一个纪念日');
      empty.type = 'button';
      empty.addEventListener('click', function () { openAnniModal(); });
      box.appendChild(empty);
      return;
    }

    list.slice(0, ANNI_MAX_ROWS).forEach(function (item) {
      box.appendChild(anniRowEl(item));
    });
  }

  function anniRowEl(item) {
    var info = anniInfo(item);
    var today = !!(info && info.isToday);
    var row = el('button', 'anni-line' + (today ? ' today' : ''));
    row.type = 'button';

    row.appendChild(el('span', 'anni-line-icon', today ? '🎉' : (item.repeat ? '🎂' : '💜')));

    var main = el('span', 'anni-line-main');
    main.appendChild(el('span', 'anni-line-name', item.name));
    main.appendChild(el('span', 'anni-line-sub', info ? info.sub : '日期格式不对'));
    row.appendChild(main);

    if (info && info.num > 0) {
      var days = el('span', 'anni-line-days');
      days.appendChild(el('span', 'anni-line-cap', info.cap));
      days.appendChild(el('b', null, String(info.num)));
      days.appendChild(el('i', null, '天'));
      row.appendChild(days);
    }

    row.addEventListener('click', function () { openAnniModal(item.id); });
    return row;
  }

  /* ---- 纪念日管理弹窗 ---- */
  var editingAnniId = null;

  function renderAnniList() {
    var box = $('anniList');
    if (!box) return;
    box.innerHTML = '';
    var list = Store.getAnniversaries();

    list.forEach(function (item) {
      var row = el('div', 'anni-row' + (item.id === editingAnniId ? ' editing' : ''));

      var main = el('div', 'anni-row-main');
      main.appendChild(el('div', 'anni-row-name', item.name));
      var info = anniInfo(item);
      main.appendChild(el('div', 'anni-row-meta',
        fmtDate(item.date) + ' · ' + (info ? info.sub : '—')));
      row.appendChild(main);

      row.appendChild(el('span', 'anni-row-flag', item.repeat ? '每年' : '一次'));

      var acts = el('div', 'anni-row-actions');
      var edit = el('button', 'icon-btn');
      edit.type = 'button';
      edit.title = '编辑';
      edit.appendChild(svgIcon('edit'));
      edit.addEventListener('click', function () {
        editingAnniId = item.id;
        $('anniNameInput').value = item.name;
        $('anniDate').value = item.date;
        $('anniRepeat').checked = !!item.repeat;
        $('anniFormLabel').textContent = '编辑「' + item.name + '」';
        $('anniSaveBtn').textContent = '保存修改';
        $('anniCancelEditBtn').hidden = false;
        renderAnniList();
      });
      acts.appendChild(edit);

      var del = el('button', 'icon-btn del');
      del.type = 'button';
      del.title = '删除';
      del.appendChild(svgIcon('del'));
      del.addEventListener('click', function () {
        Store.removeAnniversary(item.id);
        Store.save();
        if (editingAnniId === item.id) resetAnniForm();
        renderAnniList();
        renderHomeAnni();
        toast('已删除', 'ok');
      });
      acts.appendChild(del);

      row.appendChild(acts);
      box.appendChild(row);
    });
  }

  function resetAnniForm() {
    editingAnniId = null;
    $('anniNameInput').value = '';
    $('anniDate').value = '';
    $('anniRepeat').checked = false;
    $('anniFormLabel').textContent = '添加一个纪念日';
    $('anniSaveBtn').textContent = '添加';
    $('anniCancelEditBtn').hidden = true;
  }

  function openAnniModal(editId) {
    resetAnniForm();
    if (!editId) {
      var d = new Date();
      $('anniDate').value = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }
    renderAnniList();
    openModal($('anniModal'));
    if (editId) {
      var item = Store.getAnniversaries().filter(function (a) { return a.id === editId; })[0];
      if (item) loadAnniForEdit(item);
    }
  }

  function loadAnniForEdit(item) {
    editingAnniId = item.id;
    $('anniNameInput').value = item.name;
    $('anniDate').value = item.date;
    $('anniRepeat').checked = !!item.repeat;
    $('anniFormLabel').textContent = '编辑「' + item.name + '」';
    $('anniSaveBtn').textContent = '保存修改';
    $('anniCancelEditBtn').hidden = false;
    renderAnniList();
  }

  $('anniAddBtn').addEventListener('click', function () { openAnniModal(); });
  $('anniCancelEditBtn').addEventListener('click', function () { resetAnniForm(); renderAnniList(); });

  $('anniSaveBtn').addEventListener('click', function () {
    var name = $('anniNameInput').value.trim();
    var date = $('anniDate').value;
    var repeat = $('anniRepeat').checked;

    if (!name) { toast('给它起个名字吧', 'warn'); $('anniNameInput').focus(); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { toast('请选择日期', 'warn'); $('anniDate').focus(); return; }

    if (editingAnniId) {
      Store.updateAnniversary(editingAnniId, { name: name, date: date, repeat: repeat });
      toast('已保存修改', 'ok');
    } else {
      Store.addAnniversary(name, date, repeat);
      toast('已添加', 'ok');
    }
    Store.save();
    resetAnniForm();
    renderAnniList();
    renderHomeAnni();
  });

  /* 在输入框里按回车直接提交 */
  ['anniNameInput', 'anniDate'].forEach(function (id) {
    $(id).addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      $('anniSaveBtn').click();
    });
  });
  /* ---- 写信 / 信箱 ---- */
  var LETTER_SUBJECTS = ['回信', '写给你的', '见字如面', '一封回信', '给你的信'];
  var LETTER_OPENINGS = ['见字如面。', '展信佳。', '收到你的信了。', '我慢慢回你，别急。', '读完了，想了很久才回。'];
  var LETTER_ACKS = [
    '这句话我看了好几遍。',
    '嗯，我记住了。',
    '读到这儿的时候，我停了一下。',
    '你说这句的时候，我在想你的表情。',
    '我把它抄下来了。',
    '看到这句，我一下就懂你了。',
  ];

  var LETTER_PAPERS = [
    { id: 'plain', name: '素纸', bg: '#fffdf7', ink: '#4d4033', rule: 'rgba(203,124,133,0.55)',
      css: 'linear-gradient(180deg,#fffdf7,#fbf5e9)' },
    { id: 'ruled', name: '横线纸', bg: '#fffdf7', ink: '#4d4033', rule: 'rgba(203,124,133,0.55)', ruled: true,
      css: 'repeating-linear-gradient(to bottom,#fffdf7 0 12px,rgba(150,122,200,.35) 12px 13px)' },
    { id: 'kraft', name: '牛皮纸', bg: '#eedfc4', ink: '#57432f', rule: 'rgba(170,120,70,0.5)',
      css: 'linear-gradient(180deg,#f3e3ca,#e9d4b4)' },
    { id: 'sakura', name: '樱纸', bg: '#fdeef5', ink: '#5a3d4b', rule: 'rgba(214,130,170,0.5)',
      css: 'linear-gradient(180deg,#fff8fb,#fdeaf3)' },
    { id: 'night', name: '夜纸', bg: '#262040', ink: '#e9e2f8', rule: 'rgba(255,255,255,0.28)',
      css: 'linear-gradient(180deg,#2c2748,#211c37)' },
  ];

  function paperById(id) {
    var found = LETTER_PAPERS[0];
    LETTER_PAPERS.forEach(function (p) { if (p.id === id) found = p; });
    return found;
  }

  function pickOne(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function letterTimeLabel(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '.' + pad2(d.getMonth() + 1) + '.' + pad2(d.getDate());
  }

  /** 从用户信里挑一句可以引用的原话 */
  function pickQuote(body) {
    var parts = String(body || '')
      .split(/[。！？!?；;\n\r]+/)
      .map(function (s) { return s.trim().replace(/^[，,、：:\s]+/, ''); })
      .filter(function (s) { return s.length >= 4; });
    if (!parts.length) return '';
    var pick = parts[Math.floor(Math.random() * parts.length)];
    if (pick.length > 40) pick = pick.slice(0, 40) + '…';
    return pick;
  }

  /** 回信：引用你的原话 + 回应 + （间隔提示）+ 2~4 张字卡 */
  function buildDreamLetter(userBody, prevTime) {
    var lines = [];
    var quote = pickQuote(userBody);
    if (quote) {
      lines.push('你写：「' + quote + '」');
      lines.push(pickOne(LETTER_ACKS));
    } else {
      lines.push(pickOne(LETTER_OPENINGS));
    }

    // 距上次写信的间隔
    if (typeof prevTime === 'number' && prevTime > 0) {
      var days = Math.round((Date.now() - prevTime) / 86400000);
      if (days >= 1) {
        lines.push(days === 1
          ? '昨天才收到你的信，今天又来了，我很高兴。'
          : pickOne([
            '距你上次写信，已经 ' + days + ' 天了。',
            '上一封信是 ' + days + ' 天前收到的，我数着呢。',
            '你上一次动笔，是 ' + days + ' 天前的事。',
          ]));
      }
    }

    var n = 2 + Math.floor(Math.random() * 3);
    var seen = {};
    for (var i = 0; i < n; i++) {
      var card = drawCard();
      if (!card) break;
      var guard = 0;
      while (seen[card.text] && guard++ < 8) card = drawCard();
      seen[card.text] = 1;
      lines.push(card.text);
    }
    if (lines.length < 2) lines.push('今天没什么特别的话，只是想你了。');
    return lines.join('\n\n');
  }

  function currentPaper() {
    return paperById(Store.state.settings.letterPaper || 'plain');
  }

  function renderPaperPicker() {
    var box = $('paperPicker');
    if (!box) return;
    box.innerHTML = '';
    var cur = Store.state.settings.letterPaper || 'plain';
    LETTER_PAPERS.forEach(function (p) {
      var b = el('button', 'paper-chip' + (p.id === cur ? ' active' : ''));
      b.type = 'button';
      b.dataset.paper = p.id;
      var i = el('i');
      i.style.background = p.css;
      b.appendChild(i);
      b.appendChild(el('span', null, p.name));
      b.addEventListener('click', function () {
        Store.updateSettings({ letterPaper: p.id });
        Store.save();
        renderPaperPicker();
      });
      box.appendChild(b);
    });
  }

  function openLetterCompose() {
    $('letterSubject').value = '';
    $('letterBody').value = '';
    $('letterCount').textContent = '0 字';
    renderPaperPicker();
    setTimeout(function () { $('letterBody').focus(); }, 80);
  }

  function renderMailList() {
    var box = $('mailList');
    if (!box) return;
    box.innerHTML = '';

    // 梦角正在读信的占位
    if (letterPending) {
      var ph = el('div', 'mail-pending');
      ph.appendChild(el('i'));
      ph.appendChild(el('i'));
      ph.appendChild(el('i'));
      ph.appendChild(el('span', null, '梦角正在读你的信…'));
      box.appendChild(ph);
    }

    var list = Store.getLetters().slice().sort(function (a, b) { return b.time - a.time; });

    if (!list.length) {
      if (!letterPending) {
        box.appendChild(el('div', 'mail-empty', '信箱还是空的。\n写一封信给梦角吧，它会认真回你的。'));
      }
      $('mailCount').textContent = '共 0 封';
      return;
    }

    list.forEach(function (item) {
      var row = el('button', 'mail-item' + (item.from === 'me' ? ' mine' : '') + (item.from === 'dream' && !item.read ? ' unread' : ''));
      row.type = 'button';

      var av = el('span', 'mail-avatar');
      av.textContent = item.from === 'me' ? '✉️' : (Store.state.profile.avatar || '🌙');
      row.appendChild(av);

      var body = el('div', 'mail-body');
      var subj = el('div', 'mail-subject');
      if (item.from === 'dream' && !item.read) subj.appendChild(el('span', 'mail-dot'));
      subj.appendChild(el('span', null, item.title || (item.from === 'me' ? '（无标题）' : '回信')));
      body.appendChild(subj);
      body.appendChild(el('div', 'mail-snippet', item.body.replace(/\n+/g, ' ')));
      row.appendChild(body);

      row.appendChild(el('div', 'mail-meta', letterTimeLabel(item.time)));

      row.addEventListener('click', function () { openLetterView(item.id); });
      box.appendChild(row);
    });

    $('mailCount').textContent = '共 ' + list.length + ' 封';
  }

  var viewingLetterId = null;
  var letterPending = false;

  /** 读信界面的信纸选择（只改这一封） */
  function renderLetterPapers(item) {
    var box = $('letterViewPapers');
    if (!box) return;
    box.innerHTML = '';
    var cur = item.paper || Store.state.settings.letterPaper || 'plain';
    LETTER_PAPERS.forEach(function (p) {
      var b = el('button', 'paper-chip' + (p.id === cur ? ' active' : ''));
      b.type = 'button';
      b.title = p.name;
      var i = el('i');
      i.style.background = p.css;
      b.appendChild(i);
      b.appendChild(el('span', null, p.name));
      b.addEventListener('click', function () {
        item.paper = p.id;
        Store.save();
        $('letterPaper').dataset.paper = p.id;
        renderLetterPapers(item);
      });
      box.appendChild(b);
    });
  }

  function openLetterView(id) {
    var item = Store.getLetter(id);
    if (!item) return;
    viewingLetterId = id;

    if (!item.read) {
      item.read = true;
      Store.save();
      renderHomeApps();
    }

    var name = Store.state.profile.name || '梦角';
    $('letterViewTitle').textContent = item.from === 'me' ? '我寄出的信' : (name + ' 的来信');

    var paper = $('letterPaper');
    paper.dataset.paper = item.paper || Store.state.settings.letterPaper || 'plain';
    paper.innerHTML = '';
    var head = el('div', 'letter-head');
    head.appendChild(el('span', 'letter-subject', item.title || (item.from === 'me' ? '（无标题）' : '回信')));
    head.appendChild(el('span', 'letter-date', letterTimeLabel(item.time)));
    paper.appendChild(head);
    paper.appendChild(el('div', 'letter-text', item.body));
    var sign = el('div', 'letter-sign');
    sign.appendChild(el('b', null, item.from === 'me' ? '我' : name));
    sign.appendChild(document.createElement('br'));
    sign.appendChild(document.createTextNode(letterTimeLabel(item.time)));
    paper.appendChild(sign);

    renderLetterPapers(item);
    openModal($('letterViewModal'));
  }

  /* ---- 导出信件 ---- */
  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = el('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function letterFileBase(item) {
    var name = Store.state.profile.name || '梦角';
    var t = (item.title || '无标题').replace(/[\\/:*?"<>|\s]+/g, '');
    return '信件-' + (item.from === 'me' ? '给' + name : name + '回信') + '-' + t + '-' + letterTimeLabel(item.time).replace(/\./g, '');
  }

  function exportLetterText(item) {
    var name = Store.state.profile.name || '梦角';
    var text = [
      item.title || (item.from === 'me' ? '（无标题）' : '回信'),
      letterTimeLabel(item.time),
      '',
      item.body,
      '',
      '—— ' + (item.from === 'me' ? '我' : name) + '  ' + letterTimeLabel(item.time),
    ].join('\n');
    downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), letterFileBase(item) + '.txt');
    toast('已导出文字', 'ok');
  }

  /** 用 Canvas 把信画成图片（不依赖任何库） */
  function exportLetterImage(item) {
    var p = paperById(item.paper || Store.state.settings.letterPaper || 'plain');
    var name = Store.state.profile.name || '梦角';

    var W = 760;
    var PAD_X = 58;
    var PAD_TOP = 54;
    var LH = 34;
    var FS = 20;
    var font = FS + 'px "Songti SC","SimSun",Georgia,serif';
    var titleFont = 'bold 23px "Songti SC","SimSun",Georgia,serif';
    var metaFont = '15px "Songti SC","SimSun",Georgia,serif';

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var maxW = W - PAD_X * 2 - 26;

    ctx.font = font;
    var bodyLines = wrapCanvasText(ctx, item.body, maxW);

    var headH = 84;
    var signH = 96;
    var H = PAD_TOP + headH + bodyLines.length * LH + signH;

    canvas.width = W;
    canvas.height = H;

    // 纸面
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, H);

    // 横线纸
    if (p.ruled) {
      ctx.strokeStyle = 'rgba(150,122,200,0.22)';
      ctx.lineWidth = 1;
      for (var y = PAD_TOP + headH; y < H - 30; y += LH) {
        ctx.beginPath();
        ctx.moveTo(PAD_X - 6, y + 0.5);
        ctx.lineTo(W - PAD_X + 6, y + 0.5);
        ctx.stroke();
      }
    }

    // 左侧竖线
    ctx.strokeStyle = p.rule;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PAD_X - 14, 22);
    ctx.lineTo(PAD_X - 14, H - 22);
    ctx.stroke();

    // 标题与日期
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = p.ink;
    ctx.font = titleFont;
    var title = item.title || (item.from === 'me' ? '（无标题）' : '回信');
    ctx.fillText(title, PAD_X, PAD_TOP + 24);

    ctx.font = metaFont;
    ctx.globalAlpha = 0.7;
    var dateStr = letterTimeLabel(item.time);
    var dw = ctx.measureText(dateStr).width;
    ctx.fillText(dateStr, W - PAD_X - dw, PAD_TOP + 22);
    ctx.globalAlpha = 1;

    // 标题下虚线
    ctx.strokeStyle = p.rule;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(PAD_X, PAD_TOP + 44);
    ctx.lineTo(W - PAD_X, PAD_TOP + 44);
    ctx.stroke();
    ctx.setLineDash([]);

    // 正文
    ctx.font = font;
    ctx.fillStyle = p.ink;
    var ty = PAD_TOP + headH + FS;
    bodyLines.forEach(function (line) {
      ctx.fillText(line, PAD_X, ty);
      ty += LH;
    });

    // 落款
    ctx.font = metaFont;
    ctx.globalAlpha = 0.85;
    var signName = item.from === 'me' ? '我' : name;
    var sw = ctx.measureText(signName).width;
    ctx.fillText(signName, W - PAD_X - sw, ty + 18);
    var sw2 = ctx.measureText(dateStr).width;
    ctx.fillText(dateStr, W - PAD_X - sw2, ty + 42);
    ctx.globalAlpha = 1;

    canvas.toBlob(function (blob) {
      if (!blob) { toast('生成图片失败', 'warn'); return; }
      downloadBlob(blob, letterFileBase(item) + '.png');
      toast('已导出图片', 'ok');
    }, 'image/png');
  }

  /** 按显示宽度断行（按码位遍历，避免拆散代理对） */
  function wrapCanvasText(ctx, text, maxWidth) {
    var out = [];
    String(text || '').split('\n').forEach(function (para) {
      var chars = Array.from(para);
      if (!chars.length) { out.push(''); return; }
      var line = '';
      chars.forEach(function (ch) {
        if (line && ctx.measureText(line + ch).width > maxWidth) {
          out.push(line);
          line = ch;
        } else {
          line += ch;
        }
      });
      if (line) out.push(line);
    });
    return out;
  }

  $('letterTxtBtn').addEventListener('click', function () {
    var item = Store.getLetter(viewingLetterId);
    if (item) exportLetterText(item);
  });
  $('letterImgBtn').addEventListener('click', function () {
    var item = Store.getLetter(viewingLetterId);
    if (item) exportLetterImage(item);
  });

  /* 图片放大层 */
  $('photoPrev').addEventListener('click', function (e) {
    e.stopPropagation();
    viewerIndex--;
    renderPhotoView();
  });
  $('photoNext').addEventListener('click', function (e) {
    e.stopPropagation();
    viewerIndex++;
    renderPhotoView();
  });
  $('photoSave').addEventListener('click', function (e) {
    e.stopPropagation();
    if (viewerList.length) savePhoto(viewerList[viewerIndex], viewerIndex);
  });
  $('photoView').addEventListener('click', function (e) {
    if (e.target.id === 'photoViewImg') return;
    closePhotoView();
  });
  document.addEventListener('keydown', function (e) {
    if ($('photoView').hidden) return;
    if (e.key === 'ArrowLeft') { viewerIndex--; renderPhotoView(); }
    else if (e.key === 'ArrowRight') { viewerIndex++; renderPhotoView(); }
    else if (e.key === 'Escape') closePhotoView();
  });

  $('letterViewDelBtn').addEventListener('click', function () {
    if (!viewingLetterId) return;
    var id = viewingLetterId;
    confirmDialog('删除这封信？', '删掉就找不回来了。', '删除').then(function (ok) {
      if (!ok) return;
      Store.removeLetter(id);
      Store.save();
      viewingLetterId = null;
      closeModal($('letterViewModal'));
      renderMailList();
      renderHomeApps();
      toast('已删除', 'ok');
    });
  });

  /** 寄出我的信，并安排梦角的回信 */
  function sendLetter() {
    var subject = $('letterSubject').value.trim();
    var body = $('letterBody').value.trim();
    if (!body) { toast('还没写内容呢', 'warn'); $('letterBody').focus(); return; }

    // 找上一封我写的信（用来算间隔）
    var prevTime = null;
    var letters = Store.getLetters();
    for (var i = letters.length - 1; i >= 0; i--) {
      if (letters[i].from === 'me') { prevTime = letters[i].time; break; }
    }

    var mine = Store.addLetter('me', subject, body, Store.state.settings.letterPaper);
    Store.save();
    goHome();

    // 梦角"正在读信"
    letterPending = true;
    toast('信已寄出 · 梦角正在读', 'ok');
    showTyping('梦角正在读你的信');
    renderMailList();

    setTimeout(function () {
      letterPending = false;
      hideTyping();

      var text = buildDreamLetter(body, prevTime);
      var reply = Store.addLetter('dream', pickOne(LETTER_SUBJECTS), text, Store.state.settings.letterPaper);
      reply.read = false;
      var notice = Store.addMessage('sys', '✉️ 梦角给你回了一封信，去「信箱」看看吧');
      Store.save();
      appendMessage(notice, true);
      renderHomeApps();
      renderMailList();
      toast('梦角回信了', 'ok');
    }, 3600 + Math.random() * 2200);
  }

  $('letterSendBtn').addEventListener('click', sendLetter);
  $('letterBody').addEventListener('input', function () {
    $('letterCount').textContent = this.value.trim().length + ' 字';
  });
  $('letterBody').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendLetter(); }
  });
  $('mailWriteBtn').addEventListener('click', function () {
    setView('write');
    openLetterCompose();
  });

  /* 让梦角主动写一封（由它决定） */
  $('mailAskBtn').addEventListener('click', function () {
    if (Math.random() < 0.6) {
      toast('梦角正在写信…', 'ok');
      setTimeout(function () {
        Store.addLetter('dream', pickOne(LETTER_SUBJECTS), buildDreamLetter());
        Store.save();
        renderMailList();
        renderHomeApps();
        toast('梦角写了一封给你', 'ok');
      }, 1600 + Math.random() * 1200);
    } else {
      var line = pickOne([
        '唔……我现在还没想好写什么，晚点再写给你。',
        '你是不是太想我了？先陪我说说话，我再动笔。',
        '笔尖停了很久，写不出来——你先欠着我一封吧。',
      ]);
      var msg = Store.addMessage('dream', line);
      Store.save();
      appendMessage(msg, true);
    }
  });

  /* ---- 朋友圈 ---- */
  var pendingPhotos = [];
  var MAX_PHOTOS = 9;
  var viewerList = [];
  var viewerIndex = 0;
  var momentFilterValue = 'all';
  var lastLongPress = 0;

  var MENTION_ACKS = ['叫我了？', '诶，在的。', '嗯？怎么啦。', '你这样叫我，我马上就来了。', '在的，说吧。'];

  function momentFilterDefs() {
    return [
      { id: 'all', name: '全部' },
      { id: 'me', name: '我' },
      { id: 'dream', name: Store.state.profile.name || '梦角' },
    ];
  }

  /** 动态里有没有 @ 梦角 */
  function hasMention(text) {
    var t = String(text || '');
    if (t.indexOf('@') === -1) return false;
    var name = Store.state.profile.name || '梦角';
    if (name && t.indexOf('@' + name) !== -1) return true;
    if (t.indexOf('@梦角') !== -1) return true;
    return /@\s*(?=$|[\s，。！？!?,.;])/.test(t);
  }

  /** 渲染正文，把 @名字 高亮出来 */
  function renderMomentBody(node, text) {
    var name = Store.state.profile.name || '梦角';
    var pattern = new RegExp('@(' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '|梦角)?', 'g');
    var last = 0, m;
    while ((m = pattern.exec(text)) !== null) {
      if (m.index > last) node.appendChild(document.createTextNode(text.slice(last, m.index)));
      node.appendChild(el('span', 'moment-mention', m[0]));
      last = m.index + m[0].length;
    }
    if (last < text.length) node.appendChild(document.createTextNode(text.slice(last)));
  }

  function renderMomentFilter() {
    var box = $('momentFilter');
    if (!box) return;
    box.innerHTML = '';
    momentFilterDefs().forEach(function (f) {
      var b = el('button', momentFilterValue === f.id ? 'active' : '', f.name);
      b.type = 'button';
      b.dataset.filter = f.id;
      b.title = f.name;
      b.addEventListener('click', function () {
        momentFilterValue = f.id;
        renderMomentFilter();
        renderMoments();
      });
      box.appendChild(b);
    });
  }

  function relTime(ts) {
    var d = Date.now() - ts;
    if (d < 60000) return '刚刚';
    if (d < 3600000) return Math.floor(d / 60000) + ' 分钟前';
    if (d < 86400000) return Math.floor(d / 3600000) + ' 小时前';
    if (d < 7 * 86400000) return Math.floor(d / 86400000) + ' 天前';
    var t = new Date(ts);
    return (t.getMonth() + 1) + '月' + t.getDate() + '日';
  }

  /** 时间轴分组 */
  function momentGroup(ts) {
    var now = new Date();
    var d = new Date(ts);
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var that = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (that === today) return '今天';
    if (that === today - 86400000) return '昨天';
    if (today - that < 7 * 86400000) return '本周';
    if (now.getFullYear() === d.getFullYear()) return (d.getMonth() + 1) + ' 月';
    return d.getFullYear() + ' 年';
  }

  function whoName(from) {
    return from === 'me' ? '我' : (Store.state.profile.name || '梦角');
  }

  function whoAvatar(from) {
    return from === 'me' ? '我' : (Store.state.profile.avatar || '🌙');
  }

  /** 压缩图片成 data URL（这样能跟着完整备份一起走） */
  function shrinkImage(file, maxSize, quality) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight;
        var scale = Math.min(1, maxSize / Math.max(w, h));
        var cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(w * scale));
        cv.height = Math.max(1, Math.round(h * scale));
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        try { resolve(cv.toDataURL('image/jpeg', quality)); }
        catch (e) { reject(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('图片读取失败')); };
      img.src = url;
    });
  }

  function draftBytes() {
    var n = 0;
    pendingPhotos.forEach(function (p) { n += p.length; });
    return n;
  }

  function renderMomentDraft() {
    var box = $('momentPhotoPreview');
    box.innerHTML = '';
    if (!pendingPhotos.length) {
      box.hidden = true;
      $('momentPhotoName').textContent = '';
      return;
    }
    box.hidden = false;
    $('momentPhotoName').textContent = pendingPhotos.length + ' 张 · ' +
      Math.round(draftBytes() / 1024) + ' KB';

    pendingPhotos.forEach(function (src, i) {
      var cell = el('div', 'moment-thumb');
      var img = el('img');
      img.src = src;
      img.alt = '待发表图片 ' + (i + 1);
      cell.appendChild(img);
      var del = el('button', 'moment-photo-del', '×');
      del.type = 'button';
      del.title = '移除这张';
      del.addEventListener('click', function () {
        pendingPhotos.splice(i, 1);
        renderMomentDraft();
      });
      cell.appendChild(del);
      box.appendChild(cell);
    });

    if (pendingPhotos.length < MAX_PHOTOS) {
      var add = el('button', 'moment-thumb-add', '＋');
      add.type = 'button';
      add.title = '再加一张';
      add.addEventListener('click', function () { $('momentPhotoFile').click(); });
      box.appendChild(add);
    }
  }

  function openMoments() {
    pendingPhotos = [];
    $('momentInput').value = '';
    renderMomentDraft();
    renderMomentFilter();
    renderMomentRate();
    if (Store.markMomentsSeen()) Store.save();
    renderMoments();
  }

  $('momentsBack').addEventListener('click', goHome);

  function renderMoments() {
    var box = $('momentList');
    if (!box) return;
    box.innerHTML = '';

    var all = Store.getMoments().slice().sort(function (a, b) { return b.time - a.time; });
    var list = momentFilterValue === 'all'
      ? all
      : all.filter(function (m) { return m.from === momentFilterValue; });
    $('momentCount').textContent = momentFilterValue === 'all'
      ? ('共 ' + all.length + ' 条')
      : ('共 ' + all.length + ' 条 · 筛选出 ' + list.length + ' 条');

    if (!list.length) {
      box.appendChild(el('div', 'moment-empty',
        all.length ? '这个筛选下没有动态。' : '还没有动态。\n发一条，或者让梦角发一条。'));
      return;
    }

    var lastGroup = null;
    list.forEach(function (m) {
      var g = momentGroup(m.time);
      if (g !== lastGroup) {
        box.appendChild(el('div', 'moment-group', g));
        lastGroup = g;
      }
      box.appendChild(momentItemEl(m));
    });
  }

  function momentItemEl(m) {
    var item = el('div', 'moment-item' + (m.from === 'me' ? ' mine' : ''));

    var head = el('div', 'moment-head');
    head.appendChild(el('span', 'moment-avatar', whoAvatar(m.from)));
    var who = el('div', 'moment-who');
    who.appendChild(el('div', 'moment-name', whoName(m.from)));
    head.appendChild(who);
    head.appendChild(el('span', 'moment-time', relTime(m.time)));
    item.appendChild(head);

    if (m.text) {
      var txt = el('div', 'moment-text');
      renderMomentBody(txt, m.text);
      item.appendChild(txt);
    }

    if (m.photos && m.photos.length) {
      var grid = el('div', 'moment-photos');
      grid.dataset.count = String(Math.min(9, m.photos.length));
      m.photos.forEach(function (src, i) {
        var pic = el('img');
        pic.src = src;
        pic.alt = '图片 ' + (i + 1);
        pic.addEventListener('click', function () {
          if (Date.now() - lastLongPress < 700) return;
          openPhotoView(m.photos, i);
        });
        bindPhotoLongPress(pic, src, i);
        grid.appendChild(pic);
      });
      item.appendChild(grid);
    }

    // 点赞栏
    var bar = el('div', 'moment-like');
    var liked = m.likes.indexOf('me') !== -1;
    var likeBtn = el('button', 'moment-like-btn' + (liked ? ' liked' : ''));
    likeBtn.type = 'button';
    likeBtn.textContent = liked ? '❤️ 已赞' : '🤍 赞';
    likeBtn.addEventListener('click', function () {
      Store.toggleLike(m.id, 'me');
      Store.save();
      renderMoments();
    });
    bar.appendChild(likeBtn);

    bar.appendChild(el('span', 'moment-likers',
      m.likes.length ? ('❤️ ' + m.likes.map(whoName).join('、') + ' 觉得不错') : ''));

    var del = el('button', 'moment-like-btn');
    del.type = 'button';
    del.textContent = '删除';
    del.addEventListener('click', function () {
      confirmDialog('删除这条动态？', '删掉就找不回来了。', '删除').then(function (ok) {
        if (!ok) return;
        Store.removeMoment(m.id);
        Store.save();
        renderMoments();
        renderHomeApps();
        toast('已删除', 'ok');
      });
    });
    bar.appendChild(del);
    item.appendChild(bar);

    // 评论
    if (m.comments.length) {
      var cm = el('div', 'moment-comments');
      m.comments.forEach(function (c) {
        var line = el('div', 'moment-comment');
        line.appendChild(el('b', null, whoName(c.from) + '：'));
        if (c.replyTo) {
          line.appendChild(el('span', 'reply-tag', '回复 ' + whoName(c.replyTo) + ' '));
        }
        var text = String(c.text || '');
        if (isFaceOnly(text)) line.appendChild(el('span', 'face-text', text));
        else line.appendChild(document.createTextNode(text));
        cm.appendChild(line);
      });
      item.appendChild(cm);
    }

    // 评论输入
    var reply = el('div', 'moment-reply');
    var input = el('input');
    input.type = 'text';
    input.maxLength = 80;
    input.placeholder = '说点什么…';
    var send = el('button', 'btn btn-ghost btn-sm', '评论');
    send.type = 'button';

    function submitComment() {
      var v = input.value.trim();
      if (!v) return;
      Store.addComment(m.id, 'me', v);
      Store.save();
      input.value = '';
      renderMoments();
      reactToComment(m.id, v);
    }
    send.addEventListener('click', submitComment);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submitComment(); }
    });
    reply.appendChild(input);
    reply.appendChild(send);
    item.appendChild(reply);

    return item;
  }

  /* ---- 图片放大（支持左右翻页） ---- */
  function openPhotoView(list, index) {
    viewerList = list || [];
    viewerIndex = index || 0;
    renderPhotoView();
    $('photoView').hidden = false;
  }

  function renderPhotoView() {
    var box = $('photoView');
    if (!viewerList.length) return;
    if (viewerIndex < 0) viewerIndex = viewerList.length - 1;
    if (viewerIndex > viewerList.length - 1) viewerIndex = 0;
    $('photoViewImg').src = viewerList[viewerIndex];
    var multi = viewerList.length > 1;
    $('photoPrev').hidden = !multi;
    $('photoNext').hidden = !multi;
    $('photoCounter').hidden = !multi;
    $('photoCounter').textContent = (viewerIndex + 1) + ' / ' + viewerList.length;
  }

  function closePhotoView() { $('photoView').hidden = true; viewerList = []; }

  /** 内联 SVG -> <img> 能用的 data URL（补上固有尺寸，放大看时不至于只有 120px） */
  function svgDataUrl(svg) {
    var s = String(svg || '');
    if (s && !/\swidth=/.test(s)) s = s.replace('<svg ', '<svg width="600" height="600" ');
    if (typeof TextEncoder === 'undefined' || typeof btoa === 'undefined') {
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    }
    var bytes = new TextEncoder().encode(s);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return 'data:image/svg+xml;base64,' + btoa(bin);
  }

  /**
   * 表情包引用 -> 能存下来的图片地址。
   * 内置的是内联 SVG，转成 data URL；自己导入的是 blob: 临时地址，读回 data URL 再存。
   */
  function stickerPhotoUrl(ref) {
    ref = String(ref || '');
    if (ref.indexOf('builtin:') === 0) {
      return Promise.resolve(svgDataUrl(STICKERS.svg(ref.slice(8))));
    }
    if (ref.indexOf('img:') !== 0) return Promise.resolve('');

    var url = stickerURLs[ref.slice(4)];
    if (!url) return Promise.resolve('');
    if (url.indexOf('data:') === 0) return Promise.resolve(url);

    return fetch(url).then(function (r) { return r.blob(); }).then(function (blob) {
      return new Promise(function (resolve) {
        var fr = new FileReader();
        fr.onload = function () { resolve(String(fr.result || '')); };
        fr.onerror = function () { resolve(''); };
        fr.readAsDataURL(blob);
      });
    }).catch(function () { return ''; });
  }

  /** 纯表情 / 颜文字：没有汉字也不长，显示得大一点 */
  function isFaceOnly(text) {
    var s = String(text || '').trim();
    return !!s && s.length <= 12 && !/[\u4e00-\u9fa5]/.test(s);
  }

  /**
   * 梦角在朋友圈要发 / 要说的内容：字卡、黄脸、颜文字，allowSticker 时还有表情包。
   * 比例沿用「梦角频率 → 表情频率」，和聊天里保持一致。
   * 返回 { kind: 'card' | 'emoji' | 'kao' | 'sticker', text?, ref? }，什么都没得挑时返回 null
   */
  function pickDreamContent(allowSticker) {
    var cards = Store.allCards();
    var pools = [];
    var emoji = EMOJI_LIST.concat(Store.state.extra.face);
    var kao = KAOMOJI_LIST.concat(Store.state.extra.kao);
    var stickers = allowSticker ? allStickerRefs() : [];

    if (emoji.length) pools.push({ kind: 'emoji', w: 30, list: emoji });
    if (kao.length) pools.push({ kind: 'kao', w: 30, list: kao });
    if (stickers.length) pools.push({ kind: 'sticker', w: 40, list: stickers });

    if (!cards.length && !pools.length) return null;

    var p = EXPR_RATE[Store.state.settings.exprRate];
    if (typeof p !== 'number') p = EXPR_RATE.less;
    if (!cards.length) p = 1;          // 没有字卡就全用表情
    if (!pools.length) p = 0;          // 没有表情就全用字卡

    if (pools.length && Math.random() < p) {
      var total = 0;
      pools.forEach(function (x) { total += x.w; });
      var r = Math.random() * total;
      var chosen = pools[pools.length - 1];
      for (var i = 0; i < pools.length; i++) {
        r -= pools[i].w;
        if (r <= 0) { chosen = pools[i]; break; }
      }
      var val = chosen.list[Math.floor(Math.random() * chosen.list.length)];
      if (chosen.kind === 'sticker') return { kind: 'sticker', ref: val };
      return { kind: chosen.kind, text: val };
    }

    var card = drawCard();
    return { kind: 'card', text: card ? card.text : '嗯，我看到了。' };
  }

  /** 评论 / 回复评论：一句话，纯文字，所以不含表情包 */
  function pickCommentBody() {
    var pick = pickDreamContent(false);
    return pick ? pick.text : '嗯，我看到了。';
  }

  /** 你在某条动态下评论 / 发动态后，梦角的反应 */
  function reactToComment(momentId, myText) {
    var mentioned = hasMention(myText);
    if (!mentioned && Math.random() >= 0.55) return;
    var delay = mentioned ? (700 + Math.random() * 800) : (1800 + Math.random() * 1800);
    setTimeout(function () {
      var target = Store.getMoment(momentId);
      if (!target) return;
      var body = pickCommentBody();
      if (mentioned) body = pickOne(MENTION_ACKS) + ' ' + body;
      Store.addComment(momentId, 'dream', body, 'me');
      Store.save();
      renderMoments();
      toast(mentioned ? '梦角被 @ 到了，马上回复了' : '梦角回复了你的评论', 'ok');
    }, delay);
  }

  /** 长按图片保存 */
  function bindPhotoLongPress(node, dataUrl, index) {
    var timer = null;
    node.addEventListener('pointerdown', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;
        lastLongPress = Date.now();
        savePhoto(dataUrl, index);
      }, 620);
    });
    ['pointermove', 'pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
      node.addEventListener(ev, function () { clearTimeout(timer); });
    });
    node.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      lastLongPress = Date.now();
      savePhoto(dataUrl, index);
    });
  }

  function savePhoto(dataUrl, index) {
    var parts = String(dataUrl || '').split(',');
    if (parts.length < 2) { toast('图片数据不完整', 'warn'); return; }
    var mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
    var ext = mime.indexOf('svg') !== -1 ? 'svg' : (mime.indexOf('png') !== -1 ? 'png' : 'jpg');
    try {
      var blob = base64ToBlob(parts[1], mime);
      downloadBlob(blob, '朋友圈-' + letterTimeLabel(Date.now()).replace(/\./g, '') +
        '-' + ((index || 0) + 1) + '.' + ext);
      toast('图片已保存', 'ok');
    } catch (e) {
      toast('保存失败', 'warn');
    }
  }

  function postMoment() {
    var text = $('momentInput').value.trim();
    if (!text && !pendingPhotos.length) { toast('写点什么，或者加张图片', 'warn'); $('momentInput').focus(); return; }

    var mentioned = hasMention(text);
    var m = Store.addMoment('me', text, pendingPhotos.slice());
    if (!Store.save()) {
      Store.removeMoment(m.id);
      toast('存储空间不足，试试少放几张图片', 'warn');
      return;
    }

    $('momentInput').value = '';
    pendingPhotos = [];
    renderMomentDraft();
    renderMoments();
    toast(mentioned ? '已发表 · 你 @ 了梦角' : '已发表', 'ok');

    // 梦角点赞 + 评论
    setTimeout(function () {
      var target = Store.getMoment(m.id);
      if (!target) return;
      if (target.likes.indexOf('dream') === -1) Store.toggleLike(m.id, 'dream');
      var body = pickCommentBody();
      if (mentioned) body = pickOne(MENTION_ACKS) + ' ' + body;
      Store.addComment(m.id, 'dream', body);
      Store.save();
      renderMoments();
      renderHomeApps();
      toast(mentioned ? '梦角被 @ 到了，马上回应了' : '梦角赞了你', 'ok');
    }, mentioned ? (900 + Math.random() * 900) : (2200 + Math.random() * 2200));
  }

  $('momentPhotoBtn').addEventListener('click', function () { $('momentPhotoFile').click(); });

  $('momentPhotoFile').addEventListener('change', function (e) {
    var files = [].slice.call(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    var room = MAX_PHOTOS - pendingPhotos.length;
    if (room <= 0) { toast('最多 ' + MAX_PHOTOS + ' 张', 'warn'); return; }
    files = files.slice(0, room);

    toast('正在处理 ' + files.length + ' 张图片…', 'ok');
    var chain = Promise.resolve();
    var failed = 0;

    files.forEach(function (file) {
      chain = chain.then(function () {
        if (!/^image\//.test(file.type)) { failed++; return; }
        if (file.size > 8 * 1024 * 1024) { failed++; return; }
        return shrinkImage(file, 640, 0.68).then(function (dataUrl) {
          if (dataUrl.length > 220 * 1024) { failed++; return; }
          pendingPhotos.push(dataUrl);
        }).catch(function () { failed++; });
      });
    });

    chain.then(function () {
      renderMomentDraft();
      if (failed) toast(failed + ' 张图片没能加入（太大或格式不支持）', 'warn');
    });
  });

  $('momentPostBtn').addEventListener('click', postMoment);
  $('momentInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); postMoment(); }
  });

  /* ---------------- 梦角主动发朋友圈 ---------------- */

  var MOMENT_INTERVAL = {
    less:  [20 * 60000, 55 * 60000],   // 20 ~ 55 分钟
    often: [8 * 60000,  25 * 60000],   //  8 ~ 25 分钟
    half:  [3 * 60000,  10 * 60000],   //  3 ~ 10 分钟
  };
  var MOMENT_RATE_TEXT = {
    off: '不会主动发',
    less: '20～55 分钟一条',
    often: '8～25 分钟一条',
    half: '3～10 分钟一条',
  };
  var momentTimer = null;

  /** 真的发一条梦角的动态 */
  function postDreamMoment(text, photos, silent) {
    if (!text && !photos.length) return null;
    var m = Store.addMoment('dream', text, photos);
    if (!m) return null;
    if (!Store.save()) { Store.removeMoment(m.id); return null; }   // 存不下就撤掉，别留幻觉
    renderMoments();
    renderHomeApps();          // 更新主页「朋友圈」图标上的未读角标
    if (!silent) toast('梦角发了一条动态', 'ok');
    return m;
  }

  /** 梦角发一条动态：正文或配图从 字卡 / 黄脸 / 颜文字 / 表情包 里挑 */
  function dreamPostsMoment(silent) {
    var pick = pickDreamContent(true);
    if (!pick) return Promise.resolve(null);

    if (pick.kind !== 'sticker') {
      return Promise.resolve(postDreamMoment(pick.text || '', [], silent));
    }
    return stickerPhotoUrl(pick.ref).then(function (url) {
      return postDreamMoment('', url ? [url] : [], silent);
    });
  }

  function scheduleDreamMoment(delay) {
    clearTimeout(momentTimer);
    var rate = Store.state.settings.momentRate;
    if (rate === 'off') return;
    var range = MOMENT_INTERVAL[rate] || MOMENT_INTERVAL.less;

    momentTimer = setTimeout(function () {
      if (Store.state.settings.momentRate === 'off') return;
      if (document.hidden) {
        scheduleDreamMoment(60000);
        return;
      }
      dreamPostsMoment();
      scheduleDreamMoment();
    }, delay || (range[0] + Math.random() * (range[1] - range[0])));
  }

  function renderMomentRate() {
    var rate = Store.state.settings.momentRate;
    var hint = $('momentRateHint');
    if (hint) hint.textContent = MOMENT_RATE_TEXT[rate] || '';
    var seg = $('momentRateSeg');
    if (!seg) return;
    [].slice.call(seg.querySelectorAll('button')).forEach(function (b) {
      b.classList.toggle('active', b.dataset.rate === rate);
    });
  }

  $('momentRateSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-rate]');
    if (!b) return;
    Store.updateSettings({ momentRate: b.dataset.rate });
    Store.save();
    renderMomentRate();
    scheduleDreamMoment();
    toast(b.dataset.rate === 'off'
      ? '梦角不会再主动发动态了'
      : '梦角发动态：' + MOMENT_RATE_TEXT[b.dataset.rate], 'ok');
  });

  /* 让梦角发一条（由它决定） */
  $('momentAskBtn').addEventListener('click', function () {
    if (Math.random() < 0.6) {
      dreamPostsMoment().then(function (m) {
        if (!m) toast('梦角想不出发什么，再等等吧', 'warn');
      });
    } else {
      toast('梦角说它现在没什么想发的', 'warn');
    }
  });

  function openAboutModal() {
    var s = Store.state;
    var lines = [
      '字卡传讯 · 与梦角对话',
      '',
      '字卡 ' + Store.countCards() + ' 张 · 聊天 ' + s.messages.length + ' 条',
      '自己添加的表情 ' + (s.extra.face.length + s.extra.kao.length) + ' 个 · 表情包 ' + customStickers.length + ' 个',
      '',
      '双击梦角头像可以拍拍它。',
      '长按主页图标可以排序或收起。',
      '所有数据都保存在你自己的浏览器里。',
    ];
    confirmDialog('关于', lines.join('\n'), '知道了');
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function updateHomeClock() {
    var d = new Date();
    var clock = $('homeClock');
    if (clock) clock.textContent = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    var date = $('homeDate');
    if (date) {
      var wk = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][d.getDay()];
      date.textContent = (d.getMonth() + 1) + '月' + d.getDate() + '日  ' + wk;
    }
  }

  function updateHomeGreeting() {
    var h = new Date().getHours();
    var lines = HOME_GREETINGS[2].lines;
    for (var i = 0; i < HOME_GREETINGS.length; i++) {
      var g = HOME_GREETINGS[i];
      if (g.from < g.to) {
        if (h >= g.from && h < g.to) { lines = g.lines; break; }
      } else if (h >= g.from || h < g.to) { lines = g.lines; break; }
    }
    var n = Store.state.profile.name || '梦角';
    var nameEl = $('homeName');
    if (nameEl) nameEl.textContent = n;
    paintAvatar($('homeAvatar'), 'avatar-md');
    var el2 = $('homeGreet');
    if (el2) el2.textContent = lines[Math.floor(Math.random() * lines.length)];
  }

  /* 进入应用：隐藏主页，执行该图标对应的动作 */
  function enterApp(app) {
    var page = app && app.page;
    if (page) {
      setView(page);
      if (app && app.run) app.run();
      return;
    }
    setView('chat');
    if (app && app.run) setTimeout(function () { app.run(); }, 60);
    setTimeout(function () {
      window.scrollTo(0, 0);
      scrollToBottom(true);
    }, 120);
  }

  /* 回到主页 */
  function goHome() {
    setView('home');
    document.querySelectorAll('.modal:not([hidden])').forEach(function (m) { closeModal(m); });
    closeCallMenu();
    closeEmojiPanel();
    closePhotoView();
    updateHomeClock();
    updateHomeGreeting();
    renderHomeApps();
    renderHomeAnni();
  }

  $('homeBtn').addEventListener('click', goHome);

  /* 主页装饰星点 */
  (function buildHomeStars() {
    var box = $('homeStars');
    if (!box) return;
    for (var i = 0; i < 16; i++) {
      var d = document.createElement('span');
      var size = 2 + Math.random() * 3.5;
      d.style.left = (Math.random() * 100) + '%';
      d.style.top = (10 + Math.random() * 80) + '%';
      d.style.width = size + 'px';
      d.style.height = size + 'px';
      d.style.animationDuration = (5 + Math.random() * 6).toFixed(1) + 's';
      d.style.animationDelay = (-Math.random() * 8).toFixed(1) + 's';
      box.appendChild(d);
    }
  })();

  /* ---------------- 启动 ---------------- */

  function restoreCustomMusic() {
    MediaStore.get().then(function (rec) {
      if (rec && rec.blob) {
        Music.loadCustom(rec.blob, rec.name);
        syncMenuUI();
      }
    }).catch(function () { /* 没有就用内置生成音乐 */ });
  }

  function init() {
    Store.load();
    setView('home');
    renderProfile();
    renderCards();
    renderMessages();
    autoGrow();
    applyI18n();
    syncMenuUI();
    restoreCustomMusic();
    scheduleAutoCall();
    scheduleDreamMoment();

    renderPane('face');
    renderPane('kao');
    loadStickers().then(function () {
      renderMessages();
      renderPane('sticker');
      renderHomeApps();
    });

    // 主页
    renderHomeApps();
    renderHomeAnni();
    updateHomeClock();
    updateHomeGreeting();
    restoreWallpaper();
    setInterval(updateHomeClock, 10000);
  }

  init();
})();
