document.addEventListener("DOMContentLoaded", () => {

    // --- CONFIGURAÇÃO DO FIREBASE (V9.0) ---
    const firebaseConfig = {
      apiKey: "AIzaSyA290FhJUsr0PxigVCtYSPdYFOToLZBGUo",
      authDomain: "simuladordefeitos.firebaseapp.com",
      databaseURL: "https://simuladordefeitos-default-rtdb.firebaseio.com",
      projectId: "simuladordefeitos",
      storageBucket: "simuladordefeitos.firebasestorage.app",
      messagingSenderId: "830892126935",
      appId: "1:830892126935:web:6cc549bd09f4f4b3617692",
      measurementId: "G-L5RQ75KTJK"
    };
    // ------------------------------------------------

    // Inicializa o Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    // --- BANCO DE DADOS (V9.1 - Revisado) ---
    const allActionsDB = {
        hardware: [
            { id: "action_ram", text: "Verificar/Reencaixar Memória RAM", image: "imagens/acao_ram.png" },
            { id: "action_psu", text: "Verificar/Trocar Fonte de Alimentação", image: "imagens/acao_psu.png" },
            { id: "action_gpu", text: "Verificar/Trocar Placa de Vídeo", image: "imagens/acao_gpu.png" },
            { id: "action_storage", text: "Verificar Cabos/Trocar SSD/HD", image: "imagens/acao_storage.png" },
            { id: "action_cpu_cooler", text: "Verificar Cooler/Reaplicar Pasta Térmica", image: "imagens/acao_cpu_cooler.png" },
            { id: "action_mobo", text: "Trocar Placa-mãe", image: "imagens/acao_mobo.png" },
            { id: "action_cmos_reset", text: "Trocar Bateria CR2032 / Clear CMOS (Jumper)", image: "imagens/acao_cmos_reset.png" } // <--- TEXTO ATUALIZADO
        ],
        software: [
            { id: "action_bios", text: "Acessar BIOS (Ordem de Boot, Configurações)", image: "imagens/acao_bios.png" }, // <--- TEXTO ATUALIZADO
            { id: "action_drivers", text: "Atualizar/Reinstalar Drivers (Vídeo, Áudio, Rede)", image: "imagens/acao_drivers.png" },
            { id: "action_format", text: "Formatar e Reinstalar S.O.", image: "imagens/acao_format.png" },
            { id: "action_antivirus", text: "Passar Antivírus e Anti-Malware", image: "imagens/acao_antivirus.png" },
            { id: "action_sfc", text: "Rodar 'sfc /scannow' (Verificador de Arquivos)", image: "imagens/acao_sfc.png" },
            { id: "action_safemode", text: "Iniciar em Modo de Segurança / Restauração do Sistema", image: "imagens/acao_safemode.png" } // <--- NOVA AÇÃO
        ]
    };

    // --- BANCO DE DADOS (V9.2 - Com a "Pegadinha" do Instrutor) ---
    const problemsDB = [
        { 
            symptom: "Meu PC liga, todas as ventoinhas giram, mas não dá vídeo e minha placa-mãe não emite bipes.", 
            solution_id: "action_ram", 
            close_guess_ids: ["action_gpu", "action_mobo", "action_psu"], 
            points_reward: 250, 
            // A pegadinha está aqui no feedback!
            feedbackCorrect: "Perfeito! Era um módulo de RAM com mau contato. Mesmo sem bipes (provavelmente o gabinete estava sem o Speaker/Buzzer interno), o sintoma de girar tudo e não dar vídeo é um clássico da RAM!" 
        },
        { symptom: "PC desligou sozinho durante um jogo. Agora, ele liga e desliga após 5 segundos, antes de dar vídeo.", solution_id: "action_psu", close_guess_ids: ["action_cpu_cooler", "action_mobo"], points_reward: 250, feedbackCorrect: "Diagnóstico preciso. A fonte de alimentação estava com defeito." },
        { symptom: "O PC liga, o Windows inicia (dá para ouvir o som), mas a tela está cheia de 'artefatos' (linhas, quadrados coloridos).", solution_id: "action_gpu", close_guess_ids: ["action_drivers", "action_ram"], points_reward: 250, feedbackCorrect: "Correto! A memória da placa de vídeo (VRAM) estava corrompida. A troca da GPU resolveu." },
        { symptom: "O PC liga, passa da BIOS, mas trava na tela de 'Carregando Windows' ou dá erro 'Disk Read Error'.", solution_id: "action_storage", close_guess_ids: ["action_bios", "action_ram"], points_reward: 250, feedbackCorrect: "Isso! O cabo de dados SATA do SSD estava solto. Reconectar resolveu." },
        { symptom: "O PC funciona bem para navegar, mas após 10 minutos de jogo, ele trava ou desliga sozinho. Está muito quente.", solution_id: "action_cpu_cooler", close_guess_ids: ["action_psu"], points_reward: 250, feedbackCorrect: "Exato! A pasta térmica do processador estava seca. Após a troca, as temperaturas voltaram ao normal." },
        { symptom: "PC totalmente 'morto'. Não liga, não acende LED, não gira ventoinha. Já testei a fonte em outro PC e ela funciona.", solution_id: "action_mobo", close_guess_ids: ["action_psu", "action_ram"], points_reward: 350, feedbackCorrect: "Diagnóstico de mestre. A placa-mãe estava em curto. A troca dela resolveu." },
        { symptom: "Toda vez que desligo o PC da tomada, o relógio e a data da BIOS voltam para o ano 2000.", solution_id: "action_cmos_reset", close_guess_ids: ["action_bios", "action_mobo"], points_reward: 250, feedbackCorrect: "Isso mesmo! A bateria CR2032 da placa-mãe estava gasta. A troca manteve as configurações salvas." },
        { symptom: "Acabei de instalar um SSD novo, mas o PC insiste em ligar pelo HD antigo.", solution_id: "action_bios", close_guess_ids: ["action_storage", "action_format"], points_reward: 250, feedbackCorrect: "Exato! Era só entrar na BIOS e definir o 'Windows Boot Manager' do SSD novo como prioridade #1." },
        { symptom: "Acabei de formatar o PC, mas a imagem está 'esticada' (resolução 800x600) e não consigo me conectar à internet.", solution_id: "action_drivers", close_guess_ids: ["action_format", "action_sfc"], points_reward: 250, feedbackCorrect: "Correto. Faltava instalar os drivers de Chipset, Vídeo e Rede." },
        { symptom: "O PC está MUITO lento, o antivírus detecta 50 'ameaças', remove, e elas voltam na próxima reinicialização.", solution_id: "action_format", close_guess_ids: ["action_antivirus", "action_sfc", "action_safemode"], points_reward: 250, feedbackCorrect: "Infelizmente era a única solução. Um Rootkit se instalou. A formatação limpou o sistema." },
        { symptom: "O PC está normal, mas de vez em quando abre um pop-up de propaganda do nada, mesmo com o navegador fechado.", solution_id: "action_antivirus", close_guess_ids: ["action_format", "action_sfc"], points_reward: 250, feedbackCorrect: "Isso. Não era um vírus, mas um 'Adware' irritante. Uma passada de Malwarebytes resolveu." },
        { symptom: "O Windows inicia, mas o Menu Iniciar não abre, a busca não funciona e o Painel de Controle dá erro.", solution_id: "action_sfc", close_guess_ids: ["action_format", "action_antivirus", "action_drivers", "action_safemode"], points_reward: 250, feedbackCorrect: "Boa! Você rodou 'sfc /scannow' e ele reparou arquivos corrompidos do Windows." },
        { symptom: "O PC estava normal ontem. Hoje ele liga, mas dá Tela Azul (BSOD) na exata hora que vai carregar a Área de Trabalho do Windows.", solution_id: "action_safemode", close_guess_ids: ["action_format", "action_sfc", "action_drivers"], points_reward: 250, feedbackCorrect: "Perfeito! Você usou o Modo de Segurança para acessar o Windows sem carregar o driver que estava causando a Tela Azul e resolveu o problema." },
        { symptom: "Acabei de me mudar. Montei o PC na casa nova e agora ele não liga. Nenhum sinal de vida.", solution_id: "action_psu", close_guess_ids: ["action_mobo"], points_reward: 250, feedbackCorrect: "Isso! Na mudança, o cabo de força da fonte (interno ou externo) ficou frouxo. Reconectar resolveu." },
        { symptom: "O som do meu PC parou de funcionar do nada. Já verifiquei o volume e o fone de ouvido.", solution_id: "action_drivers", close_guess_ids: ["action_format", "action_sfc"], points_reward: 250, feedbackCorrect: "Correto. Uma atualização do Windows corrompeu o driver de áudio. Reinstalar o driver resolveu." },
        { symptom: "O PC estava funcionando, mas adicionei um pente de memória novo e agora ele não liga mais (emite 3 bipes longos).", solution_id: "action_ram", close_guess_ids: ["action_mobo"], points_reward: 250, feedbackCorrect: "Exato. O pente de memória novo era incompatível (ou com defeito). Retirar ele e deixar o antigo fez o PC voltar." },
        { symptom: "O PC liga, mas a ventoinha do processador faz um barulho muito alto, como se estivesse 'raspando', e o PC está lento.", solution_id: "action_cpu_cooler", close_guess_ids: ["action_psu", "action_gpu"], points_reward: 250, feedbackCorrect: "Isso mesmo. O cooler do processador estava travado de poeira e com defeito. A troca dele resolveu o barulho." },
        { symptom: "Meu PC tem um HD de 1TB e um SSD, mas o HD 'sumiu' do 'Meu Computador'.", solution_id: "action_storage", close_guess_ids: ["action_drivers", "action_bios"], points_reward: 250, feedbackCorrect: "Boa. O cabo de energia SATA do HD estava solto. Reconectar fez ele 'reaparecer' no Windows." },
        { symptom: "O PC liga, funciona, mas quando abro qualquer jogo, o jogo fecha sozinho ou o PC reinicia.", solution_id: "action_gpu", close_guess_ids: ["action_drivers", "action_psu", "action_cpu_cooler"], points_reward: 250, feedbackCorrect: "Correto. A placa de vídeo estava superaquecendo por poeira. Uma limpeza resolveu." },
        { symptom: "Eu tentei fazer um overclock nas memórias pela BIOS e agora o PC liga, as ventoinhas giram rápido, mas não dá vídeo.", solution_id: "action_cmos_reset", close_guess_ids: ["action_ram", "action_gpu", "action_mobo"], points_reward: 250, feedbackCorrect: "Mestre! Como não dava vídeo, era impossível entrar na BIOS pelo teclado. Fazer o Clear CMOS via Hardware restaurou os padrões e o PC voltou a dar vídeo." }
    ];

    // --- ELEMENTOS DO HTML ---
    const nameInputScreen = document.getElementById("name-input-screen");
    const startScreen = document.getElementById("start-screen");
    const endScreen = document.getElementById("end-screen");
    const gameContainer = document.getElementById("game-container");
    const adminScreen = document.getElementById("admin-screen"); 
    
    const submitNameButton = document.getElementById("submit-name-button");
    const startButton = document.getElementById("start-button");
    const playAgainButton = document.getElementById("play-again-button");
    const nextButton = document.getElementById("next-button");
    const openAdminButton = document.getElementById("open-admin-button"); 
    const closeAdminButton = document.getElementById("close-admin-button"); 

    const nameInput = document.getElementById("name-input");
    const welcomeMessage = document.getElementById("welcome-message");
    const startLeaderboardDisplay = document.getElementById("start-leaderboard-display");
    const endLeaderboardDisplay = document.getElementById("end-leaderboard-display");
    const adminLeaderboardDisplay = document.getElementById("admin-leaderboard-display"); 
    const finalScoreText = document.getElementById("final-score-text");
    
    const symptomText = document.getElementById("symptom-text");
    const hardwareContainer = document.getElementById("hardware-actions");
    const softwareContainer = document.getElementById("software-actions");
    const feedbackText = document.getElementById("feedback-text");
    const scoreDisplay = document.getElementById("score-display");
    const timerDisplay = document.getElementById("timer-display");

    // --- VARIÁVEIS ---
    let username = "";
    let currentProblemIndex = 0;
    let totalScore = 1000;
    let shuffledProblems = [];
    let leaderboard = []; 
    let timerInterval = null;
    let secondsElapsed = 0;

    function showScreen(screenId) {
        [nameInputScreen, startScreen, gameContainer, endScreen, adminScreen].forEach(screen => {
            if (screen.id === screenId) {
                screen.classList.remove("hidden");
            } else {
                screen.classList.add("hidden");
            }
        });
    }

    // --- FIREBASE & PLACAR ---
    function addScoreToLeaderboard(name, score, time) {
        const leaderboardRef = db.ref('leaderboard');
        leaderboardRef.push({ name, score, time }); 
    }

    // Função que o Admin usa para excluir do banco de dados
    window.deleteScore = function(firebaseKey) {
        if (confirm("Professor, tem certeza que deseja excluir esta pontuação?")) {
            db.ref('leaderboard/' + firebaseKey).remove();
        }
    };

    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function displayLeaderboard(elementId, isAdmin = false) {
        const displayElement = document.getElementById(elementId);
        displayElement.innerHTML = ""; 

        if (leaderboard.length === 0) {
            displayElement.innerHTML = "<li>Nenhum recorde ainda. Seja o primeiro!</li>";
            return;
        }

        leaderboard.forEach((entry, index) => {
            const li = document.createElement("li");
            
            if (isAdmin) {
                li.innerHTML = `
                    <span>${index + 1}. ${entry.name}</span>
                    <span>${entry.score} pts</span>
                    <span>${formatTime(entry.time)}</span>
                    <button class="delete-btn" onclick="deleteScore('${entry.id}')">Excluir</button>
                `;
            } else {
                li.innerHTML = `
                    <span>${index + 1}. ${entry.name}</span>
                    <span>${entry.score} pts</span>
                    <span>${formatTime(entry.time)}</span>
                `;
            }
            displayElement.appendChild(li);
        });
    }

    function setupLeaderboardListener() {
        const leaderboardRef = db.ref('leaderboard');
        
        leaderboardRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                leaderboard = Object.keys(data).map(key => ({
                    id: key, 
                    ...data[key]
                }));
                
                leaderboard.sort((a, b) => {
                    if (a.score !== b.score) return b.score - a.score;
                    return a.time - b.time;
                });

                leaderboard = leaderboard.slice(0, 15); 
            } else {
                leaderboard = []; 
            }
            
            displayLeaderboard('start-leaderboard-display', false);
            displayLeaderboard('end-leaderboard-display', false);
            displayLeaderboard('admin-leaderboard-display', true); 
        });
    }

    // --- PAINEL ADMIN LÓGICA ---
    function openAdminPanel() {
        const senha = prompt("Digite a senha do Professor:");
        if (senha === "professor123") {
            showScreen("admin-screen");
        } else if (senha !== null) {
            alert("Senha incorreta!");
        }
    }

    // --- TIMER ---
    function startTimer() {
        secondsElapsed = 0;
        timerDisplay.textContent = "Tempo: 00:00";
        timerInterval = setInterval(() => {
            secondsElapsed++;
            timerDisplay.textContent = `Tempo: ${formatTime(secondsElapsed)}`;
        }, 1000);
    }
    function stopTimer() { clearInterval(timerInterval); }

    // --- LÓGICA DO JOGO ---
    function handleNameSubmit() {
        const name = nameInput.value.trim();
        if (name === "") { alert("Por favor, digite seu nome."); return; }
        username = name;
        welcomeMessage.textContent = `Seja bem-vindo, ${username}!`;
        showScreen("start-screen");
    }

    function startGame() {
        totalScore = 1000;
        currentProblemIndex = 0;
        shuffledProblems = shuffleArray(problemsDB);
        
        scoreDisplay.textContent = `Pontuação: ${totalScore}`;
        showScreen("game-container");
        startTimer();
        loadProblem(currentProblemIndex);
    }

    function endGame() {
        stopTimer();
        addScoreToLeaderboard(username, totalScore, secondsElapsed);
        finalScoreText.textContent = `Sua Pontuação Final é: ${totalScore}`;
        showScreen("end-screen");
    }

    function shuffleArray(array) {
        let newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    function createActionButtons() {
        hardwareContainer.innerHTML = ""; softwareContainer.innerHTML = "";
        allActionsDB.hardware.forEach(a => hardwareContainer.appendChild(createButton(a)));
        allActionsDB.software.forEach(a => softwareContainer.appendChild(createButton(a)));
    }

    function createButton(action) {
        const buttonDiv = document.createElement("div");
        buttonDiv.id = action.id; buttonDiv.classList.add("action-button");
        buttonDiv.onclick = () => checkAnswer(action.id);
        const img = document.createElement("img"); img.src = action.image; img.alt = action.text;
        const tooltip = document.createElement("span"); tooltip.classList.add("tooltip-text"); tooltip.textContent = action.text;
        buttonDiv.appendChild(img); buttonDiv.appendChild(tooltip);
        return buttonDiv;
    }

    function loadProblem(index) {
        const problem = shuffledProblems[index];
        symptomText.textContent = problem.symptom;
        feedbackText.textContent = ""; feedbackText.className = "";
        nextButton.style.display = "none";
        document.querySelectorAll('.action-button').forEach(btn => btn.classList.remove("disabled"));
    }

    function checkAnswer(clickedActionId) {
        if (document.getElementById(clickedActionId).classList.contains("disabled")) return;
        const problem = shuffledProblems[currentProblemIndex];

        if (clickedActionId === problem.solution_id) {
            totalScore += problem.points_reward;
            feedbackText.textContent = `${problem.feedbackCorrect} (+${problem.points_reward} pts!)`;
            feedbackText.className = "correct";
            nextButton.style.display = "block";
            document.querySelectorAll('.action-button').forEach(btn => btn.classList.add("disabled"));
        } else if (problem.close_guess_ids.includes(clickedActionId)) {
            feedbackText.textContent = "Quase lá! Raciocínio correto, mas não resolve. (0 pts)";
            feedbackText.className = "close-guess";
            document.getElementById(clickedActionId).classList.add("disabled");
        } else {
            totalScore -= 100;
            feedbackText.textContent = "Incorreto. (-100 pts)";
            feedbackText.className = "incorrect";
            document.getElementById(clickedActionId).classList.add("disabled");
        }
        scoreDisplay.textContent = `Pontuação: ${totalScore}`;
    }

    // --- GATILHOS ---
    createActionButtons();
    setupLeaderboardListener();
    
    submitNameButton.onclick = handleNameSubmit;
    startButton.onclick = startGame;
    playAgainButton.onclick = startGame;
    nextButton.onclick = () => {
        currentProblemIndex++;
        if (currentProblemIndex < shuffledProblems.length) loadProblem(currentProblemIndex);
        else endGame();
    };
    
    // Admin gatilhos
    openAdminButton.onclick = openAdminPanel;
    closeAdminButton.onclick = () => showScreen("start-screen");
    
    showScreen("name-input-screen");
});
