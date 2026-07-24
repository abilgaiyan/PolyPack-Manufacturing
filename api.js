// ============================================================
//  PolyPack — Full-Stack MES & ERP API Client
//  Connects directly to PolyPack Express Backend (/api)
// ============================================================

const API = (() => {

  async function request(url, options = {}) {
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn(`API request to ${url} failed:`, err);
      return { ok: false, error: "Network error: " + err.message };
    }
  }

  return {

    // ── Auth ────────────────────────────────────────────────
    login(employee_id, pin) {
      return request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ employee_id, pin })
      });
    },

    // ── Dashboard ───────────────────────────────────────────
    getDashboard() {
      return request('/api/dashboard');
    },

    // ── Master Data ─────────────────────────────────────────
    getMasterData() {
      return request('/api/master/all');
    },

    addEmployee(data) {
      return request('/api/master/employees', { method: 'POST', body: JSON.stringify(data) });
    },

    deleteEmployee(id) {
      return request(`/api/master/employees/${id}`, { method: 'DELETE' });
    },

    addMachine(data) {
      return request('/api/master/machines', { method: 'POST', body: JSON.stringify(data) });
    },

    deleteMachine(id) {
      return request(`/api/master/machines/${id}`, { method: 'DELETE' });
    },

    addMaterial(data) {
      return request('/api/master/materials', { method: 'POST', body: JSON.stringify(data) });
    },

    deleteMaterial(id) {
      return request(`/api/master/materials/${id}`, { method: 'DELETE' });
    },

    addClient(data) {
      return request('/api/master/clients', { method: 'POST', body: JSON.stringify(data) });
    },

    deleteClient(id) {
      return request(`/api/master/clients/${id}`, { method: 'DELETE' });
    },

    addTallyMapping(data) {
      return request('/api/master/tally-mapping', { method: 'POST', body: JSON.stringify(data) });
    },

    deleteTallyMapping(id) {
      return request(`/api/master/tally-mapping/${id}`, { method: 'DELETE' });
    },

    // ── Production Logs ─────────────────────────────────────
    logExtrusion(payload) {
      return request('/api/production/extrusion', { method: 'POST', body: JSON.stringify(payload) });
    },

    logCutting(payload) {
      return request('/api/production/cutting', { method: 'POST', body: JSON.stringify(payload) });
    },

    markAttendance(payload) {
      return request('/api/production/attendance', { method: 'POST', body: JSON.stringify(payload) });
    },

    logDispatch(payload) {
      return request('/api/dispatch', { method: 'POST', body: JSON.stringify(payload) });
    },

    getProductionLogs() {
      return request('/api/production/logs');
    },

    // ── Stock & GRN ─────────────────────────────────────────
    getStock() {
      return request('/api/stock');
    },

    logGRN(payload) {
      return request('/api/stock/grn', { method: 'POST', body: JSON.stringify(payload) });
    },

    // ── Orders & Tally ──────────────────────────────────────
    getOrders() {
      return request('/api/orders');
    },

    createOrder(payload) {
      return request('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
    },

    getTallyData() {
      return request('/api/tally/data');
    },

    syncTally() {
      return request('/api/tally/sync', { method: 'POST' });
    },

    // ── AI Assistant & Production Planner ───────────────────
    aiChat(prompt, language = 'hinglish') {
      return request('/api/ai/chat', { method: 'POST', body: JSON.stringify({ prompt, language }) });
    },

    aiPlan() {
      return request('/api/ai/plan', { method: 'POST' });
    },

    // ── Settings & Archive ──────────────────────────────────
    getSettings() {
      return request('/api/settings');
    },

    saveSettings(payload) {
      return request('/api/settings', { method: 'POST', body: JSON.stringify(payload) });
    },

    archiveFY(fy_label, archived_by) {
      return request('/api/archive', { method: 'POST', body: JSON.stringify({ fy_label, archived_by }) });
    }

  };

})();
