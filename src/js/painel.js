/*
  Arquivo: painel.js (VERSÃO UNIFICADA v3.1)
  Descrição: Script principal para interatividade do site Eden Spa.
  Contém:
  - Lógica do painel de login/cadastro
  - Lógica do modal de agendamento
  - Fluxo de verificação de login para agendar
  - Salvamento de agendamentos no localStorage
  - Exibição de agendamentos no painel do usuário
  - Lógica de "flag" para mostrar modal de sucesso
  - Lógica do Menu Hambúrguer (ATUALIZADA)
  - Modal de confirmação (Sim/Não) para cancelamento
  - CORREÇÃO: Adicionado setTimeout para evitar auto-fechamento do modal.
  - *** NOVA MODIFICAÇÃO: Auto-abrir modal de localização ***
*/

// Objeto para converter meses de texto para números
const MESES = {
    "Janeiro": 1, "Fevereiro": 2, "Março": 3, "Abril": 4,
    "Maio": 5, "Junho": 6, "Julho": 7, "Agosto": 8,
    "Setembro": 9, "Outubro": 10, "Novembro": 11, "Dezembro": 12
};

// --- PONTO DE ENTRADA PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Funções de Inicialização (Geral) ---
    setupHamburgerMenu();     // <<< ATUALIZADA
    setupHeroCarousel();      
    setupSearchBar();         
    
    // --- Funções de Inicialização (Página Cadastro) ---
    setupModalMensagem(); 
    verificarLogin();         
    setupPanelAnimation();    
    setupDatePickers();       
    setupCancelamentoAgendamento(); 

    // --- Funções de Inicialização (Página Home) ---
    setupServiceCarousel();   
    setupExpandableCards();   
    setupModalCards();
    
    // --- INÍCIO DA MODIFICAÇÃO: Chamar a função ao carregar ---
    // abrirModalLocalizacaoAoCarregar(); // <-- CORREÇÃO APLICADA AQUI
    // --- FIM DA MODIFICAÇÃO ---
    
    setupScrollAnimation();   
    setupTestimonialForm();   

    // --- Funções de Inicialização (Página Serviços) ---
    setupLogicaAgendamento(); 

    // --- Funções de Inicialização (Página Produtos/Loja) ---
    setupCartLogic(); 
});


// ==========================================================
// --- LÓGICA DO MENU HAMBURGUER (ATUALIZADA) ---
// ==========================================================
function setupHamburgerMenu() {
    // --- CÓDIGO DO MENU HAMBÚRGUER (NOVO E CORRIGIDO) --- //
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');

    // Se os elementos essenciais não existirem, encerra.
    // O menuToggle e menuClose podem não existir em todas as telas,
    // mas o sideMenu e overlay devem existir se o header estiver presente.
    if (!sideMenu || !overlay) {
        return; 
    }

    // Função para abrir o menu
    const openMenu = () => {
        if(sideMenu) sideMenu.classList.add('open');
        if(overlay) overlay.classList.add('open');
    };

    // Função para fechar o menu
    const closeMenu = () => {
        if(sideMenu) sideMenu.classList.remove('open');
        if(overlay) overlay.classList.remove('open');
    };

    // 1. Quando clicar no ícone de hambúrguer
    if (menuToggle) {
        menuToggle.addEventListener('click', openMenu);
    }

    // 2. Quando clicar no ícone 'X'
    if (menuClose) {
        menuClose.addEventListener('click', closeMenu);
    }

    // 3. Quando clicar no fundo escuro (overlay)
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }
}


// ==========================================================
// --- LÓGICA DE LOGIN/CADASTRO (PAINEL.JS) ---
// ==========================================================

function setupPanelAnimation() {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container-login');

    if (signUpButton && signInButton && container) {
        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
        });
    }
}

// --- Lógica do Modal de Mensagem (Pop-up) ---

let modalOverlay, modalTitulo, modalTexto;
let modalBtnFechar, modalBtnConfirmarSim, modalBtnCancelarNao;
let modalContainerBotoesConfirmacao;
let onConfirmCallback = null; // Armazena a função a ser executada no "Sim"

function setupModalMensagem() {
    modalOverlay = document.getElementById('modal-mensagem');
    if (!modalOverlay) return; // Só existe na página de cadastro

    modalTitulo = document.getElementById('modal-titulo');
    modalTexto = document.getElementById('modal-texto');
    
    // Botões
    modalBtnFechar = document.getElementById('modal-fechar');
    modalBtnConfirmarSim = document.getElementById('modal-confirmar-sim');
    modalBtnCancelarNao = document.getElementById('modal-cancelar-nao');

    // Containers dos botões
    modalContainerBotoesConfirmacao = document.getElementById('modal-botoes-confirmacao');

    if (!modalOverlay || !modalTitulo || !modalTexto || !modalBtnFechar || !modalBtnConfirmarSim || !modalBtnCancelarNao || !modalContainerBotoesConfirmacao) {
        console.error("Elementos do modal (novos ou antigos) não encontrados!");
        return;
    }

    // Função para fechar o modal
    const fecharModal = () => {
        modalOverlay.classList.remove('visible');
        onConfirmCallback = null; // Limpa o callback ao fechar
    }

    // Event Listeners
    modalBtnFechar.addEventListener('click', fecharModal);
    modalBtnCancelarNao.addEventListener('click', fecharModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) fecharModal();
    });

    // Botão "Sim" (Confirmação)
    modalBtnConfirmarSim.addEventListener('click', () => {
        // Executa o callback (a função de deletar) se ela existir
        if (typeof onConfirmCallback === 'function') {
            onConfirmCallback();
        }
        fecharModal(); // Fecha o modal *depois* de executar
    });
}

/**
 * Exibe o modal customizado para INFORMAÇÃO (só botão "Fechar").
 * @param {string} titulo O título da mensagem (ex: "Sucesso", "Erro")
 * @param {string} texto O texto da mensagem.
 */
