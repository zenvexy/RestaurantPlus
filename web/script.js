const API_URL = "https://restaurantplus-backend.vercel.app";

const TODAS_CATEGORIAS_PRISMA = ["ENTRADA", "PRATO_PRINCIPAL", "SOBREMESA", "BEBIDA"];
const TODOS_STATUS_PEDIDO_PRISMA = ["PENDENTE", "PREPARANDO", "CONCLUIDO", "CANCELADO"];

let categoriasCache = [];
let pratosCache = [];
let ingredientesCache = [];
let mesasCache = [];
let pedidosCache = [];

let enumsStatusPedido = [...TODOS_STATUS_PEDIDO_PRISMA];
let enumsCategorias = [...TODAS_CATEGORIAS_PRISMA];

let modalRecursoAtual = "";
let modalEditId = null;

document.addEventListener("DOMContentLoaded", () => {
    configurarNavegacao();
    configurarEventosModal();
    carregarTudo();
});

function configurarNavegacao() {
    const links = document.querySelectorAll(".nav-item");
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute("data-section");
            
            links.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
            const targetElement = document.getElementById(`section-${targetSection}`);
            if (targetElement) {
                targetElement.classList.add("active");
            }
        });
    });
}

function configurarEventosModal() {
    const overlay = document.getElementById("modal-overlay");
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            fecharModal();
        }
    });

    const form = document.getElementById("modal-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            salvarModal();
        });
    }
}

