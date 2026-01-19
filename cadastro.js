const form = document.getElementById("formBrigadista");
const selectBloco = document.getElementById("bloco");
const selectAndar = document.getElementById("andar");
const inputFoto = document.querySelector("input[name='foto']");
const previewFoto = document.getElementById("previewFoto");
const msg = document.getElementById("mensagem");

let estruturaHospital = {};
let fotoBase64 = "";


// ================= CARREGA ESTRUTURA =================
fetch("dados/estrutura-hospital.json")
    .then(res => res.json())
    .then(data => {
        estruturaHospital = data;
        console.log("Estrutura carregada:", estruturaHospital);
    })
    .catch(err => console.error("Erro ao carregar estrutura:", err));


// ================= BLOCO → ANDARES =================
selectBloco.addEventListener("change", function () {

    const bloco = this.value;

    selectAndar.innerHTML = "";
    selectAndar.disabled = true;

    if (!estruturaHospital[bloco]) {
        selectAndar.innerHTML =
            `<option value="">Selecione o bloco primeiro</option>`;
        return;
    }

    selectAndar.innerHTML = `<option value="">Selecione</option>`;
    selectAndar.disabled = false;

    estruturaHospital[bloco].forEach(andar => {
        const opt = document.createElement("option");
        opt.value = andar;
        opt.textContent = andar;
        selectAndar.appendChild(opt);
    });
});


// ================= PREVIEW + BASE64 =================
inputFoto.addEventListener("change", function () {

    const file = this.files[0];
    if (!file) {
        fotoBase64 = "";
        previewFoto.src = "imagens/avatar-padrao.png";
        return;
    }

    const reader = new FileReader();
    reader.onload = e => {
        fotoBase64 = e.target.result;
        previewFoto.src = fotoBase64;
    };
    reader.readAsDataURL(file);
});


// ================= SUBMIT =================
form.addEventListener("submit", function (e) {

    e.preventDefault();

    const brigadista = {
        nome: form.nome.value.trim(),
        matricula: form.matricula.value.trim(),
        funcao: form.funcao.value.trim(),
        setor: form.setor.value.trim(),
        bloco: form.bloco.value,
        andar: form.andar.value,
        foto: fotoBase64
    };

    // 🔹 validação
    if (!brigadista.nome ||
        !brigadista.matricula ||
        !brigadista.funcao ||
        !brigadista.setor ||
        !brigadista.bloco ||
        !brigadista.andar) {

        msg.textContent = "Preencha todos os campos obrigatórios.";
        msg.className = "mensagem erro";
        return;
    }

    let lista = JSON.parse(localStorage.getItem("brigadistas")) || [];

    if (lista.some(b => b.matricula === brigadista.matricula)) {
        msg.textContent = "Matrícula já cadastrada.";
        msg.className = "mensagem erro";
        return;
    }

    lista.push(brigadista);
    localStorage.setItem("brigadistas", JSON.stringify(lista));

    msg.textContent = "Brigadista cadastrado com sucesso!";
    msg.className = "mensagem sucesso";

    form.reset();
    fotoBase64 = "";
    previewFoto.src = "imagens/avatar-padrao.png";
});
