(() => {
  'use strict';

  const PROFILE_KEY = 'yunfan_user_profile';
  const DEBUG_SETTINGS_KEY = 'yunfan_debug_settings';

  const DEFAULT_DEBUG_SETTINGS = {
    submitCatches: 10,
    fleeCooldownMs: 650,
    fleeZoneHeightPx: 280,
    fleeJumpRatio: 0.5,
    fleeActivateRatio: 0.88,
    fleeActivateMinPx: 280,
    timerSeconds: 120,
    captchaRequired: 7,
    tankMoveDelay: 12,
    tankEnemyMoveCdMin: 22,
    tankEnemyMoveCdMax: 39,
    pacMoveDelay: 12,
    pacBeanPenalty: 8,
    pacGhostMoveCdMin: 22,
    pacGhostMoveCdMax: 39,
    pacRespawnGhostDist: 5,
    pacPartsNeeded: 7,
    pacInitialBeans: 48,
    redGhostAttackRange: 3,
  };

  const DEBUG_SETTING_FIELDS = [
    { key: 'submitCatches', label: '抓住逃跑按钮次数', type: 'number', min: 1, max: 30, step: 1, group: '提交' },
    { key: 'fleeCooldownMs', label: '按钮逃跑冷却 (ms)', type: 'number', min: 100, max: 5000, step: 50, group: '提交' },
    { key: 'fleeZoneHeightPx', label: '逃跑黄框高度 (px)', type: 'number', min: 120, max: 480, step: 10, group: '提交' },
    { key: 'fleeJumpRatio', label: '单次跳跃距离 (框比例)', type: 'number', min: 0.1, max: 1, step: 0.05, group: '提交' },
    { key: 'fleeActivateRatio', label: '鼠标感应范围 (框比例)', type: 'number', min: 0.3, max: 1.5, step: 0.05, group: '提交' },
    { key: 'fleeActivateMinPx', label: '鼠标感应最小 (px)', type: 'number', min: 80, max: 600, step: 10, group: '提交' },
    { key: 'timerSeconds', label: '注册倒计时 (秒)', type: 'number', min: 30, max: 600, step: 10, group: '全局' },
    { key: 'captchaRequired', label: '验证码需完成轮数', type: 'number', min: 1, max: 15, step: 1, group: '全局' },
    { key: 'tankMoveDelay', label: '坦克玩家移动冷却 (帧)', type: 'number', min: 4, max: 40, step: 1, group: '坦克', reload: true },
    { key: 'tankEnemyMoveCdMin', label: '敌方坦克移动 CD 最小', type: 'number', min: 8, max: 80, step: 1, group: '坦克', reload: true },
    { key: 'tankEnemyMoveCdMax', label: '敌方坦克移动 CD 最大', type: 'number', min: 10, max: 120, step: 1, group: '坦克', reload: true },
    { key: 'pacMoveDelay', label: '吃豆人移动冷却 (帧)', type: 'number', min: 4, max: 40, step: 1, group: '吃豆人', reload: true },
    { key: 'pacBeanPenalty', label: '被鬼抓豆子惩罚', type: 'number', min: 1, max: 30, step: 1, group: '吃豆人', reload: true },
    { key: 'pacGhostMoveCdMin', label: '鬼魂移动 CD 最小', type: 'number', min: 8, max: 80, step: 1, group: '吃豆人', reload: true },
    { key: 'pacGhostMoveCdMax', label: '鬼魂移动 CD 最大', type: 'number', min: 10, max: 120, step: 1, group: '吃豆人', reload: true },
    { key: 'pacRespawnGhostDist', label: '复活离鬼最小格数', type: 'number', min: 2, max: 15, step: 1, group: '吃豆人', reload: true },
    { key: 'pacPartsNeeded', label: '头像部件数量', type: 'number', min: 3, max: 12, step: 1, group: '吃豆人', reload: true },
    { key: 'pacInitialBeans', label: '初始豆子数量', type: 'number', min: 10, max: 120, step: 1, group: '吃豆人', reload: true },
    { key: 'redGhostAttackRange', label: '赤鬼远程攻击格数', type: 'number', min: 1, max: 6, step: 1, group: '吃豆人', reload: true },
  ];

  let debugSettingsCache = null;

  function loadDebugSettingsRaw() {
    try {
      const raw = localStorage.getItem(DEBUG_SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_DEBUG_SETTINGS };
      return { ...DEFAULT_DEBUG_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_DEBUG_SETTINGS };
    }
  }

  function saveDebugSettingsRaw(settings) {
    localStorage.setItem(DEBUG_SETTINGS_KEY, JSON.stringify(settings));
    debugSettingsCache = { ...settings };
    applyDebugSettings();
  }

  function getDebugSettings() {
    if (!debugSettingsCache) debugSettingsCache = loadDebugSettingsRaw();
    return { ...debugSettingsCache };
  }

  function applyDebugSettings() {
    const s = getDebugSettings();
    document.documentElement.style.setProperty('--flee-zone-height', `${s.fleeZoneHeightPx}px`);
    if (state && !state._timerStarted) state.timerSeconds = s.timerSeconds;
    if (state && !state.captcha) state.captchaRequired = s.captchaRequired;
  }

  window.YunfanDebugSettings = {
    get: getDebugSettings,
    defaults: () => ({ ...DEFAULT_DEBUG_SETTINGS }),
    reset: () => saveDebugSettingsRaw({ ...DEFAULT_DEBUG_SETTINGS }),
    save: (partial) => saveDebugSettingsRaw({ ...getDebugSettings(), ...partial }),
  };

  debugSettingsCache = loadDebugSettingsRaw();
  document.documentElement.style.setProperty('--flee-zone-height', `${debugSettingsCache.fleeZoneHeightPx}px`);

  const ALL_CHARS = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵湛汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董粱杜阮蓝闵席季麻强贾路娄危江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯昝管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁荀羊於惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲邰从鄂索咸籍赖卓蔺屠蒙池乔阴鬱胥能苍双闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍舄璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庾终暨居衡步都耿满弘匡国文寇广禄阙东欧殳沃利蔚越夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查後荆红游竺权逯盖益桓公';

  const COUNTRIES = [
    { id: 'cn', name: '中国', code: 'cn' },
    { id: 'us', name: '美国', code: 'us' },
    { id: 'jp', name: '日本', code: 'jp' },
    { id: 'gb', name: '英国', code: 'gb' },
    { id: 'fr', name: '法国', code: 'fr' },
    { id: 'de', name: '德国', code: 'de' },
    { id: 'it', name: '意大利', code: 'it' },
  ];

  const TERMS_PAGES = [
    { title: '第一章：总则', body: [
      { t: 'legal', text: '欢迎使用云帆科技平台。本协议是您与云帆科技有限公司之间关于使用本平台服务所订立的法律文件。注册前请仔细阅读全部条款。' },
      { t: 'fun', text: '💡 小百科：全世界 100% 的注册用户都曾经觉得「这协议好长」——您并不孤独。' },
      { t: 'legal', text: '您点击注册即表示已充分理解并接受本协议。若您未满 18 周岁，请在监护人陪同下阅读，并由监护人代为后悔。' },
      { t: 'legal', text: '本公司有权在必要时修订本协议，修订后的协议将在平台公布。若您继续使用服务，视为接受修订；若您怒而离开，我们也只能挥手。' },
      { t: 'fun', text: '🐹 办公室仓鼠备注：「总则」的本意是「总之你同意了就行」。' },
      { t: 'legal', text: '本协议各条款标题仅为方便阅读而设，不影响条款本身的含义——就像「人类友好」不影响注册流程一样。' },
      { t: 'legal', text: '您声明：您具备完全民事行为能力，或至少具备完全民事行为能力的演技。' },
      { t: 'fun', text: '若您读到这里还没放弃，恭喜，您的毅力已超过 73% 的用户（数据来源：我们编的）。' },
      { t: 'legal', text: '禁止将本协议用于垫显示器、扇风、折纸飞机等未授权用途。' },
      { t: 'legal', text: '云帆科技保留对本协议的最终解释权，以及对你为什么还在填表的不解。' },
    ]},
    { title: '第二章：数据与隐私', body: [
      { t: 'legal', text: '为提供服务，我们会收集您的注册信息、设备信息、操作日志等数据。这些数据对我们很重要，对您也未必不重要。' },
      { t: 'fun', text: '🔍 我们收集的数据不包括：您叹气时呼出的二氧化碳（暂时）。' },
      { t: 'legal', text: '您的个人信息将加密存储，并仅限授权人员访问。未经授权的人员若想访问，需要先通过我们的弹球性别测试。' },
      { t: 'legal', text: '我们不会向第三方出售您的个人数据。我们只是偶尔在内部周报里匿名展示「用户平均注册耗时」。' },
      { t: 'fun', text: 'Cookie 提醒：本站 Cookie 不能蘸牛奶。请勿在凌晨三点尝试。' },
      { t: 'legal', text: '您有权查阅、更正、删除您的个人信息。删除请求将在 30 个工作日内处理，或更久，取决于我们的咖啡库存。' },
      { t: 'legal', text: '为遵守法律法规，我们可能依法向有关部门提供相关信息。希望您不要给我们这个机会。' },
      { t: 'fun', text: '📊 隐私小贴士：您的手机号小数点后两位目前处于叠加态，这符合量子隐私保护理论（我们刚发明的）。' },
      { t: 'legal', text: '未成年人使用本平台应在监护人指导下进行，且监护人须承担一切后果，包括帮小孩完成国旗拼图。' },
      { t: 'legal', text: '若发生数据安全事件，我们将及时通知您，通知方式包括但不限于：弹窗、邮件、或您下次打开页面时的沉默凝视。' },
    ]},
    { title: '第三章：用户义务', body: [
      { t: 'legal', text: '您应保证注册信息的真实性、准确性。若信息不实，我们有权暂停或终止服务。' },
      { t: 'fun', text: '⚠️ 特别提醒：若您通过弹球选择了「沃尔玛购物袋」，后续修改需重新发射弹球并填写书面说明。' },
      { t: 'legal', text: '您不得利用本平台从事违法违规活动，包括但不限于洗钱、诈骗、以及用脚本自动勾选协议。' },
      { t: 'legal', text: '您应妥善保管账号密码。因保管不善导致的损失由您自行承担，我们深表同情但爱莫能助。' },
      { t: 'fun', text: '🧩 国旗拼图完成前，禁止在国际论坛代表所选国家发言。这是基本礼仪。' },
      { t: 'legal', text: '禁止干扰平台正常运行，包括但不限于：DDoS 攻击、恶意刷接口、或对计时器发泄情绪。' },
      { t: 'legal', text: '您上传的头像不得含有违法违规内容。六个组件拼成的抽象派面孔目前不在禁止范围内。' },
      { t: 'fun', text: '✉️ 邮箱倒着输入时若出现重复字母，那是系统在练习书法，请淡定。' },
      { t: 'legal', text: '您同意配合我们进行安全验证，无论验证题目多么哲学。' },
      { t: 'legal', text: '违反本协议的用户，我们有权采取警告、限制功能、封号等措施，情节严重者将被弹球永久判为「不愿透露」。' },
    ]},
    { title: '第四章：免责条款', body: [
      { t: 'legal', text: '因不可抗力导致的服务中断，本公司不承担责任。不可抗力包括但不限于：停电、断网、以及开发者在摸鱼。' },
      { t: 'fun', text: '⏱️ 关于计时器：每次归零都只是虚惊一场。您的表单很安全，但您的神经可能不太安全。' },
      { t: 'legal', text: '因您自身原因（如手滑、眼花、对 π 的执念）导致的注册失败，本公司不承担责任。' },
      { t: 'legal', text: '平台按「现状」提供服务，不对服务的及时性、安全性、准确性作任何明示或暗示的保证。' },
      { t: 'fun', text: '🎱 弹球结果具有娱乐性质。若球落入「猫」一栏，请自行准备猫砂盆，与本公司无关。' },
      { t: 'legal', text: '对于因使用本平台而产生的任何间接、附带、特殊损失，本公司在法律允许范围内免责。' },
      { t: 'legal', text: '第三方链接或内容不代表本公司立场。若链接指向奇怪的地方，那是互联网的错。' },
      { t: 'fun', text: '📱 手机号滑动条在第 5 次移动后会施舍您一次整数对齐。请感恩。' },
      { t: 'legal', text: '您理解注册流程可能消耗较多时间，并自愿放弃在此期间本可完成的其他事情。' },
      { t: 'legal', text: '本公司对「武装直升机」性别选项可能引发的军事误会概不负责。' },
    ]},
    { title: '第五章：附则', body: [
      { t: 'legal', text: '本协议自您勾选同意之日起生效，至您注销账号之日终止，或至宇宙热寂，以较早者为准。' },
      { t: 'fun', text: '🎉 您已读完 5 页协议！全国超过 0.003% 的用户能做到这一点（分母含未完成注册者）。' },
      { t: 'legal', text: '本协议未尽事宜，适用中华人民共和国法律。争议由本公司所在地法院管辖。' },
      { t: 'legal', text: '若本协议任何条款被认定无效，其余条款仍然有效，就像注册表单里其他 9 项仍然在等您一样。' },
      { t: 'fun', text: '🐱 办公室猫现正趴在服务器上，对您的坚持表示慵懒的认可。' },
      { t: 'legal', text: '您勾选同意的速度不构成已阅读的充分证据——但我们都不会说破。' },
      { t: 'legal', text: '本协议以中文为准。其他语言译本若有歧义，以中文版的折磨程度为准。' },
      { t: 'fun', text: '时空环提示：三环会自动旋转，看准时机按下「定格」。选错日期？那是时空的错。' },
      { t: 'legal', text: '感谢您选择云帆科技。注册完成后，您将获得一张个人资料卡，以及一段不可复制的回忆。' },
      { t: 'legal', text: '【完】现在请勾选同意，然后去和那些滑动条搏斗吧。祝您好运。' },
    ]},
  ];

  const WEAK_PASSWORDS = new Set([
    '123456', '1234567', '12345678', 'password', 'password1', 'password123',
    'qwerty', 'abc123', '111111', '123123', 'admin', 'letmein', 'welcome',
    'monkey', 'dragon', 'master', 'login', 'princess', 'football', 'shadow',
    'sunshine', 'trustno1', '000000', '654321', 'superman', 'qazwsx',
  ]);

  const CAPTCHA_TYPES = [
    { q: '请点击所有「让人感到希望」的图案', test: (e) => ['🌅', '💡', '🌈', '🍀', '⭐', '🕊️'].includes(e) },
    { q: '请点击所有「看起来像食物」的图案', test: (e) => ['🍕', '🍔', '🍣', '🍎', '🥗', '🍜', '🌮'].includes(e) },
    { q: '请点击所有「让人快乐」的图案', test: (e) => ['😊', '🎉', '🎈', '🐶', '🌻', '🎵'].includes(e) },
    { q: '请点击所有「可以在雨天使用」的图案', test: (e) => ['☂️', '🧥', '🌂', '👢', '🏠'].includes(e) },
    { q: '请点击所有「比大象小」的图案', test: (e) => ['🐜', '🐁', '🐝', '🦗', '🔸', '📎'].includes(e) },
  ];

  const CAPTCHA_EMOJIS = ['🌅', '🌧️', '🏔️', '🍕', '🔥', '💡', '🌈', '⭐', '🍔', '🎭', '🌊', '🍀', '😊', '🎉', '🐜', '🐘', '☂️', '🧥', '🍣', '🐶', '🎈', '🌻', '🕊️', '🦗', '📎', '🍎', '🌮', '🍜', '🐁', '🐝', '🎵', '👢', '🏠', '🌂', '🔸'];

  const DEBUG_SKIP_FIELDS = [
    'name', 'gender', 'country', 'phone', 'birthday', 'email', 'password', 'captcha', 'avatar', 'terms',
  ];
  const DEBUG_SKIP_LABELS = {
    name: '姓名', gender: '性别', country: '国家/地区', phone: '手机号', birthday: '生日',
    email: '邮箱', password: '密码', captcha: '安全验证', avatar: '头像', terms: '用户协议',
  };
  const DEBUG_PASSWORD = '😀   7😀x';

  const state = {
    name: [],
    gender: null,
    country: null,
    countryPuzzleDone: false,
    phoneConfirmed: false,
    birthday: null,
    email: '',
    password: false,
    captcha: false,
    captchaRound: 0,
    captchaRequired: getDebugSettings().captchaRequired,
    avatar: false,
    avatarPlaced: new Set(),
    terms: false,
    termsPage: 0,
    termsAgreed: new Set(),
    timerSeconds: getDebugSettings().timerSeconds,
    timerExpireCount: 0,
    registerOpen: false,
    debugMode: false,
    debugSkippedFields: new Set(),
    regLog: null,
    emailDisplay: '',
  };

  let puzzleState = { pieces: [] };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2800);
  }

  function setStatus(field, status) {
    const el = $(`#status-${field}`);
    if (!el) return;
    const done = status === '已完成';
    el.textContent = done ? '已完成' : status;
    el.className = 'field-status' + (done ? ' done' : status === '失败' ? ' fail' : '');
    document.querySelector(`[data-field="${field}"]`)?.classList.toggle('valid', done);
    updateProgress();
  }

  function updateProgress() {
    const checks = [
      state.name.length >= 2,
      !!state.gender,
      state.country && state.countryPuzzleDone,
      state.phoneConfirmed,
      !!state.birthday,
      validateEmail(state.email),
      state.password,
      state.captcha,
      state.avatar,
      state.terms,
    ];
    const done = checks.filter(Boolean).length;
    $('#progressFill').style.width = Math.round((done / checks.length) * 100) + '%';
    $('#progressText').textContent = Math.round((done / checks.length) * 100) + '%';
    $('#submitHint').textContent = state.debugMode
      ? `调试模式：各栏可点「跳过」；提交需抓住按钮 ${getDebugSettings().submitCatches} 次`
      : done === 10 ? '所有项目已完成' : `还有 ${10 - done} 项未完成`;
    $('#submitBtn').disabled = !state.debugMode && done < 10;
    updateDebugSkips();
    updateDebugSettingsUI();
  }

  function updateDebugSettingsUI() {
    const toggle = $('#debugSettingsToggle');
    const panel = $('#debugSettingsPanel');
    if (toggle) toggle.classList.toggle('hidden', !state.debugMode);
    if (panel && !state.debugMode) panel.classList.add('hidden');
  }

  function renderDebugSettingsForm() {
    const form = $('#debugSettingsForm');
    if (!form) return;
    const s = getDebugSettings();
    const groups = [...new Set(DEBUG_SETTING_FIELDS.map((f) => f.group))];
    form.innerHTML = groups.map((group) => {
      const fields = DEBUG_SETTING_FIELDS.filter((f) => f.group === group);
      const inputs = fields.map((f) => {
        const val = s[f.key];
        const reloadMark = f.reload ? ' *' : '';
        return `<label class="debug-field"><span class="debug-field-label">${esc(f.label)}${reloadMark}</span>
          <input type="${f.type}" data-key="${f.key}" value="${val}"
            min="${f.min ?? ''}" max="${f.max ?? ''}" step="${f.step ?? 'any'}"></label>`;
      }).join('');
      return `<div class="debug-settings-group"><div class="debug-settings-group-title">${esc(group)}</div>${inputs}</div>`;
    }).join('');
  }

  function readDebugSettingsForm() {
    const next = { ...getDebugSettings() };
    $$('#debugSettingsForm input[data-key]').forEach((input) => {
      const key = input.dataset.key;
      const field = DEBUG_SETTING_FIELDS.find((f) => f.key === key);
      let val = field?.type === 'number' ? parseFloat(input.value) : input.value;
      if (field?.type === 'number' && Number.isNaN(val)) val = DEFAULT_DEBUG_SETTINGS[key];
      if (field?.min != null) val = Math.max(field.min, val);
      if (field?.max != null) val = Math.min(field.max, val);
      next[key] = val;
    });
    return next;
  }

  function initDebugSettingsPanel() {
    if (state._debugSettingsInited) return;
    state._debugSettingsInited = true;
    renderDebugSettingsForm();
    $('#debugSettingsToggle')?.addEventListener('click', () => {
      const panel = $('#debugSettingsPanel');
      if (!panel) return;
      renderDebugSettingsForm();
      panel.classList.toggle('hidden');
    });
    $('#debugSettingsClose')?.addEventListener('click', () => {
      $('#debugSettingsPanel')?.classList.add('hidden');
    });
    $('#debugSettingsSave')?.addEventListener('click', () => {
      const next = readDebugSettingsForm();
      saveDebugSettingsRaw(next);
      applyDebugSettings();
      updateProgress();
      toast('调试参数已保存（标 * 的小游戏参数需刷新页面）');
    });
    $('#debugSettingsReset')?.addEventListener('click', () => {
      if (!confirm('恢复全部调试参数为默认值？')) return;
      window.YunfanDebugSettings.reset();
      renderDebugSettingsForm();
      applyDebugSettings();
      updateProgress();
      toast('已恢复默认参数');
    });
  }

  function updateDebugSkips() {
    $$('.btn-debug-skip').forEach((btn) => {
      btn.classList.toggle('hidden', !state.debugMode);
    });
  }

  function initDebugSkips() {
    DEBUG_SKIP_FIELDS.forEach((field) => {
      const card = document.querySelector(`[data-field="${field}"]`);
      if (!card) return;
      const header = card.querySelector('.field-header');
      if (!header || header.querySelector('.btn-debug-skip')) return;
      const actions = document.createElement('div');
      actions.className = 'field-header-actions';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-debug-skip hidden';
      btn.textContent = '跳过';
      btn.addEventListener('click', () => skipField(field));
      const status = header.querySelector('.field-status');
      actions.appendChild(btn);
      if (status) actions.appendChild(status);
      header.appendChild(actions);
    });
  }

  function skipField(field) {
    if (!state.debugMode) return;
    logEvent('debug_skip', field);
    switch (field) {
      case 'name':
        state.name = ['测', '试'];
        renderNameSlots();
        setStatus('name', '已完成');
        break;
      case 'gender':
        state.gender = '男';
        $('#genderInput').value = '男';
        $('#genderResult').textContent = '性别：男（调试跳过）';
        setStatus('gender', '已完成');
        break;
      case 'country': {
        const c = COUNTRIES[0];
        state.country = c.name;
        state.countryPuzzleDone = true;
        $('#countryInput').value = c.name;
        $$('.country-btn').forEach((b) => b.classList.toggle('selected', b.textContent === c.name));
        $('#puzzleArea').classList.remove('hidden');
        setStatus('country', '已完成');
        break;
      }
      case 'phone':
        state.debugSkippedFields.add('phone');
        $('#phoneInput').value = '13800138000';
        $('#phoneDisplay').textContent = '1 3 8 0 0 1 3 8 0 0 0';
        $('#phoneHint').textContent = '（调试跳过）';
        state.phoneConfirmed = true;
        tankPhoneApi?.markDebugSkipped('13800138000');
        updatePhoneResetUI();
        setStatus('phone', '已完成');
        break;
      case 'birthday':
        state.birthday = '19900101';
        $('#birthdayInput').value = '19900101';
        setStatus('birthday', '已完成');
        break;
      case 'email':
        state.email = 'debug@test.com';
        state.emailDisplay = 'moc.tset@gubed';
        $('#emailInput').value = 'moc.tset@gubed';
        $('#emailPreview').textContent = '正序预览：debug@test.com';
        setStatus('email', '已完成');
        break;
      case 'password':
        $('#usernameInput').value = DEBUG_PASSWORD;
        $('#passwordInput').value = DEBUG_PASSWORD;
        state.password = true;
        $$('#passwordRules li').forEach((li) => { li.className = 'pass'; });
        setStatus('password', '已完成');
        break;
      case 'captcha':
        state.captcha = true;
        state.captchaRound = state.captchaRequired;
        $('#captchaQuestion').textContent = '验证完成。（调试跳过）';
        $('#captchaGrid').innerHTML = '';
        $('#captchaLoading').classList.add('hidden');
        $('#submitCaptcha').disabled = false;
        setStatus('captcha', '已完成');
        break;
      case 'avatar': {
        state.debugSkippedFields.add('avatar');
        const dz = $('#avatarDropzone');
        dz.innerHTML = '<div class="avatar-part placed" style="left:50%;top:45%;transform:translate(-50%,-50%);font-size:2.5rem">😀</div>';
        dz.classList.add('has-parts');
        state.avatar = true;
        pacAvatarApi?.markDebugSkipped();
        setStatus('avatar', '已完成');
        break;
      }
      case 'terms':
        state.termsAgreed = new Set(TERMS_PAGES.map((_, i) => i));
        state.terms = true;
        setStatus('terms', '已完成');
        break;
      default:
        return;
    }
    toast(`已跳过：${DEBUG_SKIP_LABELS[field] || field}`);
  }

  function updatePhoneResetUI() {
    const btn = $('#resetPhone');
    if (!btn) return;
    btn.classList.toggle('hidden', !state.phoneConfirmed);
  }

  function logEvent(type, detail = '') {
    if (!state.regLog) return;
    state.regLog.events.push({ t: Date.now(), type, detail });
    if (type === 'phone_tank') state.regLog.phoneMovesTotal++;
    if (type === 'birthday_dial') state.regLog.whackHits++;
    if (type === 'captcha_submit') state.regLog.captchaSubmissions++;
    if (type === 'timer_fakeout') state.regLog.timerFakeouts++;
  }

  function initRegLog() {
    state.regLog = {
      startedAt: Date.now(),
      events: [],
      phoneMovesTotal: 0,
      captchaSubmissions: 0,
      timerFakeouts: 0,
      genderLaunch: 0,
      puzzleMoves: 0,
      whackHits: 0,
    };
    logEvent('register_open', '打开注册面板');
  }

  // ── Profile ──
  function saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    updateProfileUI();
  }

  function loadProfile() {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY));
    } catch { return null; }
  }

  function deleteProfile() {
    if (!confirm('确定注销账号？本地资料将被清除，此操作不可恢复。')) return;
    localStorage.removeItem(PROFILE_KEY);
    $('#profilePopover').classList.add('hidden');
    updateProfileUI();
    toast('账号已注销');
  }

  const EVENT_LABELS = {
    register_open: '打开注册面板',
    register_success: '提交注册成功',
    gender_brick: '打砖块定性别',
    country_select: '选择国家',
    puzzle_move: '拼图拖拽',
    puzzle_done: '拼图完成',
    phone_tank: '坦克击毁数字',
    phone_tank_complete: '手机号集齐',
    phone_confirm: '确认手机号',
    phone_reject: '号码被拒绝',
    birthday_dial: '转盘拨号',
    captcha_submit: '安全验证',
    avatar_done: '头像组装完成',
    timer_fakeout: '计时器惊吓',
    debug_skip: '调试跳过',
  };

  function eventLabel(type) {
    return EVENT_LABELS[type] || type;
  }

  function formatBirthday(bday) {
    if (!bday || bday.length !== 8) return { display: bday || '—', age: null, zodiac: null };
    const y = bday.slice(0, 4);
    const m = parseInt(bday.slice(4, 6), 10);
    const d = parseInt(bday.slice(6, 8), 10);
    const signs = [
      ['摩羯', 1, 20], ['水瓶', 2, 19], ['双鱼', 3, 21], ['白羊', 4, 20],
      ['金牛', 5, 21], ['双子', 6, 22], ['巨蟹', 7, 23], ['狮子', 8, 23],
      ['处女', 9, 24], ['天秤', 10, 24], ['天蝎', 11, 23], ['射手', 12, 22],
    ];
    let zodiac = '摩羯';
    for (let i = signs.length - 1; i >= 0; i--) {
      const [name, month, day] = signs[i];
      if (m > month || (m === month && d >= day)) { zodiac = name; break; }
    }
    const age = new Date().getFullYear() - parseInt(y, 10);
    return { display: `${y}年${m}月${d}日`, age, zodiac };
  }

  function renderProfileCard(container, profile, { compact = false } = {}) {
    if (!container || !profile) return;
    const bday = formatBirthday(profile.birthday);
    if (compact) {
      container.innerHTML = `
        <div class="profile-avatar-preview profile-avatar-full-wrap">${profile.avatarHtml || '🙂'}</div>
        <dl>
          <dt>姓名</dt><dd>${esc(profile.name)}</dd>
          <dt>性别</dt><dd>${esc(profile.gender)}</dd>
          <dt>国家</dt><dd>${esc(profile.country)}</dd>
          <dt>手机</dt><dd>${esc(profile.phone)}</dd>
          <dt>生日</dt><dd>${esc(bday.display)}</dd>
          <dt>邮箱</dt><dd>${esc(profile.email)}</dd>
          <dt>用户名</dt><dd>${esc(profile.username)}</dd>
        </dl>
      `;
      return;
    }
    const a = profile.analysis || {};
    const log = profile.regLog || {};
    const logs = (log.events || []).slice(-20).map((e) => {
      const time = new Date(e.t).toLocaleTimeString('zh-CN');
      const label = eventLabel(e.type);
      return `<div class="profile-log-row"><span class="profile-log-time">${time}</span><span class="profile-log-type">${esc(label)}</span>${e.detail ? `<span class="profile-log-detail">${esc(e.detail)}</span>` : ''}</div>`;
    }).join('');

    const statBars = (a.stats || []).map((s) => `
      <div class="profile-stat">
        <div class="profile-stat-head"><span>${esc(s.label)}</span><span>${s.value}</span></div>
        <div class="profile-stat-bar"><div class="profile-stat-fill" style="width:${s.value}%;background:${s.color || 'var(--primary)'}"></div></div>
      </div>
    `).join('');

    const badges = (a.badges || []).map((b) =>
      `<span class="profile-badge" title="${esc(b.hint || '')}">${b.emoji} ${esc(b.label)}</span>`
    ).join('');

    const highlights = (a.highlights || []).map((h) =>
      `<li><span class="profile-highlight-icon">${h.icon}</span><span>${esc(h.text)}</span></li>`
    ).join('');

    const funFacts = (a.funFacts || []).map((f) => `<li>${esc(f)}</li>`).join('');

    container.innerHTML = `
      <div class="profile-hero">
        <div class="profile-avatar-preview profile-avatar-full-wrap">${profile.avatarHtml || '🙂'}</div>
        <div class="profile-hero-meta">
          <div class="profile-grade-badge grade-${esc(a.grade || 'C')}">${esc(a.grade || 'C')}</div>
          <h4 class="profile-title">${esc(a.title || '云帆新公民')}</h4>
          <p class="profile-subtitle">${esc(a.subtitle || '')}</p>
          <div class="profile-badges">${badges || '<span class="profile-badge">🎫 注册幸存者</span>'}</div>
        </div>
      </div>
      <dl class="profile-dl">
        <dt>姓名</dt><dd>${esc(profile.name)} <span class="profile-tag">${esc(a.nameTag || '')}</span></dd>
        <dt>性别</dt><dd>${esc(profile.gender)} <span class="profile-tag">${esc(a.genderComment || '')}</span></dd>
        <dt>国家</dt><dd>${esc(profile.country)}</dd>
        <dt>手机</dt><dd>${esc(profile.phone)} <span class="profile-tag">${esc(a.phoneTag || '')}</span></dd>
        <dt>生日</dt><dd>${esc(bday.display)}${bday.age != null ? ` · ${bday.age} 岁` : ''}${bday.zodiac ? ` · ${bday.zodiac}座` : ''}</dd>
        <dt>邮箱</dt><dd>${esc(profile.email)}</dd>
        <dt>用户名</dt><dd>${esc(profile.username)}</dd>
        <dt>注册时间</dt><dd>${esc(profile.registeredAt)}</dd>
      </dl>
      <div class="profile-section">
        <h4>📊 云帆 AI 注册行为分析报告</h4>
        <p class="profile-summary">${esc(a.summary || '')}</p>
        <div class="profile-stat-grid">${statBars}</div>
        <ul class="profile-highlights">${highlights}</ul>
      </div>
      <div class="profile-section">
        <h4>🎮 关卡战绩明细</h4>
        <ul class="profile-analysis profile-detail-list">
          <li>⏱ 总耗时 <strong>${esc(a.durationText || '未知')}</strong> — 击败全国 ${a.beatPercent ?? '?'}% 的注册用户</li>
          <li>🧠 精神状况 <strong>${esc(a.mentalState || '未知')}</strong></li>
          <li>🧱 打砖块性别 <strong>${esc(profile.gender)}</strong>（${esc(a.genderComment || '—')}）</li>
          <li>🧩 国旗拼图 <strong>${log.puzzleMoves ?? 0}</strong> 次拖拽 — ${esc(a.puzzleComment || '')}</li>
          <li>🎖 坦克大战 <strong>${log.phoneMovesTotal ?? 0}</strong> 辆击毁 — ${esc(a.phoneComment || '')}</li>
          <li>☎️ 生日拨号 <strong>${log.whackHits ?? 0}</strong> 次 — ${esc(a.birthdayComment || '')}</li>
          <li>✉️ 倒序邮箱 ${esc(a.emailComment || '')}</li>
          <li>🔐 密码合规 ${esc(a.passwordComment || '')}</li>
          <li>🤖 人机验证 <strong>${log.captchaSubmissions ?? 0}</strong> 轮 — ${esc(a.captchaComment || '')}</li>
          <li>👻 吃豆人头像 ${esc(a.avatarComment || '')}</li>
          <li>⏳ 计时器惊吓 <strong>${log.timerFakeouts ?? 0}</strong> 次 — ${esc(a.timerComment || '')}</li>
          <li>🏃 抓住逃跑按钮 <strong>${log.submitCatches ?? 3}</strong> 次 — ${esc(a.submitComment || '')}</li>
          ${a.debugSkipNote ? `<li>🛠 ${esc(a.debugSkipNote)}</li>` : ''}
        </ul>
      </div>
      ${funFacts ? `<div class="profile-section"><h4>🔮 云帆玄学观察</h4><ul class="profile-funfacts">${funFacts}</ul></div>` : ''}
      <div class="profile-section">
        <h4>📜 操作日志（最近 ${Math.min(20, (log.events || []).length)} 条）</h4>
        <div class="profile-log">${logs || '<div class="profile-log-row">暂无记录</div>'}</div>
      </div>
    `;
  }

  function buildProfileAnalysis(profile) {
    const log = profile.regLog || {};
    const events = log.events || [];
    const ms = (log.endedAt || Date.now()) - (log.startedAt || Date.now());
    const sec = Math.round(ms / 1000);
    const min = Math.floor(sec / 60);
    const durationText = min > 0 ? `${min} 分 ${sec % 60} 秒` : `${sec} 秒`;
    const beatPercent = Math.min(99, Math.max(1, Math.floor(sec / 3.5)));

    let mentalState = '情绪稳定，尚有理智';
    if (sec > 420) mentalState = '已与表单达成共生关系';
    else if (sec > 300) mentalState = '灵魂出窍边缘，建议休息';
    else if (sec > 180) mentalState = '濒临崩溃，但仍可沟通';
    else if (sec > 90) mentalState = '开始烦躁，鼠标点击变重';
    else if ((log.timerFakeouts || 0) >= 2) mentalState = '惊弓之鸟，听见倒计时会抖';

    const phoneKills = log.phoneMovesTotal || 0;
    const phoneComment = phoneKills > 30 ? '战区传奇，数字坦克闻风丧胆' : phoneKills > 15 ? '坦克王牌，走位风骚' : phoneKills > 5 ? '尚可一战，偶尔撞墙' : '新手司机，建议多练走位';

    const captchaRounds = log.captchaSubmissions || 0;
    const captchaComment = captchaRounds >= 9 ? '耐心惊人，疑似禅修用户' : captchaRounds >= 6 ? '正常人类，略有不甘' : captchaRounds >= 3 ? '效率偏高，运气不错' : '快得可疑，请接受复查';

    const timerFakeouts = log.timerFakeouts || 0;
    const timerComment = timerFakeouts >= 2 ? '您太容易上当了，可爱型选手' : timerFakeouts >= 1 ? '被吓一次，仍算镇定' : '定力不错，计时器克星';

    const genderComments = {
      '男': '经典选项，稳如老狗',
      '女': '经典选项，气质在线',
      '男同': '勇敢做自己，云帆支持',
      '女同': '勇敢做自己，云帆支持',
      '双': '选择困难症的高级形态',
      '武装直升机': '军方可能致电确认',
      '沃尔玛塑料袋': '零售巨头荣誉会员',
      '沃尔玛购物袋': '环保材质，可重复使用',
      '猫': '已自动加入喵星驻地球办事处',
      '不愿透露': '神秘的代名词',
    };
    const genderComment = genderComments[profile.gender] || '中规中矩，不卑不亢';

    const puzzleMoves = log.puzzleMoves || 0;
    const puzzleComment = puzzleMoves > 12 ? '拼图大师，国旗记得比国歌还熟' : puzzleMoves > 5 ? '认真拼图，细节控' : puzzleMoves > 0 ? '眼疾手快，一次到位' : '疑似开了天眼';

    const dialHits = log.whackHits || 0;
    const birthdayComment = dialHits >= 8 ? '拨号稳如老司机' : dialHits >= 4 ? '转盘手感逐渐上手' : '生日记得很准，或很敢编';

    const nameLen = (profile.name || '').length;
    const nameTag = nameLen >= 4 ? '四字姓名，气场全开' : nameLen >= 2 ? '标准姓名' : '姓名偏短';

    const phone = profile.phone || '';
    let phoneTag = '';
    if (/8888|6666|520/.test(phone)) phoneTag = '靓号体质';
    else if (phone.endsWith('0000')) phoneTag = '整齐划一';
    else if (phone.startsWith('138')) phoneTag = '经典号段';

    const emailLen = (profile.email || '').length;
    const emailComment = emailLen > 20 ? '倒序输入量大，手指辛苦了' : emailLen > 10 ? '倒序邮箱，逻辑清晰' : '邮箱简洁，删起来也快';

    const passwordComment = /   /.test(profile.username || '')
      ? '密码含三连空格，规则教科书级理解'
      : /\p{Extended_Pictographic}/u.test(profile.username || '')
        ? '密码含 emoji，云帆 HR 陷入沉思'
        : '已满足全部奇葩密码条款';

    const avatarComment = profile.avatarHtml ? '成功组装面部，识别度存疑' : '使用默认面孔，低调入场';

    const submitCatches = log.submitCatches || 3;
    const submitComment = submitCatches >= 3 ? '三次擒拿，手速与预判俱佳' : '差点让按钮溜了';

    const debugSkips = events.filter((e) => e.type === 'debug_skip').length;
    const debugSkipNote = debugSkips > 0 ? `调试模式跳过 ${debugSkips} 项（不影响最终评级，影响良心）` : '';

    const bday = formatBirthday(profile.birthday);

    let grade = 'B';
    let title = '云帆合格公民';
    let subtitle = '完成了全部反人类流程';
    if (sec > 300 && phoneKills > 20 && captchaRounds >= 6) {
      grade = 'S'; title = '反人类注册大师'; subtitle = '您与表单搏斗良久，最终双赢（大概）';
    } else if (sec > 150 || phoneKills > 12) {
      grade = 'A'; title = '资深受难者'; subtitle = '经历过风雨，仍选择提交';
    } else if (sec < 45 && debugSkips === 0) {
      grade = 'C'; title = '快得可疑'; subtitle = '建议云帆 AI 复查您是否真是人类';
    } else if (profile.gender === '武装直升机' || profile.gender === '猫') {
      grade = 'A'; title = '个性注册选手'; subtitle = '您的性别选择已写入云帆传说';
    }

    let gradeComment = '合格的云帆公民，欢迎入坑';
    if (grade === 'S') gradeComment = '反人类注册大师，建议颁发纸质奖状（需拼图验证领取）';
    else if (grade === 'A') gradeComment = '表现优异，下次注册会更熟练（别再有下次）';
    else if (grade === 'C') gradeComment = '速度异常，系统已默默记小本本';

    const patience = Math.min(100, captchaRounds * 9 + puzzleMoves * 4 + Math.floor(sec / 6));
    const reflex = Math.min(100, phoneKills * 5 + submitCatches * 8);
    const composure = Math.max(10, 100 - timerFakeouts * 25 - Math.floor(sec / 8));
    const luck = Math.min(100, beatPercent + (phoneTag ? 15 : 0) + (debugSkips ? -10 : 5));
    const persistence = Math.min(100, Math.floor(sec / 4) + events.length);

    const stats = [
      { label: '耐心值', value: patience, color: '#6366f1' },
      { label: '手速', value: reflex, color: '#ef4444' },
      { label: '抗压', value: composure, color: '#22c55e' },
      { label: '运气', value: luck, color: '#f59e0b' },
      { label: '毅力', value: persistence, color: '#06b6d4' },
    ];

    const badges = [];
    if (phoneKills > 20) badges.push({ emoji: '🎖', label: '坦克杀手', hint: '击毁 20+ 数字坦克' });
    if (captchaRounds >= 7) badges.push({ emoji: '🤖', label: '人机难分', hint: '验证 7 轮以上' });
    if (timerFakeouts >= 2) badges.push({ emoji: '⏰', label: '计时器受害者', hint: '被吓 2 次以上' });
    if (puzzleMoves <= 3 && puzzleMoves > 0) badges.push({ emoji: '🧩', label: '拼图闪电侠', hint: '3 次内完成' });
    if (submitCatches >= getDebugSettings().submitCatches) badges.push({ emoji: '🏃', label: '按钮猎手', hint: '抓住逃跑按钮' });
    if (profile.gender === '猫') badges.push({ emoji: '🐱', label: '喵星认证', hint: '性别：猫' });
    if (debugSkips >= 3) badges.push({ emoji: '🛠', label: '调试老司机', hint: '跳过 3 项以上' });
    if (!badges.length) badges.push({ emoji: '🎫', label: '注册幸存者', hint: '成功完成注册' });

    const highlights = [
      { icon: '⏱', text: `耗时 ${durationText}，精神状况：${mentalState}` },
      { icon: '🎯', text: `综合评级 ${grade} — ${gradeComment}` },
      { icon: '📱', text: `手机号 ${phone || '—'}${phoneTag ? `（${phoneTag}）` : ''}` },
    ];
    if (bday.zodiac) highlights.push({ icon: '✨', text: `${bday.zodiac}座，${bday.age != null ? `约 ${bday.age} 岁` : '年龄成谜'}，与云帆缘分 ${luck}%` });

    const funFacts = [];
    if (profile.gender === '沃尔玛购物袋' || profile.gender === '沃尔玛塑料袋') {
      funFacts.push('系统检测到您的性别可重复使用，环保指数 +100。');
    }
    if (phone.includes('10000000000')) funFacts.push('您曾尝试全零号码，云帆默默拒绝了。');
    if (captchaRounds >= 8) funFacts.push(`您提交了 ${captchaRounds} 轮验证码，AI 怀疑您在收集 emoji 图鉴。`);
    if (sec > 360) funFacts.push('注册时长超过 6 分钟，已超过一次 TED 演讲。');
    if (events.length > 40) funFacts.push(`共产生 ${events.length} 条操作日志，键盘承受了不该承受之重。`);
    if (profile.username && profile.username.includes('   ')) funFacts.push('密码含三个连续空格，您可能是空格派传人。');
    if (funFacts.length < 2) funFacts.push('云帆 AI 认为：能填完这份表单的人，做什么都会成功的（除了快速注册）。');

    const summary = `经云帆 AI 综合分析，您在 ${durationText} 内完成了 10 项反人类验证，`
      + `产生 ${events.length} 条行为日志，最终评级 ${grade}。`
      + `${debugSkips ? '（含调试跳过，良心略减）' : '全程无作弊嫌疑（大概）。'}`;

    return {
      durationText, beatPercent, mentalState, phoneComment, captchaComment, timerComment,
      genderComment, puzzleComment, birthdayComment, emailComment, passwordComment,
      avatarComment, submitComment, debugSkipNote, grade, gradeComment, title, subtitle,
      summary, nameTag, phoneTag, stats, badges, highlights, funFacts,
    };
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s ?? '';
    return d.innerHTML;
  }

  function updateProfileUI() {
    const profile = loadProfile();
    const btn = $('#profileBtn');
    const regBtn = $('#openRegisterBtn');
    if (profile) {
      btn.classList.remove('hidden');
      regBtn.textContent = '已注册';
      renderProfileCard($('#profileCard'), profile);
    } else {
      btn.classList.add('hidden');
      regBtn.textContent = '免费注册';
    }
  }

  function toggleProfilePopover() {
    const pop = $('#profilePopover');
    const profile = loadProfile();
    if (!profile) return;
    renderProfileCard($('#profileCard'), profile);
    pop.classList.toggle('hidden');
  }

  // ── Register ──
  function openRegister() {
    if (loadProfile()) { toggleProfilePopover(); return; }
    state.registerOpen = true;
    if (!state.regLog) initRegLog();
    $('#registerOverlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (!state._timerStarted) {
      state._timerStarted = true;
      startTimer();
      initFormIfNeeded();
    }
  }

  function closeRegister() {
    state.registerOpen = false;
    $('#registerOverlay').classList.add('hidden');
    document.body.style.overflow = '';
    window._resetSubmitFlee?.();
  }

  function initFieldStepNumbers() {
    $$('#registerForm .field-card[data-field]').forEach((card, i) => {
      const header = card.querySelector('.field-header');
      const h3 = header?.querySelector('h3');
      if (!header || !h3 || header.querySelector('.field-step-num')) return;
      const num = document.createElement('span');
      num.className = 'field-step-num';
      num.textContent = String(i + 1);
      num.setAttribute('aria-hidden', 'true');
      header.insertBefore(num, h3);
    });
  }

  const LANDING_REGISTER_IDS = new Set(['openRegisterBtn', 'heroRegisterBtn', 'pricingRegisterBtn']);
  const LANDING_BYPASS_IDS = new Set(['aboutUsLink', 'aboutUsLinkFooter', 'profileBtn']);

  function showGateAlert(type) {
    const modal = $('#gateAlertModal');
    const box = modal?.querySelector('.gate-alert-modal');
    const isError = type === 'account-error';
    if (!modal || !box) return;

    box.classList.remove('gate-type-register', 'gate-type-error');
    box.classList.add(isError ? 'gate-type-error' : 'gate-type-register');

    $('#gateAlertIcon').textContent = isError ? '⛔' : '🔒';
    $('#gateAlertTitle').textContent = isError ? '账号错误' : '请先完成注册';
    $('#gateAlertMsg').textContent = isError
      ? '系统检测到当前账号状态异常，无法访问该功能。请前往个人中心注销账号后，重新完成注册。'
      : '您尚未完成注册，无法使用此功能。请先填写并完成全部注册流程。';

    const primary = $('#gateAlertPrimary');
    primary.textContent = isError ? '前往个人中心注销' : '立即去注册';
    primary.onclick = () => {
      modal.classList.add('hidden');
      if (isError) toggleProfilePopover();
      else openRegister();
    };

    modal.classList.remove('hidden');
  }

  function initGateAlert() {
    const modal = $('#gateAlertModal');
    if (!modal) return;
    $('#gateAlertClose')?.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  function initLandingGates() {
    const landing = $('#landing');
    if (!landing) return;
    landing.addEventListener('click', (e) => {
      const el = e.target.closest('a, button');
      if (!el || !landing.contains(el)) return;
      if (LANDING_REGISTER_IDS.has(el.id) || LANDING_BYPASS_IDS.has(el.id)) return;

      e.preventDefault();
      e.stopPropagation();

      if (loadProfile()) {
        showGateAlert('account-error');
      } else {
        showGateAlert('need-register');
      }
    });
  }

  function initFormIfNeeded() {
    if (state._formInited) return;
    state._formInited = true;
    initName();
    initGender();
    initCountry();
    initPhone();
    initBirthday();
    initEmail();
    initPassword();
    initCaptcha();
    initAvatar();
    initTerms();
    initDebugSkips();
    initFieldStepNumbers();
    updateDebugSkips();
    applyDebugSettings();
    updateProgress();
  }

  function resetForm() {
    const cfg = getDebugSettings();
    Object.assign(state, {
      name: [], gender: null, country: null, countryPuzzleDone: false,
      phoneConfirmed: false,
      birthday: null, email: '', password: false, captcha: false, captchaRound: 0,
      captchaRequired: cfg.captchaRequired,
      avatar: false, avatarPlaced: new Set(), terms: false, termsPage: 0, termsAgreed: new Set(),
      timerSeconds: cfg.timerSeconds, timerExpireCount: 0,
      debugSkippedFields: new Set(),
    });

    resetTankPhone?.();
    pacAvatarApi?.unmarkDebugSkipped?.();

    $('#nameSlots').innerHTML = '';
    $$('.char-btn').forEach((b) => b.classList.remove('used'));
    $('#genderResult').textContent = '移动鼠标控制挡板，点击发射小球。';
    $('#genderInput').value = '';
    $$('.country-btn').forEach((b) => b.classList.remove('selected'));
    $('#puzzleArea').classList.add('hidden');
    $('#puzzleBoard').innerHTML = '';
    puzzleState.pieces = [];

    $('#phoneDisplay').textContent = '_ _ _ _ _ _ _ _ _ _ _';
    $('#phoneHint').textContent = '';
    $('#phoneInput').value = '';
    $('#birthdayDial').innerHTML = '';
    $('#birthdayInput').value = '';
    $('#emailInput').value = '';
    $('#emailPreview').textContent = '正序预览：';
    $('#usernameInput').value = '';
    $('#passwordInput').value = '';
    $$('#passwordRules li').forEach((li) => { li.className = 'fail'; });

    $('#avatarDropzone').innerHTML = '<span class="dropzone-hint">集齐 7 个组件后拖入此区域</span>';
    $('#avatarDropzone').classList.remove('has-parts');
    $('#avatarParts').innerHTML = '';

    $$('.terms-page').forEach((p, i) => { p.style.display = i === 0 ? 'block' : 'none'; });
    state.termsPage = 0;
    $('#termsPageInfo').textContent = '第 1 / 5 页';
    $('#prevPage').disabled = true;
    $('#nextPage').disabled = false;
    $('#termsScroll').scrollTop = 0;
    $('#termsCheckbox').checked = false;
    $('#termsCheckbox').disabled = true;

    renderCaptcha();
    $('#captchaQuestion').textContent = '请完成人机验证。';
    setStatus('name', '未完成');
    setStatus('gender', '未完成');
    setStatus('country', '未完成');
    setStatus('phone', '未完成');
    setStatus('birthday', '未完成');
    setStatus('email', '未完成');
    setStatus('password', '未完成');
    setStatus('captcha', '未完成');
    setStatus('avatar', '未完成');
    setStatus('terms', '未完成');
    toast('表单已清空，请刷新页面以重置小游戏。');
  }

  // ── Timer ──
  function startTimer() {
    const block = $('#timerBlock');
    const display = $('#timerDisplay');

    setInterval(() => {
      if (!state.registerOpen) return;

      const m = Math.floor(state.timerSeconds / 60);
      const s = state.timerSeconds % 60;
      display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      block.classList.toggle('warning', state.timerSeconds <= 30 && state.timerSeconds > 0);
      block.classList.toggle('expired', state.timerSeconds <= 0);
      const hint = $('#timerHint');
      if (hint) {
        hint.textContent = state.timerSeconds <= 0
          ? '时限已到！（吓唬你的）'
          : state.timerSeconds <= 30
            ? '剩余时间不多，请抓紧！'
            : '超时将清空表单（大概）';
      }

      if (state.timerSeconds === 0) {
        state.timerExpireCount++;
        toast(state.timerExpireCount <= 2
          ? `注册时限已到！表单即将清空…（第 ${state.timerExpireCount} 次）`
          : '注册时限再次归零！表单清空程序已启动…');
        setTimeout(() => toast('…骗你的，请继续填写。数据都还在。'), 2200);
        logEvent('timer_fakeout', `第 ${state.timerExpireCount} 次时限归零`);
        state.timerSeconds = getDebugSettings().timerSeconds;
      } else {
        state.timerSeconds--;
      }
    }, 1000);
  }

  // ── 1. Name ──
  function initName() {
    const pool = ALL_CHARS.split('').sort(() => Math.random() - 0.5).slice(0, 10 + Math.floor(Math.random() * 4));
    const poolEl = $('#charPool');
    pool.forEach((ch) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'char-btn';
      btn.textContent = ch;
      btn.addEventListener('click', () => {
        if (state.name.length >= 4) { toast('姓名最多 4 个字'); return; }
        state.name.push(ch);
        btn.classList.add('used');
        renderNameSlots();
        setStatus('name', state.name.length >= 2 ? '已完成' : '字数不足');
      });
      poolEl.appendChild(btn);
    });
    $('#clearName').addEventListener('click', () => {
      state.name = [];
      $$('.char-btn').forEach((b) => b.classList.remove('used'));
      renderNameSlots();
      setStatus('name', '未完成');
    });
  }

  function renderNameSlots() {
    const el = $('#nameSlots');
    el.innerHTML = '';
    state.name.forEach((ch, i) => {
      const slot = document.createElement('div');
      slot.className = 'name-slot';
      slot.textContent = ch;
      slot.addEventListener('click', () => {
        state.name.splice(i, 1);
        $$('.char-btn').forEach((b) => { if (b.textContent === ch) b.classList.remove('used'); });
        renderNameSlots();
        setStatus('name', state.name.length >= 2 ? '已完成' : '未完成');
      });
      el.appendChild(slot);
    });
    $('#nameInput').value = state.name.join('');
  }

  // ── 2. 打砖块选性别 ──
  function initGender() {
    RegisterGames.initGenderBrick($('#genderCanvas'), {
      onDone: (g) => {
        state.gender = g;
        $('#genderInput').value = g;
        $('#genderResult').textContent = `性别砖块命中：${g}`;
        logEvent('gender_brick', g);
        setStatus('gender', '已完成');
      },
      toast,
    });
  }

  // ── 3. Country + Puzzle（精细国旗） ──
  function initCountry() {
    const sel = $('#countrySelect');
    COUNTRIES.forEach((c) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'country-btn';
      btn.textContent = c.name;
      btn.addEventListener('click', () => {
        $$('.country-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.country = c.name;
        state.countryPuzzleDone = false;
        $('#countryInput').value = c.name;
        setStatus('country', '请完成拼图');
        $('#puzzleArea').classList.remove('hidden');
        logEvent('country_select', c.name);
        loadFlagPuzzle(c);
      });
      sel.appendChild(btn);
    });
    $('#shufflePuzzle').addEventListener('click', () => {
      const c = COUNTRIES.find((x) => x.name === state.country);
      if (c) loadFlagPuzzle(c);
    });
  }

  function loadFlagPuzzle(country) {
    const off = document.createElement('canvas');
    off.width = 420; off.height = 280;
    RegisterGames.drawFlag(off.getContext('2d'), country.code, 420, 280);
    buildPuzzleFromImage(off, country.code);
  }

  function buildPuzzleFromImage(img, flagCode) {
    const board = $('#puzzleBoard');
    board.innerHTML = '';
    const pw = 420, ph = 280, cols = 3, rows = 3;
    const pieceW = 140, pieceH = Math.round(ph / 3);
    const off = document.createElement('canvas');
    off.width = pw; off.height = ph;
    off.getContext('2d').drawImage(img, 0, 0, pw, ph);

    const pieces = [];
    const expectedGroups = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const pc = document.createElement('canvas');
        pc.width = pieceW; pc.height = pieceH;
        pc.getContext('2d').drawImage(off, c * pieceW, r * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);
        const color = RegisterGames.avgColorFromCanvas(pc);
        const swapGroup = RegisterGames.computeSwapGroup(flagCode, idx, color);
        pieces.push({ correct: idx, current: 0, img: pc.toDataURL(), color, swapGroup });
        expectedGroups.push(swapGroup);
      }
    }

    const order = pieces.map((_, i) => i).sort(() => Math.random() - 0.5);
    puzzleState.pieces = pieces;
    puzzleState.expectedGroups = expectedGroups;
    puzzleState.flagCode = flagCode;

    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.className = 'puzzle-slot puzzle-cell';
      slot.dataset.idx = i;
      board.appendChild(slot);
    }

    order.forEach((pi, slotIdx) => {
      pieces[pi].current = slotIdx;
      placePuzzlePiece(board.children[slotIdx], pi, pieces[pi].img);
    });

    $$('.puzzle-cell').forEach((cell) => {
      cell.addEventListener('dragover', (e) => e.preventDefault());
      cell.addEventListener('drop', (e) => {
        e.preventDefault();
        const pi = parseInt(e.dataTransfer.getData('text/plain'));
        const sourceCell = [...board.children].find((c) => c.querySelector(`[data-piece="${pi}"]`));
        if (!sourceCell || sourceCell === cell) return;
        const targetPiece = cell.querySelector('.puzzle-piece');
        const sourceDiv = sourceCell.querySelector('.puzzle-piece');
        if (targetPiece) {
          sourceCell.appendChild(targetPiece);
          puzzleState.pieces[parseInt(targetPiece.dataset.piece)].current = parseInt(sourceCell.dataset.idx);
          sourceCell.classList.add('puzzle-slot');
        } else {
          sourceCell.classList.add('puzzle-slot');
          sourceCell.innerHTML = '';
        }
        cell.innerHTML = '';
        cell.appendChild(sourceDiv);
        cell.classList.remove('puzzle-slot');
        puzzleState.pieces[pi].current = parseInt(cell.dataset.idx);
        checkPuzzle();
      });
    });
    checkPuzzle();
  }

  function placePuzzlePiece(slot, pi, imgUrl) {
    const div = document.createElement('div');
    div.className = 'puzzle-piece';
    div.style.backgroundImage = `url(${imgUrl})`;
    div.draggable = true;
    div.dataset.piece = pi;
    div.addEventListener('dragstart', (e) => {
      div.classList.add('dragging');
      e.dataTransfer.setData('text/plain', String(pi));
    });
    div.addEventListener('dragend', () => {
      div.classList.remove('dragging');
      if (state.regLog) state.regLog.puzzleMoves++;
      logEvent('puzzle_move', '');
      checkPuzzle();
    });
    slot.innerHTML = '';
    slot.appendChild(div);
    slot.classList.remove('puzzle-slot');
  }

  function checkPuzzle() {
    if (!state.country || !puzzleState.pieces.length) return;
    const ok = puzzleState.pieces.every((p) => p.current === p.correct);
    if (ok) {
      state.countryPuzzleDone = true;
      setStatus('country', '已完成');
      logEvent('puzzle_done', state.country);
    } else {
      state.countryPuzzleDone = false;
      setStatus('country', '请完成拼图');
    }
  }

  // ── 4. 坦克大战手机号 ──
  let resetTankPhone = null;
  let tankPhoneApi = null;

  function resumePhonePlay() {
    state.debugSkippedFields.delete('phone');
    state.phoneConfirmed = false;
    $('#phoneInput').value = '';
    $('#phoneDisplay').textContent = '_ _ _ _ _ _ _ _ _ _ _';
    $('#phoneHint').textContent = '';
    updatePhoneResetUI();
    setStatus('phone', '未完成');
  }

  function initPhone() {
    tankPhoneApi = RegisterGames.initTankPhone(
      $('#tankCanvas'),
      { display: $('#phoneDisplay'), hint: $('#phoneHint') },
      {
        onDigit: (num, slot) => {
          state.debugSkippedFields.delete('phone');
          state.phoneConfirmed = false;
          updatePhoneResetUI();
          setStatus('phone', '未完成');
          if (num) $('#phoneInput').value = num;
          else $('#phoneInput').value = '';
        },
        onPlayerDeath: () => {
          state.debugSkippedFields.delete('phone');
          $('#phoneInput').value = '';
          state.phoneConfirmed = false;
          updatePhoneResetUI();
          setStatus('phone', '未完成');
        },
        onComplete: (num) => {
          state.debugSkippedFields.delete('phone');
          $('#phoneInput').value = num;
          state.phoneConfirmed = true;
          setStatus('phone', '已完成');
          updatePhoneResetUI();
          logEvent('phone_tank_complete', num);
        },
        onResumePlay: resumePhonePlay,
        toast,
        logEvent,
      },
    );
    resetTankPhone = tankPhoneApi.resetPhone;

    $('#confirmPhone').addEventListener('click', () => {
      const num = $('#phoneInput').value;
      if (!num || num.length !== 11) {
        toast('请先在坦克大战中集齐 11 位号码');
        return;
      }
      if (num === '10000000000') {
        toast('不允许使用 1 后面全 0 的号码');
        logEvent('phone_reject', '全零号码');
        return;
      }
      if (!num.startsWith('1')) {
        toast('手机号必须以 1 开头');
        return;
      }
      state.phoneConfirmed = true;
      setStatus('phone', '已完成');
      updatePhoneResetUI();
      logEvent('phone_confirm', num);
      toast('手机号已确认');
    });

    $('#resetPhone').addEventListener('click', () => {
      if (!state.phoneConfirmed && !$('#phoneInput').value) {
        toast('当前没有已确认的号码');
        return;
      }
      state.debugSkippedFields.delete('phone');
      resetTankPhone?.();
      state.phoneConfirmed = false;
      $('#phoneInput').value = '';
      setStatus('phone', '未完成');
      updatePhoneResetUI();
      toast('手机号已重置，请重新收集');
    });
  }

  // ── 5. 生日转盘拨号 ──
  function initBirthday() {
    RegisterGames.initBirthdayDial($('#birthdayDial'), {
      onDone: (date) => {
        state.birthday = date;
        $('#birthdayInput').value = date;
        setStatus('birthday', '已完成');
      },
      toast,
      logEvent,
    });
  }

  // ── 6. Email 倒序 + 随机重复字符 ──
  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function initEmail() {
    const input = $('#emailInput');
    let display = '';
    const ignoreKeys = new Set(['Shift', 'Control', 'Alt', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab', 'CapsLock']);

    function syncEmail() {
      input.value = display;
      state.emailDisplay = display;
      state.email = display.split('').reverse().join('');
      $('#emailPreview').textContent = '正序预览：' + (state.email || '（空）');
      setStatus('email', validateEmail(state.email) ? '已完成' : '格式不正确');
    }

    input.addEventListener('keydown', (e) => {
      e.preventDefault();
      if (ignoreKeys.has(e.key)) return;

      if (e.key === 'Backspace') {
        if (!display.length) return;
        display = display.slice(0, -1);
      } else if (e.key === 'Enter') {
        return;
      } else if (e.key.length === 1) {
        display += e.key;
        if (Math.random() < 0.45) {
          const extra = 1 + Math.floor(Math.random() * 2);
          for (let i = 0; i < extra; i++) display += e.key;
        }
      } else {
        return;
      }
      syncEmail();
    });
  }

  // ── 7. Password ──
  function isWeakPassword(pw) {
    if (!pw) return false;
    const lower = pw.toLowerCase();
    if (WEAK_PASSWORDS.has(lower)) return true;
    const stripped = lower.replace(/\s/g, '');
    if (WEAK_PASSWORDS.has(stripped)) return true;
    for (const w of WEAK_PASSWORDS) {
      if (w.length >= 5 && stripped === w) return true;
    }
    return false;
  }

  function initPassword() {
    const pwInput = $('#passwordInput');
    const unInput = $('#usernameInput');
    function check() {
      const pw = pwInput.value, un = unInput.value;
      const rules = {
        length: [...pw].length === 7,
        'no-upper': !/[A-Z]/.test(pw),
        'no-lower': !/[a-z]/.test(pw),
        emoji: /\p{Extended_Pictographic}/u.test(pw),
        space: /   /.test(pw),
        username: pw.length > 0 && pw === un,
        common: pw.length > 0 && !isWeakPassword(pw),
      };
      let allPass = true;
      $$('#passwordRules li').forEach((li) => {
        const pass = rules[li.dataset.rule];
        li.className = pass ? 'pass' : 'fail';
        if (!pass) allPass = false;
      });
      state.password = allPass;
      setStatus('password', allPass ? '已完成' : '未完成');
    }
    pwInput.addEventListener('input', check);
    unInput.addEventListener('input', check);
  }

  // ── 8. Captcha ──
  function initCaptcha() {
    renderCaptcha();
    $('#submitCaptcha').addEventListener('click', submitCaptcha);
  }

  function renderCaptcha() {
    const grid = $('#captchaGrid');
    grid.innerHTML = '';
    const type = CAPTCHA_TYPES[Math.floor(Math.random() * CAPTCHA_TYPES.length)];
    $('#captchaQuestion').textContent = type.q;
    const shuffled = [...CAPTCHA_EMOJIS].sort(() => Math.random() - 0.5).slice(0, 10);
    shuffled.forEach((emoji) => {
      const item = document.createElement('div');
      item.className = 'captcha-item';
      item.textContent = emoji;
      item.addEventListener('click', () => item.classList.toggle('selected'));
      grid.appendChild(item);
    });
  }

  function submitCaptcha() {
    const selected = $$('.captcha-item.selected');
    if (!selected.length) { toast('请至少选择一个图案'); return; }

    $('#captchaLoading').classList.remove('hidden');
    $('#submitCaptcha').disabled = true;

    setTimeout(() => {
      $('#captchaLoading').classList.add('hidden');
      $('#submitCaptcha').disabled = false;
      state.captchaRound++;
      logEvent('captcha_submit', `第${state.captchaRound}轮`);

      if (state.captchaRound >= state.captchaRequired) {
        state.captcha = true;
        setStatus('captcha', '已完成');
        $('#captchaQuestion').textContent = '验证完成。';
        $('#captchaGrid').innerHTML = '';
      } else {
        setStatus('captcha', '未完成');
        renderCaptcha();
      }
    }, 1500 + Math.random() * 2000);
  }

  // ── 9. 吃豆人头像 ──
  let pacAvatarApi = null;

  function resumeAvatarPlay() {
    state.debugSkippedFields.delete('avatar');
    state.avatar = false;
    state.avatarPlaced = new Set();
    const dz = $('#avatarDropzone');
    dz.innerHTML = '<span class="dropzone-hint">集齐 7 个组件后拖入此区域</span>';
    dz.classList.remove('has-parts');
    $('#avatarParts').innerHTML = '';
    setStatus('avatar', '未完成');
  }

  function avatarPartsNeeded() {
    return getDebugSettings().pacPartsNeeded;
  }

  function initAvatar() {
    let avatarPlacedCount = 0;
    pacAvatarApi = RegisterGames.initPacAvatar(
      $('#pacCanvas'),
      $('#avatarDropzone'),
      $('#avatarParts'),
      {
        onAllEaten: () => {},
        onPlaced: () => {
          const need = avatarPartsNeeded();
          if (avatarPlacedCount >= need) return;
          avatarPlacedCount++;
          if (avatarPlacedCount >= need) {
            state.debugSkippedFields.delete('avatar');
            state.avatar = true;
            setStatus('avatar', '已完成');
            logEvent('avatar_done', `已放置 ${avatarPlacedCount} 个组件`);
          }
        },
        onCaught: () => {
          if (!state.avatar && !state.debugSkippedFields.has('avatar')) return;
          resumeAvatarPlay();
        },
        onResumePlay: resumeAvatarPlay,
        toast,
      },
    );
  }

  function getAvatarHtml() {
    const dz = $('#avatarDropzone');
    if (!dz || !dz.classList.contains('has-parts')) return '';
    const clone = dz.cloneNode(true);
    clone.classList.add('profile-avatar-full');
    clone.style.width = '200px';
    clone.style.height = '200px';
    clone.querySelector('.dropzone-hint')?.remove();
    return clone.outerHTML;
  }

  // ── 10. Terms (5 pages) ──
  function initTerms() {
    const total = TERMS_PAGES.length;
    const content = $('#termsContent');
    TERMS_PAGES.forEach((page, p) => {
      const div = document.createElement('div');
      div.className = 'terms-page';
      div.dataset.page = p;
      div.style.display = p === 0 ? 'block' : 'none';
      div.innerHTML = `<h4>${page.title}</h4>` +
        page.body.map((item) =>
          `<p class="terms-${item.t}">${item.text}</p>`
        ).join('');
      content.appendChild(div);
    });

    const scroll = $('#termsScroll');
    const checkbox = $('#termsCheckbox');

    scroll.addEventListener('scroll', () => {
      checkbox.disabled = scroll.scrollTop + scroll.clientHeight < scroll.scrollHeight - 8;
    });

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) state.termsAgreed.add(state.termsPage);
      else state.termsAgreed.delete(state.termsPage);
      state.terms = state.termsAgreed.size === total;
      setStatus('terms', state.terms ? '已完成' : `${state.termsAgreed.size}/${total} 页`);
      checkbox.checked = false;
      checkbox.disabled = true;
    });

    $('#prevPage').addEventListener('click', () => { if (state.termsPage > 0) showPage(state.termsPage - 1); });
    $('#nextPage').addEventListener('click', () => {
      if (!state.termsAgreed.has(state.termsPage)) { toast('请先阅读并同意本页协议'); return; }
      if (state.termsPage < total - 1) showPage(state.termsPage + 1);
    });

    function showPage(page) {
      state.termsPage = page;
      $$('.terms-page').forEach((p) => { p.style.display = parseInt(p.dataset.page) === page ? 'block' : 'none'; });
      $('#termsPageInfo').textContent = `第 ${page + 1} / ${total} 页`;
      $('#prevPage').disabled = page === 0;
      $('#nextPage').disabled = page === total - 1;
      scroll.scrollTop = 0;
      checkbox.disabled = true;
    }
  }

  // ── Submit ──
  function initSubmit() {
    const FLEE_PAD = 8;
    const submitCatches = () => getDebugSettings().submitCatches;
    let fleeing = false;
    let catchCount = 0;
    let fleeCooldownUntil = 0;
    let lastPointer = { x: null, y: null };
    const area = () => $('#submitArea');
    const zone = () => $('#submitFleeZone');
    const btn = () => $('#submitBtn');

    function resetSubmitFlee() {
      fleeing = false;
      catchCount = 0;
      fleeCooldownUntil = 0;
      lastPointer = { x: null, y: null };
      area()?.classList.remove('fleeing');
      const b = btn();
      b?.classList.remove('fleeing');
      if (b) {
        b.style.left = '';
        b.style.top = '';
        b.textContent = '完成注册';
      }
      updateProgress();
    }

    function initFleePosition() {
      const fleeZone = zone();
      const submitBtn = btn();
      if (!fleeZone || !submitBtn) return;
      const bw = submitBtn.offsetWidth;
      const bh = submitBtn.offsetHeight;
      const zw = fleeZone.clientWidth;
      const zh = fleeZone.clientHeight;
      submitBtn.style.left = `${Math.max(FLEE_PAD, (zw - bw) / 2)}px`;
      submitBtn.style.top = `${Math.max(FLEE_PAD, (zh - bh) / 2)}px`;
    }

    function fleeSubmitBtn(pointerX, pointerY, force = false) {
      const fleeZone = zone();
      const submitBtn = btn();
      if (!fleeZone || !submitBtn) return false;

      const now = Date.now();
      if (!force && now < fleeCooldownUntil) return false;

      const rect = fleeZone.getBoundingClientRect();
      const pad = FLEE_PAD;
      const bw = submitBtn.offsetWidth;
      const bh = submitBtn.offsetHeight;
      const zw = fleeZone.clientWidth;
      const zh = fleeZone.clientHeight;
      if (zw <= bw || zh <= bh) return false;

      let curX = parseFloat(submitBtn.style.left);
      let curY = parseFloat(submitBtn.style.top);
      if (!Number.isFinite(curX) || !Number.isFinite(curY)) {
        curX = Math.max(pad, (zw - bw) / 2);
        curY = Math.max(pad, (zh - bh) / 2);
      }

      if (pointerX == null || pointerY == null) return false;

      const mx = pointerX - rect.left;
      const my = pointerY - rect.top;
      const bx = curX + bw / 2;
      const by = curY + bh / 2;
      let dx = bx - mx;
      let dy = by - my;
      const dist = Math.hypot(dx, dy);

      if (!force) {
        const cfg = getDebugSettings();
        const activateDist = Math.max(cfg.fleeActivateMinPx, Math.hypot(zw, zh) * cfg.fleeActivateRatio);
        if (dist > activateDist) return false;
      }

      if (dist < 1) {
        const angle = Math.random() * Math.PI * 2;
        dx = Math.cos(angle);
        dy = Math.sin(angle);
      } else {
        dx /= dist;
        dy /= dist;
      }

      const minX = pad;
      const maxX = zw - bw - pad;
      const minY = pad;
      const maxY = zh - bh - pad;
      const rangeW = Math.max(0, maxX - minX);
      const rangeH = Math.max(0, maxY - minY);
      const edgeThreshold = Math.max(14, Math.min(rangeW, rangeH) * 0.08);

      const atLeft = curX <= minX + edgeThreshold;
      const atRight = curX >= maxX - edgeThreshold;
      const atTop = curY <= minY + edgeThreshold;
      const atBottom = curY >= maxY - edgeThreshold;

      if (atLeft && dx < 0) dx = -dx;
      if (atRight && dx > 0) dx = -dx;
      if (atTop && dy < 0) dy = -dy;
      if (atBottom && dy > 0) dy = -dy;

      let dirLen = Math.hypot(dx, dy);
      if (dirLen < 0.01) {
        dx = zw / 2 - bx;
        dy = zh / 2 - by;
        dirLen = Math.hypot(dx, dy);
        if (dirLen < 0.01) {
          dx = atLeft ? 1 : atRight ? -1 : 0;
          dy = atTop ? 1 : atBottom ? -1 : 0;
          dirLen = Math.hypot(dx, dy) || 1;
        }
        dx /= dirLen;
        dy /= dirLen;
      } else {
        dx /= dirLen;
        dy /= dirLen;
      }

      const cfg = getDebugSettings();
      const jumpX = rangeW * cfg.fleeJumpRatio;
      const jumpY = rangeH * cfg.fleeJumpRatio;

      let nx = curX + dx * jumpX;
      let ny = curY + dy * jumpY;
      nx = Math.max(minX, Math.min(maxX, nx));
      ny = Math.max(minY, Math.min(maxY, ny));

      if (Math.abs(nx - curX) < 2 && Math.abs(ny - curY) < 2) {
        nx = curX - dx * jumpX;
        ny = curY - dy * jumpY;
        nx = Math.max(minX, Math.min(maxX, nx));
        ny = Math.max(minY, Math.min(maxY, ny));
      }

      submitBtn.style.left = `${nx}px`;
      submitBtn.style.top = `${ny}px`;
      fleeCooldownUntil = now + getDebugSettings().fleeCooldownMs;
      return true;
    }

    function tryFlee(pointerX, pointerY, force = false) {
      if (!fleeing) return;
      if (pointerX != null) lastPointer = { x: pointerX, y: pointerY };
      fleeSubmitBtn(lastPointer.x, lastPointer.y, force);
    }

    function onFleePointerMove(e) {
      tryFlee(e.clientX, e.clientY);
    }

    function beginSubmitFlee(e) {
      fleeing = true;
      catchCount = 1;
      fleeCooldownUntil = 0;
      area()?.classList.add('fleeing');
      const submitBtn = btn();
      submitBtn?.classList.add('fleeing');
      if (submitBtn) submitBtn.textContent = `抓住我！(${catchCount}/${submitCatches()})`;
      $('#submitHint').textContent = `已抓住 ${catchCount}/${submitCatches()} 次，继续点击按钮`;
      initFleePosition();
      if (e) lastPointer = { x: e.clientX, y: e.clientY };
      fleeSubmitBtn(lastPointer.x, lastPointer.y, true);
      document.addEventListener('pointermove', onFleePointerMove);
      toast(`完成注册按钮逃跑了！再抓住它 ${submitCatches() - 1} 次`);
    }

    function endFleeMotionListeners() {
      document.removeEventListener('pointermove', onFleePointerMove);
    }

    function doActualSubmit(catches = 3) {
      endFleeMotionListeners();
      if (state.regLog) {
        state.regLog.endedAt = Date.now();
        state.regLog.submitCatches = catches;
      }
      resetSubmitFlee();
      logEvent('register_success', `提交注册 · 抓住按钮 ${catches} 次`);
      const profile = {
        name: state.name.join(''),
        gender: state.gender,
        country: state.country,
        phone: $('#phoneInput').value,
        birthday: state.birthday,
        email: state.email,
        username: $('#usernameInput').value,
        avatarHtml: getAvatarHtml(),
        registeredAt: new Date().toLocaleString('zh-CN'),
        regLog: { ...state.regLog, events: [...state.regLog.events] },
      };
      profile.analysis = buildProfileAnalysis(profile);
      saveProfile(profile);
      renderProfileCard($('#successProfileCard'), profile);
      $('#successModal').classList.remove('hidden');
    }

    $('#registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if ($('#submitBtn').disabled) return;

      if (!fleeing) {
        beginSubmitFlee(e);
        return;
      }
      catchCount++;
      const need = submitCatches();
      $('#submitBtn').textContent = `抓住我！(${catchCount}/${need})`;
      if (catchCount < need) {
        $('#submitHint').textContent = `已抓住 ${catchCount}/${need} 次，继续点击按钮`;
        toast(`抓住了 ${catchCount}/${need} 次，还差 ${need - catchCount} 次`);
        tryFlee(e.clientX, e.clientY, true);
        return;
      }
      toast('抓到了！正在注册…');

      doActualSubmit(catchCount);
    });

    window._resetSubmitFlee = () => {
      endFleeMotionListeners();
      resetSubmitFlee();
    };

    function closeSuccessModal() {
      $('#successModal').classList.add('hidden');
      closeRegister();
    }

    $('#closeModal').addEventListener('click', closeSuccessModal);
    $('#closeSuccessBtn').addEventListener('click', closeSuccessModal);
    $('#successModal').addEventListener('click', (e) => {
      if (e.target.id === 'successModal') closeSuccessModal();
    });
  }

  // ── Boot ──
  function init() {
    $('#openRegisterBtn').addEventListener('click', openRegister);
    $('#heroRegisterBtn').addEventListener('click', openRegister);
    $('#pricingRegisterBtn')?.addEventListener('click', openRegister);
    $('#closeRegisterBtn').addEventListener('click', closeRegister);
    $('#profileBtn').addEventListener('click', toggleProfilePopover);
    $('#closeProfileBtn').addEventListener('click', () => $('#profilePopover').classList.add('hidden'));
    $('#deleteProfileBtn').addEventListener('click', deleteProfile);
    initLandingGates();
    initGateAlert();
    let aboutClicks = 0;
    function onAboutClick(e) {
      e.preventDefault();
      aboutClicks++;
      if (aboutClicks >= 5 && !state.debugMode) {
        state.debugMode = true;
        updateProgress();
        toast('调试模式已开启：各栏可点「跳过」；侧栏可打开「参数设置」');
      }
    }
    $('#aboutUsLink')?.addEventListener('click', onAboutClick);
    $('#aboutUsLinkFooter')?.addEventListener('click', onAboutClick);
    document.addEventListener('click', (e) => {
      const pop = $('#profilePopover');
      const btn = $('#profileBtn');
      if (!pop || pop.classList.contains('hidden')) return;
      if (pop.contains(e.target) || e.target === btn || btn?.contains(e.target)) return;
      pop.classList.add('hidden');
    });
    initSubmit();
    initDebugSettingsPanel();
    applyDebugSettings();
    updateProfileUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
