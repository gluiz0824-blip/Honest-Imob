const statuses = ["Em contato", "Fazer follow-up", "Visita agendada", "Passado ao corretor", "Perdido"];
const contactStatuses = ["Nao respondeu", "Respondeu", "Aguardando retorno", "Agendado", "Encerrado"];
const channels = ["WhatsApp", "Instagram", "TikTok"];
const properties = ["Pontal Ecolife", "Intense - Parque Cascavel", "Rosas do Parque", "Laguna - Setor Bueno"];
const loginUsers = [
  { user: "honest", password: "honest123" },
  { user: "chefe", password: "honest123" }
];
const supabaseUrl = "https://awrxwtcfyjesphvklmvs.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3cnh3dGNmeWplc3BodmtsbXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzY3MzAsImV4cCI6MjA5NzIxMjczMH0.fxZKEjYKie4rNefGqz5kJraeMCTfnrDXP9JS9dmuwdg";
const supabaseLeadsUrl = `${supabaseUrl}/rest/v1/leads`;
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
    contactStatus: "Agendado",
    propertyName: "Pontal EcoLife",
    firstContactDate: todayPlus(0),
    notes: "Lead interessado em revenda. Quer entender condicoes e disponibilidade para visita.",
    createdAt: todayPlus(-2)
  },
  {
    id: makeId(),
    name: "Rafael Costa",
    phone: "(62) 99773-5521",
    channel: "Instagram",
    status: "Fazer follow-up",
    contactStatus: "Aguardando retorno",
    propertyName: "Intense Parque Cascavel",
    firstContactDate: todayPlus(-1),
    notes: "Perguntou se o imovel aceita financiamento. Precisa de retorno.",
    createdAt: todayPlus(-5)
  },
  {
    id: makeId(),
    name: "Camila Rocha",
    phone: "(62) 98840-2201",
    channel: "TikTok",
    status: "Em contato",
    contactStatus: "Respondeu",
    propertyName: "Rosas do Parque",
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
    contactStatus: "Encerrado",
    propertyName: "Laguna - Setor Bueno",
    firstContactDate: todayPlus(-3),
    notes: "Lead ja enviado ao corretor responsavel para continuidade.",
    createdAt: todayPlus(-12)
  },
  {
    id: makeId(),
    name: "Bruno Martins",
    phone: "(62) 98110-4429",
    channel: "Instagram",
    status: "Em contato",
    contactStatus: "Nao respondeu",
    propertyName: "Pontal EcoLife",
    firstContactDate: todayPlus(0),
    notes: "Primeiro contato recebido pelo Instagram. Aguardando resposta.",
    createdAt: todayPlus(-4)
  }
];

