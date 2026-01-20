// ================= CONFIG =================
const params = new URLSearchParams(window.location.search);
const BLOCO = params.get("bloco");

const tituloBloco = document.getElementById("tituloBloco");
const listaAndares = document.getElementById("listaAndares");
const listaBrigadistas = document.getElementById("listaBrigadistas");

if (!BLOCO) {
    tituloBloco.textContent = "Bloco não informado";
    console.error("Bloco não informado na URL");
    throw new Error("Bloco não informado");
}

tituloBloco.textContent = BLOCO;


// ================= DADOS =================
let brigadistas = [];
let estruturaHospital = {};


// ================= CARREGAR DADOS =================
async function carregarDados() {
    try {
        const [resBrig, resEstr] = await Promise.all([
            fetch("dados/brigadistas.json"),
            fetch("dados/estrutura-hospital.json")
        ]);

        const brigJson = await resBrig.json();
        const estruturaJson = await resEstr.json();

        const local = JSON.parse(localStorage.getItem("brigadistas")) || [];

        brigadistas = [...brigJson, ...local];
        estruturaHospital = estruturaJson;

        atualizarTotalBloco();
        montarAndares();

    } catch (err) {
        console.error("Erro ao carregar dados públicos:", err);
    }
}

// ================= CONTADOR BLOCO =================
function atualizarTotalBloco() {

    const total = brigadistas.filter(b => b.bloco === BLOCO).length;

    const span = document.getElementById("totalBloco");

    if (span) {
        span.textContent = `${total} brigadista${total !== 1 ? "s" : ""}`;
    }
}


// ================= MONTAR ANDARES =================
function montarAndares() {
    listaAndares.innerHTML = "";

    const andares = estruturaHospital[BLOCO];

    if (!andares) {
        listaAndares.innerHTML = "<p>Bloco não encontrado</p>";
        return;
    }

    andares.forEach(andar => {
        const btn = document.createElement("button");
        btn.className = "btn-andar";
        btn.textContent = andar;

        btn.addEventListener("click", () => abrirAndar(andar));

        listaAndares.appendChild(btn);
    });
}


// ================= ABRIR ANDAR =================
function abrirAndar(andar) {
    listaBrigadistas.innerHTML = "";

    const filtrados = brigadistas.filter(b =>
        b.bloco === BLOCO && b.andar === andar
    );

    if (filtrados.length === 0) {
        listaBrigadistas.innerHTML =
            `<p class="sem-dados">Nenhum brigadista neste andar</p>`;
        return;
    }

    filtrados.forEach(b => {
        listaBrigadistas.appendChild(criarCard(b));
    });
}


// ================= CARD =================
function criarCard(b) {

    let foto = "imagens/avatar-padrao.png";

    if (b.fotoBase64 && b.fotoBase64.startsWith("data:image")) {
        foto = b.fotoBase64;
    } else if (b.foto) {
        foto = "imagens/brigadistas/" + b.foto;
    }

    const card = document.createElement("div");
    card.className = "brigadista-card publico";

    card.innerHTML = `
        <img src="${foto}" onerror="this.src='imagens/avatar-padrao.png'">
        <h4>${b.nome}</h4>
        <span class="funcao">${b.funcao}</span>
        <small>${b.setor}</small>
    `;

    return card;
}


// ================= START =================
carregarDados();
