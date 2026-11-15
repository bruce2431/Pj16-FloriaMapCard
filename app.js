/* Floria 缩略图 · 卡逻辑
   - 缩略图 = 同源 iframe 内真实前端（?demo=1 离线演示），高亮框读 iframe 内真实元素坐标 ⇒ 随布局同步
   - 人机共用同一 select()：点击组件行与 agent 命令走同一条处理链 */
(function () {
  const NS = 'floria-map-pv'
  const TREE = window.FLORIA_MAP_TREE || []
  const W = 1440
  const H = 900

  const $ = (s) => document.querySelector(s)
  const frame = $('#frame')
  const stage = $('#stage')
  const hl = $('#hl')
  const hlTag = $('#hl-tag')
  const treeEl = $('#tree')
  const missEl = $('#stage-miss')
  const pickTip = $('#pick-tip')

  const st = {
    mode: 'chat',
    selected: '',
    scale: 1,
    miss: false,
    ready: false,
    box: null,
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const raf = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const fwin = () => { try { return frame.contentWindow } catch { return null } }
  const fdoc = () => { try { return frame.contentDocument } catch { return null } }

  // ---------- 缩放 ----------
  // 以容器内容宽高为准（舞台尺寸随缩放变化，不能自引用），首次量到尺寸前保持隐藏，避免开卡闪烁跳动。
  // clientWidth/Height 已排除滚动条与边框：改用内容盒，避免「有滚动条→量小→缩小→滚动条消失→量变大」的回环
  function layout() {
    const wrap = stage.parentElement
    const cs = getComputedStyle(wrap)
    const availW = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    const availH = wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
    st.availW = availW
    st.availH = availH
    // 布局尚未成形（高度链未就绪）时先不缩放，等 ResizeObserver 下一拍
    if (!(availW > 0 && availH > 0)) return
    // 等比铺满可用区：短边受限，长边自然留白；不再把上限钉在 1，避免大窗时四周一圈空白
    const s = Math.min(availW / W, availH / H)
    if (stage.classList.contains('on') && Math.abs(s - st.scale) < 0.0005) return
    st.scale = s
    frame.style.transform = 'scale(' + s + ')'
    stage.style.width = W * s + 'px'
    stage.style.height = H * s + 'px'
    stage.classList.add('on')
    // 缩放变了，已选中的高亮框跟着重算，否则拉宽卡片后框会停在旧位置
    if (st.logicalBox) applyBox(st.logicalBox)
  }

  // ---------- 组件树 UI ----------
  // 逐级收敛：默认只露 Floria 直属子级，点父级行才展开下一级
  const EXPANDED = new Set() // 已展开的父组件点分名
  const HASKIDS = new Set()
  for (const it of TREE) {
    const segs = it.name.split('.')
    if (segs.length > 2) HASKIDS.add(segs.slice(0, -1).join('.'))
  }
  function ancestorsOf(it) {
    const segs = it.name.split('.')
    const out = []
    for (let i = 2; i < segs.length; i++) out.push(segs.slice(0, i).join('.'))
    return out
  }
  const isOpen = (it) => ancestorsOf(it).every((a) => EXPANDED.has(a))

  function renderTree() {
    const rows = TREE.filter(isOpen)
    treeEl.innerHTML = rows
      .map((it) => {
        const segs = it.name.split('.')
        const depth = segs.length - 1
        // 层级 = 点分名去掉 Floria 根后的段数；树最深六层，一列一级
        const short = segs[segs.length - 1]
        const col = depth
        const cls = (it.id === st.selected ? ' class="on"' : '')
        const caret = HASKIDS.has(it.name)
          ? '<span class="cv' + (EXPANDED.has(it.name) ? ' open' : '') + '">▸</span>'
          : '<span class="cv"></span>'
        // 每行同一套六列栅格：组件只在所属层级那一列，列与列纵向对齐
        return '<li data-id="' + it.id + '"' + cls + ' title="' + esc(it.name) + '">' +
          '<span class="cn" style="grid-column:' + col + '">' + caret +
          '<span class="n">' + esc(short) + '</span>' +
          '<span class="m">' + esc(it.mode) + '</span></span></li>'
      })
      .join('')
    // 选中项滚动可见
    const on = treeEl.querySelector('li.on')
    if (on) on.scrollIntoView({ block: 'nearest' })
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  }

  treeEl.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-id]')
    if (!li) return
    const it = TREE.find((x) => x.id === li.dataset.id)
    // 父级行：先切换本级展开，再照常选中高亮
    if (it && HASKIDS.has(it.name)) {
      if (EXPANDED.has(it.name)) EXPANDED.delete(it.name)
      else EXPANDED.add(it.name)
      renderTree()
    }
    select(li.dataset.id).catch(() => {})
  })

  // ---------- iframe 内动作 ----------
  function visibleInFrame(el) {
    if (!el) return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && el.getClientRects().length > 0
  }

  async function ensureMode(mode) {
    const m = mode === 'work' ? 'work' : 'chat'
    if (m === st.mode) return
    const doc = fdoc()
    if (!doc) return
    const btn = doc.querySelector('#mode-switch .ms-btn[data-sbmode="' + m + '"]')
    if (btn) btn.click()
    st.mode = m
    await sleep(m === 'work' ? 650 : 350)
    await raf()
  }

  // 演示帧启动态：侧栏默认收起、work 未选项目。缩略图要展示完整布局，选中前先把这两件补齐。
  // 演示帧被用户点走后（首页/管理态：会话卡整卡隐藏），所有选择器都量不到。
  // 选中组件前先拉回规范会话视图，保证「模拟态永远自洽」。
  async function ensureDemoRoute() {
    const doc = fdoc()
    const w = fwin()
    if (!doc || !w) return false
    // 判据是路由而不是 #session-card 在场：首页/管理态同样有会话卡壳，只有 /session/<id> 才有消息流
    let path = ''
    try { path = w.location.pathname } catch { path = '' }
    if (path.startsWith('/session/')) return false
    w.location.href = '/session/demo-1?demo=1'
    await sleep(1500) // 演示页静态加载 + 首屏渲染
    await raf()
    st.mode = 'chat' // 重载后页面回到默认 chat 态
    return true
  }

  async function ensureSidebar() {
    const doc = fdoc()
    if (!doc) return
    const sb = doc.querySelector('#sidebar')
    if (sb && sb.classList.contains('open')) return
    doc.querySelector('#menu-btn')?.click() // 打开并钉住（鼠标移出不会自动收）
    await sleep(320)
    await raf()
  }

  async function ensureWorkProject() {
    const doc = fdoc()
    if (!doc) return
    const lab = doc.querySelector('#wk-proj-seat .wk-proj-label')
    const cur = lab ? lab.textContent.trim() : ''
    if (cur && cur !== '选择项目') return
    doc.querySelector('#wk-proj-seat')?.click()
    for (let i = 0; i < 30; i++) {
      const row = doc.querySelector('#wk-proj-pop .pk-row')
      if (row) { row.click(); break }
      await sleep(50)
    }
    await sleep(500) // 等项目文件树拉取渲染
    await raf()
  }

  function pvOpen() {
    const doc = fdoc()
    const area = doc && doc.querySelector('#chat-area')
    return !!(area && area.classList.contains('wk-preview')) // 右栏在场真源（抽屉态下元素仍在 DOM，位置判定不可靠）
  }

  function cleanupFrame() {
    const doc = fdoc()
    if (!doc) return
    doc.querySelectorAll('.row-menu-pop').forEach((n) => n.remove())
    ;['#organize-pop', '#bubble-pop', '#search-overlay'].forEach((s) => doc.querySelector(s)?.classList.remove('show'))
    const rm = doc.querySelector('#rename-modal')
    if (rm) rm.hidden = true
  }

  function fireContext(el) {
    if (!el) return
    const r = el.getBoundingClientRect()
    el.dispatchEvent(new MouseEvent('contextmenu', {
      bubbles: true, cancelable: true, view: fwin(),
      clientX: r.left + Math.min(60, r.width / 2), clientY: r.top + r.height / 2,
    }))
  }

  async function runSetup(name) {
    const doc = fdoc()
    if (!doc) return
    if (name === 'organize') {
      doc.querySelector('#recent-more')?.click()
    } else if (name === 'changetab') {
      doc.querySelector('#recent-more')?.click()
      await sleep(80)
      doc.querySelector('.org-opt[data-mode="project"]')?.click()
    } else if (name === 'rowmenu') {
      fireContext(doc.querySelector('#recent-body .sess-item'))
      await sleep(120)
    } else if (name === 'workrowmenu' || name === 'workfilemenu') {
      // 文件树只在「文件」页签渲染：先切回该页签再右键（此前选中过会话行会停在下沉区「聊天」tab）
      doc.querySelector('.wk-tab[data-wktab="files"]')?.click()
      await sleep(250)
      // 目录行菜单 = 在资源管理器中打开 / 重命名 / 归档 / 删除（归档仅目录行有）
      // 文件行菜单 = 在资源管理器中打开 / 重命名 / 下载 / 删除（下载仅文件行有）
      const sel = name === 'workrowmenu' ? '[data-wkdir]' : '[data-wkfile]'
      fireContext(doc.querySelector('#wk-body .wk-row' + sel))
      await sleep(120)
    } else if (name === 'wksessmenu') {
      // work 侧栏「聊天」页签的会话行菜单 = 置顶 / 重命名 / 关闭（置顶仅 work 语境有）
      doc.querySelector('.wk-tab[data-wktab="chat"]')?.click()
      await sleep(350)
      fireContext(doc.querySelector('#wk-body .sess-item'))
      await sleep(120)
    } else if (name === 'search') {
      doc.querySelector('#panel-search')?.click()
    } else if (name === 'openpv') {
      if (!pvOpen()) {
        doc.querySelector('#wk-tb-tool')?.click()
        await sleep(500)
        await raf()
      }
      // 工具页（评论等）在场时预览体是隐藏的，必须回到预览页签才量得到
      const pvTab = doc.querySelector('#wk-pv-tabs [data-wkcard], #wk-pv-tabs [data-wkpv=""]')
      if (pvTab && !pvTab.classList.contains('on')) {
        pvTab.click()
        await sleep(450)
        await raf()
      }
    } else if (name === 'comments') {
      if (!pvOpen()) {
        doc.querySelector('#wk-tb-tool')?.click()
        await sleep(500)
        await raf()
      }
      const cmTab = doc.querySelector('#wk-pv-tabs [data-wkpv="comments"]')
      if (cmTab && !cmTab.classList.contains('on')) cmTab.click()
      await sleep(300)
    } else if (name === 'plugins') {
      doc.querySelector('[data-wkplugins]')?.click()
      await sleep(350)
    } else if (name === 'openfile') {
      // 同 workrowmenu：切回「文件」页签，编辑卡才会被文件行点击打开
      doc.querySelector('.wk-tab[data-wktab="files"]')?.click()
      await sleep(250)
      doc.querySelector('#wk-body .wk-row[data-wkfile]')?.click()
      await sleep(450)
    } else if (name === 'rename') {
      fireContext(doc.querySelector('#recent-body .sess-item'))
      await sleep(120)
      doc.querySelector('.row-menu-pop .rm-item[data-a="rename"]')?.click()
      await sleep(180)
    }
  }

  // ---------- 测量与高亮 ----------
  function measure(it) {
    const doc = fdoc()
    if (!doc) return null
    for (const sel of it.sel || []) {
      let el = null
      try { el = doc.querySelector(sel) } catch { el = null }
      if (el && visibleInFrame(el)) {
        const r = el.getBoundingClientRect()
        return { x: r.left, y: r.top, w: r.width, h: r.height, sel }
      }
    }
    return null
  }

  // 框位按当前缩放落到 DOM；缩放变了只需用同一份逻辑坐标重画，不必重新测量
  function applyBox(box) {
    if (!box) {
      hl.hidden = true
      st.box = null
      return
    }
    const s = st.scale
    hl.hidden = false
    hl.style.left = box.x * s + 'px'
    hl.style.top = box.y * s + 'px'
    hl.style.width = box.w * s + 'px'
    hl.style.height = box.h * s + 'px'
    st.box = { x: box.x * s, y: box.y * s, w: box.w * s, h: box.h * s, sel: box.sel }
  }

  function paint(box, name) {
    st.logicalBox = box || null
    if (box) hlTag.textContent = name
    applyBox(st.logicalBox)
  }

  // ---------- 帧内点击：弹组件名 + 同步高亮 ----------
  function depthOf(el) {
    let d = 0
    while (el) { d++; el = el.parentElement }
    return d
  }

  // 命中最深的组件（外层容器也命中时取最内层）
  function componentAt(target) {
    const doc = fdoc()
    if (!doc || !target) return null
    let best = null
    let bestD = -1
    for (const it of TREE) {
      for (const sel of it.sel || []) {
        let el = null
        try { el = doc.querySelector(sel) } catch { el = null }
        if (!el || !(el === target || el.contains(target))) continue
        const d = depthOf(el)
        if (d > bestD) { bestD = d; best = { it, el } }
      }
    }
    return best
  }

  let tipTimer = 0
  function showTip(name, cx, cy) {
    const s = st.scale
    pickTip.textContent = name
    pickTip.hidden = false
    pickTip.style.left = cx * s + 'px'
    pickTip.style.top = cy * s + 'px'
    clearTimeout(tipTimer)
    tipTimer = setTimeout(() => { pickTip.hidden = true }, 2400)
  }

  // 点击只是查看：不改模式、不重跑 setup，避免把用户刚点开的界面收回去
  async function adopt(it, el) {
    st.selected = it.id
    st.miss = false
    renderTree()
    const r = el.getBoundingClientRect()
    paint({ x: r.left, y: r.top, w: r.width, h: r.height, sel: 'click' }, it.name)
    missEl.hidden = true
    await raf()
    const box = measure(it)
    if (box) paint(box, it.name)
  }

  // 未命中组件树的深层元素回落到自身 id/class，点哪都能知道它叫什么
  function elLabel(el) {
    if (!el || el.nodeType !== 1) return ''
    if (el.id) return '#' + el.id
    const cls = String(el.className || '').trim().split(/\s+/)[0]
    return cls ? el.tagName.toLowerCase() + '.' + cls : el.tagName.toLowerCase()
  }

  function onFrameClick(e) {
    const hit = componentAt(e.target)
    const name = hit ? hit.it.name : elLabel(e.target)
    if (!name) return
    showTip(name, e.clientX, e.clientY)
    if (hit) adopt(hit.it, hit.el).catch(() => {})
  }

  let boundDoc = null
  function bindFrame() {
    const doc = fdoc()
    if (!doc || doc === boundDoc) return
    boundDoc = doc
    doc.addEventListener('click', onFrameClick, true)
  }

  async function select(id) {
    const it = TREE.find((x) => x.id === id)
    if (!it) throw new Error('未知组件 ' + id)
    for (const a of ancestorsOf(it)) EXPANDED.add(a) // 选中项所在链路自动展开
    await ensureDemoRoute()
    await ensureMode(it.mode)
    await ensureSidebar()
    if (st.mode === 'work') await ensureWorkProject()
    cleanupFrame()
    await raf()
    if (it.setup) await runSetup(it.setup)
    await raf()
    // 预览帧等异步挂载：轮询等选择器命中，最多约 2s
    let box = measure(it)
    for (let i = 0; i < 10 && !box; i++) {
      await sleep(200)
      await raf()
      box = measure(it)
    }
    st.miss = !box
    st.selected = it.id
    renderTree()
    paint(box, it.name)
    missEl.hidden = !!box
    if (!box) missEl.textContent = '「' + it.name + '」当前未在界面上显形（其选择器未命中或需要交互后才能出现）。布局改动后如持续如此，请修 data.js 的 sel。'
    return snapshot()
  }

  function snapshot() {
    return {
      mode: st.mode,
      selected: st.selected,
      total: TREE.length,
      scale: Number(st.scale.toFixed(3)),
      availW: Math.round(st.availW || 0),
      availH: Math.round(st.availH || 0),
      miss: st.miss,
      box: st.box,
      ready: st.ready,
    }
  }

  // ---------- 卡片公开 API ----------
  const HANDLERS = Object.create(null)
  const CMDS = []
  function api(name, fn) { HANDLERS[name] = fn; if (!CMDS.includes(name)) CMDS.push(name) }
  const send = (m) => { try { parent.postMessage(m, '*'); return true } catch { return false } }
  const event = (ev, data) => send({ type: NS + '-event', ev, ...(data || {}) })

  api('state', () => snapshot())
  api('locate', () => snapshot().box)
  api('open', async (a) => {
    if (!a || !a.id) throw new Error('缺少 id')
    return await select(String(a.id))
  })
  api('close', () => {
    st.selected = ''
    st.miss = false
    pickTip.hidden = true
    paint(null)
    missEl.hidden = true
    renderTree()
    return snapshot()
  })
  api('mode', async (a) => {
    const m = a && a.mode
    if (m !== 'chat' && m !== 'work') throw new Error('mode 必须是 chat/work')
    await ensureMode(m)
    return snapshot()
  })
  api('list', () => {
    const doc = fdoc()
    return TREE.map((it) => {
      let hit = false
      if (doc) {
        for (const sel of it.sel || []) {
          let el = null
          try { el = doc.querySelector(sel) } catch { el = null }
          if (el && visibleInFrame(el)) { hit = true; break }
        }
      }
      return { id: it.id, name: it.name, mode: it.mode, setup: it.setup || '', visibleNow: hit }
    })
  })
  api('scroll', (a) => {
    const i = Number(a && a.index)
    if (!Number.isFinite(i) || i < 0 || i >= TREE.length) throw new Error('index 越界')
    const li = treeEl.querySelectorAll('li')[i]
    if (li) li.scrollIntoView({ block: 'center' })
    return { index: i, id: TREE[i].id }
  })

  addEventListener('message', (e) => {
    if (e.source !== parent) return
    const d = e.data
    if (!d) return
    if (d.type === 'floria-wk-card-init') return // 无上下文可校正，幂等空操作
    if (d.type !== NS + '-cmd') return
    const h = HANDLERS[d.cmd]
    if (!h) return event('ack', { cmd: d.cmd, ok: false, error: '未注册的命令 ' + d.cmd })
    Promise.resolve().then(() => h(d)).then(
      (result) => event('ack', { cmd: d.cmd, ok: true, result: result ?? null }),
      (err) => event('ack', { cmd: d.cmd, ok: false, error: String((err && err.message) || err) }),
    )
  })

  // ---------- 启动 ----------
  window.addEventListener('resize', layout)
  new ResizeObserver(layout).observe(stage.parentElement)
  renderTree()
  layout()

  let readySent = false
  function announce() {
    if (readySent) return
    readySent = true
    st.ready = true
    layout()
    event('ready', { ns: NS, cmds: CMDS, state: snapshot() })
  }
  frame.addEventListener('load', () => {
    layout()
    bindFrame()
    setTimeout(announce, 700) // 真实前端 boot（演示数据 + 首屏渲染）后再申报就绪
  })
  if (frame.contentDocument && frame.contentDocument.readyState === 'complete') {
    bindFrame()
    setTimeout(announce, 700)
  }

  // 演示用的初始选中：底栏所在主舞台会话卡
  setTimeout(() => { select('chat-card').catch(() => {}) }, 1400)
})()