function mostrarModal(titulo, texto) {
    if (!modalOverlay || !modalTitulo || !modalTexto) {
        // Fallback para alert se o modal falhar
        alert(`${titulo}: ${texto}`);
        return;
    }
    modalTitulo.textContent = titulo;
    modalTexto.textContent = texto;

    // Garante que os botões certos estão visíveis
    modalContainerBotoesConfirmacao.style.display = 'none';
    modalBtnFechar.style.display = 'block'; // Mostra o botão "Fechar"

    // *** CORREÇÃO APLICADA AQUI ***
    // Adicionado setTimeout para evitar auto-fechamento
    setTimeout(() => {
        modalOverlay.classList.add('visible'); // Usa a classe de animação
    }, 10); // 10ms de delay
}

/**
 * Exibe o modal customizado para CONFIRMAÇÃO (Sim/Não).
 * @param {string} titulo O título da pergunta (ex: "Confirmar Ação")
 * @param {string} texto O texto da pergunta (ex: "Tem certeza?")
 * @param {function} callback A função a ser executada se o usuário clicar "Sim".
 */
function mostrarModalConfirmacao(titulo, texto, callback) {
    if (!modalOverlay || !modalTitulo || !modalTexto) {
        // Fallback para o confirm() original se o modal falhar
        if (confirm(`${titulo}: ${texto}`)) {
            callback();
        }
        return;
    }
    modalTitulo.textContent = titulo;
    modalTexto.textContent = texto;
    onConfirmCallback = callback; // Armazena a função de "Sim"

    // Garante que os botões certos estão visíveis
    modalContainerBotoesConfirmacao.style.display = 'flex'; // Mostra os botões "Sim/Não"
    modalBtnFechar.style.display = 'none'; // Esconde o botão "Fechar"

    // *** CORREÇÃO APLICADA AQUI ***
    // Adicionado setTimeout para evitar auto-fechamento
    setTimeout(() => {
        modalOverlay.classList.add('visible');
    }, 10); // 10ms de delay
}

// --- Fim da seção de Modal ---


// Popula os seletores de data de nascimento
function setupDatePickers() {
    const diaSelect = document.getElementById('dia');
    const mesSelect = document.getElementById('mes');
    const anoSelect = document.getElementById('ano');

    if (!diaSelect || !mesSelect || !anoSelect) {
        return; // Só executa na página de cadastro
    }

    diaSelect.innerHTML = '<option value="">Dia</option>';
    for (let i = 1; i <= 31; i++) {
        diaSelect.innerHTML += `<option value="${i}">${i}</option>`;
    }

    mesSelect.innerHTML = '<option value="">Mês</option>';
    for (const mesNome in MESES) {
        mesSelect.innerHTML += `<option value="${mesNome}">${mesNome}</option>`;
    }

    anoSelect.innerHTML = '<option value="">Ano</option>';
    const anoAtual = new Date().getFullYear();
    const anoInicio = 1950;
    for (let i = anoAtual - 18; i >= anoInicio; i--) { // Começa com 18 anos
        anoSelect.innerHTML += `<option value="${i}">${i}</option>`;
    }
}

/**
 * Verifica o login, CARREGA OS AGENDAMENTOS
 * e MOSTRA O MODAL DE SUCESSO se a flag existir.
 */
function verificarLogin() {
    const usuarioLogado = sessionStorage.getItem('usuarioLogado');
    const dadosUsuario = usuarioLogado ? JSON.parse(usuarioLogado) : null;
    
    const loginWrapper = document.querySelector('.container-login-wrapper');
    const usuarioWrapper = document.querySelector('.container-usuario-wrapper');

    // Se não acharmos os painéis, estamos em outra página.
    if (!loginWrapper || !usuarioWrapper) {
        return;
    }

    const mensagemBoasVindas = document.getElementById('mensagem-boas-vindas');
    const detalhesUsuario = document.getElementById('detalhes-usuario');

    if (usuarioLogado && dadosUsuario) {
        // --- USUÁRIO ESTÁ LOGADO ---
        loginWrapper.style.display = 'none';
        usuarioWrapper.style.display = 'flex'; 

        const hoje = new Date();
        const diaAtual = hoje.getDate();
        const mesAtual = hoje.getMonth() + 1;
        let msgPersonalizada = "";
        
        if (dadosUsuario.diaNasc == diaAtual && dadosUsuario.mesNasc == mesAtual) {
            msgPersonalizada = `🎉 Feliz Aniversário, ${dadosUsuario.nome}! 🎉`;
        } else {
            msgPersonalizada = `Bem-vindo, ${dadosUsuario.nome}!`;
        }
        mensagemBoasVindas.innerHTML = msgPersonalizada;
        
        detalhesUsuario.innerHTML = `
            <li><strong>Nome:</strong> ${dadosUsuario.nome}</li>
            <li><strong>E-mail/Celular:</strong> ${dadosUsuario.email}</li>
            <li><strong>Data de Nascimento:</strong> ${dadosUsuario.dataNascimentoCompleta}</li>
        `;
        
        // --- Carregar Agendamentos ---
        carregarAgendamentos(dadosUsuario.email);
        
    } else {
        // --- USUÁRIO NÃO ESTÁ LOGADO ---
        loginWrapper.style.display = 'flex'; 
        usuarioWrapper.style.display = 'none';
    }

    // --- VERIFICAR FLAG DE SUCESSO DO AGENDAMENTO ---
    if (sessionStorage.getItem('agendamentoSucesso') === 'true') {
        // Mostra o modal personalizado que existe nesta página
        mostrarModal("Agendamento Confirmado!", "Seu horário foi reservado com sucesso.");
        
        // Remove a flag para não mostrar de novo
        sessionStorage.removeItem('agendamentoSucesso');
    }
    // --- FIM DA VERIFICAÇÃO ---
}

