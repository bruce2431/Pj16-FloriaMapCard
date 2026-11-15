/* Floria 缩略图 · 组件树数据（唯一维护点）
   - name  = 组件点分名（@ 插入的文本，与 CLAUDE.md 组件树逐字一致）
   - mode  = 该组件在哪个界面模式可见：any / chat / work
   - sel   = iframe 内真实前端的 CSS 选择器（按序取首个命中；布局改动后自动跟随）
   - setup = 选中前在 iframe 内执行的动作（打开弹层/切页面），无则直接量
   - demo  = 拟造的虚拟使用情景：[who, text]，who = u(用户) / f(Floria) */
window.FLORIA_MAP_TREE = [
  {
    id: 'sidebar', name: 'Floria.Sidebar', mode: 'any', sel: ['#sidebar'],
    desc: '左侧栏总壳：模式切换、最近会话、work 项目与文件树都挂在这里。',
    demo: [['u', '侧栏太宽了，收窄一点。'], ['f', '已把展开宽度调窄，主区让出空间；折叠入口仍在右上角。']],
  },
  {
    id: 'mode-switch', name: 'Floria.Sidebar.ModeSwitch', mode: 'any', sel: ['#mode-switch'],
    desc: 'chat / work 两个模式的切换卡面，空位落在非当前模式一侧。',
    demo: [['u', '切到 work 模式改个文件。'], ['f', '侧栏换成项目 + 文件树，主区分两栏：编辑区与助手。']],
  },
  {
    id: 'panel-actions', name: 'Floria.Sidebar.PanelActions', mode: 'any', sel: ['.panel-actions'],
    desc: '侧栏顶栏三件套：搜索、日夜主题、折叠（work 下换成收起侧栏）。',
    demo: [['u', '白天看着刺眼，换个暗色。'], ['f', '主题已在浅色与夜晚之间翻转，所有卡片与预览页同步。']],
  },
  {
    id: 'chat-panel', name: 'Floria.Sidebar.ChatPanel', mode: 'chat', sel: ['#chat-panel'],
    desc: 'chat 模式侧栏主体：管理 tabs + 最近会话列表。',
    demo: [['u', '回到聊天模式。'], ['f', '会话列表与插件/预览入口都在这一列，点任意会话直接接上。']],
  },
  {
    id: 'mgr-tabs', name: 'Floria.Sidebar.ChatPanel.MgrTabs', mode: 'chat', sel: ['#mgr-tabs'],
    desc: '第一方卡片入口：会话 / 插件 / 预览，以及已启用的应用卡。',
    demo: [['u', '打开插件管理看看。'], ['f', '点「插件」tab，主区切到插件卡，可启停项目插件与技能。']],
  },
  {
    id: 'recent', name: 'Floria.Sidebar.ChatPanel.Recent', mode: 'chat', sel: ['#recent'],
    desc: '最近会话列表容器，含整理菜单与项目/聊天切换。',
    demo: [['u', '把会话按项目分组看。'], ['f', '点「…」选「按项目展开」，列表按项目分节，当前项目排最前。']],
  },
  {
    id: 'organize-menu', name: 'Floria.Sidebar.ChatPanel.Recent.OrganizeMenu', mode: 'chat', sel: ['#organize-pop'], setup: 'organize',
    desc: '会话整理方式：一个列表 / 按项目展开。',
    demo: [['u', '我项目多，想按项目看。'], ['f', '选「按项目展开」，每个项目一节，切换项目不改排序习惯。']],
  },
  {
    id: 'change-tab', name: 'Floria.Sidebar.ChatPanel.Recent.ChangeTab', mode: 'chat', sel: ['#mode-tabs'], setup: 'changetab',
    desc: '按项目展开后出现的「项目 / 聊天」二级切换。',
    demo: [['u', '只看聊天记录，不看项目。'], ['f', '切到「聊天」页签，列表回到按时间倒序的纯会话流。']],
  },
  {
    id: 'session-tab', name: 'Floria.Sidebar.ChatPanel.Recent.SessionTab', mode: 'chat', sel: ['#recent-body .sess-item'],
    desc: '单条会话行：标题、项目归属、置顶图钉与状态点。',
    demo: [['u', '继续上次那个改底栏的会话。'], ['f', '点会话行直接接上，右侧消息区恢复到上次的滚动位置。']],
  },
  {
    id: 'session-menu', name: 'Floria.Sidebar.ChatPanel.Recent.SessionTab.Menu', mode: 'chat', sel: ['.row-menu-pop'], setup: 'rowmenu',
    desc: '会话行右键/长按菜单：置顶、重命名、关闭。',
    demo: [['u', '这条先别关，给我钉在顶上。'], ['f', '菜单选「置顶」，会话行固定到列表最前，不受更新时间影响。']],
  },
  {
    id: 'session-pin', name: 'Floria.Sidebar.ChatPanel.Recent.SessionTab.Menu.PinTab', mode: 'work', sel: ['.row-menu-pop .rm-item[data-a="pin"]'], setup: 'wksessmenu',
    desc: '会话置顶 / 取消置顶（仅 work 侧栏会话行与 work 顶栏会话胶囊有此项）。',
    demo: [['u', '常开的那条永远放最上面。'], ['f', '置顶后行尾出现图钉，排序优先于时间。']],
  },
  {
    id: 'session-rename', name: 'Floria.Sidebar.ChatPanel.Recent.SessionTab.Menu.RenameTab', mode: 'chat', sel: ['.row-menu-pop .rm-item[data-a="rename"]'], setup: 'rowmenu',
    desc: '重命名会话。',
    demo: [['u', '这个名字太糊了，改成「底栏最近文件」。'], ['f', '弹重命名框，确认后侧栏与顶栏标题同步更新。']],
  },
  {
    id: 'session-close', name: 'Floria.Sidebar.ChatPanel.Recent.SessionTab.Menu.CloseTab', mode: 'chat', sel: ['.row-menu-pop .rm-item[data-a="close"]'], setup: 'rowmenu',
    desc: '关闭会话（只从列表移除，转录保留）。',
    demo: [['u', '清掉几条跑废的会话。'], ['f', '关闭只移除列表项，文件仍在，需要时可从头像菜单恢复。']],
  },
  {
    id: 'bubble-search', name: 'Floria.Sidebar.ChatPanel.BubbleSearch', mode: 'any', sel: ['#search-overlay'], setup: 'search',
    desc: '全局搜索浮层：会话、文件、命令、技能跨类命中。',
    demo: [['u', '搜一下「近文件」在哪儿出现过。'], ['f', '搜索浮层同时列出会话片段、命中文件与相关命令，点一条直接跳。']],
  },
  {
    id: 'work-panel', name: 'Floria.Sidebar.WorkPanel', mode: 'work', sel: ['#work-panel'],
    desc: 'work 模式侧栏：项目切换、文件/聊天/插件页签、文件树。',
    demo: [['u', '打开项目里的 src 目录。'], ['f', '文件树按自然序展开，点文件在主区只读打开。']],
  },
  {
    id: 'project-switch', name: 'Floria.Sidebar.WorkPanel.ProjectSwitch', mode: 'work', sel: ['#wk-proj-seat'],
    desc: '切换当前工作项目（数据源 = 项目列表，与底栏项目选择器同源）。',
    demo: [['u', '换到演示项目看看。'], ['f', '项目切换后文件树与聊天 tab 都限定在该项目内。']],
  },
  {
    id: 'wk-tabs', name: 'Floria.Sidebar.WorkPanel.WkTabs', mode: 'work', sel: ['.wk-tabs'],
    desc: '文件 / 聊天 / 插件三个侧栏页签，右端是新建入口。',
    demo: [['u', '看这个项目装了哪些插件。'], ['f', '点「插件」，下沉区切到插件页，列出项目技能与应用并可启停。']],
  },
  {
    id: 'file-tree', name: 'Floria.Sidebar.WorkPanel.FileTree', mode: 'work', sel: ['#wk-body'],
    desc: '项目文件树容器（自然序、广度优先，超预算截断提示）。',
    demo: [['u', '树里怎么没看到 docs？'], ['f', '文件树只列项目内真实文件；docs 在项目根下，展开即可见。']],
  },
  {
    id: 'file-tab', name: 'Floria.Sidebar.WorkPanel.FileTree.FileTab', mode: 'work', sel: ['#wk-body .wk-row'],
    desc: '文件 / 目录行：点击打开或展开，右键出操作菜单。',
    demo: [['u', '打开 CLAUDE.md。'], ['f', '主区编辑卡打开该文件，顶栏出现对应文件 pill。']],
  },
  {
    id: 'file-menu', name: 'Floria.Sidebar.WorkPanel.FileTree.FileTab.Menu', mode: 'work', sel: ['.row-menu-pop'], setup: 'workrowmenu',
    desc: '文件行右键菜单容器（在资源管理器中打开 / 重命名 / 归档·下载 / 删除）。',
    demo: [['u', '这个文件怎么操作？'], ['f', '右键文件行弹出菜单，按行类型给出可用项。']],
  },
  {
    id: 'file-reveal', name: 'Floria.Sidebar.WorkPanel.FileTree.FileTab.Menu.RevealTab', mode: 'work', sel: ['.row-menu-pop .rm-item[data-a="reveal"]'], setup: 'workrowmenu',
    desc: '在系统资源管理器中定位该文件。',
    demo: [['u', '这个文件在磁盘哪儿？'], ['f', '资源管理器打开并选中该文件。']],
  },
  {
    id: 'file-rename', name: 'Floria.Sidebar.WorkPanel.FileTree.FileTab.Menu.RenameTab', mode: 'work', sel: ['.row-menu-pop .rm-item[data-a="rename"]'], setup: 'workrowmenu',
    desc: '重命名文件或目录。',
    demo: [['u', '把 temp 目录改名。'], ['f', '改名后树上位置与已打开的编辑卡路径同步刷新。']],
  },
  {
    id: 'file-archive', name: 'Floria.Sidebar.WorkPanel.FileTree.FileTab.Menu.ArchiveTab', mode: 'work', sel: ['.row-menu-pop .rm-item[data-a="archive"]'], setup: 'workrowmenu',
    desc: '归档目录：打成 <项目根>/.achrives/<名>-<ts>.tar.gz，原目录移入 .trash/。',
    demo: [['u', '这个目录不用了，先归档留着。'], ['f', '归档包落 .achrives/，原目录移入 .trash/，树上的子树整体离场。']],
  },
  {
    id: 'file-download', name: 'Floria.Sidebar.WorkPanel.FileTree.FileTab.Menu.DownloadTab', mode: 'work', sel: ['.row-menu-pop .rm-item[data-a="download"]'], setup: 'workfilemenu',
    desc: '下载文件（仅文件行；大文件超过 50MB 会先确认）。',
    demo: [['u', '把这个导出文件下载下来。'], ['f', '走流式下载，大文件先弹确认栏，不占预览内存。']],
  },
  {
    id: 'file-delete', name: 'Floria.Sidebar.WorkPanel.FileTree.FileTab.Menu.DeleteTab', mode: 'work', sel: ['.row-menu-pop .rm-item[data-a="delete"]'], setup: 'workrowmenu',
    desc: '删除（移入 .trash/，可恢复）。',
    demo: [['u', '清掉这几个临时文件。'], ['f', '移入 .trash/ 而不是直接抹除，误删还能找回。']],
  },
  {
    id: 'wk-foot', name: 'Floria.Sidebar.WorkPanel.Foot', mode: 'work', sel: ['#wk-foot'],
    desc: '侧栏底部信息行：当前项目名与项目数。',
    demo: [['u', '现在有几个项目？'], ['f', '底部行显示当前项目与总项目数，切项目即时更新。']],
  },
  {
    id: 'chat-card', name: 'Floria.ChatCard', mode: 'any', sel: ['#session-card'],
    desc: '会话卡：消息流、角色形象、底栏输入区，是 chat 的主舞台。',
    demo: [['u', '接着聊刚才的改动。'], ['f', '会话卡保留完整消息流，工具调用折进「已处理」折叠。']],
  },
  {
    id: 'messages', name: 'Floria.ChatCard.Messages', mode: 'any', sel: ['#messages'],
    desc: '会话消息流：用户/助手消息、思考折叠、工具调用与结果、附件卡片。',
    demo: [['u', '刚才那段工具输出展开看看。'], ['f', '点开「已处理」折叠即可展开工具调用与结果。']],
  },
  {
    id: 'character', name: 'Floria.ChatCard.Character', mode: 'any', sel: ['#char'],
    desc: '角色形象：会话卡右侧/背景的 Floria 立绘。',
    demo: [['u', '形象有点挡内容。'], ['f', '形象随视图定位，不参与消息流滚动，宽度足够时贴右缘显示。']],
  },
  {
    id: 'input-bar', name: 'Floria.ChatCard.InputBar', mode: 'any', sel: ['#input-bar'],
    desc: '底栏输入区：编辑区、附件胶囊行与底部工具行。',
    demo: [['u', '输入框多行时别挤掉按钮行。'], ['f', '编辑区随内容增高，工具行固定在底栏下沿。']],
  },
  {
    id: 'cmd-btn', name: 'Floria.ChatCard.InputBar.CmdBtn', mode: 'any', sel: ['#cmd-btn'],
    desc: '「+」命令按钮：打开工具栏浮窗（命令 / 技能 / 元素 / 文件）。',
    demo: [['u', '怎么引用一个项目文件？'], ['f', '点「+」在文件分组里找到目标文件，选中即插入文件引用。']],
  },
  {
    id: 'project-seat', name: 'Floria.ChatCard.InputBar.ProjectSeat', mode: 'any', sel: ['#proj-root'],
    desc: '目标项目选择座：空态可选项目，会话态锁为只读标识。',
    demo: [['u', '这条消息落到哪个项目？'], ['f', '底栏项目座显示当前目标项目，会话建立后锁定只读。']],
  },
  {
    id: 'model-seat', name: 'Floria.ChatCard.InputBar.ModelSeat', mode: 'any', sel: ['#model-root'],
    desc: '模型·推理座：切换模型与思考等级。',
    demo: [['u', '换个模型再试。'], ['f', '点模型座切换供应商与模型，下面的推理等级同步可调。']],
  },
  {
    id: 'send-btn', name: 'Floria.ChatCard.InputBar.SendBtn', mode: 'any', sel: ['#send-btn'],
    desc: '发送钮：提交当前输入；运行中变为停止。',
    demo: [['u', '发送后想中断。'], ['f', '运行期间发送钮变停止，点击即中止当前回合。']],
  },
  {
    id: 'ctx-meter', name: 'Floria.ChatCard.InputBar.CtxMeter', mode: 'any', sel: ['#ctx-meter'],
    desc: '底栏上下文占用环：显示上下文已用百分比，点击展开用量明细面板。',
    demo: [['u', '现在上下文用了多少？'], ['f', '发送钮左侧的环形显示已用占比，点开可看各段 token 明细。']],
  },
  {
    id: 'work-space', name: 'Floria.WorkSpace', mode: 'work', sel: ['#chat-area.work'],
    desc: 'work 主区：编辑区、插件页与顶栏胶囊共用的两栏容器。',
    demo: [['u', '把编辑区拉宽一点。'], ['f', '拖分界条调整编辑区与右栏比例，栏宽按项目记住。']],
  },
  {
    id: 'editor', name: 'Floria.WorkSpace.Editor', mode: 'work', sel: ['#work-editor'], setup: 'openfile',
    desc: 'work 编辑卡（CodeMirror 6 实时渲染）：打开项目文件、可编辑、自动保存。',
    demo: [['u', '把这段改成两行。'], ['f', '编辑卡即时渲染，保存后变更卡列出增删行。']],
  },
  {
    id: 'plugins-pane', name: 'Floria.WorkSpace.PluginsPane', mode: 'work', sel: ['#wk-plugins-pane'], setup: 'plugins',
    desc: '下沉区第三态：项目插件 / 技能 / 应用管理页。',
    demo: [['u', '把用不到的技能停掉。'], ['f', '在插件页关掉该技能，底栏 @ 与「+」列表同步收起。']],
  },
  {
    id: 'topbar', name: 'Floria.WorkSpace.Topbar', mode: 'work', sel: ['#wk-topbar'],
    desc: 'work 主区顶栏：聊天胶囊、文件 pill、工具栏开关。',
    demo: [['u', '同时开两个文件来回看。'], ['f', '每个文件一枚 pill，点哪枚切哪份，编辑卡状态各自保留。']],
  },
  {
    id: 'tool-capsule', name: 'Floria.ToolCapsule', mode: 'work', sel: ['#work-preview'], setup: 'openpv',
    desc: 'work 右栏工具列总容器（预览 / 评论 / 项目卡）。',
    demo: [['u', '把右栏打开看看这个页面。'], ['f', '右栏展开，默认是项目预览页，顶部可切评论等工具。']],
  },
  {
    id: 'tool-topbar', name: 'Floria.ToolCapsule.ToolTopBar', mode: 'work', sel: ['#wk-pv-tabs'], setup: 'openpv',
    desc: '右栏顶部页签条：预览与各工具页切换。',
    demo: [['u', '切到评论。'], ['f', '点「评论」页签，右栏换成评论面板，预览帧保留在池中不重载。']],
  },
  {
    id: 'comment-card', name: 'Floria.ToolCapsule.ToolTopBar.CommentCard', mode: 'work', sel: ['#wk-cmt'], setup: 'comments',
    desc: '评论卡：对当前项目/文件留批注，人机共用同一份数据。',
    demo: [['u', '在侧栏标题上提个意见。'], ['f', '评论卡记录定位与正文，agent 也能用公开命令读到同一条。']],
  },
  {
    id: 'center-pop', name: 'Floria.CenterPop', mode: 'chat', sel: ['#rename-modal'], setup: 'rename',
    desc: '居中弹层族：重命名、风险确认、审批浮层。',
    demo: [['u', '改个名字。'], ['f', '居中弹层接管焦点，Enter 确认、Esc 取消。']],
  },
  {
    id: 'overlays', name: 'Floria.Overlays', mode: 'any', sel: ['#search-overlay', '#toast', '#drop-overlay'], setup: 'search',
    desc: '浮层族：搜索、toast、拖拽上传、图片灯箱。',
    demo: [['u', '刚保存成功了吗？'], ['f', '右下角 toast 提示保存结果，几秒后自动淡出。']],
  },
]
