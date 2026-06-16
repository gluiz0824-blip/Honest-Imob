const statuses = ["Novo", "Em contato", "Qualificado", "Visita agendada", "Passado ao corretor", "Perdido"];
const channels = ["WhatsApp", "Instagram", "TikTok"];
const properties = ["Pontal EcoLife", "Intense Parque Cascavel", "Rosas do Parque", "Lagunas Setor Bueno"];
const loginUsers = [
  { user: "honest", password: "honest123" },
  { user: "chefe", password: "honest123" }
];
const authKey = "honest-imob-auth";
const storageKey = "honest-imob-sdr-leads-v4";
const previousStorageKeys = ["imob-sdr-leads-v3", "imob-sdr-leads-v2"];

const sampleLeads = [
  {
    id: makeId(),
    name: "Mariana Lima",
    phone: "(62) 98422-1188",
    channel: "WhatsApp",
    status: "Visita agendada",
    propertyName: "Pontal EcoLife",
    profile: "Pronto para visita",
    firstContactDate: todayPlus(0),
    notes: "Lead interessado em revenda. Quer entender condicoes e disponibilidade para visita.",
    createdAt: todayPlus(-2)
  },
  {
    id: makeId(),
    name: "Rafael Costa",
    phone: "(62) 99773-5521",
    channel: "Instagram",
    status: "Qualificado",
    propertyName: "Intense Parque Cascavel",
    profile: "Qualificado",
    firstContactDate: todayPlus(-1),
    notes: "Perguntou se o imovel aceita financiamento. Perfil bom para corretor.",
    createdAt: todayPlus(-5)
  },
  {
    id: makeId(),
    name: "Camila Rocha",
    phone: "(62) 98840-2201",
    channel: "TikTok",
    status: "Em contato",
    propertyName: "Rosas do Parque",
    profile: "Pesquisar opcoes",
    firstContactDate: todayPlus(-1),
    notes: "Chegou por video do TikTok. Ainda pediu mais informacoes.",
    createdAt: todayPlus(-1)
  },
  {
    id: makeId(),
    name: "Grupo Sol Nascente",
    phone: "(62) 99131-8702",
    channel: "WhatsApp",
    status: "Passado ao corretor",
    propertyName: "Lagunas Setor Bueno",
    profile: "Pronto para visita",
    firstContactDate: todayPlus(-3),
    notes: "Lead ja enviado ao corretor responsavel para continuidade.",
    createdAt: todayPlus(-12)
  },
  {
    id: makeId(),
    name: "Bruno Martins",
    phone: "(62) 98110-4429",
    channel: "Instagram",
    status: "Novo",
    propertyName: "Pontal EcoLife",
    profile: "Qualificado",
    firstContactDate: todayPlus(0),
    notes: "Primeiro contato recebido pelo Instagram. Aguardando resposta.",
    createdAt: todayPlus(-4)
  }
];

let leads = loadLeads();

const els = {
  loginScreen: document.querySelector("#loginScreen"),
  loginForm: document.querySelector("#loginForm"),
  loginUser: document.querySelector("#loginUser"),
  loginPassword: document.querySelector("#loginPassword"),
  loginError: document.querySelector("#loginError"),
  appShell: document.querySelector("#appShell"),
  kpiGrid: document.querySelector("#kpiGrid"),
  channelChart: document.querySelector("#channelChart"),
  funnelChart: document.querySelector("#funnelChart"),
  hotList: document.querySelector("#hotList"),
  kanban: document.querySelector("#kanban"),
  leadRows: document.querySelector("#leadRows"),
  agendaList: document.querySelector("#agendaList"),
  goalProgress: document.querySelector("#goalProgress"),
  goalBar: document.querySelector("#goalBar"),
  searchInput: document.querySelector("#searchInput"),
  pipelineSearch: document.querySelector("#pipelineSearch"),
  channelFilter: document.querySelector("#channelFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  periodFilter: document.querySelector("#periodFilter"),
  dialog: document.querySelector("#leadDialog"),
  form: document.querySelector("#leadForm"),
  modalTitle: document.querySelector("#modalTitle"),
  deleteLeadBtn: document.querySelector("#deleteLeadBtn"),
  importInput: document.querySelector("#importInput"),
  logoutBtn: document.querySelector("#logoutBtn")
};

els.loginForm.addEventListener("submit", handleLogin);
els.logoutBtn.addEventListener("click", handleLogout);

document.querySelectorAll("[data-view-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showView(link.dataset.viewLink);
  });
});