function cadastrar() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const dia = document.getElementById('dia').value;
    const mesTexto = document.getElementById('mes').value;
    const ano = document.getElementById('ano').value;
    
    if (!nome || !email || !senha || !dia || !mesTexto || !ano) {
        mostrarModal('Erro no Cadastro', 'Por favor, preencha todos os campos, incluindo sua data de nascimento.');
        return;
    }
    
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioExistente = usuarios.find(user => user.email === email);
    
    if (usuarioExistente) {
        mostrarModal('Erro no Cadastro', 'Este e-mail ou celular já está cadastrado.');
        return;
    }
    
    const novoUsuario = {
        nome: nome,
        email: email,
        senha: senha,
        dataNascimentoCompleta: `${dia}/${mesTexto}/${ano}`,
        diaNasc: parseInt(dia),
        mesNasc: MESES[mesTexto]
    };
    
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    mostrarModal('Sucesso!', `Cadastro realizado com sucesso, ${nome}! Agora você pode fazer o login.`);
    
    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
    document.getElementById('senha').value = '';
    document.getElementById('dia').value = '';
    document.getElementById('mes').value = '';
    document.getElementById('ano').value = '';
    
    const container = document.getElementById('container-login');
    if(container) container.classList.remove("right-panel-active");
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    const usuario = usuarios.find(user => user.email === email && user.senha === senha);
    
    if (usuario) {
        sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        verificarLogin(); // Troca os painéis
    } else {
        mostrarModal('Erro no Login', 'E-mail ou senha incorretos.');
    }
}

function logout() {
    sessionStorage.removeItem('usuarioLogado');
    verificarLogin(); // Troca os painéis de volta
}

// --- NOVAS FUNÇÕES: GERENCIAMENTO DE AGENDAMENTOS ---

/**
 * Carrega e exibe os agendamentos do usuário no painel.
 * @param {string} userEmail Email do usuário logado.
 */
function carregarAgendamentos(userEmail) {
    const listaAgendamentosEl = document.getElementById('lista-agendamentos');
    if (!listaAgendamentosEl) return;

    const todosAgendamentos = JSON.parse(localStorage.getItem('agendamentos')) || {};
    const agendamentosDoUsuario = todosAgendamentos[userEmail] || [];

    if (agendamentosDoUsuario.length === 0) {
        listaAgendamentosEl.innerHTML = '<p class="sem-agendamentos">Você ainda não possui nenhum agendamento.</p>';
        return;
    }

    listaAgendamentosEl.innerHTML = ''; // Limpa a lista
    
    // Ordena por data
    agendamentosDoUsuario.sort((a, b) => new Date(a.dataObj) - new Date(b.dataObj));

    agendamentosDoUsuario.forEach(agendamento => {
        const cardHTML = `
            <div class="agendamento-card" data-id="${agendamento.id}">
                <img src="${agendamento.img}" alt="${agendamento.servico}">
                <div class="agendamento-card-info">
                    <h4>${agendamento.servico}</h4>
                    <p><strong>Data:</strong> ${agendamento.data}</p>
                    <p><strong>Horário:</strong> ${agendamento.horario}</p>
                </div>
                <span class="agendamento-card-preco">${agendamento.preco.replace('a partir de ', '')}</span>
                <button class="agendamento-card-cancelar">Cancelar</button>
            </div>
        `;
        listaAgendamentosEl.innerHTML += cardHTML;
    });
}

/**
 * Adiciona um listener de clique na lista de agendamentos para lidar com cancelamentos.
 */
function setupCancelamentoAgendamento() {
    const listaAgendamentosEl = document.getElementById('lista-agendamentos');
    if (!listaAgendamentosEl) return;

    listaAgendamentosEl.addEventListener('click', (event) => {
        // Verifica se o clique foi no botão "Cancelar"
        if (event.target.classList.contains('agendamento-card-cancelar')) {
            const card = event.target.closest('.agendamento-card');
            const id = parseInt(card.dataset.id);
            cancelarAgendamento(id); 
        }
    });
}

/**
 * Pergunta ao usuário e remove um agendamento.
 * @param {number} id ID único do agendamento a ser cancelado.
 */
function cancelarAgendamento(id) {
    // Pega os dados do usuário ANTES de mostrar o modal
    const usuarioLogadoStr = sessionStorage.getItem('usuarioLogado');
    if (!usuarioLogadoStr) return;
    const userEmail = JSON.parse(usuarioLogadoStr).email;

    // Esta é a função que será executada se o usuário clicar "Sim"
    const funcaoDeExclusao = () => {
        let todosAgendamentos = JSON.parse(localStorage.getItem('agendamentos')) || {};
        let agendamentosDoUsuario = todosAgendamentos[userEmail] || [];

        // Filtra o agendamento a ser removido
        agendamentosDoUsuario = agendamentosDoUsuario.filter(ag => ag.id !== id);

        // Atualiza o localStorage
        todosAgendamentos[userEmail] = agendamentosDoUsuario;
        localStorage.setItem('agendamentos', JSON.stringify(todosAgendamentos));

        // Recarrega a lista e mostra o modal de sucesso
        carregarAgendamentos(userEmail);
        mostrarModal("Sucesso", "Agendamento cancelado.");
    };

    // Chama o novo modal de confirmação
    mostrarModalConfirmacao(
        "Cancelar Agendamento",
        "Tem certeza que deseja cancelar este agendamento?",
        funcaoDeExclusao // Passa a lógica de exclusão como callback
    );
}


// ==========================================================
// --- LÓGICA DE AGENDAMENTO (AGENDAMENTO.JS) ---
// ==========================================================

// Variáveis de estado globais para o modal de agendamento
let selectedDate = null;
let selectedTime = null;
let selectedService = null;
let selectedImg = null;
let selectedPreco = null;
let today = new Date();
today.setHours(0, 0, 0, 0); 
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

/**
 * Esta função inicializa toda a lógica da página de SERVIÇOS.
 */