async function requisicao(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

        if (!response.ok) {
            const erroData = await response.json().catch(() => ({}));
            throw new Error(erroData.message || `Erro ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (err) {
        exibirToast(err.message || "Erro de conexão com o servidor", "error");
        throw err;
    }
}

function exibirToast(mensagem, tipo = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    
    const icon = tipo === "success" ? "check_circle" : "error_outline";
    toast.innerHTML = `<span class="material-icons-round">${icon}</span><span>${mensagem}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = "toastOut 0.3s forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

async function carregarTudo() {
    await carregarEnums();
    await Promise.all([
        carregarCategorias(),
        carregarIngredientes(),
        carregarMesas(),
        carregarPratos(),
        carregarPedidos()
    ]);
    atualizarTudoUI();
}

function atualizarTudoUI() {
    renderizarPratos();
    renderizarCategorias();
    renderizarIngredientes();
    renderizarMesas();
    renderizarPedidos();
    atualizarDashboard();
}

async function carregarEnums() {
    try {
        const [statusList, catList] = await Promise.all([
            requisicao("/enums/status-pedido").catch(() => TODOS_STATUS_PEDIDO_PRISMA),
            requisicao("/enums/categorias").catch(() => TODAS_CATEGORIAS_PRISMA)
        ]);
        if (Array.isArray(statusList) && statusList.length > 0) enumsStatusPedido = statusList;
        if (Array.isArray(catList) && catList.length > 0) enumsCategorias = catList;
    } catch (e) {}
}

async function carregarCategorias() {
    try {
        const data = await requisicao("/categorias/listar");
        categoriasCache = data;
        renderizarCategorias();
    } catch (e) {}
}

async function carregarIngredientes() {
    try {
        const data = await requisicao("/ingredientes/listar");
        ingredientesCache = data;
        renderizarIngredientes();
    } catch (e) {}
}

async function carregarMesas() {
    try {
        const data = await requisicao("/mesas/listar");
        mesasCache = data;
        renderizarMesas();
    } catch (e) {}
}

async function carregarPratos() {
    try {
        const data = await requisicao("/pratos/listar");
        pratosCache = data;
        renderizarPratos();
    } catch (e) {}
}

async function carregarPedidos() {
    try {
        const data = await requisicao("/pedidos/listar");
        pedidosCache = data;
        renderizarPedidos();
    } catch (e) {}
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarNomeEnum(valor) {
    if (!valor) return "";
    return valor.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function atualizarDashboard() {
    document.getElementById("stat-pratos").textContent = pratosCache.length;
    document.getElementById("stat-categorias").textContent = enumsCategorias.length;
    document.getElementById("stat-mesas").textContent = mesasCache.length;
    document.getElementById("stat-pedidos").textContent = pedidosCache.length;

    const pedidosContainer = document.getElementById("dashboard-pedidos-recentes");
    if (pedidosCache.length === 0) {
        pedidosContainer.innerHTML = `<div class="empty-state"><p>Sem pedidos registrados</p></div>`;
    } else {
        const ultimosPedidos = [...pedidosCache].reverse().slice(0, 5);
        pedidosContainer.innerHTML = ultimosPedidos.map(p => `
            <div class="pedido-mini">
                <div class="pedido-mini-info">
                    <span class="pedido-mini-cliente">${escapeHtml(p.cliente)}</span>
                    <span class="pedido-mini-mesa">Mesa ${p.mesa ? p.mesa.numero : p.mesaId}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="badge ${badgeStatus(p.status)}">${p.status}</span>
                    <span class="pedido-mini-valor">${formatarMoeda(p.total)}</span>
                </div>
            </div>
        `).join("");
    }

    const mesasContainer = document.getElementById("dashboard-mesas-status");
    if (mesasCache.length === 0) {
        mesasContainer.innerHTML = `<div class="empty-state"><p>Sem mesas registradas</p></div>`;
    } else {
        const mesasOrdenadas = [...mesasCache].sort((a, b) => a.numero - b.numero);
        mesasContainer.innerHTML = mesasOrdenadas.map(m => `
            <div class="mesa-mini">
                <div class="mesa-mini-info">
                    <span class="material-icons-round" style="color: ${m.ocupada === "SIM" ? "var(--danger)" : "var(--success)"}">
                        ${m.ocupada === "SIM" ? "event_busy" : "event_available"}
                    </span>
                    <div>
                        <div class="mesa-mini-numero">Mesa ${m.numero}</div>
                        <div class="mesa-mini-cap">Capacidade: ${m.capacidade} pessoas</div>
                    </div>
                </div>
                <span class="badge ${m.ocupada === "SIM" ? "badge-danger" : "badge-success"}">
                    ${m.ocupada === "SIM" ? "Ocupada" : "Livre"}
                </span>
            </div>
        `).join("");
    }
}

function badgeStatus(status) {
    switch (status) {
        case "PENDENTE": return "badge-warning";
        case "PREPARANDO": return "badge-info";
        case "CONCLUIDO": return "badge-success";
        case "CANCELADO": return "badge-danger";
        default: return "badge-neutral";
    }
}

function renderizarPratos() {
    const tbody = document.getElementById("tabela-pratos");
    const empty = document.getElementById("empty-pratos");

    if (pratosCache.length === 0) {
        tbody.innerHTML = "";
        empty.style.display = "block";
        return;
    }
    empty.style.display = "none";

    tbody.innerHTML = pratosCache.map(p => `
        <tr>
            <td style="font-weight: 600;">${escapeHtml(p.nome)}</td>
            <td style="color: var(--text-muted); max-width: 250px;">${escapeHtml(p.descricao || "-")}</td>
            <td style="font-weight: 700; color: var(--success);">${formatarMoeda(p.preco)}</td>
            <td>
                <span class="badge badge-primary">
                    ${p.categoria ? formatarNomeEnum(p.categoria.categoria) : "-"}
                </span>
            </td>
            <td>
                <span class="badge ${p.disponivel === "SIM" ? "badge-success" : "badge-danger"}">
                    ${p.disponivel === "SIM" ? "Sim" : "Não"}
                </span>
            </td>
            <td>
                <div class="ingredientes-tags">
                    ${p.ingredientes && p.ingredientes.length > 0 
                        ? p.ingredientes.map(i => `<span class="badge badge-neutral">${escapeHtml(i.nome)}</span>`).join("")
                        : `<span style="color: var(--text-muted); font-size: 12px;">Nenhum</span>`
                    }
                </div>
            </td>
            <td>
                <div class="acoes">
                    <button class="btn-icon edit" onclick="editarPrato(${p.id})" title="Editar">
                        <span class="material-icons-round">edit</span>
                    </button>
                    <button class="btn-icon delete" onclick="excluirItem('pratos', ${p.id})" title="Excluir">
                        <span class="material-icons-round">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

function renderizarCategorias() {
    const tbody = document.getElementById("tabela-categorias");

    const listaFinal = enumsCategorias.map(catEnum => {
        const itemBanco = categoriasCache.find(c => c.categoria === catEnum);
        const pratos = itemBanco && itemBanco.pratos ? itemBanco.pratos.length : 
                       pratosCache.filter(p => p.categoria && p.categoria.categoria === catEnum).length;
        return {
            enum: catEnum,
            id: itemBanco ? itemBanco.id : null,
            cadastrada: Boolean(itemBanco),
            totalPratos: pratos
        };
    });

    tbody.innerHTML = listaFinal.map(c => `
        <tr>
            <td style="font-weight: 600; font-size: 15px;">
                ${formatarNomeEnum(c.enum)}
            </td>
            <td>
                <span class="badge badge-primary">
                    ${c.enum}
                </span>
            </td>
            <td>
                <span class="badge ${c.cadastrada ? 'badge-success' : 'badge-warning'}">
                    ${c.cadastrada ? `Ativa (ID: ${c.id})` : 'Pendente no Banco'}
                </span>
            </td>
            <td>
                <span class="badge badge-neutral">
                    ${c.totalPratos} prato(s)
                </span>
            </td>
        </tr>
    `).join("");
}

function renderizarIngredientes() {
    const tbody = document.getElementById("tabela-ingredientes");
    const empty = document.getElementById("empty-ingredientes");

    if (ingredientesCache.length === 0) {
        tbody.innerHTML = "";
        empty.style.display = "block";
        return;
    }
    empty.style.display = "none";

    tbody.innerHTML = ingredientesCache.map(i => `
        <tr>
            <td>#${i.id}</td>
            <td style="font-weight: 600;">${escapeHtml(i.nome)}</td>
            <td>
                <span class="badge ${i.quantidade > 5 ? "badge-success" : "badge-danger"}">
                    ${i.quantidade} unidades
                </span>
            </td>
            <td>
                <div class="acoes">
                    <button class="btn-icon edit" onclick="editarIngrediente(${i.id})" title="Editar">
                        <span class="material-icons-round">edit</span>
                    </button>
                    <button class="btn-icon delete" onclick="excluirItem('ingredientes', ${i.id})" title="Excluir">
                        <span class="material-icons-round">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

function renderizarMesas() {
    const grid = document.getElementById("grid-mesas");
    const empty = document.getElementById("empty-mesas");

    if (mesasCache.length === 0) {
        grid.innerHTML = "";
        empty.style.display = "block";
        return;
    }
    empty.style.display = "none";

    const mesasOrdenadas = [...mesasCache].sort((a, b) => a.numero - b.numero);

    grid.innerHTML = mesasOrdenadas.map(m => `
        <div class="mesa-card ${m.ocupada === "SIM" ? "ocupada" : "livre"}">
            <div class="mesa-card-top">
                <span class="mesa-card-numero">Mesa ${m.numero}</span>
                <span class="badge ${m.ocupada === "SIM" ? "badge-danger" : "badge-success"}">
                    ${m.ocupada === "SIM" ? "Ocupada" : "Livre"}
                </span>
            </div>
            <div class="mesa-card-info">
                <div class="mesa-card-info-row">
                    <span class="material-icons-round">people</span>
                    Capacidade: ${m.capacidade} lugares
                </div>
                <div class="mesa-card-info-row">
                    <span class="material-icons-round">receipt_long</span>
                    Pedidos: ${m.pedidos ? m.pedidos.length : 0}
                </div>
            </div>
            <div class="mesa-card-actions">
                <button class="btn btn-ghost" style="flex: 1; padding: 6px 10px; font-size: 12px;" onclick="alternarOcupacaoMesa(${m.id}, '${m.ocupada}')">
                    <span class="material-icons-round" style="font-size: 16px;">sync_alt</span>
                    ${m.ocupada === "SIM" ? "Liberar" : "Ocupar"}
                </button>
                <button class="btn-icon edit" onclick="editarMesa(${m.id})" title="Editar">
                    <span class="material-icons-round">edit</span>
                </button>
                <button class="btn-icon delete" onclick="excluirItem('mesas', ${m.id})" title="Excluir">
                    <span class="material-icons-round">delete</span>
                </button>
            </div>
        </div>
    `).join("");
}

async function alternarOcupacaoMesa(id, ocupadaAtual) {
    const novoStatus = ocupadaAtual === "SIM" ? "NAO" : "SIM";
    
    const mesaLocal = mesasCache.find(m => m.id === id);
    if (mesaLocal) {
        mesaLocal.ocupada = novoStatus;
        renderizarMesas();
        atualizarDashboard();
    }

    try {
        await requisicao(`/mesas/atualizar/${id}`, {
            method: "PUT",
            body: JSON.stringify({ ocupada: novoStatus })
        });
        exibirToast(`Status da mesa atualizado com sucesso!`);
        await carregarMesas();
        renderizarMesas();
        atualizarDashboard();
    } catch (e) {
        if (mesaLocal) {
            mesaLocal.ocupada = ocupadaAtual;
            renderizarMesas();
            atualizarDashboard();
        }
    }
}

function renderizarPedidos() {
    const tbody = document.getElementById("tabela-pedidos");
    const empty = document.getElementById("empty-pedidos");

    if (pedidosCache.length === 0) {
        tbody.innerHTML = "";
        empty.style.display = "block";
        return;
    }
    empty.style.display = "none";

    const pedidosOrdenados = [...pedidosCache].reverse();

    tbody.innerHTML = pedidosOrdenados.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td style="font-weight: 600;">${escapeHtml(p.cliente)}</td>
            <td>
                <span class="badge badge-neutral">
                    Mesa ${p.mesa ? p.mesa.numero : p.mesaId}
                </span>
            </td>
            <td style="font-weight: 700; color: var(--success);">${formatarMoeda(p.total)}</td>
            <td>
                <select class="status-select badge ${badgeStatus(p.status)}" 
                        style="background-color: transparent; border: 1px solid var(--border); color: inherit; padding: 4px 8px; border-radius: 20px; font-weight: 600;"
                        onchange="atualizarStatusPedido(${p.id}, this.value)">
                    ${enumsStatusPedido.map(st => `
                        <option value="${st}" ${p.status === st ? "selected" : ""}>${st}</option>
                    `).join("")}
                </select>
            </td>
            <td>
                <div class="acoes">
                    <button class="btn-icon edit" onclick="editarPedido(${p.id})" title="Editar">
                        <span class="material-icons-round">edit</span>
                    </button>
                    <button class="btn-icon delete" onclick="excluirItem('pedidos', ${p.id})" title="Excluir">
                        <span class="material-icons-round">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

async function atualizarStatusPedido(id, novoStatus) {
    const pedidoLocal = pedidosCache.find(p => p.id === id);
    const statusAnterior = pedidoLocal ? pedidoLocal.status : null;
    
    if (pedidoLocal) {
        pedidoLocal.status = novoStatus;
        renderizarPedidos();
        atualizarDashboard();
    }

    try {
        await requisicao(`/pedidos/atualizar/${id}`, {
            method: "PUT",
            body: JSON.stringify({ status: novoStatus })
        });
        exibirToast("Status do pedido alterado!");
        await carregarPedidos();
        renderizarPedidos();
        atualizarDashboard();
    } catch (e) {
        if (pedidoLocal && statusAnterior) {
            pedidoLocal.status = statusAnterior;
            renderizarPedidos();
            atualizarDashboard();
        }
    }
}

function abrirModal(recurso, id = null) {
    modalRecursoAtual = recurso;
    modalEditId = id;
    
    const titulo = document.getElementById("modal-titulo");
    const form = document.getElementById("modal-form");
    const isEdit = id !== null;

    form.innerHTML = "";

    if (recurso === "pratos") {
        const item = isEdit ? pratosCache.find(x => x.id === id) : null;
        titulo.textContent = isEdit ? "Editar Prato" : "Novo Prato";
        
        const categoriasOptions = enumsCategorias.map(catEnum => {
            const catBanco = categoriasCache.find(c => c.categoria === catEnum);
            const valueId = catBanco ? catBanco.id : "";
            const isSelected = item && (item.categoriaId === valueId || (item.categoria && item.categoria.categoria === catEnum));
            return `
                <option value="${valueId}" data-enum="${catEnum}" ${isSelected ? "selected" : ""} ${!catBanco ? "disabled" : ""}>
                    ${formatarNomeEnum(catEnum)} ${!catBanco ? "(não sincronizada)" : ""}
                </option>
            `;
        }).join("");

        const ingredientesChecks = ingredientesCache.map(i => {
            const checked = item && item.ingredientes && item.ingredientes.some(ing => ing.id === i.id);
            return `
                <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; text-transform: none;">
                    <input type="checkbox" name="ingrediente_id" value="${i.id}" ${checked ? "checked" : ""}>
                    ${escapeHtml(i.nome)} (${i.quantidade} un.)
                </label>
            `;
        }).join("");

        form.innerHTML = `
            <div class="form-group">
                <label>Nome do Prato</label>
                <input type="text" id="prato-nome" value="${item ? escapeHtml(item.nome) : ""}" required placeholder="Ex: Salada Especial">
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <input type="text" id="prato-descricao" value="${item ? escapeHtml(item.descricao) : ""}" required placeholder="Ex: Alface fresco com molho caseiro">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Preço (R$)</label>
                    <input type="number" step="0.01" min="0" id="prato-preco" value="${item ? item.preco : ""}" required placeholder="0.00">
                </div>
                <div class="form-group">
                    <label>Categoria</label>
                    <select id="prato-categoria" required>
                        <option value="">Selecione...</option>
                        ${categoriasOptions}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Disponível</label>
                <select id="prato-disponivel">
                    <option value="SIM" ${item && item.disponivel === "SIM" ? "selected" : ""}>Sim</option>
                    <option value="NAO" ${item && item.disponivel === "NAO" ? "selected" : ""}>Não</option>
                </select>
            </div>
            <div class="form-group">
                <label>Ingredientes</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 140px; overflow-y: auto; padding: 10px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                    ${ingredientesChecks || '<span style="color: var(--text-muted); font-size: 13px;">Nenhum ingrediente cadastrado</span>'}
                </div>
            </div>
        `;
    } else if (recurso === "ingredientes") {
        const item = isEdit ? ingredientesCache.find(x => x.id === id) : null;
        titulo.textContent = isEdit ? "Editar Ingrediente" : "Novo Ingrediente";
        
        form.innerHTML = `
            <div class="form-group">
                <label>Nome do Ingrediente</label>
                <input type="text" id="ingrediente-nome" value="${item ? escapeHtml(item.nome) : ""}" required placeholder="Ex: Queijo Mussarela">
            </div>
            <div class="form-group">
                <label>Quantidade em Estoque</label>
                <input type="number" min="0" id="ingrediente-quantidade" value="${item ? item.quantidade : ""}" required placeholder="Ex: 50">
            </div>
        `;
    } else if (recurso === "mesas") {
        const item = isEdit ? mesasCache.find(x => x.id === id) : null;
        titulo.textContent = isEdit ? "Editar Mesa" : "Nova Mesa";
        
        form.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Número da Mesa</label>
                    <input type="number" min="1" id="mesa-numero" value="${item ? item.numero : ""}" required placeholder="Ex: 5">
                </div>
                <div class="form-group">
                    <label>Capacidade (Pessoas)</label>
                    <input type="number" min="1" id="mesa-capacidade" value="${item ? item.capacidade : ""}" required placeholder="Ex: 4">
                </div>
            </div>
            <div class="form-group">
                <label>Ocupada</label>
                <select id="mesa-ocupada">
                    <option value="NAO" ${item && item.ocupada === "NAO" ? "selected" : ""}>Não</option>
                    <option value="SIM" ${item && item.ocupada === "SIM" ? "selected" : ""}>Sim</option>
                </select>
            </div>
        `;
    } else if (recurso === "pedidos") {
        const item = isEdit ? pedidosCache.find(x => x.id === id) : null;
        titulo.textContent = isEdit ? "Editar Pedido" : "Novo Pedido";
        
        const mesasOptions = mesasCache.map(m => `
            <option value="${m.id}" ${item && item.mesaId === m.id ? "selected" : ""}>
                Mesa ${m.numero} (${m.capacidade} lug.)
            </option>
        `).join("");

        form.innerHTML = `
            <div class="form-group">
                <label>Nome do Cliente</label>
                <input type="text" id="pedido-cliente" value="${item ? escapeHtml(item.cliente) : ""}" required placeholder="Ex: João da Silva">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Mesa</label>
                    <select id="pedido-mesa" required>
                        <option value="">Selecione...</option>
                        ${mesasOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Total (R$)</label>
                    <input type="number" step="0.01" min="0" id="pedido-total" value="${item ? item.total : ""}" required placeholder="0.00">
                </div>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="pedido-status">
                    ${enumsStatusPedido.map(st => `
                        <option value="${st}" ${item && item.status === st ? "selected" : ""}>${st}</option>
                    `).join("")}
                </select>
            </div>
        `;
    }

    document.getElementById("modal-overlay").classList.add("active");
}

function fecharModal() {
    document.getElementById("modal-overlay").classList.remove("active");
    modalRecursoAtual = "";
    modalEditId = null;
}

async function salvarModal() {
    const isEdit = modalEditId !== null;
    let endpoint = "";
    let method = isEdit ? "PUT" : "POST";
    let body = {};
    const recurso = modalRecursoAtual;
    const idAtual = modalEditId;

    if (recurso === "pratos") {
        const nome = document.getElementById("prato-nome").value.trim();
        const descricao = document.getElementById("prato-descricao").value.trim();
        const preco = parseFloat(document.getElementById("prato-preco").value);
        const categoriaId = parseInt(document.getElementById("prato-categoria").value);
        const disponivel = document.getElementById("prato-disponivel").value;

        if (!nome || !descricao || isNaN(preco) || isNaN(categoriaId)) {
            exibirToast("Preencha todos os campos obrigatórios do prato!", "error");
            return;
        }

        const ingredientesChecked = Array.from(document.querySelectorAll("input[name='ingrediente_id']:checked"))
            .map(el => ({ id: parseInt(el.value) }));

        if (isEdit) {
            endpoint = `/pratos/atualizar/${idAtual}`;
            body = {
                nome,
                descricao,
                preco,
                disponivel,
                categoriaId,
                ingredientes: {
                    set: ingredientesChecked
                }
            };
        } else {
            endpoint = "/pratos/cadastrar";
            body = {
                nome,
                descricao,
                preco,
                disponivel,
                categoria: {
                    connect: { id: categoriaId }
                }
            };

            if (ingredientesChecked.length > 0) {
                body.ingredientes = {
                    connect: ingredientesChecked
                };
            }
        }
    } else if (recurso === "ingredientes") {
        const nome = document.getElementById("ingrediente-nome").value.trim();
        const quantidade = parseInt(document.getElementById("ingrediente-quantidade").value);

        if (!nome || isNaN(quantidade)) {
            exibirToast("Preencha nome e quantidade válida!", "error");
            return;
        }

        endpoint = isEdit ? `/ingredientes/atualizar/${idAtual}` : "/ingredientes/cadastrar";
        body = { nome, quantidade };
    } else if (recurso === "mesas") {
        const numero = parseInt(document.getElementById("mesa-numero").value);
        const capacidade = parseInt(document.getElementById("mesa-capacidade").value);
        const ocupada = document.getElementById("mesa-ocupada").value;

        if (isNaN(numero) || isNaN(capacidade)) {
            exibirToast("Preencha número e capacidade da mesa!", "error");
            return;
        }

        endpoint = isEdit ? `/mesas/atualizar/${idAtual}` : "/mesas/cadastrar";
        body = { numero, capacidade, ocupada };
    } else if (recurso === "pedidos") {
        const cliente = document.getElementById("pedido-cliente").value.trim();
        const total = parseFloat(document.getElementById("pedido-total").value);
        const mesaId = parseInt(document.getElementById("pedido-mesa").value);
        const status = document.getElementById("pedido-status").value;

        if (!cliente || isNaN(total) || isNaN(mesaId)) {
            exibirToast("Preencha todos os dados do pedido!", "error");
            return;
        }

        if (isEdit) {
            endpoint = `/pedidos/atualizar/${idAtual}`;
            body = { cliente, total, status, mesaId };
        } else {
            endpoint = "/pedidos/cadastrar";
            body = {
                cliente,
                total,
                status,
                mesa: {
                    connect: { id: mesaId }
                }
            };
        }
    }

    try {
        const btnSalvar = document.getElementById("modal-btn-salvar");
        btnSalvar.disabled = true;
        btnSalvar.style.opacity = "0.7";

        await requisicao(endpoint, {
            method,
            body: JSON.stringify(body)
        });

        exibirToast(`${isEdit ? "Atualizado" : "Cadastrado"} com sucesso!`);
        fecharModal();

        if (recurso === "pratos") {
            await carregarPratos();
            renderizarPratos();
            renderizarCategorias();
        } else if (recurso === "ingredientes") {
            await carregarIngredientes();
            renderizarIngredientes();
        } else if (recurso === "mesas") {
            await carregarMesas();
            renderizarMesas();
        } else if (recurso === "pedidos") {
            await carregarPedidos();
            renderizarPedidos();
        }

        atualizarDashboard();
    } catch (e) {
    } finally {
        const btnSalvar = document.getElementById("modal-btn-salvar");
        if (btnSalvar) {
            btnSalvar.disabled = false;
            btnSalvar.style.opacity = "1";
        }
    }
}

function editarPrato(id) {
    abrirModal("pratos", id);
}

function editarIngrediente(id) {
    abrirModal("ingredientes", id);
}

function editarMesa(id) {
    abrirModal("mesas", id);
}

function editarPedido(id) {
    abrirModal("pedidos", id);
}

async function excluirItem(recurso, id) {
    if (!confirm(`Deseja realmente excluir este item?`)) {
        return;
    }

    if (recurso === "pratos") {
        pratosCache = pratosCache.filter(p => p.id !== id);
        renderizarPratos();
        renderizarCategorias();
    } else if (recurso === "ingredientes") {
        ingredientesCache = ingredientesCache.filter(i => i.id !== id);
        renderizarIngredientes();
    } else if (recurso === "mesas") {
        mesasCache = mesasCache.filter(m => m.id !== id);
        renderizarMesas();
    } else if (recurso === "pedidos") {
        pedidosCache = pedidosCache.filter(p => p.id !== id);
        renderizarPedidos();
    }
    atualizarDashboard();

    try {
        await requisicao(`/${recurso}/excluir/${id}`, {
            method: "DELETE"
        });

        exibirToast("Item excluído com sucesso!");

        if (recurso === "pratos") await carregarPratos();
        else if (recurso === "ingredientes") await carregarIngredientes();
        else if (recurso === "mesas") await carregarMesas();
        else if (recurso === "pedidos") await carregarPedidos();

        atualizarTudoUI();
    } catch (e) {
        if (recurso === "pratos") await carregarPratos();
        else if (recurso === "ingredientes") await carregarIngredientes();
        else if (recurso === "mesas") await carregarMesas();
        else if (recurso === "pedidos") await carregarPedidos();
        atualizarTudoUI();
    }
}

function escapeHtml(texto) {
    if (!texto) return "";
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