let leads = loadLeads();
let usingRemoteDatabase = false;

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
  pipelinePropertyFilter: document.querySelector("#pipelinePropertyFilter"),
  channelFilter: document.querySelector("#channelFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  propertyFilter: document.querySelector("#propertyFilter"),
  periodFilter: document.querySelector("#periodFilter"),
  dialog: document.querySelector("#leadDialog"),
  form: document.querySelector("#leadForm"),
  modalTitle: document.querySelector("#modalTitle"),
  deleteLeadBtn: document.querySelector("#deleteLeadBtn"),
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
els.form.addEventListener("submit", saveLead);
els.deleteLeadBtn.addEventListener("click", deleteCurrentLead);
["input", "change"].forEach((eventName) => {
  els.searchInput.addEventListener(eventName, render);
  els.pipelineSearch.addEventListener(eventName, render);
  els.pipelinePropertyFilter.addEventListener(eventName, render);
  els.channelFilter.addEventListener(eventName, render);
  els.statusFilter.addEventListener(eventName, render);
  els.propertyFilter.addEventListener(eventName, render);
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
  syncLeadsFromDatabase();
}

function normalizeLead(lead) {
  const propertyName = lead.propertyName || lead.nomeImovel || lead.address || lead.endereco || lead.interest || lead.imovel || "";
  const migratedStatus = lead.status === "Novo" ? "Em contato" : lead.status === "Qualificado" ? "Fazer follow-up" : lead.status;
  return {
    id: lead.id || makeId(),
    name: lead.name || "Lead sem nome",
    phone: lead.phone || "",
    channel: channels.includes(lead.channel) ? lead.channel : "WhatsApp",
    status: statuses.includes(migratedStatus) ? migratedStatus : "Em contato",
    contactStatus: contactStatuses.includes(lead.contactStatus || lead.contact_status) ? lead.contactStatus || lead.contact_status : "Nao respondeu",
    propertyName: properties.includes(propertyName) ? propertyName : properties[0],
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

function supabaseHeaders(extra = {}) {
  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    "Content-Type": "application/json",
    ...extra
  };
}

function dbLeadToApp(row) {
  return normalizeLead({
    id: row.id,
    name: row.name,
    phone: row.phone,
    channel: row.channel,
    propertyName: row.property_name,
    status: row.status,
    contactStatus: row.contact_status,
    firstContactDate: row.first_contact,
    notes: row.notes,
    createdAt: row.created_at
  });
}

function appLeadToDb(lead) {
  return {
    name: lead.name,
    phone: lead.phone,
    channel: lead.channel,
    property_name: lead.propertyName,
    status: lead.status,
    contact_status: lead.contactStatus,
    first_contact: lead.firstContactDate,
    notes: lead.notes
  };
}

function getSavedLocalLeads() {
  const saved = localStorage.getItem(storageKey) || previousStorageKeys.map((key) => localStorage.getItem(key)).find(Boolean);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeLead) : [];
  } catch {
    return [];
  }
}

async function requestSupabase(path = "", options = {}) {
  const response = await fetch(`${supabaseLeadsUrl}${path}`, {
    ...options,
    headers: supabaseHeaders(options.headers)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Erro Supabase ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function syncLeadsFromDatabase() {
  try {
    const rows = await requestSupabase("?select=*&order=created_at.desc");
    let remoteLeads = rows.map(dbLeadToApp);
    const localLeads = getSavedLocalLeads();

    if (!remoteLeads.length && localLeads.length) {
      const payload = localLeads.map(appLeadToDb);
      const inserted = await requestSupabase("", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(payload)
      });
      remoteLeads = inserted.map(dbLeadToApp);
    }

    leads = remoteLeads;
    usingRemoteDatabase = true;
    persist();
    render();
  } catch (error) {
    usingRemoteDatabase = false;
    console.error("Nao foi possivel sincronizar com o Supabase:", error);
    alert("Nao foi possivel conectar ao banco de dados. Confira as politicas RLS da tabela leads no Supabase.");
  }
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
  const date = parseLeadDate(value);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return date.toLocaleDateString("pt-BR");
}

function parseLeadDate(value) {
  if (!value) return new Date("invalid");
  if (value instanceof Date) return value;
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return new Date(`${text}T12:00:00`);
  }
  return new Date(text);
}

function channelClass(channel) {
  return channel.toLowerCase();
}

function statusClass(status) {
  return status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
}

function filteredLeads({ table = false, pipeline = false } = {}) {
  const search = (pipeline ? els.pipelineSearch.value : els.searchInput.value).trim().toLowerCase();
  const propertyValue = pipeline ? els.pipelinePropertyFilter.value : els.propertyFilter.value;
  return leads.filter((lead) => {
    const matchesSearch = !search || [
      lead.name,
      lead.phone,
      lead.propertyName,
      lead.contactStatus,
      lead.notes
    ].some((field) => String(field || "").toLowerCase().includes(search));
    const matchesChannel = !table || els.channelFilter.value === "all" || lead.channel === els.channelFilter.value;
    const matchesStatus = !table || els.statusFilter.value === "all" || lead.status === els.statusFilter.value;
    const matchesProperty = propertyValue === "all" || lead.propertyName === propertyValue;
    return matchesSearch && matchesChannel && matchesStatus && matchesProperty;
  });
}

function periodLeads() {
  const period = els.periodFilter.value;
  if (period === "all") return leads;
  const limit = new Date();
  limit.setDate(limit.getDate() - Number(period));
  return leads.filter((lead) => {
    const date = parseLeadDate(lead.createdAt);
    return !Number.isNaN(date.getTime()) && date >= limit;
  });
}

function renderKpis() {
  const active = leads.filter((lead) => !["Passado ao corretor", "Perdido"].includes(lead.status));
  const scheduled = leads.filter((lead) => lead.status === "Visita agendada");
  const passed = leads.filter((lead) => lead.status === "Passado ao corretor");
  const kpis = [
    ["Leads totais", leads.length, "entrada dos canais"],
    ["Em atendimento", active.length, "pedem retorno"],
    ["Visitas agendadas", scheduled.length, "proximos atendimentos"],
    ["Passados ao corretor", passed.length, "prontos para seguir"]
  ];

  els.kpiGrid.innerHTML = kpis.map(([label, number, hint], index) => `
    <article class="kpi kpi-${index + 1}">
      <span>${label}</span>
      <strong>${number}</strong>
      <small>${hint}</small>
    </article>
  `).join("");

  const progress = leads.length ? Math.round(((scheduled.length + passed.length) / leads.length) * 100) : 0;
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
        <span class="tag status ${statusClass(lead.status)}">${lead.status}</span>
        <span class="tag contact">${lead.contactStatus}</span>
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
    .filter((lead) => ["Fazer follow-up", "Visita agendada"].includes(lead.status))
    .sort((a, b) => String(a.firstContactDate || "").localeCompare(String(b.firstContactDate || "")))
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
      <td><span class="tag contact">${lead.contactStatus}</span></td>
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

function fillContactStatusSelect() {
  document.querySelector("#contactStatus").innerHTML = contactStatuses.map((status) => `<option>${status}</option>`).join("");
}

function fillPropertyFilters() {
  const options = properties.map((property) => `<option>${property}</option>`).join("");
  els.propertyFilter.innerHTML = `<option value="all">Todos os imoveis</option>${options}`;
  els.pipelinePropertyFilter.innerHTML = `<option value="all">Todos os imoveis</option>${options}`;
}

function openLeadDialog(id) {
  const lead = leads.find((item) => item.id === id);
  els.form.reset();
  document.querySelector("#leadId").value = lead?.id || "";
  document.querySelector("#name").value = lead?.name || "";
  document.querySelector("#phone").value = lead?.phone || "";
  document.querySelector("#channel").value = lead?.channel || "WhatsApp";
  document.querySelector("#status").value = lead?.status || "Em contato";
  document.querySelector("#contactStatus").value = lead?.contactStatus || "Nao respondeu";
  document.querySelector("#interest").value = lead?.propertyName || "";
  document.querySelector("#nextContact").value = lead?.firstContactDate || todayPlus(0);
  document.querySelector("#notes").value = lead?.notes || "";
  els.modalTitle.textContent = lead ? "Editar Lead" : "Novo Lead";
  els.deleteLeadBtn.style.visibility = lead ? "visible" : "hidden";
  els.dialog.showModal();
}

async function saveLead(event) {
  event.preventDefault();
  const id = document.querySelector("#leadId").value;
  const payload = normalizeLead({
    id: id || makeId(),
    name: document.querySelector("#name").value.trim(),
    phone: document.querySelector("#phone").value.trim(),
    channel: document.querySelector("#channel").value,
    status: document.querySelector("#status").value,
    contactStatus: document.querySelector("#contactStatus").value,
    propertyName: document.querySelector("#interest").value.trim(),
    firstContactDate: document.querySelector("#nextContact").value,
    notes: document.querySelector("#notes").value.trim(),
    createdAt: leads.find((lead) => lead.id === id)?.createdAt || todayPlus(0)
  });

  try {
    if (usingRemoteDatabase) {
      const dbPayload = appLeadToDb(payload);
      const saved = id
        ? await requestSupabase(`?id=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(dbPayload)
        })
        : await requestSupabase("", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(dbPayload)
        });
      const savedLead = dbLeadToApp(Array.isArray(saved) ? saved[0] : saved);
      leads = id ? leads.map((lead) => lead.id === id ? savedLead : lead) : [savedLead, ...leads];
    } else {
      leads = id ? leads.map((lead) => lead.id === id ? payload : lead) : [payload, ...leads];
    }

    persist();
    els.dialog.close();
    render();
  } catch (error) {
    console.error("Erro ao salvar lead:", error);
    alert("Nao foi possivel salvar no banco de dados. Confira as permissoes da tabela leads no Supabase.");
  }
}

async function deleteCurrentLead() {
  const id = document.querySelector("#leadId").value;
  try {
    if (usingRemoteDatabase && id) {
      await requestSupabase(`?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    }
    leads = leads.filter((lead) => lead.id !== id);
    persist();
    els.dialog.close();
    render();
  } catch (error) {
    console.error("Erro ao excluir lead:", error);
    alert("Nao foi possivel excluir no banco de dados. Confira as permissoes da tabela leads no Supabase.");
  }
}

function exportLeads() {
  const blob = new Blob([createLeadsPdf()], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leads-honest-imob-${todayPlus(0)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

function createLeadsPdf() {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 32;
  const rowHeight = 38;
  const tableTop = 742;
  const rowsPerPage = 15;
  const columns = [
    { label: "Nome", key: "name", x: 38, width: 118 },
    { label: "Numero", key: "phone", x: 160, width: 96 },
    { label: "Imovel de interesse", key: "propertyName", x: 260, width: 128 },
    { label: "Observacao", key: "notes", x: 392, width: 158 }
  ];

  const rows = leads.map((lead) => ({
    name: lead.name,
    phone: lead.phone,
    propertyName: lead.propertyName || "Nao informado",
    notes: lead.notes || ""
  }));
  const pages = [];
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    const pageRows = rows.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage);
    const lines = [];

    lines.push("0 g");
    lines.push("BT /F1 20 Tf 36 796 Td (Honest Imob - SDR) Tj ET");
    lines.push(`BT /F1 10 Tf 36 778 Td (${pdfText(`Relatorio de leads - ${dateLabel(todayPlus(0))}`)}) Tj ET`);
    lines.push(`BT /F1 9 Tf 500 778 Td (${pdfText(`Pag. ${pageIndex + 1}/${totalPages}`)}) Tj ET`);
    lines.push(`0.94 g ${margin} ${tableTop} ${pageWidth - margin * 2} 26 re f`);
    lines.push("0 G 0.7 w");
    lines.push(`${margin} ${tableTop} ${pageWidth - margin * 2} 26 re S`);
    lines.push("0 g");
    columns.forEach((column) => {
      lines.push(`BT /F1 9 Tf ${column.x} ${tableTop + 9} Td (${pdfText(column.label)}) Tj ET`);
    });

    pageRows.forEach((row, index) => {
      const y = tableTop - rowHeight - index * rowHeight;
      const fill = index % 2 === 0 ? "1 g" : "0.985 g";
      lines.push(`${fill} ${margin} ${y} ${pageWidth - margin * 2} ${rowHeight} re f`);
      lines.push(`0.82 G 0.4 w ${margin} ${y} ${pageWidth - margin * 2} ${rowHeight} re S`);
      lines.push("0 g");
      columns.forEach((column) => {
        const value = truncateForPdf(row[column.key], column.width);
        lines.push(`BT /F1 8 Tf ${column.x} ${y + 22} Td (${pdfText(value)}) Tj ET`);
      });
    });

    if (!rows.length) {
      lines.push("0 g");
      lines.push("BT /F1 11 Tf 36 704 Td (Nenhum lead cadastrado.) Tj ET");
    }

    pages.push(lines.join("\n"));
  }

  return buildPdf(pages, pageWidth, pageHeight);
}

function truncateForPdf(value, width) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  const maxChars = Math.max(6, Math.floor(width / 4.1));
  return text.length > maxChars ? `${text.slice(0, maxChars - 3)}...` : text;
}

function pdfText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildPdf(pageContents, width, height) {
  const objects = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Kids [${pageContents.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pageContents.length} >>`);

  pageContents.forEach((content, index) => {
    const pageObject = 3 + index * 2;
    const contentObject = pageObject + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 ${3 + pageContents.length * 2} 0 R >> >> /Contents ${contentObject} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
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
fillContactStatusSelect();
fillPropertyFilters();
render();
if (sessionStorage.getItem(authKey) === "true") {
  showApp();
} else {
  els.loginUser.focus();
}