function setupLogicaAgendamento() {
    const agendamentoModal = document.getElementById('agendamento-modal');
    
    // Se não encontrar o modal, estamos em outra página. Encerra a função.
    if (!agendamentoModal) {
        return;
    }

    const confirmacaoModal = document.getElementById('confirmacao-modal');
    
    const btnFecharModal = agendamentoModal.querySelector('.modal-close');
    const btnsAgendarCard = document.querySelectorAll('.card .btn2');
    const btnConfirmarAgendamento = document.getElementById('modal-btn-confirmar');
    const timeSlotsContainer = document.getElementById('time-slots-container');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // Adiciona o evento de abrir o modal a CADA botão "Agendar"
    btnsAgendarCard.forEach(btn => {
        btn.addEventListener('click', (event) => abrirModalAgendamento(event, agendamentoModal));
    });

    // Botões de fechar Modal de Agendamento
    btnFecharModal.addEventListener('click', () => fecharModalAgendamento(agendamentoModal));

    // Botão "Agendar" de DENTRO do modal
    btnConfirmarAgendamento.addEventListener('click', confirmarAgendamentoESalvar);

    // Navegação do Calendário
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar();
    });
    
    // Seleção de Horário
    timeSlotsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('time-slot')) {
            selectTime(event.target);
        }
    });

    // Fechar modais ao clicar no fundo
    agendamentoModal.addEventListener('click', (event) => {
        if (event.target === agendamentoModal) {
            fecharModalAgendamento(agendamentoModal);
        }
    });
}

/**
 * Abre o modal de agendamento e preenche com dados.
 * Verifica se o usuário está logado.
 */
function abrirModalAgendamento(event, agendamentoModal) {
    event.preventDefault();
    
    // --- VERIFICAÇÃO DE LOGIN ---
    const usuarioLogado = sessionStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        // Este alert É NECESSÁRIO, pois o modal customizado
        // não existe nesta página (servicos.html).
        alert("Por favor, faça o login ou cadastre-se para agendar um serviço.");
        window.location.href = './cadastro.html';
        return; // Para a execução da função
    }
    // --- FIM DA VERIFICAÇÃO ---
    
    const card = event.target.closest('.card');
    
    // 1. Extrai dados do card
    const imgScr = card.querySelector('img').src;
    const nome = card.querySelector('h4').textContent;
    const desc = card.querySelector('p').textContent;
    const preco = card.querySelector('.price').textContent;
    
    // 2. Salva os dados selecionados nas variáveis globais
    selectedService = nome; 
    selectedImg = imgScr;
    selectedPreco = preco;

    // 3. Preenche o modal
    document.getElementById('modal-img').src = imgScr;
    document.getElementById('modal-nome').textContent = nome;
    document.getElementById('modal-desc').textContent = desc;
    document.getElementById('modal-preco').textContent = preco;

    // Limpa os horários antigos ao abrir o modal
    const timeSlotsContainer = document.getElementById('time-slots-container');
    if (timeSlotsContainer) {
        timeSlotsContainer.innerHTML = ''; 
    }

    // 4. Reseta o calendário para o mês atual
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    resetSelections(); // ResetSelections agora também limpa os horários
    generateCalendar(); 

    // 5. Exibe o modal
    agendamentoModal.classList.add('visible');
}

/**
 * Fecha o modal de agendamento.
 */
function fecharModalAgendamento(agendamentoModal) {
    agendamentoModal.classList.remove('visible');
    setTimeout(resetSelections, 300);
}

/**
 * Confirma o agendamento, salva no localStorage e redireciona.
 */
function confirmarAgendamentoESalvar() {
    // 1. Obter dados do usuário logado
    const usuarioLogadoStr = sessionStorage.getItem('usuarioLogado');
    if (!usuarioLogadoStr) {
        alert("Sessão expirada. Por favor, faça o login novamente.");
        window.location.href = './cadastro.html';
        return;
    }
    const usuarioLogado = JSON.parse(usuarioLogadoStr);
    const userEmail = usuarioLogado.email;

    // 2. Obter todos os agendamentos do localStorage
    let todosAgendamentos = JSON.parse(localStorage.getItem('agendamentos')) || {};

    // 3. Obter a lista de agendamentos deste usuário
    let agendamentosDoUsuario = todosAgendamentos[userEmail] || [];

    // 4. Criar o novo objeto de agendamento
    const novoAgendamento = {
        id: new Date().getTime(), // ID único para o caso de cancelamento
        servico: selectedService,
        data: selectedDate.toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'}),
        dataObj: selectedDate, // Salva o objeto Date para ordenação
        horario: selectedTime,
        img: selectedImg,
        preco: selectedPreco
    };

    // 5. Adicionar o novo agendamento à lista do usuário
    agendamentosDoUsuario.push(novoAgendamento);

    // 6. Atualizar o objeto principal de agendamentos
    todosAgendamentos[userEmail] = agendamentosDoUsuario;

    // 7. Salvar de volta no localStorage
    localStorage.setItem('agendamentos', JSON.stringify(todosAgendamentos));

    // 8. Fechar o modal
    const agendamentoModal = document.getElementById('agendamento-modal');
    fecharModalAgendamento(agendamentoModal);

    // 9. Salvar flag para mostrar modal na próxima página
    sessionStorage.setItem('agendamentoSucesso', 'true');

    // 10. Redirecionar IMEDIATAMENTE (sem alert)
    window.location.href = './cadastro.html';
}

// --- Funções do Calendário (Agendamento) ---

function generateCalendar() {
    // Esta função só deve rodar se os elementos existirem
    const calendarDaysContainer = document.getElementById('calendar-days');
    const monthYearDisplay = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    
    if (!calendarDaysContainer || !monthYearDisplay || !prevMonthBtn) return;
    
    calendarDaysContainer.innerHTML = '';
    monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
      prevMonthBtn.disabled = true;
    } else {
      prevMonthBtn.disabled = false;
    }

    let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDaysContainer.appendChild(createEmptyDayCell());
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.classList.add('calendar-day');
      dayCell.textContent = day;

      const cellDate = new Date(currentYear, currentMonth, day);
      cellDate.setHours(0,0,0,0);

      if (cellDate < today) {
        dayCell.classList.add('past');
      } else {
        dayCell.addEventListener('click', () => selectDate(dayCell, cellDate));
      }
      
      if (selectedDate && cellDate.getTime() === selectedDate.getTime()) {
        dayCell.classList.add('selected');
      }
      calendarDaysContainer.appendChild(dayCell);
    }
}

function createEmptyDayCell() {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('calendar-day', 'empty');
    return emptyCell;
}

/**
 * Seleciona uma data, gera os horários e reseta a seleção de tempo.
 */
