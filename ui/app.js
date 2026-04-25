const form = document.querySelector('#assessment-form');
const questionBankEl = document.querySelector('#question-bank');
const resultCard = document.querySelector('#result-card');
const classificationTitle = document.querySelector('#classification-title');
const classificationDesc = document.querySelector('#classification-desc');
const recommendationList = document.querySelector('#recommendation-list');
const totalScoreEl = document.querySelector('#total-score');
const scoreRing = document.querySelector('#score-ring');

const levelMeta = {
  '低阶': { icon: 'fa-seedling', text: '第 1 层：零基础也能作答，重点是认识 AI、会安全使用、会写清楚需求。' },
  '中阶': { icon: 'fa-gears', text: '第 2 层：把 AI 放进岗位和业务流程，判断是否具备场景应用能力。' },
  '高阶': { icon: 'fa-brain', text: '第 3 层：进入方案设计、客户交付、治理风险和 OPC 创业判断。' }
};

const maxExamScore = QUESTION_BANK.reduce((sum, question) => sum + question.score, 0);
const maxTotalScore = maxExamScore + 90;

function renderQuestionBank() {
  const grouped = QUESTION_BANK.reduce((acc, question) => {
    acc[question.level] = acc[question.level] || [];
    acc[question.level].push(question);
    return acc;
  }, {});

  const countNote = document.querySelector('#question-count-note');
  if (countNote) {
    countNote.textContent = `当前题库共 ${QUESTION_BANK.length} 题，满分 ${maxExamScore} 分。系统按低阶、中阶、高阶逐层展示，答题过程本身就是一次入门培训。`;
  }

  questionBankEl.innerHTML = Object.entries(grouped).map(([level, questions]) => {
    const levelScore = questions.reduce((sum, question) => sum + question.score, 0);
    return `
      <article class="level-block">
        <header class="level-header">
          <i class="fa-solid ${levelMeta[level].icon}"></i>
          <div>
            <h3>${level}<small>${questions.length} 题 · ${levelScore} 分</small></h3>
            <p>${levelMeta[level].text}</p>
          </div>
        </header>
        ${questions.map(renderQuestion).join('')}
      </article>
    `;
  }).join('');
}

function renderQuestion(question, index) {
  const inputType = question.type === 'multiple' ? 'checkbox' : 'radio';
  return `
    <fieldset class="exam-question" data-question-id="${question.id}">
      <legend><span>${question.id}</span>${question.question}<em>${question.score} 分 · ${question.dimension}</em></legend>
      <div class="exam-options">
        ${question.options.map((option) => `
          <label>
            <input type="${inputType}" name="q_${question.id}" value="${option}" ${question.type === 'single' ? 'required' : ''}>
            ${option}
          </label>
        `).join('')}
      </div>
      <p class="teaching-tip"><i class="fa-regular fa-lightbulb"></i> 学习提示：${question.teaching}</p>
    </fieldset>
  `;
}

function getSelectedValues(name) {
  return [...document.querySelectorAll(`[name="${name}"]:checked`)].map(input => input.value);
}

function arraysEqualAsSet(a, b) {
  return a.length === b.length && a.every(item => b.includes(item));
}

function calculateExam() {
  let examScore = 0;
  const details = [];
  QUESTION_BANK.forEach(question => {
    const selected = getSelectedValues(`q_${question.id}`);
    const correct = Array.isArray(question.answer)
      ? arraysEqualAsSet(selected, question.answer)
      : selected[0] === question.answer;
    if (correct) examScore += question.score;
    details.push({
      id: question.id,
      level: question.level,
      dimension: question.dimension,
      question: question.question,
      selected,
      answer: question.answer,
      correct,
      score: correct ? question.score : 0,
      maxScore: question.score
    });
  });
  return { examScore, details };
}

function calculateSurveyScore() {
  const aiLevelInput = document.querySelector('[name="aiSelfLevel"]:checked');
  const aiScore = aiLevelInput ? Number(aiLevelInput.dataset.score) : 0;
  const toolsCount = getSelectedValues('toolsUsed').length;
  const toolScore = Math.min(24, toolsCount * 3);
  const years = Number(document.querySelector('#experience-years').value || 0);
  const experienceScore = Math.min(20, years * 2);
  const goalText = document.querySelector('#business-goal').value.trim();
  const goalScore = goalText.length >= 50 ? 12 : goalText.length >= 25 ? 8 : goalText.length >= 10 ? 4 : 0;
  return Math.min(90, aiScore + toolScore + experienceScore + goalScore);
}

