let andarAbertoAtual = null;

// ================= BASE DE ANDARES =================
const baseAndares = {
    "Bloco A": ["9º Andar", "8º Andar", "7º Andar", "6º Andar", "5º Andar", "4º Andar", "3º Andar", "2º Andar", "1º Andar", "Térreo", "3º Subsolo", "4º Subsolo"],
    "Bloco B": ["6º Andar", "5º Andar", "4º Andar", "3º Andar", "2º Andar", "1º Andar", "Térreo", "1º Subsolo", "2º Subsolo", "3º Subsolo", "4º Subsolo", "5º Subsolo"],
    "Bloco C": ["7º Andar", "6º Andar", "5º Andar", "4º Andar", "3º Andar", "2º Andar", "1º Andar", "Térreo", "1º Subsolo", "2º Subsolo", "3º Subsolo", "4º Subsolo", "5º Subsolo", "6º Subsolo"],
    "Bloco D": ["8º Andar", "7º Andar", "6º Andar", "5º Andar", "4º Andar", "3º Andar", "2º Andar", "1º Andar", "Mezanino", "Térreo", "1º Subsolo", "2º Subsolo"]
};

// ================= MODO DA PÁGINA =================
const params = new URLSearchParams(window.location.search);
const MODO_PUBLICO = params.get("modo") === "publico";
const campoBusca = document.querySelector(".campo-busca");



const BLOCO_QR = params.get("bloco");
const ANDAR_QR = params.get("andar");

if (MODO_PUBLICO) {
    document.body.classList.add("modo-publico");
}

// ================= VARIÁVEIS =================
let brigadistas = [];
let brigadistasLocal = [];

// ================= CARREGAMENTO =================
async function carregarBrigadistas() {
    try {
        const res = await fetch("dados/brigadistas.json");
        const brigadistasJson = await res.json();

        brigadistasLocal =
            JSON.parse(localStorage.getItem("brigadistas")) || [];

        brigadistas = [...brigadistasJson, ...brigadistasLocal];

        atualizarPainelCompleto();

        if (MODO_PUBLICO && BLOCO_QR && ANDAR_QR) {
            abrirAndar(BLOCO_QR, ANDAR_QR);
        }

    } catch (error) {
        console.error("Erro ao carregar brigadistas:", error);
    }
}

carregarBrigadistas();

// ================= AJUSTES MODO PÚBLICO =================
if (MODO_PUBLICO) {
    document.querySelector(".campo-busca")?.remove();
    document.querySelector(".dashboard-blocos")?.remove();
    document.querySelector(".resumo-brigadistas")?.remove();

    const titulo = document.getElementById("tituloLocal");
    if (titulo) titulo.textContent = "Brigadistas do andar";
}

// ================= ATUALIZAÇÕES =================
function atualizarPainelCompleto() {
    atualizarTotalGeral();
    atualizarDashboardBlocos();
    atualizarBadges();
}

function atualizarTotalGeral() {
    const el = document.getElementById("totalBrigadistas");
    if (el && !MODO_PUBLICO) el.textContent = brigadistas.length;
}

// ================= ABRIR ANDAR =================
function abrirAndar(bloco, andar, elemento) {

    const box = document.getElementById('boxLocal');
    const lista = document.getElementById("listaBrigadistas");

    document.getElementById('localBloco').innerText = bloco;
    document.getElementById('localAndar').innerText = andar;

    box.classList.add("ativo");

    document.querySelectorAll(".andar")
        .forEach(a => a.classList.remove("andar-ativo"));

    elemento?.classList.add("andar-ativo");

    lista.innerHTML = "";

    const filtrados = brigadistas.filter(b =>
        b.bloco === bloco && b.andar === andar
    );

    if (filtrados.length === 0) {
        lista.innerHTML =
            `<p class="sem-dados">Nenhum brigadista cadastrado neste andar.</p>`;
    } else {
        filtrados.forEach(b => lista.appendChild(criarCardBrigadista(b)));
    }

    window.scrollTo({
        top: document.getElementById("painelConteudo").offsetTop - 20,
        behavior: "smooth"
    });

}



// ================= CARD =================
function criarCardBrigadista(b) {

    const isLocal = brigadistasLocal.some(l => l.matricula === b.matricula);

    let srcFoto = "imagens/avatar-padrao.png";

    if (b.fotoBase64 && b.fotoBase64.startsWith("data:image")) {
        // Foto vinda do cadastro
        srcFoto = b.fotoBase64;

    } else if (b.foto) {
        // Foto vinda do JSON ou pasta
        srcFoto = b.foto.startsWith("data:image")
            ? b.foto
            : "imagens/brigadistas/" + b.foto;
    }

    const card = document.createElement("div");
    card.className = "brigadista-card";

    card.innerHTML = `
        <img src="${srcFoto}" 
             onerror="this.src='imagens/avatar-padrao.png'">

        <h4>${b.nome}</h4>
        <span class="funcao">${b.funcao}</span>

        <small>Matrícula: ${b.matricula}</small>
        <small>${b.setor}</small>
        <small>${b.bloco} • ${b.andar}</small>

        ${(!MODO_PUBLICO && isLocal) ? `
        <div class="acoes-card">
            <button class="btn-editar"
                onclick="editarBrigadista('${b.matricula}')">✏️</button>
            <button class="btn-excluir"
                onclick="excluirBrigadista('${b.matricula}')">🗑️</button>
        </div>` : ""}
    `;

    return card;
}