function selectDate(dayCell, date) {
    const calendarDaysContainer = document.getElementById('calendar-days');
    if (!calendarDaysContainer) return;
    
    // 1. Atualiza a seleção visual do dia
    const prevSelectedDay = calendarDaysContainer.querySelector('.selected');
    if (prevSelectedDay) {
      prevSelectedDay.classList.remove('selected');
    }
    dayCell.classList.add('selected');
    selectedDate = date;

    // 2. Gera os horários dinamicamente para o dia selecionado (Domingo=0, Seg=1...)
    generateTimeSlots(date.getDay()); 
    
    // 3. Reseta o horário selecionado (já que o dia mudou)
    selectedTime = null;
    
    // 4. Verifica se pode confirmar (agora não pode, pois o horário foi resetado)
    checkIfCanConfirm(); 
}

/**
 * Gera os horários disponíveis (time-slots) com base no dia da semana.
 * @param {number} dayOfWeek O dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
 */
function generateTimeSlots(dayOfWeek) {
    const timeSlotsContainer = document.getElementById('time-slots-container');
    if (!timeSlotsContainer) return;

    // 1. Limpa os horários antigos
    timeSlotsContainer.innerHTML = '';

    const interval = 40; // NOVO: Intervalo de 40 minutos
    let slotIndex = 0;
    const delayIncrement = 40; // 40ms de atraso entre cada botão

    // 2. Helper function para criar e adicionar o botão
    // Converte minutos totais (ex: 540) para string (ex: "09:00")
    const createSlot = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        
        const slot = document.createElement('button');
        slot.classList.add('time-slot');
        slot.textContent = timeString;
        slot.style.animationDelay = `${slotIndex * delayIncrement}ms`;
        timeSlotsContainer.appendChild(slot);
        slotIndex++;
    };

    // 3. Define os blocos de horário (em minutos totais do dia)
    
    // Horários de Domingo (09:00 - 12:00)
    if (dayOfWeek === 0) { 
        const morningStart = 540; // 09:00
        const morningEnd = 720;   // 12:00 (exclusivo, o loop para ANTES das 12:00)
        
        // Loop da manhã
        for (let m = morningStart; m < morningEnd; m += interval) {
            createSlot(m); 
        }
        // Slots gerados: 09:00, 09:40, 10:20, 11:00, 11:40
    
    } else { // Horários de Segunda a Sábado
        
        // Bloco 1: Manhã (09:00 - 12:00)
        const morningStart = 540; // 09:00
        const morningEnd = 720;   // 12:00 (exclusivo)
        
        for (let m = morningStart; m < morningEnd; m += interval) {
            createSlot(m);
        }
        // Slots gerados: 09:00, 09:40, 10:20, 11:00, 11:40
        // Nota: O slot 12:00 não é gerado (11:40 + 40min = 12:20)

        // Bloco 2: Tarde (13:30 - 19:00)
        const afternoonStart = 810; // 13:30
        const afternoonEnd = 1140;  // 19:00 (exclusivo)
        
        for (let m = afternoonStart; m < afternoonEnd; m += interval) {
            createSlot(m);
        }
        // Slots gerados: 13:30, 14:10, 14:50, 15:30, 16:10, 16:50, 17:30, 18:10, 18:50
        // O último slot (18:50) termina às 19:30.
    }
}


function selectTime(timeCell) {
    const timeSlotsContainer = document.getElementById('time-slots-container');
    if (!timeSlotsContainer) return;
    const prevSelectedTime = timeSlotsContainer.querySelector('.selected');
    if (prevSelectedTime) {
      prevSelectedTime.classList.remove('selected');
    }
    timeCell.classList.add('selected');
    selectedTime = timeCell.textContent;
    checkIfCanConfirm();
}
  
function checkIfCanConfirm() {
    const btnConfirmarAgendamento = document.getElementById('modal-btn-confirmar');
    if (!btnConfirmarAgendamento) return;
    if (selectedDate && selectedTime) {
      btnConfirmarAgendamento.disabled = false;
    } else {
      btnConfirmarAgendamento.disabled = true;
    }
}

/**
 * Reseta seleções e também limpa os horários gerados.
 */
function resetSelections() {
    selectedDate = null;
    selectedTime = null;
    const allSelected = document.querySelectorAll('#agendamento-modal .selected');
    allSelected.forEach(el => el.classList.remove('selected'));
    
    // Limpa os horários gerados
    const timeSlotsContainer = document.getElementById('time-slots-container');
    if(timeSlotsContainer) {
        timeSlotsContainer.innerHTML = '';
    }
    
    const btnConfirmarAgendamento = document.getElementById('modal-btn-confirmar');
    if(btnConfirmarAgendamento) btnConfirmarAgendamento.disabled = true;
}


// ==========================================================
// --- OUTRAS FUNÇÕES (PAINEL.JS - PÁGINA HOME) ---
// ==========================================================

function setupHeroCarousel() {
  const imagens = document.querySelectorAll('.imagem-painel');
  if (imagens.length === 0) return; // Só roda na Home

  const frases = document.querySelectorAll('.frases');
  const indicadores = document.querySelectorAll('.indicador-dot');
  const btnAvancar = document.querySelector('#seta-avancar');
  const btnVoltar = document.querySelector('#seta-voltar');
  
  if (frases.length === 0 || indicadores.length === 0 || !btnAvancar || !btnVoltar) {
    return;
  }

  let indice = 0;
  const tempoTroca = 5000; 

  function mostrarSlide(i) {
    imagens.forEach(img => img.classList.remove('mostrar'));
    frases.forEach(frase => frase.style.display = 'none');
    indicadores.forEach(dot => dot.classList.remove('ativo'));

    imagens[i].classList.add('mostrar');
    frases[i].style.display = 'block';
    indicadores[i].classList.add('ativo');
  }

  function proximoSlide() {
    indice = (indice + 1) % imagens.length;
    mostrarSlide(indice);
  }

  let slideInterval = setInterval(proximoSlide, tempoTroca);

  btnAvancar.addEventListener('click', (e) => {
    e.preventDefault();
    proximoSlide();
    clearInterval(slideInterval); // Reinicia o timer
    slideInterval = setInterval(proximoSlide, tempoTroca);
  });

  btnVoltar.addEventListener('click', (e) => {
    e.preventDefault();
    indice = (indice - 1 + imagens.length) % imagens.length;
    mostrarSlide(indice);
    clearInterval(slideInterval); // Reinicia o timer
    slideInterval = setInterval(proximoSlide, tempoTroca);
  });

  mostrarSlide(indice);
}

