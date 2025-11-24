// script.js
// Funcionalidades globais do site da Dra. Maria Fernanda

const SiteConfig = {
  // Coloque aqui o número da clínica no formato DDI + DDD + número, só dígitos
  // Exemplo: Brasil (55) + DDD 41 + número 999999999 => "5541999999999"
  whatsappNumero: "5500000000000",
  whatsappMensagemPadrao:
    "Olá, gostaria de agendar uma consulta com a Dra. Maria Fernanda.",
};

document.addEventListener("DOMContentLoaded", () => {
  atualizarAnoRodape();
  marcarLinkAtivo();
  inicializarMenuResponsivo();
  inicializarHeaderAoRolar();
  inicializarAnimacoesScroll();
  inicializarFormularioContato();
});

/* ============ FUNÇÕES GERAIS ============ */

/**
 * Atualiza automaticamente o ano no rodapé.
 * Espera um elemento com id="ano-atual"
 */
function atualizarAnoRodape() {
  const spanAno = document.getElementById("ano-atual");
  if (!spanAno) return;
  spanAno.textContent = new Date().getFullYear();
}

/**
 * Marca como ativo o link do menu baseado na URL atual.
 * Usa o fim do href (index.html, sobre.html, etc.).
 */
function marcarLinkAtivo() {
  const linksMenu = document.querySelectorAll(".menu a");
  if (!linksMenu.length) return;

  const path = window.location.pathname;
  const paginaAtual = path.substring(path.lastIndexOf("/") + 1) || "index.html";

  linksMenu.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const hrefFinal = href.substring(href.lastIndexOf("/") + 1);

    if (hrefFinal === paginaAtual) {
      link.classList.add("ativo");
    } else {
      link.classList.remove("ativo");
    }
  });
}

/**
 * Inicializa comportamento do menu em telas menores.
 * Depende de um botão com classe .menu-toggle (se você quiser criar).
 * Se não existir, ignora silenciosamente.
 */
function inicializarMenuResponsivo() {
  const menu = document.querySelector(".menu");
  const topo = document.querySelector(".topo");
  const toggle = document.querySelector(".menu-toggle");

  if (!menu || !topo || !toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const aberto = topo.classList.toggle("menu-aberto");
    toggle.setAttribute("aria-expanded", aberto ? "true" : "false");
  });

  // Fecha o menu ao clicar em um link
  menu.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === "a") {
      topo.classList.remove("menu-aberto");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

/**
 * Adiciona classe no header ao rolar a página
 * para reforçar sombra / visual de destaque.
 */
function inicializarHeaderAoRolar() {
  const topo = document.querySelector(".topo");
  if (!topo) return;

  const aplicarClasse = () => {
    if (window.scrollY > 10) {
      topo.classList.add("topo--scrolled");
    } else {
      topo.classList.remove("topo--scrolled");
    }
  };

  aplicarClasse();
  window.addEventListener("scroll", aplicarClasse);
}

/**
 * Animação suave de entrada para cards e blocos usando IntersectionObserver.
 * Adiciona a classe .is-visible quando o elemento entra na viewport.
 */
function inicializarAnimacoesScroll() {
  const elementos = document.querySelectorAll(
    ".card, .hero__cartao, .bloco-info, .formulario-contato"
  );
  if (!elementos.length || !("IntersectionObserver" in window)) return;

  elementos.forEach((el) => el.classList.add("is-animable"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // anima só uma vez
        }
      });
    },
    { threshold: 0.18 }
  );

  elementos.forEach((el) => observer.observe(el));
}

/* ============ FORMULÁRIO DE CONTATO / WHATSAPP ============ */

