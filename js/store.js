/* =========================================================
   store.js —— 数据层
   · 负责字卡、消息、梦角资料的增删改查
   · 通过 localStorage 持久化（保存在你自己的浏览器里）
   · 对外暴露 window.Store
   ========================================================= */

(function () {
  'use strict';

  var STORAGE_KEY = 'dreamCardChat.v1';

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function str(v, fallback) {
    return typeof v === 'string' ? v : (fallback === undefined ? '' : fallback);
  }

  function normTags(raw) {
    var list = [];
    if (Array.isArray(raw)) list = raw;
    else if (typeof raw === 'string') list = raw.split(/[\s,，、|/]+/);
    var out = [];
    list.forEach(function (t) {
      t = String(t == null ? '' : t).trim();
      if (!t || out.indexOf(t) !== -1) return;
      if (out.length >= 8) return;
      out.push(t);
    });
    return out;
  }

  /** 拍一拍内容：一行一条，最多 40 条、每条 40 字，自动去重 */
  function normPatSuffixes(raw) {
    var list = Array.isArray(raw) ? raw : (typeof raw === 'string' && raw.trim() ? [raw] : []);
    var out = [];
    list.forEach(function (x) {
      if (typeof x !== 'string') return;
      x = x.trim().slice(0, 40);
      if (!x || out.indexOf(x) !== -1 || out.length >= 40) return;
      out.push(x);
    });
    return out;
  }

  /** 取某一侧的拍一拍内容：新字段 → 上一版的共用列表 → 最老的单条 → 默认 */
  function patSidePat(p, key, dp) {
    if (p[key] !== undefined) return normPatSuffixes(p[key]);
    if (p.patSuffixes !== undefined) return normPatSuffixes(p.patSuffixes);
    if (typeof p.patSuffix === 'string') return normPatSuffixes(p.patSuffix);
    if (dp[key] !== undefined) return normPatSuffixes(dp[key]);
    return normPatSuffixes(dp.patSuffixes !== undefined ? dp.patSuffixes : dp.patSuffix);
  }

  function makeCard(raw) {
    raw = raw || {};
    var tags = normTags(raw.tags !== undefined ? raw.tags : raw.tag);
    return {
      id: str(raw.id) || uid(),
      text: str(raw.text).trim(),
      tags: tags,
      createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    };
  }

  function makeMessage(raw) {
    raw = raw || {};
    var role = (raw.role === 'dream' || raw.role === 'call' || raw.role === 'pat' || raw.role === 'sys')
      ? raw.role : 'user';
    return {
      id: str(raw.id) || uid(),
      role: role,
      text: str(raw.text),
      tag: str(raw.tag),
      sticker: str(raw.sticker),
      kind: str(raw.kind),
      time: typeof raw.time === 'number' ? raw.time : Date.now(),
    };
  }

  var state = {
    profile: { name: '', avatar: '', avatarImage: '', sign: '', patSuffix: '', patMine: [], patTheirs: [] },
    settings: {
      autoCall: true,
      subtitleLang: 'zh-Hans',
      handsfree: false,
      music: true,
      musicSource: 'builtin',
      musicTimbre: 'noise',
      musicVolume: 0.7,
      // 梦角回复时用表情的概率：off / less / often / half
      exprRate: 'less',
      // 梦角主动拍你的频率：off / less / often / half
      patRate: 'less',
      // 梦角主动发朋友圈的频率：off / less / often / half
      momentRate: 'less',
      // 梦角回你消息的概率：rare / half / often / always
      replyRate: 'always',
      // 梦角主动来电的间隔：rare / normal / often / custom
      callRate: 'normal',
      // 自定义来电间隔（最短 / 最长，分钟）
      callMinMinutes: 5,
      callMaxMinutes: 12,
      // 梦角回复前的间隔（"打字"时间）：fast / normal / slow / custom
      replyDelay: 'normal',
      // 自定义回复间隔（秒）
      replyDelaySec: 1,
      // 按当前时段优先抽卡
      timeAware: true,
      // 主页壁纸
      wallpaper: 'dream',
      // 信纸样式
      letterPaper: 'plain',
      // 字卡库视图：列表 / 按标签分组
      cardsGrouped: false,
      // 折叠起来的分组
      collapsedGroups: [],
      // 主页应用顺序（存 id）
      appOrder: [],
      // 主页隐藏的应用
      hiddenApps: [],
      // 梦角状态：auto（由梦角自己决定）/ online（在线）/ busy（在忙）/ offline（离线）
      dreamStatus: 'auto',
    },
    // 用户自己往「黄脸 / 颜文字」里加的表情
    extra: { face: [], kao: [] },
    // 纪念日：{ id, name, date: 'YYYY-MM-DD', repeat }
    anniversaries: [],
    // 信件：{ id, from: 'me'|'dream', title, body, time, read }
    letters: [],
    // 朋友圈：{ id, from, text, photo, time, likes:[], comments:[], seen }
    moments: [],
    cards: [],
    messages: [],
  };

  var Store = {
    state: state,
    uid: uid,

    /* ---------------- 读写 localStorage ---------------- */

    load: function () {
      var saved = null;
      try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      } catch (e) {
        saved = null;
      }
      if (!saved || typeof saved !== 'object') saved = {};

      var dp = window.DEFAULT_PROFILE || {};
      var p = saved.profile || {};

      state.profile = {
        name: typeof p.name === 'string' ? p.name : str(dp.name, ''),
        avatar: typeof p.avatar === 'string' && p.avatar ? p.avatar : str(dp.avatar, '🌙'),
        avatarImage: typeof p.avatarImage === 'string' ? p.avatarImage : '',
        sign: typeof p.sign === 'string' ? p.sign : str(dp.sign, ''),
        patSuffix: typeof p.patSuffix === 'string' ? p.patSuffix : str(dp.patSuffix, '的肩膀'),
        // 我和梦角各自一份拍一拍内容；老数据（共用一份 / 单条）自动升级过来
        patMine: patSidePat(p, 'patMine', dp),
        patTheirs: patSidePat(p, 'patTheirs', dp),
      };

      var s = saved.settings || {};
      state.settings = {
        autoCall: typeof s.autoCall === 'boolean' ? s.autoCall : true,
        subtitleLang: (s.subtitleLang === 'zh-Hant' || s.subtitleLang === 'en') ? s.subtitleLang : 'zh-Hans',
        handsfree: typeof s.handsfree === 'boolean' ? s.handsfree : false,
        music: typeof s.music === 'boolean' ? s.music : true,
        musicSource: s.musicSource === 'custom' ? 'custom' : 'builtin',
        musicTimbre: ['noise', 'rain', 'wind', 'pad'].indexOf(s.musicTimbre) !== -1 ? s.musicTimbre : 'noise',
        musicVolume: typeof s.musicVolume === 'number'
          ? Math.min(1, Math.max(0, s.musicVolume)) : 0.7,
        exprRate: ['off', 'less', 'often', 'half'].indexOf(s.exprRate) !== -1 ? s.exprRate : 'less',
        patRate: ['off', 'less', 'often', 'half'].indexOf(s.patRate) !== -1 ? s.patRate : 'less',
        momentRate: ['off', 'less', 'often', 'half'].indexOf(s.momentRate) !== -1 ? s.momentRate : 'less',
        replyRate: ['rare', 'half', 'often', 'always'].indexOf(s.replyRate) !== -1 ? s.replyRate : 'always',
        callRate: ['rare', 'normal', 'often', 'custom'].indexOf(s.callRate) !== -1 ? s.callRate : 'normal',
        callMinMinutes: typeof s.callMinMinutes === 'number'
          ? Math.min(720, Math.max(0.5, s.callMinMinutes)) : 5,
        callMaxMinutes: typeof s.callMaxMinutes === 'number'
          ? Math.min(720, Math.max(0.5, s.callMaxMinutes)) : 12,
        replyDelay: ['fast', 'normal', 'slow', 'custom'].indexOf(s.replyDelay) !== -1 ? s.replyDelay : 'normal',
        replyDelaySec: typeof s.replyDelaySec === 'number'
          ? Math.min(10, Math.max(0.1, s.replyDelaySec)) : 1,
        timeAware: typeof s.timeAware === 'boolean' ? s.timeAware : true,
        wallpaper: typeof s.wallpaper === 'string' && s.wallpaper ? s.wallpaper : 'dream',
        letterPaper: ['plain', 'ruled', 'kraft', 'sakura', 'night'].indexOf(s.letterPaper) !== -1 ? s.letterPaper : 'plain',
        cardsGrouped: !!s.cardsGrouped,
        collapsedGroups: Array.isArray(s.collapsedGroups)
          ? s.collapsedGroups.filter(function (x) { return typeof x === 'string'; }) : [],
        appOrder: Array.isArray(s.appOrder) ? s.appOrder.filter(function (x) { return typeof x === 'string'; }) : [],
        hiddenApps: Array.isArray(s.hiddenApps) ? s.hiddenApps.filter(function (x) { return typeof x === 'string'; }) : [],
        dreamStatus: ['online', 'busy', 'offline'].indexOf(s.dreamStatus) !== -1 ? s.dreamStatus : 'auto',
      };

      var ex = saved.extra || {};
      function cleanList(v) {
        return Array.isArray(v)
          ? v.filter(function (x) { return typeof x === 'string' && x.trim(); }).slice(0, 500)
          : [];
      }
      state.extra = { face: cleanList(ex.face), kao: cleanList(ex.kao) };

      state.anniversaries = (Array.isArray(saved.anniversaries) ? saved.anniversaries : [])
        .map(function (a) {
          a = a || {};
          return {
            id: str(a.id) || uid(),
            name: str(a.name).trim(),
            date: str(a.date),
            repeat: !!a.repeat,
          };
        })
        .filter(function (a) { return a.name && /^\d{4}-\d{2}-\d{2}$/.test(a.date); });

      state.letters = (Array.isArray(saved.letters) ? saved.letters : [])
        .map(function (l) {
          l = l || {};
          return {
            id: str(l.id) || uid(),
            from: l.from === 'dream' ? 'dream' : 'me',
            title: str(l.title),
            body: str(l.body),
            paper: str(l.paper),
            time: typeof l.time === 'number' ? l.time : Date.now(),
            read: l.read !== false,
          };
        })
        .filter(function (l) { return l.body; });

      state.moments = (Array.isArray(saved.moments) ? saved.moments : [])
        .map(function (m) {
          m = m || {};
          var photos = Array.isArray(m.photos)
            ? m.photos.filter(function (p) { return typeof p === 'string' && p; })
            : (typeof m.photo === 'string' && m.photo ? [m.photo] : []);
          return {
            id: str(m.id) || uid(),
            from: m.from === 'dream' ? 'dream' : 'me',
            text: str(m.text),
            photos: photos.slice(0, 9),
            time: typeof m.time === 'number' ? m.time : Date.now(),
            likes: Array.isArray(m.likes) ? m.likes.filter(function (x) { return x === 'me' || x === 'dream'; }) : [],
            comments: Array.isArray(m.comments) ? m.comments.map(function (c) {
              c = c || {};
              return {
                id: str(c.id) || uid(),
                from: c.from === 'dream' ? 'dream' : 'me',
                text: str(c.text),
                replyTo: c.replyTo === 'me' ? 'me' : '',
                time: typeof c.time === 'number' ? c.time : Date.now(),
              };
            }).filter(function (c) { return c.text; }) : [],
            seen: m.seen !== false,
          };
        })
        .filter(function (m) { return m.text || m.photos.length; });

      // 没有任何存档时才写入示例字卡；空数组（用户清空过）会原样保留
      var cards = Array.isArray(saved.cards) ? saved.cards : (window.DEFAULT_CARDS || []);
      state.cards = cards.map(makeCard).filter(function (c) { return c.text; });

      state.messages = (Array.isArray(saved.messages) ? saved.messages : [])
        .map(makeMessage)
        .filter(function (m) { return m.text || m.sticker; });

      return state;
    },

    save: function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
      } catch (e) {
        console.warn('[字卡传讯] 保存失败：', e);
        return false;
      }
    },

    /* ---------------- 字卡 ---------------- */

    allCards: function () {
      return state.cards;
    },

    countCards: function () {
      return state.cards.length;
    },

    getCard: function (id) {
      for (var i = 0; i < state.cards.length; i++) {
        if (state.cards[i].id === id) return state.cards[i];
      }
      return null;
    },

    addCard: function (text, tags) {
      var card = makeCard({ text: text, tags: tags });
      if (!card.text) return null;
      state.cards.unshift(card);
      return card;
    },

    addMany: function (list) {
      var added = 0;
      for (var i = 0; i < list.length; i++) {
        var c = makeCard(list[i]);
        if (!c.text) continue;
        state.cards.unshift(c);
        added++;
      }
      return added;
    },

    updateCard: function (id, patch) {
      var card = this.getCard(id);
      if (!card) return null;
      if (typeof patch.text === 'string') card.text = patch.text.trim();
      if (patch.tags !== undefined || typeof patch.tag === 'string') {
        card.tags = normTags(patch.tags !== undefined ? patch.tags : patch.tag);
      }
      if (!card.text) {
        this.removeCard(id);
        return null;
      }
      return card;
    },

    /** 给某张卡加上一个标签（已有则不重复） */
    addTagToCard: function (id, tag) {
      var card = this.getCard(id);
      tag = String(tag == null ? '' : tag).trim();
      if (!card || !tag) return false;
      if (card.tags.indexOf(tag) !== -1) return false;
      card.tags = normTags(card.tags.concat([tag]));
      return true;
    },

    clearCardTags: function (id) {
      var card = this.getCard(id);
      if (!card || !card.tags.length) return false;
      card.tags = [];
      return true;
    },

    /** 把旧标签改成新标签（所有卡片） */
    renameTag: function (oldTag, newTag) {
      newTag = String(newTag == null ? '' : newTag).trim();
      var n = 0;
      state.cards.forEach(function (c) {
        var i = c.tags.indexOf(oldTag);
        if (i === -1) return;
        if (!newTag) c.tags.splice(i, 1);
        else if (c.tags.indexOf(newTag) === -1) c.tags[i] = newTag;
        else c.tags.splice(i, 1);
        n++;
      });
      return n;
    },

    /** 这一组下的卡片 */
    cardsWithTag: function (tag) {
      return state.cards.filter(function (c) { return c.tags.indexOf(tag) !== -1; });
    },

    removeCard: function (id) {
      var before = state.cards.length;
      state.cards = state.cards.filter(function (c) { return c.id !== id; });
      return state.cards.length !== before;
    },

    clearCards: function () {
      state.cards = [];
    },

    /** 按关键词过滤（内容 / 任意标签） */
    searchCards: function (query) {
      var q = str(query).trim().toLowerCase();
      if (!q) return state.cards;
      return state.cards.filter(function (c) {
        if (c.text.toLowerCase().indexOf(q) !== -1) return true;
        for (var i = 0; i < c.tags.length; i++) {
          if (c.tags[i].toLowerCase().indexOf(q) !== -1) return true;
        }
        return false;
      });
    },

    /** 所有出现过的标签，用于输入联想 */
    allTags: function () {
      var seen = {};
      var out = [];
      state.cards.forEach(function (c) {
        c.tags.forEach(function (t) {
          if (t && !seen[t]) { seen[t] = 1; out.push(t); }
        });
      });
      return out;
    },

    /** 纯随机抽一张字卡；字卡库为空时返回 null */
    randomCard: function () {
      if (!state.cards.length) return null;
      var i = Math.floor(Math.random() * state.cards.length);
      return state.cards[i];
    },

    /* ---------------- 消息 ---------------- */

    addMessage: function (role, text, tag, kind) {
      var msg = makeMessage({ role: role, text: text, tag: tag, kind: kind, time: Date.now() });
      state.messages.push(msg);
      return msg;
    },

    /** 表情包消息：sticker 形如 'builtin:smile' 或 'img:<id>' */
    addSticker: function (role, sticker) {
      var msg = makeMessage({ role: role, sticker: sticker, time: Date.now() });
      state.messages.push(msg);
      return msg;
    },

    getMessage: function (id) {
      for (var i = 0; i < state.messages.length; i++) {
        if (state.messages[i].id === id) return state.messages[i];
      }
      return null;
    },

    clearMessages: function () {
      state.messages = [];
    },

    /* ---------------- 资料 ---------------- */

    updateProfile: function (patch) {
      ['name', 'avatar', 'avatarImage', 'sign', 'patSuffix'].forEach(function (k) {
        if (typeof patch[k] === 'string') state.profile[k] = patch[k];
      });
      ['patMine', 'patTheirs'].forEach(function (k) {
        if (Array.isArray(patch[k])) state.profile[k] = normPatSuffixes(patch[k]);
      });
    },

    /* ---------------- 设置 ---------------- */

    updateSettings: function (patch) {
      var s = state.settings;
      if (typeof patch.autoCall === 'boolean') s.autoCall = patch.autoCall;
      if (typeof patch.handsfree === 'boolean') s.handsfree = patch.handsfree;
      if (typeof patch.music === 'boolean') s.music = patch.music;
      if (patch.subtitleLang === 'zh-Hans' || patch.subtitleLang === 'zh-Hant' || patch.subtitleLang === 'en') {
        s.subtitleLang = patch.subtitleLang;
      }
      if (patch.musicSource === 'builtin' || patch.musicSource === 'custom') s.musicSource = patch.musicSource;
      if (['noise', 'rain', 'wind', 'pad'].indexOf(patch.musicTimbre) !== -1) s.musicTimbre = patch.musicTimbre;
      if (['off', 'less', 'often', 'half'].indexOf(patch.exprRate) !== -1) s.exprRate = patch.exprRate;
      if (['off', 'less', 'often', 'half'].indexOf(patch.patRate) !== -1) s.patRate = patch.patRate;
      if (['off', 'less', 'often', 'half'].indexOf(patch.momentRate) !== -1) s.momentRate = patch.momentRate;
      if (['rare', 'half', 'often', 'always'].indexOf(patch.replyRate) !== -1) s.replyRate = patch.replyRate;
      if (['rare', 'normal', 'often', 'custom'].indexOf(patch.callRate) !== -1) s.callRate = patch.callRate;
      if (typeof patch.callMinMinutes === 'number') {
        s.callMinMinutes = Math.min(720, Math.max(0.5, patch.callMinMinutes));
      }
      if (typeof patch.callMaxMinutes === 'number') {
        s.callMaxMinutes = Math.min(720, Math.max(0.5, patch.callMaxMinutes));
      }
      if (['fast', 'normal', 'slow', 'custom'].indexOf(patch.replyDelay) !== -1) s.replyDelay = patch.replyDelay;
      if (['auto', 'online', 'busy', 'offline'].indexOf(patch.dreamStatus) !== -1) s.dreamStatus = patch.dreamStatus;
      if (typeof patch.replyDelaySec === 'number') {
        s.replyDelaySec = Math.min(10, Math.max(0.1, patch.replyDelaySec));
      }
      if (typeof patch.timeAware === 'boolean') s.timeAware = patch.timeAware;
      if (typeof patch.wallpaper === 'string' && patch.wallpaper) s.wallpaper = patch.wallpaper;
      if (typeof patch.cardsGrouped === 'boolean') s.cardsGrouped = patch.cardsGrouped;
      if (Array.isArray(patch.collapsedGroups)) {
        s.collapsedGroups = patch.collapsedGroups.filter(function (x) { return typeof x === 'string'; });
      }
      if (['plain', 'ruled', 'kraft', 'sakura', 'night'].indexOf(patch.letterPaper) !== -1) {
        s.letterPaper = patch.letterPaper;
      }
      if (Array.isArray(patch.appOrder)) {
        s.appOrder = patch.appOrder.filter(function (x) { return typeof x === 'string'; });
      }
      if (Array.isArray(patch.hiddenApps)) {
        s.hiddenApps = patch.hiddenApps.filter(function (x) { return typeof x === 'string'; });
      }
      if (typeof patch.musicVolume === 'number') {
        s.musicVolume = Math.min(1, Math.max(0, patch.musicVolume));
      }
    },

    /* ---------------- 用户自己添加的表情 ---------------- */

    /** kind: 'face' | 'kao'；value 可以是字符串或字符串数组，返回新增数量 */
    addExtra: function (kind, value) {
      if (kind !== 'face' && kind !== 'kao') return 0;
      var list = state.extra[kind];
      var values = Array.isArray(value) ? value : [value];
      var added = 0;
      values.forEach(function (v) {
        v = String(v == null ? '' : v).trim();
        if (!v || list.indexOf(v) !== -1) return;
        list.push(v);
        added++;
      });
      return added;
    },

    removeExtra: function (kind, value) {
      if (kind !== 'face' && kind !== 'kao') return false;
      var list = state.extra[kind];
      var i = list.indexOf(value);
      if (i === -1) return false;
      list.splice(i, 1);
      return true;
    },

    /* ---------------- 纪念日 ---------------- */

    getAnniversaries: function () {
      return state.anniversaries;
    },

    addAnniversary: function (name, date, repeat) {
      name = String(name == null ? '' : name).trim();
      date = String(date == null ? '' : date);
      if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
      var item = { id: uid(), name: name, date: date, repeat: !!repeat };
      state.anniversaries.push(item);
      return item;
    },

    updateAnniversary: function (id, patch) {
      for (var i = 0; i < state.anniversaries.length; i++) {
        if (state.anniversaries[i].id !== id) continue;
        var a = state.anniversaries[i];
        if (typeof patch.name === 'string') {
          var n = patch.name.trim();
          if (!n) return null;
          a.name = n;
        }
        if (typeof patch.date === 'string') {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(patch.date)) return null;
          a.date = patch.date;
        }
        if (typeof patch.repeat === 'boolean') a.repeat = patch.repeat;
        return a;
      }
      return null;
    },

    removeAnniversary: function (id) {
      var before = state.anniversaries.length;
      state.anniversaries = state.anniversaries.filter(function (a) { return a.id !== id; });
      return state.anniversaries.length !== before;
    },

    /* ---------------- 信件 ---------------- */

    getLetters: function () {
      return state.letters;
    },

    addLetter: function (from, title, body, paper) {
      body = String(body == null ? '' : body).trim();
      if (!body) return null;
      var item = {
        id: uid(),
        from: from === 'dream' ? 'dream' : 'me',
        title: String(title == null ? '' : title).trim(),
        body: body,
        paper: String(paper == null ? '' : paper),
        time: Date.now(),
        read: false,
      };
      state.letters.push(item);
      return item;
    },

    getLetter: function (id) {
      for (var i = 0; i < state.letters.length; i++) {
        if (state.letters[i].id === id) return state.letters[i];
      }
      return null;
    },

    removeLetter: function (id) {
      var before = state.letters.length;
      state.letters = state.letters.filter(function (l) { return l.id !== id; });
      return state.letters.length !== before;
    },

    markLettersRead: function (from) {
      var n = 0;
      state.letters.forEach(function (l) {
        if (l.from === from && !l.read) { l.read = true; n++; }
      });
      return n;
    },

    unreadLetters: function () {
      return state.letters.filter(function (l) { return l.from === 'dream' && !l.read; }).length;
    },

    /* ---------------- 朋友圈 ---------------- */

    getMoments: function () {
      return state.moments;
    },

    getMoment: function (id) {
      for (var i = 0; i < state.moments.length; i++) {
        if (state.moments[i].id === id) return state.moments[i];
      }
      return null;
    },

    addMoment: function (from, text, photos) {
      text = String(text == null ? '' : text).trim();
      photos = Array.isArray(photos)
        ? photos.filter(function (p) { return typeof p === 'string' && p; }).slice(0, 9)
        : [];
      if (!text && !photos.length) return null;
      var item = {
        id: uid(),
        from: from === 'dream' ? 'dream' : 'me',
        text: text,
        photos: photos,
        time: Date.now(),
        likes: [],
        comments: [],
        seen: from !== 'dream',
      };
      state.moments.push(item);
      return item;
    },

    removeMoment: function (id) {
      var before = state.moments.length;
      state.moments = state.moments.filter(function (m) { return m.id !== id; });
      return state.moments.length !== before;
    },

    toggleLike: function (id, who) {
      var m = this.getMoment(id);
      if (!m) return false;
      var i = m.likes.indexOf(who);
      if (i === -1) m.likes.push(who);
      else m.likes.splice(i, 1);
      return i === -1;
    },

    addComment: function (id, from, text, replyTo) {
      var m = this.getMoment(id);
      text = String(text == null ? '' : text).trim();
      if (!m || !text) return null;
      var c = {
        id: uid(),
        from: from === 'dream' ? 'dream' : 'me',
        text: text,
        replyTo: replyTo === 'me' ? 'me' : '',
        time: Date.now(),
      };
      m.comments.push(c);
      return c;
    },

    markMomentsSeen: function () {
      var n = 0;
      state.moments.forEach(function (m) {
        if (m.from === 'dream' && !m.seen) { m.seen = true; n++; }
      });
      return n;
    },

    unseenMoments: function () {
      return state.moments.filter(function (m) { return m.from === 'dream' && !m.seen; }).length;
    },

    /* ---------------- 批量导入解析 ---------------- */

    /**
     * 支持三种写法：
     *   标签 | 内容
     *   【标签】内容
     *   内容
     * 以 # 或 // 开头的行会被忽略。
     */
    parseText: function (raw) {
      var out = [];
      String(raw || '').split(/\r?\n/).forEach(function (line) {
        var s = line.trim();
        if (!s) return;
        if (s.charAt(0) === '#' || s.indexOf('//') === 0) return;

        var tag = '';
        var text = s;

        var m = s.match(/^【([^】]{1,20})】\s*(.+)$/);
        if (m) {
          tag = m[1].trim();
          text = m[2].trim();
        } else {
          var i = s.indexOf('|');
          if (i > 0) {
            tag = s.slice(0, i).trim();
            text = s.slice(i + 1).trim();
          }
        }

        if (text) out.push({ tag: tag, text: text });
      });
      return out;
    },

    /* ---------------- JSON 导入 / 导出 ---------------- */

    /** 生成导出对象。opts.full = true 时包含聊天记录与全部设置 */
    exportObject: function (opts) {
      var full = !!(opts && opts.full);
      var out = {
        format: 'dream-card-chat',
        version: 2,
        kind: full ? 'full' : 'cards',
        exportedAt: new Date().toISOString(),
        profile: state.profile,
        extra: { face: state.extra.face.slice(), kao: state.extra.kao.slice() },
        anniversaries: state.anniversaries.map(function (a) {
          return { name: a.name, date: a.date, repeat: a.repeat };
        }),
        letters: state.letters.map(function (l) {
          return { from: l.from, title: l.title, body: l.body, paper: l.paper, time: l.time, read: l.read };
        }),
        moments: state.moments.map(function (m) {
          return {
            from: m.from, text: m.text, photos: m.photos.slice(), time: m.time, likes: m.likes.slice(),
            comments: m.comments.map(function (c) {
              return { from: c.from, text: c.text, replyTo: c.replyTo, time: c.time };
            }),
          };
        }),
        cards: state.cards.map(function (c) {
          return { tag: (c.tags[0] || ''), tags: c.tags.slice(), text: c.text };
        }),
      };
      if (full) {
        out.settings = JSON.parse(JSON.stringify(state.settings));
        out.messages = state.messages.map(function (m) {
          return {
            role: m.role, text: m.text, tag: m.tag,
            sticker: m.sticker, kind: m.kind, time: m.time,
          };
        });
      }
      return out;
    },

    /** 用一份完整备份覆盖当前数据（用于两端保持一致） */
    importFull: function (data) {
      if (!data || typeof data !== 'object') throw new Error('备份内容无效');

      if (Array.isArray(data.cards)) {
        state.cards = data.cards.map(function (c) {
          if (typeof c === 'string') return makeCard({ text: c });
          return makeCard({ tags: c && (c.tags !== undefined ? c.tags : c.tag), text: c && (c.text || c.content || c.value) });
        }).filter(function (c) { return c.text; });
      }

      if (Array.isArray(data.messages)) {
        state.messages = data.messages.map(makeMessage).filter(function (m) {
          return m.text || m.sticker;
        });
      }

      if (data.profile && typeof data.profile === 'object') {
        this.updateProfile({
          name: typeof data.profile.name === 'string' ? data.profile.name : undefined,
          avatar: typeof data.profile.avatar === 'string' ? data.profile.avatar : undefined,
          sign: typeof data.profile.sign === 'string' ? data.profile.sign : undefined,
          avatarImage: typeof data.profile.avatarImage === 'string' ? data.profile.avatarImage : undefined,
        });
      }

      if (data.settings && typeof data.settings === 'object') {
        this.updateSettings(data.settings);
      }

      if (data.extra && typeof data.extra === 'object') {
        state.extra = { face: [], kao: [] };
        this.addExtra('face', Array.isArray(data.extra.face) ? data.extra.face : []);
        this.addExtra('kao', Array.isArray(data.extra.kao) ? data.extra.kao : []);
      }

      if (Array.isArray(data.anniversaries)) {
        state.anniversaries = [];
        var self = this;
        data.anniversaries.forEach(function (a) {
          if (!a) return;
          self.addAnniversary(a.name, a.date, a.repeat);
        });
      }

      if (Array.isArray(data.moments)) {
        state.moments = [];
        data.moments.forEach(function (m) {
          if (!m) return;
          var photos = Array.isArray(m.photos) ? m.photos.slice()
            : (typeof m.photo === 'string' && m.photo ? [m.photo] : []);
          if (!m.text && !photos.length) return;
          var added = {
            id: uid(),
            from: m.from === 'dream' ? 'dream' : 'me',
            text: str(m.text),
            photos: photos.filter(function (p) { return typeof p === 'string' && p; }).slice(0, 9),
            time: typeof m.time === 'number' ? m.time : Date.now(),
            likes: Array.isArray(m.likes) ? m.likes.slice() : [],
            comments: [],
            seen: true,
          };
          (Array.isArray(m.comments) ? m.comments : []).forEach(function (c) {
            if (!c || !c.text) return;
            added.comments.push({
              id: uid(),
              from: c.from === 'dream' ? 'dream' : 'me',
              text: str(c.text),
              replyTo: c.replyTo === 'me' ? 'me' : '',
              time: typeof c.time === 'number' ? c.time : Date.now(),
            });
          });
          state.moments.push(added);
        });
      }

      if (Array.isArray(data.letters)) {
        state.letters = [];
        var self2 = this;
        data.letters.forEach(function (l) {
          if (!l || !l.body) return;
          var item = self2.addLetter(l.from, l.title, l.body, l.paper);
          if (item) {
            item.time = typeof l.time === 'number' ? l.time : item.time;
            item.read = l.read !== false;
          }
        });
      }

      return state.cards.length;
    },

    /**
     * 解析 JSON 文件内容。兼容：
     *   · 本站导出的完整对象 { cards: [...] }
     *   · 纯数组 [ "内容", { tag, text }, ... ]
     *   · 单个对象 { tag, text }
     * 返回 { cards: [...], profile: {...}|null }
     */
    parseJSON: function (raw) {
      var data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        throw new Error('不是有效的 JSON 文件');
      }

      var list = null;
      var profile = null;
      var extra = null;

      if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.cards)) list = data.cards;
        else if (data.text) list = [data];
        if (data.profile && typeof data.profile === 'object') profile = data.profile;
        if (data.extra && typeof data.extra === 'object') {
          extra = {
            face: Array.isArray(data.extra.face) ? data.extra.face : [],
            kao: Array.isArray(data.extra.kao) ? data.extra.kao : [],
          };
        }
      }

      if (!list) throw new Error('文件里没有找到字卡数据（缺少 cards 字段）');

      var cards = list.map(function (item) {
        if (typeof item === 'string') return { tags: [], text: item };
        if (item && typeof item === 'object') {
          var tg = item.tags !== undefined ? item.tags : (item.tag || item.label);
          return { tags: normTags(tg), text: str(item.text || item.content || item.value) };
        }
        return { tags: [], text: '' };
      }).filter(function (c) { return c.text.trim(); });

      if (!cards.length) throw new Error('文件里没有有效的字卡内容');

      return { cards: cards, profile: profile, extra: extra };
    },
  };

  window.Store = Store;
})();