function setupSearchBar() {
    const icon = document.getElementById('icone-pesquisa');
    const searchBar = document.getElementById('barra-pesquisa');
    const searchInput = document.querySelector('.campo-pesquisa');
    
    if (!icon || !searchBar || !searchInput) {
        // Se não houver barra de pesquisa (foi removida), apenas saia
        if (icon) icon.style.display = 'none'; // Esconde o ícone se ele ainda existir
        return;
    }

    icon.addEventListener('click', () => {
        searchBar.classList.toggle('visivel');
        if (searchBar.classList.contains('visivel')) {
            searchInput.focus(); 
        }
    });

    const cards = document.querySelectorAll('.main-content .card');
    const mainContent = document.querySelector('.main-content');
    if (cards.length === 0 || !mainContent) {
        return; // Só roda na pág de serviços ou produtos
    }

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let visibleCards = 0;

        const existingMsg = document.getElementById('no-results-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        cards.forEach(card => {
            const titleElement = card.querySelector('h4');
            const descElement = card.querySelector('p'); 

            const title = titleElement ? titleElement.textContent.toLowerCase() : '';
            const description = descElement ? descElement.textContent.toLowerCase() : '';

            const isMatch = title.includes(searchTerm) || description.includes(searchTerm);

            if (isMatch) {
                card.style.display = 'block';
                visibleCards++;
            } else {
                card.style.display = 'none';
            }
        });

        if (visibleCards === 0 && searchTerm !== "") {
            let noResultsMsg = document.createElement('p');
            noResultsMsg.id = 'no-results-message';
            noResultsMsg.textContent = 'Nenhum resultado encontrado para "' + searchInput.value + '"';
            mainContent.appendChild(noResultsMsg);
        }
    });
}


// =================================================================
// --- INÍCIO DA MODIFICAÇÃO: Carrossel Responsivo (5 ou 3 cards) ---
// =================================================================
function setupServiceCarousel() {
    const cards = document.querySelectorAll('.carousel-card');
    if (cards.length === 0) return; // Só roda na Home

    let currentIndex = 0;
    const totalCards = cards.length;

    function updateCarousel() {
        // VERIFICA SE ESTÁ EM MODO MOBILE (MESMO BREAKPOINT DO CSS: 800px)
        const isMobile = window.innerWidth <= 800;

        cards.forEach((card, index) => {
            // Limpa todas as classes de posição
            card.classList.remove(
                'card-active', 
                'card-prev', 
                'card-next', 
                'card-prev-2',
                'card-next-2'
            );
            card.onclick = null;

            const activeIndex = currentIndex;
            const prevIndex = (currentIndex - 1 + totalCards) % totalCards;
            const nextIndex = (currentIndex + 1) % totalCards;

            // --- LÓGICA DESKTOP (5 CARDS) ---
            if (!isMobile) {
                const prev2Index = (currentIndex - 2 + totalCards) % totalCards;
                const next2Index = (currentIndex + 2 + totalCards) % totalCards;
    
                if (index === activeIndex) {
                    card.classList.add('card-active');
                } else if (index === prevIndex) {
                    card.classList.add('card-prev');
                    card.onclick = () => { currentIndex = prevIndex; updateCarousel(); };
                } else if (index === prev2Index) {
                    card.classList.add('card-prev-2');
                    card.onclick = () => { currentIndex = prevIndex; updateCarousel(); };
                } else if (index === nextIndex) {
                    card.classList.add('card-next');
                    card.onclick = () => { currentIndex = nextIndex; updateCarousel(); };
                } else if (index === next2Index) {
                    card.classList.add('card-next-2');
                    card.onclick = () => { currentIndex = nextIndex; updateCarousel(); }; 
                }
            
            // --- LÓGICA MOBILE (3 CARDS) ---
            } else {
                if (index === activeIndex) {
                    card.classList.add('card-active');
                } else if (index === prevIndex) {
                    card.classList.add('card-prev');
                    card.onclick = () => { currentIndex = prevIndex; updateCarousel(); };
                } else if (index === nextIndex) {
                    card.classList.add('card-next');
                    card.onclick = () => { currentIndex = nextIndex; updateCarousel(); };
                }
                // Os outros cards (prev-2, next-2) não recebem classe
                // e permanecem ocultos (com opacity: 0, conforme o CSS base)
            }
        });
    }
    
    updateCarousel(); // Chama a função na primeira vez
    
    // ADICIONA UM LISTENER PARA ATUALIZAR O CARROSSEL AO REDIMENSIONAR A JANELA
    window.addEventListener('resize', updateCarousel);
}
// =================================================================
// --- FIM DA MODIFICAÇÃO: Carrossel Responsivo ---
// =================================================================


