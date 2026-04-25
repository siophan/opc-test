const tableBody = document.querySelector('#candidate-table-body');
const detailContent = document.querySelector('#detail-content');
const searchInput = document.querySelector('#candidate-search');
const refreshButton = document.querySelector('#refresh-data');
const logoutButton = document.querySelector('#logout-button');
let allRecords = [];
let classificationChart;
let fitChart;

function redirectToLogin() {
  location.href = 'login.html';
}

async function loadAssessments() {
  const response = await fetch('tables/opc_assessments?page=1&limit=100&sort=-created_at', {
    credentials: 'same-origin',
  });
  if (response.status === 401) {
    redirectToLogin();
    throw new Error('unauthorized');
  }
  if (!response.ok) throw new Error('无法加载数据');
  const result = await response.json();
  return result.data || [];
}

async function handleLogout() {
  try {
    await fetch('api/logout.php', { method: 'POST', credentials: 'same-origin' });
  } catch (error) {
    // Even if the network call fails, drop the user back at the login page —
    // the cookie may already be invalid server-side.
  }
  redirectToLogin();
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN');
}

function renderStats(records) {
  const total = records.length;
  const average = total ? Math.round(records.reduce((sum, r) => sum + Number(r.total_score || 0), 0) / total) : 0;
  const fit = records.filter(r => String(r.opc_fit || '').includes('强适配')).length;
  const nurture = records.filter(r => String(r.opc_fit || '').includes('可培养') || String(r.opc_fit || '').includes('暂不适配')).length;
  document.querySelector('#stat-total').textContent = total;
  document.querySelector('#stat-average').textContent = average;
  document.querySelector('#stat-fit').textContent = fit;
  document.querySelector('#stat-nurture').textContent = nurture;
}

function countBy(records, field) {
  return records.reduce((acc, record) => {
    const key = record[field] || '未分类';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function drawChart(canvasId, chartRef, labels, data, title) {
  if (chartRef) chartRef.destroy();
  const ctx = document.querySelector(canvasId);
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'],
        borderColor: 'rgba(255,255,255,0.18)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#e5e7eb' } },
        title: { display: true, text: title, color: '#ffffff' }
      }
    }
  });
}

function renderCharts(records) {
  const classificationCounts = countBy(records, 'classification');
  classificationChart = drawChart(
    '#classification-chart',
    classificationChart,
    Object.keys(classificationCounts),
    Object.values(classificationCounts),
    'AI 分类'
  );

  const fitGroups = records.reduce((acc, record) => {
    const value = String(record.opc_fit || '未判断');
    const key = value.includes('强适配') ? '强适配' : value.includes('较高适配') ? '较高适配' : value.includes('可培养') ? '可培养' : value.includes('暂不适配') ? '暂不适配' : '未判断';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  fitChart = drawChart('#fit-chart', fitChart, Object.keys(fitGroups), Object.values(fitGroups), 'OPC 适配');
}

function renderTable(records) {
  if (!records.length) {
    tableBody.innerHTML = '<tr><td colspan="7">暂无匹配数据。</td></tr>';
    return;
  }
  tableBody.innerHTML = records.map(record => `
    <tr tabindex="0" data-id="${record.id}">
      <td><strong>${record.candidate_name || '-'}</strong><small>${record.contact || ''}</small><small>${record.email || ''}</small><small>${record.wechat_id ? `微信：${record.wechat_id}` : ''}</small></td>
      <td>${record.industry || '-'}<small>${record.role || ''} · ${record.experience_years || 0} 年</small></td>
      <td><span class="badge">${record.classification || '-'}</span></td>
      <td><strong>${record.total_score || 0}</strong><small>调研 ${record.survey_score || 0} / 考试 ${record.exam_score || 0}</small></td>
      <td>${record.opc_fit || '-'}</td>
      <td>${record.recommended_track || '-'}</td>
      <td>${formatDate(record.submitted_at || record.created_at)}</td>
    </tr>
  `).join('');

  [...tableBody.querySelectorAll('tr')].forEach(row => {
    row.addEventListener('click', () => showDetail(row.dataset.id));
    row.addEventListener('keydown', event => {
      if (event.key === 'Enter') showDetail(row.dataset.id);
    });
  });
}

function showDetail(id) {
  const record = allRecords.find(item => item.id === id);
  if (!record) return;
  let parsedAnswers = record.answers;
  try {
    parsedAnswers = JSON.stringify(JSON.parse(record.answers), null, 2);
  } catch (error) {
    parsedAnswers = record.answers || '无答题明细';
  }
  detailContent.textContent = `姓名：${record.candidate_name}\n电话/联系方式：${record.contact}\nEmail：${record.email || '-'}\n微信：${record.wechat_id || '-'}\n城市：${record.city}\n行业：${record.industry}\n角色：${record.role}\n业务目标：${record.business_goal}\n\nAI 自评：${record.ai_self_level}\n使用工具：${Array.isArray(record.tools_used) ? record.tools_used.join('、') : record.tools_used}\n\n分类：${record.classification}\nOPC 适配：${record.opc_fit}\n推荐路径：${record.recommended_track}\n\n答题明细：\n${parsedAnswers}`;
}

function applySearch() {
  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = allRecords.filter(record => {
    const text = `${record.candidate_name} ${record.contact} ${record.email} ${record.wechat_id} ${record.industry} ${record.role} ${record.classification} ${record.opc_fit}`.toLowerCase();
    return text.includes(keyword);
  });
  renderTable(filtered);
}

async function refreshDashboard() {
  refreshButton.disabled = true;
  refreshButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 加载中';
  try {
    allRecords = await loadAssessments();
    renderStats(allRecords);
    renderCharts(allRecords);
    renderTable(allRecords);
  } catch (error) {
    console.error(error);
    tableBody.innerHTML = '<tr><td colspan="7">数据加载失败，请稍后重试。</td></tr>';
  } finally {
    refreshButton.disabled = false;
    refreshButton.innerHTML = '<i class="fa-solid fa-rotate"></i> 刷新数据';
  }
}

async function ensureAuthenticated() {
  // Gate the entire admin page on api/me.php BEFORE rendering anything.
  // Any non-200 (including network errors) means "not logged in" — bounce.
  let response;
  try {
    response = await fetch('api/me.php', { credentials: 'same-origin' });
  } catch (error) {
    redirectToLogin();
    return false;
  }
  if (!response.ok) {
    redirectToLogin();
    return false;
  }
  return true;
}

(async function init() {
  if (!(await ensureAuthenticated())) return;
  document.body.dataset.auth = 'ok';
  searchInput.addEventListener('input', applySearch);
  refreshButton.addEventListener('click', refreshDashboard);
  if (logoutButton) logoutButton.addEventListener('click', handleLogout);
  refreshDashboard();
})();