function classify(totalScore, examScore, surveyScore) {
  const examRatio = examScore / maxExamScore;
  if (totalScore >= 145 && examRatio >= 0.78) {
    return {
      classification: 'OPC 创业候选人',
      opcFit: '强适配：建议进入 OPC 创业者面试、行业选题和项目共创',
      desc: '你已经具备较好的行业经验、AI 应用认知、方案判断和商业落地意识，可优先进入 OPC 创业孵化路径。',
      track: '创业实战营：行业切入策略、客户诊断、AI Agent 方案架构、试点报价、交付 SOP、商业闭环设计。'
    };
  }
  if (totalScore >= 115 && examRatio >= 0.62) {
    return {
      classification: 'AI 方案架构师',
      opcFit: '较高适配：适合成为 OPC 解决方案顾问或联合交付伙伴',
      desc: '你能够把 AI 工具与业务流程结合，具备一定场景拆解、流程设计和风险意识。下一步要强化行业模板和客户交付。',
      track: '架构进阶课：Agent 工作流、行业知识库、数据治理、多模型评估、ROI 设计、企业级方案文档。'
    };
  }
  if (totalScore >= 75) {
    return {
      classification: 'AI 工具实践者',
      opcFit: '可培养：建议完成系统训练后，再评估 OPC 入驻或创业适配度',
      desc: '你已经有一定工具认知或使用经验，但还需要加强场景拆解、流程化表达、业务指标和交付意识。',
      track: '工具实战课：提示词工程、常用模型对比、办公自动化、岗位案例演练、个人效率到团队流程迁移。'
    };
  }
  return {
    classification: 'AI 启蒙探索者',
    opcFit: '暂不适配：建议先完成 AI 基础训练营，再进入工具实操测评',
    desc: '你目前处于 AI 入门阶段。平台建议先建立基础概念、工具使用习惯、安全意识和简单任务实践。',
    track: '基础训练营：AI 基础概念、常用工具、提示词结构、事实校验、安全合规、个人效率小任务。'
  };
}

function renderResult(result, totalScore) {
  resultCard.classList.remove('hidden');
  classificationTitle.textContent = '你的资料已提交';
  classificationDesc.textContent = '感谢完成 OPC AI 入驻调研与测评。你的测评报告将进入管理端审核流程，用户端不直接展示评分、分类或适配结论。';
  if (totalScoreEl) totalScoreEl.textContent = '';
  if (scoreRing) scoreRing.style.setProperty('--score-percent', '0%');
  const email = document.querySelector('#email').value.trim();
  const wechatId = document.querySelector('#wechat-id').value.trim();
  recommendationList.innerHTML = `
    <li><strong>请等待消息：</strong>OPC 管理人员会查看你的提交内容，并根据审核情况与你联系。</li>
    <li><strong>Email 跟踪：</strong>${email || '未填写'}。请留意该邮箱的后续通知。</li>
    <li><strong>微信联系：</strong>${wechatId || '未填写'}。工作人员可能通过微信与你沟通下一步。</li>
    <li><strong>说明：</strong>评分、分类、OPC 适配判断和推荐路径仅在审批端供管理人员查看。</li>
  `;
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function saveAssessment(payload) {
  const response = await fetch('tables/opc_assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('保存失败');
  return response.json();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const unansweredMultiple = QUESTION_BANK.filter(q => q.type === 'multiple' && getSelectedValues(`q_${q.id}`).length === 0);
  if (unansweredMultiple.length) {
    alert(`请完成多选题：${unansweredMultiple.map(q => q.id).join('、')}`);
    return;
  }

  const { examScore, details } = calculateExam();
  const surveyScore = calculateSurveyScore();
  const totalScore = examScore + surveyScore;
  const result = classify(totalScore, examScore, surveyScore);
  const toolsUsed = getSelectedValues('toolsUsed');
  const aiSelfLevel = document.querySelector('[name="aiSelfLevel"]:checked')?.value || '';

  const payload = {
    candidate_name: document.querySelector('#candidate-name').value.trim(),
    contact: document.querySelector('#contact').value.trim(),
    email: document.querySelector('#email').value.trim(),
    wechat_id: document.querySelector('#wechat-id').value.trim(),
    city: document.querySelector('#city').value.trim(),
    industry: document.querySelector('#industry').value,
    role: document.querySelector('#role').value,
    experience_years: Number(document.querySelector('#experience-years').value || 0),
    ai_self_level: aiSelfLevel,
    tools_used: toolsUsed,
    business_goal: document.querySelector('#business-goal').value.trim(),
    survey_score: surveyScore,
    exam_score: examScore,
    total_score: totalScore,
    classification: result.classification,
    opc_fit: result.opcFit,
    recommended_track: result.track,
    answers: JSON.stringify({ exam: details, survey: { aiSelfLevel, toolsUsed } }, null, 2),
    submitted_at: new Date().toISOString()
  };

  const submitButton = document.querySelector('.submit-button');
  submitButton.disabled = true;
  submitButton.textContent = '正在保存测评结果...';
  try {
    await saveAssessment(payload);
    renderResult(result, totalScore);
    submitButton.textContent = '已提交，请等待 OPC 管理人员联系';
  } catch (error) {
    console.error(error);
    alert('提交保存失败，请检查网络后重新提交。');
    submitButton.textContent = '重新提交问卷与测评';
  } finally {
    submitButton.disabled = false;
  }
});

renderQuestionBank();