// ================= BADGES =================
function atualizarBadges() {
    document.querySelectorAll(".andar").forEach(andarDiv => {

        const bloco = andarDiv.closest(".torre-predio")
            ?.querySelector(".topo-predio")?.textContent;

        const andar = andarDiv.querySelector(".andar-nome")?.textContent;

        if (!bloco || !andar) return;

        const total = brigadistas.filter(b =>
            b.bloco === bloco && b.andar === andar
        ).length;

        const badge = andarDiv.querySelector(".badge-brigadista");
        if (badge) badge.textContent = total;
    });
}

// ================= DASHBOARD =================
function atualizarDashboardBlocos() {
    if (MODO_PUBLICO) return;

    document.querySelectorAll(".card-bloco").forEach(card => {
        const bloco = card.dataset.bloco;
        const total = brigadistas.filter(b => b.bloco === bloco).length;
        card.querySelector(".qtd-bloco").textContent = total;
    });
}

// ================= EXCLUIR =================
function excluirBrigadista(matricula) {
    if (!confirm("Deseja excluir este brigadista?")) return;

    brigadistasLocal = brigadistasLocal.filter(b => b.matricula !== matricula);
    localStorage.setItem("brigadistas", JSON.stringify(brigadistasLocal));

    carregarBrigadistas();
}

// ================= MODAL EDITAR =================
function editarBrigadista(matricula) {

    const brigadista = brigadistasLocal.find(b => b.matricula === matricula);
    if (!brigadista) return;

    document.getElementById("editMatricula").value = brigadista.matricula;
    document.getElementById("editMatriculaView").value = brigadista.matricula;

    document.getElementById("editNome").value = brigadista.nome;
    document.getElementById("editFuncao").value = brigadista.funcao;
    document.getElementById("editSetor").value = brigadista.setor;
    document.getElementById("previewFoto").src =
        brigadista.foto
            ? brigadista.foto.startsWith("data:image")
                ? brigadista.foto
                : `imagens/brigadistas/${brigadista.foto}`
            : "imagens/avatar-padrao.png";


    document.getElementById("editFoto").value = "";


    carregarBlocosEdicao(brigadista.bloco);
    carregarAndaresEdicao(brigadista.andar);

    document.getElementById("modalEditar")
        .classList.add("ativo");
}

function fecharModal() {
    document.getElementById("modalEditar")
        .classList.remove("ativo");
}

// ================= SELECTS MODAL =================
function carregarBlocosEdicao(blocoAtual) {
    const select = document.getElementById("editBloco");
    select.innerHTML = "<option value=''>Selecione</option>";

    Object.keys(baseAndares).forEach(bloco => {
        const opt = document.createElement("option");
        opt.value = bloco;
        opt.textContent = bloco;
        if (bloco === blocoAtual) opt.selected = true;
        select.appendChild(opt);
    });
}

function carregarAndaresEdicao(andarAtual) {
    const bloco = document.getElementById("editBloco").value;
    const select = document.getElementById("editAndar");

    select.innerHTML = "<option value=''>Selecione</option>";
    if (!baseAndares[bloco]) return;

    baseAndares[bloco].forEach(andar => {
        const opt = document.createElement("option");
        opt.value = andar;
        opt.textContent = andar;
        if (andar === andarAtual) opt.selected = true;
        select.appendChild(opt);
    });
}

// ================= SALVAR EDIÇÃO =================
function salvarEdicao() {

    const matricula = document.getElementById("editMatricula").value;

    const brigadista = brigadistasLocal.find(b => b.matricula === matricula);
    if (!brigadista) return;

    brigadista.nome = document.getElementById("editNome").value;
    brigadista.funcao = document.getElementById("editFuncao").value;
    brigadista.setor = document.getElementById("editSetor").value;
    brigadista.bloco = document.getElementById("editBloco").value;
    brigadista.andar = document.getElementById("editAndar").value;
    const novaFotoInput = document.getElementById("editFoto");

    if (novaFotoInput.files.length > 0) {

        const reader = new FileReader();

        reader.onload = function (e) {
            brigadista.foto = e.target.result; // BASE64
            localStorage.setItem("brigadistas", JSON.stringify(brigadistasLocal));
            fecharModal();
            carregarBrigadistas();
        };

        reader.readAsDataURL(novaFotoInput.files[0]);
        return; // 🔴 IMPORTANTÍSSIMO
    }


    // garante foto
    brigadista.foto = brigadista.foto || "";

    localStorage.setItem("brigadistas", JSON.stringify(brigadistasLocal));

    fecharModal();
    carregarBrigadistas();
}

function previewFotoEdicao() {
    const input = document.getElementById("editFoto");
    const preview = document.getElementById("previewFoto");
    const camera = document.querySelector(".icone-camera");

    if (!input.files || !input.files[0]) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
        if (camera) camera.style.display = "none";

        // 💾 guarda base64 temporariamente
        preview.dataset.base64 = e.target.result;
    };

    reader.readAsDataURL(input.files[0]);
}

function renderizarLista(lista) {
    const listaEl = document.getElementById("listaBrigadistas");
    listaEl.innerHTML = "";

    if (lista.length === 0) {
        listaEl.innerHTML =
            `<p class="sem-dados">Nenhum brigadista encontrado.</p>`;
        return;
    }

    lista.forEach(b => {
        listaEl.appendChild(criarCardBrigadista(b));
    });
}

campoBusca.addEventListener("input", function () {
    const termo = this.value.toLowerCase().trim();

    if (!termo) {
        renderizarLista(brigadistas);
        return;
    }

    const filtrados = brigadistas.filter(b =>
        b.nome.toLowerCase().includes(termo) ||
        b.matricula.toLowerCase().includes(termo) ||
        b.setor.toLowerCase().includes(termo) ||
        b.bloco.toLowerCase().includes(termo) ||
        b.andar.toLowerCase().includes(termo)
    );

    renderizarLista(filtrados);
});