document.querySelector("#newLeadBtn").addEventListener("click", () => openLeadDialog());
document.querySelector("#closeDialogBtn").addEventListener("click", () => els.dialog.close());
document.querySelector("#cancelBtn").addEventListener("click", () => els.dialog.close());
document.querySelector("#exportBtn").addEventListener("click", exportLeads);
els.importInput.addEventListener("change", importLeads);
els.form.addEventListener("submit", saveLead);
els.deleteLeadBtn.addEventListener("click", deleteCurrentLead);
["input", "change"].forEach((eventName) => {
  els.searchInput.addEventListener(eventName, render);
  els.pipelineSearch.addEventListener(eventName, render);
  els.channelFilter.addEventListener(eventName, render);
  els.statusFilter.addEventListener(eventName, render);
  els.periodFilter.addEventListener(eventName, render);
});

function todayPlus(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function makeId() {
  return `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function handleLogin(event) {
  event.preventDefault();
  const user = els.loginUser.value.trim().toLowerCase();
  const password = els.loginPassword.value;
  const isValid = loginUsers.some((account) => account.user === user && account.password === password);

  if (!isValid) {
    els.loginError.textContent = "Usuario ou senha incorretos.";
    els.loginPassword.value = "";
    els.loginPassword.focus();
    return;
  }

  sessionStorage.setItem(authKey, "true");
  els.loginError.textContent = "";
  showApp();
}

function handleLogout() {
  sessionStorage.removeItem(authKey);
  els.loginPassword.value = "";
  els.appShell.classList.add("locked");
  els.loginScreen.classList.remove("hidden");
  els.loginUser.focus();
}

function showApp() {
  els.loginScreen.classList.add("hidden");
  els.appShell.classList.remove("locked");
}

function normalizeLead(lead) {
  const propertyName = lead.propertyName || lead.nomeImovel || lead.address || lead.endereco || lead.interest || lead.imovel || "";
  return {
    id: lead.id || makeId(),
    name: lead.name || "Lead sem nome",
    phone: lead.phone || "",
    channel: channels.includes(lead.channel) ? lead.channel : "WhatsApp",
    status: statuses.includes(lead.status) ? lead.status : "Novo",
    propertyName: properties.includes(propertyName) ? propertyName : properties[0],
    profile: lead.profile || lead.temperature || lead.perfil || "Qualificado",
    firstContactDate: lead.firstContactDate || lead.nextContact || lead.proximoContato || lead.createdAt || todayPlus(0),
    notes: lead.notes || lead.observacoes || "",
    createdAt: lead.createdAt || todayPlus(0)
  };
}

function loadLeads() {
  const saved = localStorage.getItem(storageKey) || previousStorageKeys.map((key) => localStorage.getItem(key)).find(Boolean);
  if (!saved) return sampleLeads;
  try {
    const parsed = JSON.parse(saved);
    const normalized = Array.isArray(parsed) ? parsed.map(normalizeLead) : sampleLeads;
    localStorage.setItem(storageKey, JSON.stringify(normalized));
    return normalized;
  } catch {
    return sampleLeads;
  }
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(leads));
}

function showView(view) {
  document.querySelectorAll("[data-view]").forEach((section) => {
    section.classList.toggle("active", section.dataset.view === view);
  });
  document.querySelectorAll("[data-view-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.viewLink === view);
  });
}

function dateLabel(value) {
  if (!value) return "Sem data";
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

function channelClass(channel) {
  return channel.toLowerCase();
}

function profileClass(profile) {
  if (profile === "Pronto para visita") return "hot";
  if (profile === "Qualificado") return "warm";
  return "cold";
}

function statusClass(status) {
  return status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
}

function filteredLeads({ table = false, pipeline = false } = {}) {
  const search = (pipeline ? els.pipelineSearch.value : els.searchInput.value).trim().toLowerCase();
  return leads.filter((lead) => {
    const matchesSearch = !search || [
      lead.name,
      lead.phone,
      lead.propertyName,
      lead.profile,
      lead.notes
    ].some((field) => String(field || "").toLowerCase().includes(search));
    const matchesChannel = !table || els.channelFilter.value === "all" || lead.channel === els.channelFilter.value;
    const matchesStatus = !table || els.statusFilter.value === "all" || lead.status === els.statusFilter.value;
    return matchesSearch && matchesChannel && matchesStatus;
  });
}

function periodLeads() {
  const period = els.periodFilter.value;
  if (period === "all") return leads;
  const limit = new Date();
  limit.setDate(limit.getDate() - Number(period));
  return leads.filter((lead) => new Date(`${lead.createdAt}T12:00:00`) >= limit);
}

function renderKpis() {
  const active = leads.filter((lead) => !["Passado ao corretor", "Perdido"].includes(lead.status));
  const qualified = leads.filter((lead) => ["Qualificado", "Visita agendada", "Passado ao corretor"].includes(lead.status));
  const passed = leads.filter((lead) => lead.status === "Passado ao corretor");
  const kpis = [
    ["Leads totais", leads.length, "entrada dos canais"],
    ["Em atendimento", active.length, "pedem retorno"],
    ["Qualificados", qualified.length, "com perfil melhor"],
    ["Passados ao corretor", passed.length, "prontos para seguir"]
  ];

  els.kpiGrid.innerHTML = kpis.map(([label, number, hint], index) => `
    <article class="kpi kpi-${index + 1}">
      <span>${label}</span>
      <strong>${number}</strong>
      <small>${hint}</small>
    </article>
  `).join("");

  const progress = leads.length ? Math.round((qualified.length / leads.length) * 100) : 0;
  els.goalProgress.textContent = `${progress}%`;
  els.goalBar.style.width = `${Math.min(progress, 100)}%`;
}

function renderChannelChart() {
  const data = periodLeads();
  const counts = channels.map((channel) => ({
    channel,
    total: data.filter((lead) => lead.channel === channel).length
  }));
  const max = Math.max(1, ...counts.map((item) => item.total));
  els.channelChart.innerHTML = counts.map((item) => `
    <div class="chart-row">
      <strong>${item.channel}</strong>
      <div class="bar-track">
        <div class="bar ${channelClass(item.channel)}" style="width:${Math.max(4, (item.total / max) * 100)}%"></div>
      </div>
      <span>${item.total}</span>
    </div>
  `).join("");
}

function renderFunnel() {
  els.funnelChart.innerHTML = statuses.map((status) => {
    const total = leads.filter((lead) => lead.status === status).length;
    return `<div class="funnel-step ${statusClass(status)}"><span>${status}</span><strong>${total}</strong></div>`;
  }).join("");
}

function leadCard(lead) {
  return `
    <article class="lead-card compact-card ${statusClass(lead.status)}" data-id="${lead.id}" tabindex="0">
      <div class="lead-title">
        <strong>${lead.name}</strong>
        <span class="date-chip">${dateLabel(lead.firstContactDate)}</span>
      </div>
      <span class="property-name">${lead.propertyName || "Imovel nao informado"}</span>
      <div class="tags">
        <span class="tag channel-${channelClass(lead.channel)}">${lead.channel}</span>
        <span class="tag ${profileClass(lead.profile)}">${lead.profile}</span>
      </div>
    </article>
  `;
}

function bindCards(container = document) {
  container.querySelectorAll(".lead-card").forEach((card) => {
    card.addEventListener("click", () => openLeadDialog(card.dataset.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") openLeadDialog(card.dataset.id);
    });
  });
}

function renderHotList() {
  const hot = leads
    .filter((lead) => ["Pronto para visita", "Qualificado"].includes(lead.profile) && lead.status !== "Perdido")
    .sort((a, b) => {
      const aScore = a.profile === "Pronto para visita" ? 2 : 1;
      const bScore = b.profile === "Pronto para visita" ? 2 : 1;
      return bScore - aScore || String(a.firstContactDate || "").localeCompare(String(b.firstContactDate || ""));
    })
    .slice(0, 6);
  els.hotList.innerHTML = hot.length ? hot.map(leadCard).join("") : emptyState();
  bindCards(els.hotList);
}

function renderKanban() {
  const data = filteredLeads({ pipeline: true });
  els.kanban.innerHTML = statuses.map((status) => {
    const items = data.filter((lead) => lead.status === status);
    return `
      <section class="kanban-column ${statusClass(status)}">
        <header>
          <span>${status}</span>
          <strong>${items.length}</strong>
        </header>
        <div class="kanban-items">
          ${items.length ? items.map(leadCard).join("") : emptyState()}
        </div>
      </section>
    `;
  }).join("");
  bindCards(els.kanban);
}

function renderRows() {
  const data = filteredLeads({ table: true });
  if (!data.length) {
    els.leadRows.innerHTML = `<tr><td colspan="7">${emptyState()}</td></tr>`;
    return;
  }
  els.leadRows.innerHTML = data.map((lead) => `
    <tr>
      <td><strong>${lead.name}</strong><br><span>${lead.phone}</span></td>
      <td><span class="tag channel-${channelClass(lead.channel)}">${lead.channel}</span></td>
      <td><strong>${lead.propertyName || "Nao informado"}</strong></td>
      <td><span class="tag status ${statusClass(lead.status)}">${lead.status}</span></td>
      <td><span class="tag ${profileClass(lead.profile)}">${lead.profile}</span></td>
      <td>${dateLabel(lead.firstContactDate)}</td>
      <td><button class="row-button ghost-button" type="button" data-edit="${lead.id}">Editar</button></td>
    </tr>
  `).join("");
  els.leadRows.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => openLeadDialog(button.dataset.edit));
  });
}

function renderAgenda() {
  const agenda = leads
    .filter((lead) => lead.firstContactDate)
    .sort((a, b) => b.firstContactDate.localeCompare(a.firstContactDate))
    .slice(0, 8);
  els.agendaList.innerHTML = agenda.length ? agenda.map((lead) => `
    <article class="agenda-item">
      <div class="lead-title">
        <strong>${lead.name}</strong>
        <span>${dateLabel(lead.firstContactDate)}</span>
      </div>
      <span>${lead.channel} - ${lead.propertyName || "Imovel nao informado"}</span>
      <button class="row-button ghost-button" type="button" data-edit="${lead.id}">Abrir lead</button>
    </article>
  `).join("") : emptyState();
  els.agendaList.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => openLeadDialog(button.dataset.edit));
  });
}

function emptyState() {
  return document.querySelector("#emptyStateTemplate").innerHTML;
}

function fillStatusSelects() {
  const options = statuses.map((status) => `<option>${status}</option>`).join("");
  document.querySelector("#status").innerHTML = options;
  els.statusFilter.innerHTML = `<option value="all">Todas as etapas</option>${options}`;
}

function openLeadDialog(id) {
  const lead = leads.find((item) => item.id === id);
  els.form.reset();
  document.querySelector("#leadId").value = lead?.id || "";
  document.querySelector("#name").value = lead?.name || "";
  document.querySelector("#phone").value = lead?.phone || "";
  document.querySelector("#channel").value = lead?.channel || "WhatsApp";
  document.querySelector("#status").value = lead?.status || "Novo";
  document.querySelector("#interest").value = lead?.propertyName || "";
  document.querySelector("#temperature").value = lead?.profile || "Qualificado";
  document.querySelector("#nextContact").value = lead?.firstContactDate || todayPlus(0);
  document.querySelector("#notes").value = lead?.notes || "";
  els.modalTitle.textContent = lead ? "Editar Lead" : "Novo Lead";
  els.deleteLeadBtn.style.visibility = lead ? "visible" : "hidden";
  els.dialog.showModal();
}

function saveLead(event) {
  event.preventDefault();
  const id = document.querySelector("#leadId").value;
  const payload = normalizeLead({
    id: id || makeId(),
    name: document.querySelector("#name").value.trim(),
    phone: document.querySelector("#phone").value.trim(),
    channel: document.querySelector("#channel").value,
    status: document.querySelector("#status").value,
    propertyName: document.querySelector("#interest").value.trim(),
    profile: document.querySelector("#temperature").value,
    firstContactDate: document.querySelector("#nextContact").value,
    notes: document.querySelector("#notes").value.trim(),
    createdAt: leads.find((lead) => lead.id === id)?.createdAt || todayPlus(0)
  });

  leads = id ? leads.map((lead) => lead.id === id ? payload : lead) : [payload, ...leads];
  persist();
  els.dialog.close();
  render();
}

function deleteCurrentLead() {
  const id = document.querySelector("#leadId").value;
  leads = leads.filter((lead) => lead.id !== id);
  persist();
  els.dialog.close();
  render();
}

function exportLeads() {
  const blob = new Blob([JSON.stringify(leads, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leads-honest-imob-${todayPlus(0)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importLeads(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      if (file.name.endsWith(".csv")) {
        leads = parseCsv(String(reader.result));
      } else {
        const imported = JSON.parse(String(reader.result));
        leads = Array.isArray(imported) ? imported.map(normalizeLead) : leads;
      }
      persist();
      render();
    } catch {
      alert("Nao foi possivel importar o arquivo.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function parseCsv(text) {
  const [headerLine, ...rows] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((item) => item.trim());
  return rows.map((row) => {
    const values = row.split(",").map((item) => item.trim());
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
    return normalizeLead({
      id: record.id || makeId(),
      name: record.name || record.nome || "Lead sem nome",
      phone: record.phone || record.telefone || "",
      channel: record.channel || record.canal || "WhatsApp",
      status: record.status || record.etapa || "Novo",
      propertyName: record.propertyName || record.nomeImovel || record.address || record.endereco || record.interest || record.interesse || record.imovel || "",
      profile: record.profile || record.perfil || record.temperature || "Qualificado",
      firstContactDate: record.firstContactDate || record.primeiroContato || record.nextContact || "",
      notes: record.notes || record.observacoes || "",
      createdAt: record.createdAt || todayPlus(0)
    });
  });
}

function render() {
  renderKpis();
  renderChannelChart();
  renderFunnel();
  renderHotList();
  renderKanban();
  renderRows();
  renderAgenda();
}

fillStatusSelects();
render();
if (sessionStorage.getItem(authKey) === "true") {
  showApp();
} else {
  els.loginUser.focus();
}
