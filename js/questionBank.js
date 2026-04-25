const QUESTION_BANK = [
  // 低阶：从零基础到能安全使用 AI，共 12 题，每题 2 分
  {
    id: 'L1', level: '低阶', dimension: '认识 AI', type: 'single', score: 2,
    question: 'AI 助手最常见的使用方式是什么？',
    options: ['和它对话，让它根据你的要求完成任务', '只能打开网页', '只能打印文件', '只能替代鼠标'],
    answer: '和它对话，让它根据你的要求完成任务',
    teaching: '初学者先把 AI 理解为一个可以通过对话协助你完成任务的助手。'
  },
  {
    id: 'L2', level: '低阶', dimension: '常见工具', type: 'single', score: 2,
    question: 'ChatGPT、Claude、Gemini 主要属于哪一类工具？',
    options: ['大模型 / AI 对话助手', '传统杀毒软件', '财务记账凭证', '电脑硬件'],
    answer: '大模型 / AI 对话助手',
    teaching: '这些工具常用于文本生成、资料总结、分析推理、代码辅助等任务。'
  },
  {
    id: 'L3', level: '低阶', dimension: '基础任务', type: 'multiple', score: 2,
    question: '刚开始使用 AI 时，适合先尝试哪些简单任务？',
    options: ['总结一段文字', '改写一封邮件', '整理会议纪要', '直接让 AI 接管公司全部决策'],
    answer: ['总结一段文字', '改写一封邮件', '整理会议纪要'],
    teaching: '入门阶段建议从低风险、高频、容易检查的个人效率任务开始。'
  },
  {
    id: 'L4', level: '低阶', dimension: '提示词', type: 'single', score: 2,
    question: '给 AI 下指令时，哪种说法更容易得到有用结果？',
    options: ['随便写：帮我弄一下', '说明目标、背景、要求和输出格式', '只发一个表情', '不告诉它任务'],
    answer: '说明目标、背景、要求和输出格式',
    teaching: '清晰提示词通常包含：任务目标、背景信息、限制条件、输出格式。'
  },
  {
    id: 'L5', level: '低阶', dimension: '结果校验', type: 'single', score: 2,
    question: '看到 AI 给出的答案后，最稳妥的做法是？',
    options: ['直接当作绝对正确', '根据重要程度进行检查和核实', '永远不能修改', '只看字数多不多'],
    answer: '根据重要程度进行检查和核实',
    teaching: 'AI 会出错。越重要的内容，越需要人工审核、来源核验和专业确认。'
  },
  {
    id: 'L6', level: '低阶', dimension: '安全意识', type: 'single', score: 2,
    question: '使用公开 AI 工具时，哪种行为更安全？',
    options: ['随意上传客户身份证、合同和隐私信息', '避免上传敏感隐私，必要时先脱敏', '把公司密码发给 AI', '把未公开财务数据直接粘贴进去'],
    answer: '避免上传敏感隐私，必要时先脱敏',
    teaching: '安全使用 AI 的基本原则：敏感信息不随意上传，必要时脱敏、授权、留痕。'
  },
  {
    id: 'L7', level: '低阶', dimension: '输出格式', type: 'single', score: 2,
    question: '如果你希望 AI 输出一张表格，应该怎么说？',
    options: ['只说“写一下”', '明确要求“请用表格输出，列包括问题、原因、建议”', '不告诉它格式', '只发文件名'],
    answer: '明确要求“请用表格输出，列包括问题、原因、建议”',
    teaching: '指定输出格式能显著提高结果可用性，例如表格、清单、SOP、邮件、话术。'
  },
  {
    id: 'L8', level: '低阶', dimension: '角色设定', type: 'single', score: 2,
    question: '提示词中写“你是一名资深客服培训师”的作用是什么？',
    options: ['让 AI 按指定角色和专业视角回答', '让电脑变快', '自动联网付款', '删除历史记录'],
    answer: '让 AI 按指定角色和专业视角回答',
    teaching: '角色设定可以帮助 AI 采用更合适的表达风格、专业框架和判断角度。'
  },
  {
    id: 'L9', level: '低阶', dimension: '模型边界', type: 'single', score: 2,
    question: 'AI “幻觉”指的是什么？',
    options: ['AI 可能生成看起来合理但实际错误的内容', '屏幕闪烁', '网络断开', '电脑发热'],
    answer: 'AI 可能生成看起来合理但实际错误的内容',
    teaching: 'AI 幻觉是重要风险，尤其在法律、医疗、金融、合同、数据分析中必须注意。'
  },
  {
    id: 'L10', level: '低阶', dimension: '学习路径', type: 'single', score: 2,
    question: 'AI 初学者最推荐的学习路径是？',
    options: ['先掌握基础概念，再从自己的小任务开始练习', '一开始就承诺做大型系统', '只收藏工具列表不使用', '完全不做复盘'],
    answer: '先掌握基础概念，再从自己的小任务开始练习',
    teaching: '从小任务开始，逐步沉淀提示词、模板和流程，才容易形成能力。'
  },
  {
    id: 'L11', level: '低阶', dimension: '信息输入', type: 'multiple', score: 2,
    question: '让 AI 帮你写方案前，提供哪些信息更有帮助？',
    options: ['目标客户是谁', '希望达成什么结果', '有哪些限制条件', '完全不给背景'],
    answer: ['目标客户是谁', '希望达成什么结果', '有哪些限制条件'],
    teaching: 'AI 的输出质量取决于输入质量，背景越清楚，结果越接近真实需求。'
  },
  {
    id: 'L12', level: '低阶', dimension: '基础判断', type: 'single', score: 2,
    question: '以下哪句话更符合正确的 AI 使用观？',
    options: ['AI 是辅助工具，人仍需判断和负责', 'AI 永远不会错', 'AI 只能聊天没有价值', '只要用了 AI 就一定创业成功'],
    answer: 'AI 是辅助工具，人仍需判断和负责',
    teaching: 'AI 能放大人的能力，但责任、判断和业务理解仍然属于使用者。'
  },

  // 中阶：岗位应用、场景拆解与流程化，共 12 题，每题 4 分
  {
    id: 'M1', level: '中阶', dimension: '场景选择', type: 'single', score: 4,
    question: '企业第一次尝试 AI 落地，最适合优先选择哪类场景？',
    options: ['高频、重复、低风险、容易衡量结果的任务', '完全没有数据和流程的任务', '风险最高且无法审核的任务', '老板随口提到但没人负责的任务'],
    answer: '高频、重复、低风险、容易衡量结果的任务',
    teaching: 'AI 落地应先从小切口验证价值，再逐步扩大。'
  },
  {
    id: 'M2', level: '中阶', dimension: '客服场景', type: 'single', score: 4,
    question: '要用 AI 辅助客服，第一步更应该做什么？',
    options: ['梳理高频问题、标准答案、知识库和转人工规则', '马上让 AI 独立回复所有客户', '删除客服团队', '不看历史咨询记录'],
    answer: '梳理高频问题、标准答案、知识库和转人工规则',
    teaching: '客服 AI 的基础是高质量知识库、边界规则和人工兜底。'
  },
  {
    id: 'M3', level: '中阶', dimension: '销售场景', type: 'multiple', score: 4,
    question: 'AI 可以在销售过程中辅助哪些工作？',
    options: ['整理客户画像', '生成跟进话术', '总结通话纪要', '替销售承担所有成交责任'],
    answer: ['整理客户画像', '生成跟进话术', '总结通话纪要'],
    teaching: 'AI 可以提升销售效率，但客户关系、信任建立和关键判断仍需人完成。'
  },
  {
    id: 'M4', level: '中阶', dimension: '内容营销', type: 'single', score: 4,
    question: '用 AI 做内容营销时，更专业的流程是？',
    options: ['定位人群与卖点，再生成选题、脚本、标题并人工审核', '让 AI 每天随机写一篇', '只追热点不看客户', '生成后完全不修改'],
    answer: '定位人群与卖点，再生成选题、脚本、标题并人工审核',
    teaching: '内容不是堆文字，而是围绕用户、产品、渠道和转化目标设计。'
  },
  {
    id: 'M5', level: '中阶', dimension: '数据分析', type: 'single', score: 4,
    question: '让 AI 分析销售数据前，最好先做什么？',
    options: ['说明字段含义、分析目标和判断口径', '直接发一堆乱码', '不告诉它任何背景', '只问“你怎么看”'],
    answer: '说明字段含义、分析目标和判断口径',
    teaching: '数据分析要先定义指标、口径、字段含义和业务问题。'
  },
  {
    id: 'M6', level: '中阶', dimension: '知识库', type: 'multiple', score: 4,
    question: '搭建业务知识库时，哪些资料通常有价值？',
    options: ['产品说明', '常见问题', '成交案例', '过期且错误的资料不做标注直接混入'],
    answer: ['产品说明', '常见问题', '成交案例'],
    teaching: '知识库要重视准确性、版本、分类和更新机制。'
  },
  {
    id: 'M7', level: '中阶', dimension: 'Agent 理解', type: 'single', score: 4,
    question: 'Agent 相比普通聊天机器人的关键区别是？',
    options: ['能围绕目标调用工具、执行步骤并输出结果', '字体更大', '只能讲笑话', '不能接收任务'],
    answer: '能围绕目标调用工具、执行步骤并输出结果',
    teaching: 'Agent 的核心是目标驱动、工具调用、流程执行和结果检查。'
  },
  {
    id: 'M8', level: '中阶', dimension: '流程拆解', type: 'multiple', score: 4,
    question: '把一个岗位任务改造成 AI 流程时，通常要拆成哪些部分？',
    options: ['输入材料', '处理步骤', '输出标准', '审核规则'],
    answer: ['输入材料', '处理步骤', '输出标准', '审核规则'],
    teaching: '流程化是从“会用 AI”到“能交付 AI 方案”的关键。'
  },
  {
    id: 'M9', level: '中阶', dimension: '效果衡量', type: 'single', score: 4,
    question: '判断一个 AI 小项目有没有价值，最应该看什么？',
    options: ['是否节省时间、降低错误、提升转化或改善体验', '页面是否足够炫酷', '模型名字是否最热门', '演示时声音是否好听'],
    answer: '是否节省时间、降低错误、提升转化或改善体验',
    teaching: 'AI 项目要用业务指标衡量，而不是只看展示效果。'
  },
  {
    id: 'M10', level: '中阶', dimension: '团队培训', type: 'single', score: 4,
    question: '企业做 AI 培训后，最应该沉淀什么？',
    options: ['岗位提示词库、案例库、SOP 和复盘机制', '只发一张合影', '只讲模型历史', '培训后不再使用'],
    answer: '岗位提示词库、案例库、SOP 和复盘机制',
    teaching: '培训的价值在于让能力沉淀为组织资产。'
  },
  {
    id: 'M11', level: '中阶', dimension: '工具选择', type: 'single', score: 4,
    question: '不同 AI 工具之间选择时，最合理的依据是？',
    options: ['任务类型、成本、准确性、数据安全和团队习惯', '哪个名字听起来更厉害', '只看别人推荐', '随机选择'],
    answer: '任务类型、成本、准确性、数据安全和团队习惯',
    teaching: '工具选择要服务业务目标，而不是追逐工具清单。'
  },
  {
    id: 'M12', level: '中阶', dimension: '人机协作', type: 'single', score: 4,
    question: '比较成熟的人机协作方式是？',
    options: ['AI 出初稿，人做判断、修改、校验和最终负责', '人完全不看结果', 'AI 不能参与任何工作', '只让 AI 做无意义任务'],
    answer: 'AI 出初稿，人做判断、修改、校验和最终负责',
    teaching: '成熟的 AI 工作方式是人机协同，而不是盲目信任或完全排斥。'
  },

  // 高阶：方案设计、治理与 OPC 创业，共 12 题，每题 6 分
  {
    id: 'H1', level: '高阶', dimension: '行业切入', type: 'single', score: 6,
    question: '判断一个行业是否适合 OPC 创业切入，最核心的组合因素是？',
    options: ['痛点强度、付费意愿、数据可得性、交付可复制性', '行业名称是否热门', '创始人是否喜欢 AI', '是否能做漂亮海报'],
    answer: '痛点强度、付费意愿、数据可得性、交付可复制性',
    teaching: '创业机会来自真实痛点、明确付费、可交付和可复制。'
  },
  {
    id: 'H2', level: '高阶', dimension: '客户诊断', type: 'multiple', score: 6,
    question: '给客户做 AI 诊断时，应该重点了解哪些信息？',
    options: ['当前业务流程', '关键痛点和成本', '可用数据和系统', '客户老板喜欢什么颜色'],
    answer: ['当前业务流程', '关键痛点和成本', '可用数据和系统'],
    teaching: 'AI 顾问必须先做业务诊断，再谈工具和方案。'
  },
  {
    id: 'H3', level: '高阶', dimension: '方案架构', type: 'single', score: 6,
    question: '一个企业级 AI 方案通常不应缺少哪一项？',
    options: ['业务目标、数据来源、流程设计、权限边界和效果指标', '只放模型 Logo', '只做宣传海报', '只写一句口号'],
    answer: '业务目标、数据来源、流程设计、权限边界和效果指标',
    teaching: '企业级方案必须把业务、数据、流程、治理和指标连起来。'
  },
  {
    id: 'H4', level: '高阶', dimension: '治理风险', type: 'multiple', score: 6,
    question: 'AI 系统上线前，需要考虑哪些治理机制？',
    options: ['敏感数据脱敏', '输出审核', '日志追踪', '绕过所有审批'],
    answer: ['敏感数据脱敏', '输出审核', '日志追踪'],
    teaching: '治理机制决定客户是否敢长期使用 AI 系统。'
  },
  {
    id: 'H5', level: '高阶', dimension: '商业模式', type: 'single', score: 6,
    question: 'OPC 创业者更健康的商业化路径是？',
    options: ['从小场景试点验证 ROI，再产品化模板和交付 SOP', '一开始承诺替代所有岗位', '只卖概念不交付结果', '不做复盘直接扩张'],
    answer: '从小场景试点验证 ROI，再产品化模板和交付 SOP',
    teaching: '可持续商业化需要先验证价值，再复制交付方法。'
  },
  {
    id: 'H6', level: '高阶', dimension: '组织变革', type: 'single', score: 6,
    question: '企业 AI 转型失败的常见原因是？',
    options: ['只买工具，没有流程重构、培训和指标牵引', '先做小试点', '建立知识库', '安排负责人'],
    answer: '只买工具，没有流程重构、培训和指标牵引',
    teaching: 'AI 转型不是采购工具，而是组织能力升级。'
  },
  {
    id: 'H7', level: '高阶', dimension: '交付能力', type: 'multiple', score: 6,
    question: 'OPC 交付一个 AI 项目时，哪些交付物更关键？',
    options: ['需求诊断报告', '流程图和提示词模板', '培训材料和验收指标', '没有说明的临时演示'],
    answer: ['需求诊断报告', '流程图和提示词模板', '培训材料和验收指标'],
    teaching: '顾问式交付要留下可复用、可培训、可验收的资产。'
  },
  {
    id: 'H8', level: '高阶', dimension: '模型评估', type: 'single', score: 6,
    question: '为客户选择模型时，除了效果，还应关注什么？',
    options: ['成本、稳定性、隐私安全、部署方式和可维护性', '模型名称是否流行', '发布会是否热闹', '图标是否好看'],
    answer: '成本、稳定性、隐私安全、部署方式和可维护性',
    teaching: '商业项目中的模型选择要综合性能、成本、安全和长期运营。'
  },
  {
    id: 'H9', level: '高阶', dimension: '行业模板', type: 'single', score: 6,
    question: '为什么 OPC 创业者要重视行业模板？',
    options: ['模板能把一次交付经验沉淀为可复制方案', '模板越复杂越好', '模板可以完全不更新', '有模板就不需要理解客户'],
    answer: '模板能把一次交付经验沉淀为可复制方案',
    teaching: '行业模板是规模化交付和降低边际成本的关键。'
  },
  {
    id: 'H10', level: '高阶', dimension: '风险承诺', type: 'single', score: 6,
    question: '面对客户时，哪种承诺最不专业？',
    options: ['AI 100% 不会出错，可以替代所有人工审核', '先试点再评估', '明确边界和人工复核机制', '用指标验收效果'],
    answer: 'AI 100% 不会出错，可以替代所有人工审核',
    teaching: '过度承诺会造成信任风险、合规风险和交付风险。'
  },
  {
    id: 'H11', level: '高阶', dimension: '战略洞察', type: 'single', score: 6,
    question: 'AI Agent 对企业长期竞争力最深层的影响是？',
    options: ['把隐性经验、业务流程和决策逻辑沉淀为可复制系统', '只让文案更快', '让所有行业没有差异', '减少电脑数量'],
    answer: '把隐性经验、业务流程和决策逻辑沉淀为可复制系统',
    teaching: 'Agent 的长期价值是组织经验资产化和流程智能化。'
  },
  {
    id: 'H12', level: '高阶', dimension: '创业适配', type: 'multiple', score: 6,
    question: '更适合成为 OPC 创业者的人通常具备哪些特征？',
    options: ['理解某个行业的真实痛点', '愿意持续学习 AI 工具与交付方法', '能和客户沟通并推动试点', '只想复制话术不做交付'],
    answer: ['理解某个行业的真实痛点', '愿意持续学习 AI 工具与交付方法', '能和客户沟通并推动试点'],
    teaching: 'OPC 创业者不是单纯工具玩家，而是行业理解、客户沟通和方案交付的结合体。'
  }
];