function setupExpandableCards() {
    const cards = document.querySelectorAll('.expand-card');
    const overlay = document.getElementById('overlay');
    
    if (cards.length === 0 || !overlay) return; // Só roda na Home

    let activeCard = null;
    let placeholder = null;

    cards.forEach(card => {
        if (card.id === 'testimonial-form-card') return;

        card.addEventListener('click', (e) => {
            if (activeCard) return; 
            if (e.target.closest('.learn-more')) return; 

            activeCard = card;
            const rect = card.getBoundingClientRect();

            placeholder = document.createElement('div');
            placeholder.className = 'expand-card-placeholder';
            placeholder.style.width = `${rect.width}px`;
            placeholder.style.height = `${rect.height}px`;
            card.parentNode.insertBefore(placeholder, card);

            card.style.position = 'fixed';
            card.style.top = `${rect.top}px`;
            card.style.left = `${rect.left}px`;
            card.style.width = `${rect.width}px`;
            card.style.height = `${rect.height}px`;
            card.classList.add('expanding');
            overlay.classList.add('active');

            requestAnimationFrame(() => {
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;
                let cardWidth = rect.width, cardHeight = rect.height;
                const scale = 1.1; 
                cardWidth *= scale;
                cardHeight *= scale;
                
                card.style.top = `${(screenHeight / 2) - (cardHeight / 2)}px`;
                card.style.left = `${(screenWidth / 2) - (cardWidth / 2)}px`;
                card.style.width = `${cardWidth}px`;
                card.style.height = `${cardHeight}px`;
            });
        });
    });

    function collapseCard() {
        if (!activeCard) return;

        const rect = placeholder.getBoundingClientRect();
        
        activeCard.style.top = `${rect.top}px`;
        activeCard.style.left = `${rect.left}px`;
        activeCard.style.width = `${rect.width}px`;
        activeCard.style.height = `${rect.height}px`;
        overlay.classList.remove('active');

        activeCard.addEventListener('transitionend', () => {
            activeCard.classList.remove('expanding');
            activeCard.style.position = '';
            activeCard.style.top = '';
            activeCard.style.left = '';
            activeCard.style.width = '';
            activeCard.style.height = '';
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.removeChild(placeholder);
            }
            placeholder = null;
            activeCard = null;
        }, { once: true });
    }

    overlay.addEventListener('click', collapseCard);
}

function setupModalCards() {
    const miniCards = document.querySelectorAll('.mini-card');
    const overlay = document.getElementById('modal-overlay');
    
    if (miniCards.length === 0 || !overlay) return; // Só roda na Home

    const modal = document.getElementById('modal-view');
    const closeBtn = document.getElementById('modal-close-btn');
    if (!modal || !closeBtn) return;

    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');

    miniCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.dataset.title;
            const imgSrc = card.dataset.imgSrc;
            const desc = card.dataset.desc;

            modalTitle.textContent = title;
            modalImg.src = imgSrc;
            modalDesc.innerHTML = desc.replace(/(\r\n|\n|\r)/gm, "<br>");

            overlay.classList.add('active');
            modal.classList.add('active');
        });
    });

    function closeModal() {
        overlay.classList.remove('active');
        modal.classList.remove('active');
    }

    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
}

function setupScrollAnimation() {
    const cardContainer = document.querySelector('.mini-card-container');
    if (!cardContainer) return; // Só roda na Home

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                cardContainer.classList.add('visible');
            }
        });
    }, observerOptions);

    observer.observe(cardContainer);
}

function setupTestimonialForm() {
    const starContainer = document.getElementById('testimonial-rating');
    const submitBtn = document.getElementById('submit-testimonial');

    if (!starContainer || !submitBtn) {
        return; // Só roda na Home
    }

    const formCard = document.getElementById('testimonial-form-card');
    const commentGridContainer = document.querySelector('.expand-card-container');
    if (!formCard || !commentGridContainer) return;

    const stars = starContainer.querySelectorAll('span');
    let currentRating = 0;

    function paintStarsSelected(rating) {
        stars.forEach((s, i) => {
            if (i < rating) {
                s.classList.add('selected');
            } else {
                s.classList.remove('selected');
            }
        });
    }
    
    function paintStarsHover(upToIndex) {
        stars.forEach((s, i) => {
            if (i < upToIndex) {
                s.classList.add('hover');
            } else {
                s.classList.remove('hover');
            }
        });
    }

    stars.forEach((star, index) => {
        const rating = index + 1;
        star.addEventListener('mouseover', () => paintStarsHover(rating));
        star.addEventListener('click', () => {
            currentRating = rating;
            starContainer.dataset.rating = currentRating;
            paintStarsSelected(currentRating);
        });
    });

    starContainer.addEventListener('mouseout', () => {
        stars.forEach(s => s.classList.remove('hover'));
        paintStarsSelected(currentRating);
    });

    submitBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('testimonial-name');
        const commentInput = document.getElementById('testimonial-comment');
        
        const name = nameInput.value.trim();
        const comment = commentInput.value.trim();
        const rating = parseInt(starContainer.dataset.rating) || 0;

        if (!name || !comment || rating === 0) {
            alert("Por favor, preencha seu nome, comentário e selecione uma nota (de 1 a 5 estrelas).");
            return;
        }

        const newCard = document.createElement('div');
        newCard.className = 'expand-card card-lilac';
        const starString = '★'.repeat(rating) + '☆'.repeat(5 - rating);

        newCard.innerHTML = `
            <div class="card-content">
                <span class="label">Novo!</span>
                <h2>${name}</h2>
                <p>${comment}</p>
                <a class="learn-more">${starString}</a>
            </div>
        `;
        commentGridContainer.prepend(newCard); 

        nameInput.value = '';
        commentInput.value = '';
        currentRating = 0;
        starContainer.dataset.rating = 0;
        paintStarsSelected(0); 
    });
}


// --- INÍCIO DA LÓGICA DO CARRINHO DE COMPRAS (VERSÃO 3.0 COM QTD e IMAGEM NO RESUMO) ---

/**
 * Inicializa toda a lógica do carrinho de compras na página de produtos.
 */
