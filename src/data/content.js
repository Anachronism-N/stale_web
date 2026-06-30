const IMG = (n) => `/images/img_${n}.png`;
let _cid = 1;
const cid = () => `cb${_cid++}`;
const t = (name, desc) => ({ id: 't' + (Date.now().toString(36) + Math.random().toString(36)).slice(2), name, desc });
const m = (name, tag, tagColor, desc) => ({ id: 'm' + (Date.now().toString(36) + Math.random().toString(36)).slice(2), name, tag, tagColor, desc: desc || '' });

/* ============================================
   新版内容块数据结构
   每个 section 的 content 是 [{id, type, data}] 数组
   type: paragraph | heading | image | list | table | terms | models | divider | attachment
   ============================================ */

const blocks = [
  {
    id: 'block-1', title: '核心专业名词',
    subtitle: '30+ 核心术语，覆盖基础架构 / 多模态 / 生成模型 / 训练对齐 / 语音交互 / 评测工程',
    icon: 'BookOpen', color: '#58a6ff',
    sections: [
      { id: 'b1-s1', title: '基础架构', content: [{ id: cid(), type: 'terms', data: { terms: [t('Transformer', '大模型统一底层架构'), t('ViT', 'Vision Transformer，图像分块编码为视觉 token'), t('Cross-Attention', '跨模态对齐核心，图文/音视频特征交互，上下文连接')] } }] },
      { id: 'b1-s2', title: '多模态核心', content: [{ id: cid(), type: 'terms', data: { terms: [t('VLM', '视觉语言大模型，看图理解、问答、推理'), t('VLA', 'Vision-Language-Action，视觉-语言-动作模型'), t('CLIP', '图文对比学习，多模态对齐底座'), t('BLIP-2', '高效跨模态桥接，冻结 LLM 训适配器'), t('Omni', '原生全模态，统一文本/图像/语音/视频输入输出')] } }] },
      { id: 'b1-s3', title: '生成模型', content: [{ id: cid(), type: 'terms', data: { terms: [t('Diffusion', '扩散模型，文生图/视频主流技术'), t('DiT', 'Transformer 取代 U-Net，新一代扩散架构（主流）'), t('VAE', '图像压缩编码，降显存、提速度'), t('ControlNet', '生成控制模块，姿态/边缘/参考图约束'), t('Transfusion', '统一 AR 语言建模 + Diffusion 视觉生成')] } }] },
      { id: 'b1-s4', title: '训练与对齐', content: [{ id: cid(), type: 'terms', data: { terms: [t('SFT', '监督指令微调，让模型遵循指令'), t('RLHF', '人类反馈强化学习，偏好对齐'), t('DPO', '直接偏好优化，当前主流首选'), t('GRPO/RLVR/KTO', '新一代偏好对齐，更快更稳'), t('LoRA/QLoRA', '低秩适配，轻量微调、省显存')] } }] },
      { id: 'b1-s5', title: '语音与交互', content: [{ id: cid(), type: 'terms', data: { terms: [t('ASR', '语音→文本'), t('TTS', '文本→语音'), t('Codec', '音频 token 化，融入大模型'), t('VAD', '人声检测，控制识别起止'), t('Full-Duplex', '全双工，可打断、流式对话')] } }] },
      { id: 'b1-s6', title: '评测与工程', content: [{ id: cid(), type: 'terms', data: { terms: [t('Hallucination', '幻觉，图文不符、无中生有'), t('MMBench/MMMU', '多模态综合理解基准'), t('TextVQA/DocVQA/ChartQA', 'OCR/文档/图表评测'), t('POPE', '幻觉检测标准')] } }] },
    ],
  },
  {
    id: 'block-2', title: '训练全流程',
    subtitle: '数据构建 → 预训练 → Mid-train → 后训练 SFT → 强化学习 → Infra 加速',
    icon: 'Layers', color: '#a371f7',
    sections: [
      { id: 'b2-s1', title: '1. 模态数据构建', content: [{ id: cid(), type: 'list', data: { items: ['数据源采集：Data提供', '数据清洗：去重、过滤低质/违规数据', '跨模态对齐：图片、文本、视频帧语音↔文本一一配对', '格式标准化：图片统一尺寸、音频统一采样率', '分层划分：预训练大语料、微调小样本、评测测试集隔离'] } }, { id: cid(), type: 'paragraph', data: { html: '🎯 <b>目的：</b>给模型提供海量异构跨模态原材料，决定模型上限（数据质量 > 模型结构）。' } }] },
      { id: 'b2-s2', title: '2. 预训练（Pre-train）', content: [{ id: cid(), type: 'list', data: { items: ['用海量数据做自监督训练：图文匹配（CLIP）、掩码图像/文本重构', '冻结/联合训练视觉编码器+文本LLM主干', '超大batch、多卡分布式训练，拟合通用世界知识'] } }, { id: cid(), type: 'paragraph', data: { html: '🎯 <b>目的：</b>让模型学习通用跨模态基础知识、常识、空间语义、语言逻辑。' } }] },
      { id: 'b2-s3', title: '3. Mid-train（中期训练）', content: [{ id: cid(), type: 'list', data: { items: ['混合优质通用文本及数学、代码、长文本专项数据，重在提升模型基础能力'] } }, { id: cid(), type: 'paragraph', data: { html: '🎯 <b>目的：</b>提升推理、代码能力，扩容上下文，修复预训练缺陷。' } }] },
      { id: 'b2-s4', title: '4. 后训练（SFT 监督微调）', content: [{ id: cid(), type: 'list', data: { items: ['人工精标小批量高质量指令样本', '用指令数据集微调预训练大模型', '按需专项微调'] } }, { id: cid(), type: 'paragraph', data: { html: '🎯 <b>目的：</b>精准跟随用户指令，消除预训练模型答非所问、输出混乱问题。' } }] },
      { id: 'b2-s5', title: '5. 强化学习（RLHF/RLAIF）', content: [{ id: cid(), type: 'list', data: { items: ['Reward模型训练：人工打分排序', 'PPO强化迭代', '多模态专项优化：减少图文幻觉'] } }, { id: cid(), type: 'paragraph', data: { html: '🎯 <b>目的：</b>大幅降低图文幻觉，回答更严谨、逻辑性更强。' } }] },
      { id: 'b2-s6', title: '6. Infra 算力工程加速', content: [{ id: cid(), type: 'list', data: { items: ['训练侧：分布式集群、张量并行、混合精度', '推理侧：模型量化、KV Cache优化', '配套：调度框架、存储加速'] } }, { id: cid(), type: 'paragraph', data: { html: '🎯 <b>目的：</b>降低训练/推理成本，同等卡数周期缩短30%~70%。' } }] },
    ],
  },
  {
    id: 'block-3', title: '技术路线与方向',
    subtitle: 'Image/Video / 语音 / 3D / 世界模型 / 强化学习 — 主流路线与第一梯队',
    icon: 'Cpu', color: '#f778ba',
    sections: [
      { id: 'b3-s1', title: '多模态理解与生成',
        content: [
          { id: cid(), type: 'image', data: { src: IMG(7), caption: '' } },
          { id: cid(), type: 'heading', data: { html: 'Image/Video', level: 3 } },
          { id: cid(), type: 'paragraph', data: { html: '图片、视频、音频等生成都是基于 DiT 框架。DiT 把整张图切成小方块，全部排成 token，互相串门（自注意力），带上文字提示和时间参数，一点点擦掉噪声出图。' } },
          { id: cid(), type: 'models', data: { models: [m('Sora', '闭源顶流', 'red', '时空 VAE + 时空 DiT + 统一 Patch 建模'), m('Runway Gen-3', '闭源顶流', 'red'), m('快手 Kling', '闭源顶流', 'red'), m('CogVideoX', '开源SOTA', 'green'), m('Open-Sora', '开源SOTA', 'green'), m('HunyuanVideo', '开源SOTA', 'green')] } },
          { id: cid(), type: 'table', data: { headers: ['代表公司', '核心模型', '核心优势'], rows: [['字节跳动、快手', 'Seedance、可灵Kling', '综合画质国内第一，人物动态突出'], ['阿里、百度、腾讯', '通义视频/文心/混元', '短高清视频能力成熟']] } },
          { id: cid(), type: 'heading', data: { html: '语音多模态（ASR + TTS + Audio-LLM）', level: 3 } },
          { id: cid(), type: 'list', data: { items: ['语音理解：ASR 语音转文字，语音生成：TTS 文字转语音', '语音对话：Omni（全双工：音+文+图像一体化输入输出）', '统一 Token 化：文本 + 图像 Patch + 语音 Codec → 同一序列', '流式全双工：实时打断、低延迟 < 300ms'] } },
          { id: cid(), type: 'models', data: { models: [m('GPT-4o', '闭源顶流', 'red'), m('Gemini 3.1 Omni', '闭源顶流', 'red'), m('Qwen3.5-Omni', '开源SOTA', 'green'), m('混元 Omni', '国产头部', 'yellow'), m('豆包 Omni', '国产头部', 'yellow')] } },
          { id: cid(), type: 'heading', data: { html: '3D 生成（文生3D / 图生3D / 重建）', level: 3 } },
          { id: cid(), type: 'terms', data: { terms: [t('3D 理解', '识别 3D 结构、姿态、空间关系、材质、尺寸'), t('3D 生成', '直接产出 3D 几何 / 结构 / 模型'), t('3D 重建', '从已有 2D 画面还原真实三维空间结构')] } },
          { id: cid(), type: 'heading', data: { html: '世界模型（World Model）', level: 3 } },
          { id: cid(), type: 'list', data: { items: ['视频生成模拟器（Sora路线）：视频 DiT 学物理规律', '潜空间预测（JEPA路线）：自监督学习隐状态预测', '3D结构 + 物理仿真：重建稳定 3D 环境', '趋势：更懂真实物理、LLM+世界模型双结合'] } },
          { id: cid(), type: 'models', data: { models: [m('OpenAI（Sora）', '视频生成', 'purple', '主打画面逼真'), m('Google（Genie）', '机器人RL', 'purple', '适合机器人'), m('Meta（JEPA）', '抽象理解', 'purple', '专攻因果规律'), m('英伟达（Cosmos）', '对象中心', 'purple', '适合自动驾驶')] } },
          { id: cid(), type: 'heading', data: { html: '强化学习', level: 3 } },
          { id: cid(), type: 'paragraph', data: { html: '偏预言进行强化训练，期望实现自动进行监督学习和偏好对齐，可用于3D生成、世界模型等。' } },
        ],
      },
    ],
  },
  {
    id: 'block-4', title: '大模型架构',
    subtitle: '神经网络传播机制 / 梯度下降 / 过拟合 / 矩阵加速 / Transformer 核心原理',
    icon: 'Network', color: '#3fb950',
    sections: [
      { id: 'b4-s1', title: '神经网络传播机制', content: [{ id: cid(), type: 'image', data: { src: IMG(5), caption: '' } }, { id: cid(), type: 'image', data: { src: IMG(3), caption: '' } }, { id: cid(), type: 'image', data: { src: IMG(1), caption: '' } }, { id: cid(), type: 'terms', data: { terms: [t('前向传播', '分步骤进行，通过 x 算出'), t('反向传播', '计算损失函数关于每个参数的梯度')] } }] },
      { id: 'b4-s2', title: '计算神经网络的参数', content: [{ id: cid(), type: 'terms', data: { terms: [t('梯度下降', '调整 w、b 使损失函数减小'), t('链式法则', '各层间关系较简单，从输入层到隐藏层到传输层')] } }] },
      { id: 'b4-s3', title: '模型泛化能力和过拟合问题', content: [{ id: cid(), type: 'image', data: { src: IMG(9), caption: '' } }, { id: cid(), type: 'terms', data: { terms: [t('泛化能力', '模型在新数据上的预测能力'), t('过拟合', '模型在训练集效果好，新数据预测不准')] } }, { id: cid(), type: 'list', data: { items: ['原因：模型过于复杂，学习到训练数据中的噪声', '数据和模型：数据量增大/简化模型/数据增强', '训练过程：抑制参数增长，提前结束', 'Dropout：训练中随机丢弃部分参数'] } }, { id: cid(), type: 'image', data: { src: IMG(8), caption: '' } }, { id: cid(), type: 'image', data: { src: IMG(6), caption: '' } }] },
      { id: 'b4-s4', title: '网络训练加速与运算优化', content: [{ id: cid(), type: 'image', data: { src: IMG(4), caption: '' } }, { id: cid(), type: 'image', data: { src: IMG(2), caption: '' } }, { id: cid(), type: 'terms', data: { terms: [t('矩阵运算加速', '神经网络以矩阵运算为核心，可利用GPU并行计算'), t('CNN卷积运算优化', '卷积运算转化为矩阵计算，大幅减少计算量')] } }] },
      { id: 'b4-s5', title: 'Transformer 核心原理', content: [{ id: cid(), type: 'paragraph', data: { html: 'Transformer核心是注意力机制，可捕捉上下文关联，解决梯度消失问题：' } }, { id: cid(), type: 'terms', data: { terms: [t('词嵌入', '将文字转为向量'), t('位置编码', '给词向量添加位置信息'), t('Q/K/V向量', 'Q、K计算词语相似度，V存储原始特征'), t('多头注意力', '多组权重并行学习，多角度捕捉上下文')] } }, { id: cid(), type: 'image', data: { src: IMG(10), caption: '' } }] },
    ],
  },
  {
    id: 'block-5', title: '行业发展与看法',
    subtitle: 'Image/Video / Agent / 3D / 语音 / 世界模型 / 强化学习 / VLA / 具身',
    icon: 'TrendingUp', color: '#d29922',
    sections: [
      { id: 'b5-s1', title: 'Image/Video', content: [{ id: cid(), type: 'paragraph', data: { html: '视频 RL 落地难度较高：模型动态能力提升的同时画面画质会明显下降。业内现阶段更偏向 OPD 自蒸馏，而非 GRPO。大模型 SFT 与 RL 的边界也在不断模糊。' } }] },
      { id: 'b5-s2', title: 'Agent', content: [{ id: cid(), type: 'paragraph', data: { html: '多模态领域里 Domo coding、网页检索类 Agent 落地实用任务时，仅靠单轮推理无法达成效果，需要依托 Agent 运行环境，配合工具调用和环境交互迭代完成训练与执行。' } }] },
      { id: 'b5-s3', title: '3D', content: [{ id: cid(), type: 'list', data: { items: ['现存现状：主流3D模型仍依托2D思维构建', '未来趋势：2D投影到3D，2D资产数据量大且成本低'] } }] },
      { id: 'b5-s4', title: '语音', content: [{ id: cid(), type: 'list', data: { items: ['Audio比较局限，Omni更本质一些', '语音音色克隆基本完成，难点在情绪控制'] } }] },
      { id: 'b5-s5', title: '世界模型', content: [{ id: cid(), type: 'list', data: { items: ['更强调稳定性和反馈，是视频模型的拓展', '难点：数据权重更大，算法难点也有'] } }] },
      { id: 'b5-s6', title: '强化学习', content: [{ id: cid(), type: 'paragraph', data: { html: '当前训练范式存在泛化性差的问题，模型难以理解物理法则，未来可能结合世界模型。' } }] },
      { id: 'b5-s7', title: 'VLA', content: [{ id: cid(), type: 'list', data: { items: ['VLA 与世界模型现阶段性能相近，核心瓶颈是推理速度慢', '原因：基础底座模型体量过大，算法冗余', '优化方向：精简算法逻辑，流式推理、KV 缓存提速', 'VLA后续可变成Agent的skill，距离落地还有距离'] } }] },
      { id: 'b5-s8', title: '具身', content: [{ id: cid(), type: 'paragraph', data: { html: '未来落地场景工业需求较少，家庭内部需求比较大。' } }] },
    ],
  },
  {
    id: 'block-6', title: '论文分区指南',
    subtitle: 'CCF 分级 + SCI 分区，会议高于期刊',
    icon: 'GraduationCap', color: '#f85149',
    intro: '会议高于期刊，SCI只评期刊，CCF评会议加期刊。',
    sections: [
      { id: 'b6-s1', title: 'CCF 分级',
        content: [
          { id: cid(), type: 'list', data: { items: ['CCF A顶会：顶尖突破，天花板成果', 'CCF B顶会 / T1期刊：优质高水平', 'CCF C会议 / T2期刊：达标优质', 'T3期刊：基础合格，保底成果'] } },
          { id: cid(), type: 'table', data: { headers: ['等级', '档次', '难度', '应用场景', '代表会议/期刊'], rows: [['CCF A类', '顶会', '极高 10%~20%', '顶级硬核成果', 'NeurIPS、ICML、CVPR、KDD'], ['CCF B类', '中高', '20%~35%', '硕博毕业', 'ECCV、IJCAI、ICDE'], ['CCF C类', '中等', '35%~50%', '基础毕业', '各领域专项国际会议'], ['CCF T1期刊', '高', '高', '硕博优质毕业', '国际顶级权威期刊'], ['CCF T2期刊', '中等', '中等', '毕业/评奖', '核心优质中外期刊']] } },
        ],
      },
      { id: 'b6-s2', title: 'SCI 分区',
        content: [
          { id: cid(), type: 'paragraph', data: { html: '注意：JCR Q1 ≠ 中科院1区；中科院1区含金量远高于JCR Q1' } },
          { id: cid(), type: 'table', data: { headers: ['体系', '等级', '比例', '认可度'], rows: [['中科院', '1区（Top）', '前5%', '最高标准'], ['中科院', '2区', '6%~20%', '硕博毕业'], ['中科院', '3区', '21%~50%', '基础达标'], ['中科院', '4区', '51%~100%', '入门保底'], ['JCR', 'Q1', '前25%', '海外留学'], ['JCR', 'Q2', '25%~50%', '国际认可'], ['JCR', 'Q3', '50%~75%', '认可一般'], ['JCR', 'Q4', '75%~100%', '偏低']] } },
        ],
      },
    ],
  },
  {
    id: 'block-7', title: '模型学习笔记',
    subtitle: 'Seedance 2.0 / Seedream 5.0 Lite / Seed3D 2.0',
    icon: 'FileText', color: '#58a6ff',
    sections: [
      { id: 'b7-s1', title: 'Seedance 2.0', date: '2026.2.12',
        content: [
          { id: cid(), type: 'heading', data: { html: '研究背景与现存痛点', level: 3 } },
          { id: cid(), type: 'list', data: { items: ['多数模型仅支持文本单条件输入，多图/多视频参考约束能力弱', '长视频帧间一致性差、人物形变', '音频多为后期拼接，同步精度低', '缺少视频续写、局部修改等编辑能力'] } },
          { id: cid(), type: 'heading', data: { html: '整体架构（双分支解耦扩散 DiT）', level: 3 } },
          { id: cid(), type: 'list', data: { items: ['语义先验分支：统一编码文本、图片、参考视频、音频', '时空动态分支：3D 卷积增强 Shift-ViT，建模帧间运动', '跨分支门控注意力 CBGA：动态融合两路特征', '原生音视频联合建模：毫秒级对齐'] } },
          { id: cid(), type: 'heading', data: { html: '评测结论', level: 3 } },
          { id: cid(), type: 'list', data: { items: ['文生视频、图生视频、参考视频复刻综合指标全部 SOTA', '对比 Seedance 1.5 Pro、Kling 2.6、Sora 2 Pro 全面超越'] } },
        ],
      },
      { id: 'b7-s2', title: 'Seedream 5.0 Lite', date: '2026.2.13',
        content: [
          { id: cid(), type: 'heading', data: { html: '研究背景', level: 3 } },
          { id: cid(), type: 'list', data: { items: ['前身Seedream4.5画质优秀但出图慢、成本高，字节推出Lite版，主打提速降本。'] } },
          { id: cid(), type: 'heading', data: { html: '核心优势', level: 3 } },
          { id: cid(), type: 'list', data: { items: ['CoT视觉思维推理：自主校验空间透视、人体结构', '原生实时联网RAG检索：打破知识截止限制', '商用级文字渲染：中英混排、海报大字准确率SOTA', '超强多图一致性：支持14图融合参考', '轻量化：18B参数，体积精简30%、提速2倍'] } },
        ],
      },
      { id: 'b7-s3', title: 'Seed3D 2.0', date: '2026.4.23',
        content: [
          { id: cid(), type: 'heading', data: { html: '架构设计（两段式 MoE）', level: 3 } },
          { id: cid(), type: 'list', data: { items: ['粗建模分支：搭建物体三维外形骨架', '精建模分支：细化镂空、凹凸细节', '材质生成分支：一键生成真实材质贴图', '仿真适配分支：自动拆分零件、生成关节'] } },
          { id: cid(), type: 'heading', data: { html: '评测与创新', level: 3 } },
          { id: cid(), type: 'list', data: { items: ['三维建模、材质生成综合性能行业顶尖', '引入 VLM 先验，增强材质分解稳定性', '自带部件拆分+关节自动绑定，可直接用于动画', '激活参数量 13B'] } },
        ],
      },
    ],
  },
];

const hero = {
  title: '多模态大模型 · 知识体系',
  desc: '覆盖从基础架构到前沿趋势的完整知识沉淀，支持飞书风格块编辑器：/ 命令菜单、文本格式化、增删改内容块。',
  stats: [
    { num: '7', label: '知识板块' },
    { num: '40+', label: '核心名词' },
    { num: '6', label: '技术方向' },
    { num: '10', label: '架构图解' },
  ],
};

export { blocks, hero };