function inicializarFormularioContato() {
  const form = document.querySelector(".formulario-contato");
  if (!form) return;

  const campoNome = form.querySelector("#nome");
  const campoTelefone = form.querySelector("#telefone");
  const campoEmail = form.querySelector("#email");
  const campoData = form.querySelector("#data");
  const campoPeriodo = form.querySelector("#periodo");
  const campoMotivo = form.querySelector("#motivo");

  let boxMensagem = form.querySelector(".formulario-contato__status");
  if (!boxMensagem) {
    boxMensagem = document.createElement("div");
    boxMensagem.className = "formulario-contato__status";
    boxMensagem.setAttribute("role", "status");
    boxMensagem.setAttribute("aria-live", "polite");
    boxMensagem.style.marginTop = "0.75rem";
    boxMensagem.style.fontSize = "0.85rem";
    form.appendChild(boxMensagem);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const erros = [];

    if (!campoNome.value.trim()) {
      erros.push("Informe o seu nome.");
    }

    if (!campoTelefone.value.trim()) {
      erros.push("Informe um telefone ou WhatsApp para contato.");
    } else if (!telefonePareceValido(campoTelefone.value)) {
      erros.push("Informe um telefone válido (inclua DDD).");
    }

    if (campoEmail.value && !emailPareceValido(campoEmail.value)) {
      erros.push("Verifique se o e-mail está digitado corretamente.");
    }

    if (campoMotivo.value.trim().length < 5) {
      erros.push("Descreva brevemente o motivo da consulta.");
    }

    if (erros.length) {
      exibirMensagemStatus(boxMensagem, erros.join(" "), "erro");
      return;
    }

    // Monta resumo da mensagem
    const dados = {
      nome: campoNome.value.trim(),
      telefone: campoTelefone.value.trim(),
      email: campoEmail.value.trim(),
      data: campoData.value,
      periodo: campoPeriodo.value,
      motivo: campoMotivo.value.trim(),
    };

    // Se tiver WhatsApp configurado, abre conversa
    if (SiteConfig.whatsappNumero && SiteConfig.whatsappNumero.length > 8) {
      const texto = montarMensagemWhatsApp(dados);
      const url = `https://wa.me/${SiteConfig.whatsappNumero}?text=${encodeURIComponent(
        texto
      )}`;
      window.open(url, "_blank");

      exibirMensagemStatus(
        boxMensagem,
        "Redirecionando para o WhatsApp para concluir o agendamento...",
        "sucesso"
      );
      form.reset();
      return;
    }

    // Se não tiver WhatsApp configurado, apenas mostra mensagem de sucesso
    exibirMensagemStatus(
      boxMensagem,
      "Mensagem enviada! Em breve a equipe entrará em contato para confirmar a consulta.",
      "sucesso"
    );
    form.reset();
  });
}

function telefonePareceValido(valor) {
  // Remove tudo que não é dígito
  const apenasDigitos = valor.replace(/\D/g, "");
  // Mais de 9 dígitos costuma ser DDD + número
  return apenasDigitos.length >= 10;
}

function emailPareceValido(valor) {
  // Regex simples, só para evitar e-mails claramente errados
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(valor);
}

function exibirMensagemStatus(elemento, mensagem, tipo) {
  if (!elemento) return;
  elemento.textContent = mensagem;

  // Remove classes anteriores
  elemento.classList.remove(
    "formulario-contato__status--erro",
    "formulario-contato__status--sucesso"
  );

  if (tipo === "erro") {
    elemento.classList.add("formulario-contato__status--erro");
  } else if (tipo === "sucesso") {
    elemento.classList.add("formulario-contato__status--sucesso");
  }
}

function montarMensagemWhatsApp(dados) {
  const linhas = [];

  linhas.push(SiteConfig.whatsappMensagemPadrao.trim());
  linhas.push("");
  linhas.push(`Nome: ${dados.nome}`);
  linhas.push(`Telefone: ${dados.telefone}`);
  if (dados.email) linhas.push(`E-mail: ${dados.email}`);
  if (dados.data) linhas.push(`Preferência de data: ${formatarDataBR(dados.data)}`);
  if (dados.periodo) {
    const labelPeriodo = {
      manha: "Manhã",
      tarde: "Tarde",
      noite: "Noite",
    }[dados.periodo] || dados.periodo;
    linhas.push(`Período: ${labelPeriodo}`);
  }
  linhas.push("");
  linhas.push("Motivo da consulta:");
  linhas.push(dados.motivo);

  return linhas.join("\n");
}

function formatarDataBR(yyyyMmDd) {
  if (!yyyyMmDd) return "";
  const partes = yyyyMmDd.split("-");
  if (partes.length !== 3) return yyyyMmDd;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