function setupCartLogic() {
    // Variáveis do Carrinho
    let cart = []; // Array para armazenar os itens: { id, name, price, imgSrc, quantity }

    // --- Elementos do DOM (só busca se estiver na página certa) ---
    const mainContent = document.querySelector('.main-content');
    const cartToggleButton = document.getElementById('cart-toggle-icon');
    const sideCart = document.getElementById('side-cart');
    const closeCartButton = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartItemCountElement = document.getElementById('cart-item-count');
    const checkoutButton = document.getElementById('checkout-button');
    
    // Elementos dos Modais
    const confirmModal = document.getElementById('confirm-modal-overlay');
    const confirmPurchaseBtn = document.getElementById('confirm-purchase-btn');
    const cancelPurchaseBtn = document.getElementById('cancel-purchase-btn');
    const summaryModal = document.getElementById('summary-modal-overlay');
    const summaryItemsList = document.getElementById('summary-items');
    const summaryTotalElement = document.getElementById('summary-total');
    const closeSummaryBtn = document.getElementById('close-summary-btn');

    // Se os elementos principais não existirem, estamos em outra página.
    if (!mainContent || !cartToggleButton || !sideCart) {
        if(cartToggleButton) cartToggleButton.style.display = 'none';
        return;
    }

    // --- FUNÇÕES PRINCIPAIS DO CARRINHO ---

    /**
     * Adiciona um item ao carrinho ou incrementa sua quantidade.
     */
    function addToCart(id, name, price, imgSrc) {
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, imgSrc, quantity: 1 });
        }
        updateCartUI();
    }
    
    /**
     * Remove um item do carrinho ou decrementa sua quantidade.
     */
    function removeFromCart(id) {
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex === -1) return; 

        const item = cart[itemIndex];
        item.quantity--;

        if (item.quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        updateCartUI();
    }

    /**
     * Atualiza a interface do carrinho (painel lateral).
     */
    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        
        let total = 0;
        let totalItems = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<li class="empty-cart-msg">Seu carrinho está vazio.</li>';
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('li');
                
                // ATUALIZADO: Agora com controles de +/-
                itemElement.innerHTML = `
                    <img src="${item.imgSrc}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <span>${item.name}</span>
                        <span class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="cart-item-controls">
                        <button class="cart-item-remove" data-id="${item.id}">&minus;</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="cart-item-add" data-id="${item.id}">+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);

                total += item.price * item.quantity;
                totalItems += item.quantity;
            });
        }

        cartTotalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        cartItemCountElement.textContent = totalItems;
        checkoutButton.disabled = cart.length === 0;
    }
    
    /**
     * Mostra o modal de resumo da compra.
     */
    function showSummaryModal() {
        summaryItemsList.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const itemElement = document.createElement('li');
            const itemTotal = item.price * item.quantity;
            
            // ATUALIZADO: Adiciona a imagem ao resumo
            itemElement.innerHTML = `
                <img src="${item.imgSrc}" alt="${item.name}" class="summary-item-img">
                <span class="summary-item-details">${item.name} (x${item.quantity})</span>
                <strong>R$ ${itemTotal.toFixed(2).replace('.', ',')}</strong>
            `;
            summaryItemsList.appendChild(itemElement);
            total += itemTotal;
        });
        
        summaryTotalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        summaryModal.classList.add('visible');
    }
    
    /**
     * Limpa o carrinho e reseta a UI.
     */
    function clearCart() {
        cart = [];
        updateCartUI();
    }


    // --- EVENT LISTENERS ---

    // 1. Adicionar ao Carrinho (clicando no botão do card)
    mainContent.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return; 
        
        const card = button.closest('.card');
        if (!card) return; 

        e.preventDefault(); 
        
        const cardContent = card.querySelector('.card-content');
        if (!cardContent) return;
        
        try {
            const img = card.querySelector('img');
            const imgSrc = img ? img.src : ''; 
            
            const name = cardContent.querySelector('h4').innerText.trim().replace('<br>', ' ');
            
            // =================================================================
            // --- INÍCIO DA CORREÇÃO ---
            // =================================================================
            
            // Se a LÓGICA DO CARRINHO for para a página de SERVIÇOS,
            // troque a linha `priceString` por esta:
            // const priceString = cardContent.querySelector('.price').innerText.trim();
            
            // Linha original do seu JS (provavelmente para a página de produtos)
            // Esta is a linha correta para 'produtos.html'
            const priceString = cardContent.querySelector('h3').innerText.trim();
            
            // =================================================================
            // --- FIM DA CORREÇÃO ---
            // =================================================================


            const price = parseFloat(priceString.replace('R$', '').replace('a partir de ', '').replace(',', '.'));
            const id = name; 
            
            if (isNaN(price)) {
                console.error("Preço não pôde ser lido (NaN). Verifique o seletor:", priceString);
                return;
            }

            addToCart(id, name, price, imgSrc);
            
            sideCart.classList.add('visible');

        } catch (error) {
            console.error("Erro ao extrair dados do card (verifique o seletor de preço):", error, cardContent);
        }
    });

    // 2. Toggle do Carrinho (Abrir/Fechar)
    cartToggleButton.addEventListener('click', () => {
        sideCart.classList.toggle('visible');
    });

    closeCartButton.addEventListener('click', () => {
        sideCart.classList.remove('visible');
    });
    
    // 3. ATUALIZADO: Gerencia cliques de Adicionar (+) e Remover (-)
    cartItemsContainer.addEventListener('click', (e) => {
        // Clicou no botão de Remover (-)
        if (e.target.classList.contains('cart-item-remove')) {
            const id = e.target.dataset.id;
            removeFromCart(id);
        
        // Clicou no botão de Adicionar (+)
        } else if (e.target.classList.contains('cart-item-add')) {
            const id = e.target.dataset.id;
            // Reutiliza a função addToCart, que já sabe como incrementar
            // Mas primeiro, encontramos os dados do item no carrinho
            const item = cart.find(i => i.id === id);
            if (item) {
                addToCart(item.id, item.name, item.price, item.imgSrc);
            }
        }
    });

    // 4. Fluxo de Checkout (Modais)
    checkoutButton.addEventListener('click', () => {
        if (cart.length > 0) {
            confirmModal.classList.add('visible');
        }
    });

    cancelPurchaseBtn.addEventListener('click', () => {
        confirmModal.classList.remove('visible');
    });

    confirmPurchaseBtn.addEventListener('click', () => {
        confirmModal.classList.remove('visible');
        showSummaryModal();
        sideCart.classList.remove('visible');
    });
    
    closeSummaryBtn.addEventListener('click', () => {
        summaryModal.classList.remove('visible');
        clearCart();
    });

    // Inicializa o carrinho
    updateCartUI();
}

// --- FIM DA LÓGICA DO CARRINHO DE COMPRAS ---

// --- CÓDIGO DUPLICADO REMOVIDO DO FINAL ---
// O código do menu hambúrguer foi movido para a função 
// setupHamburgerMenu() no topo do arquivo.