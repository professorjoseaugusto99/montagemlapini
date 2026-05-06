document.addEventListener("DOMContentLoaded", () => {

    // --- 1. COLE SEU FIREBASE CONFIG AQUI EMBAIXO ---
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

    if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
    const db = firebase.database();

    const allActionsDB = {
        hardware: [
            { id: "action_ram", text: "Verificar/Reencaixar Memória RAM", image: "imagens/acao_ram.png" },
            { id: "action_psu", text: "Verificar/Trocar Fonte de Alimentação", image: "imagens/acao_psu.png" },
            { id: "action_gpu", text: "Verificar/Trocar Placa de Vídeo", image: "imagens/acao_gpu.png" },
            { id: "action_storage", text: "Verificar Cabos/Trocar SSD/HD", image: "imagens/acao_storage.png" },
            { id: "action_cpu_cooler", text: "Verificar Cooler/Reaplicar Pasta Térmica", image: "imagens/acao_cpu_cooler.png" },
            { id: "action_mobo", text: "Trocar Placa-mãe", image: "imagens/acao_mobo.png" },
            { id: "action_cmos_reset", text: "Trocar Bateria CR2032 / Clear CMOS (Jumper)", image: "imagens/acao_cmos_reset.png" }
        ],
        software: [
            { id: "action_bios", text: "Acessar BIOS (Ordem de Boot, Configurações)", image: "imagens/acao_bios.png" },
            { id: "action_drivers", text: "Atualizar/Reinstalar Drivers (Vídeo, Áudio, Rede)", image: "imagens/acao_drivers.png" },
            { id: "action_format", text: "Formatar e Reinstalar S.O.", image: "imagens/acao_format.png" },
            { id: "action_antivirus", text: "Passar Antivírus e Anti-Malware", image: "imagens/acao_antivirus.png" },
            { id: "action_sfc", text: "Rodar 'sfc /scannow' (Verificador de Arquivos)", image: "imagens/acao_sfc.png" },
            { id: "action_safemode", text: "Iniciar em Modo de Segurança / Restauração do Sistema", image: "imagens/acao_safemode.png" }
        ]
    };

    const problemsDB = [
        { symptom: "Meu PC liga, todas as ventoinhas giram, mas não dá vídeo e minha placa-mãe não emite bipes.", solution_id: "action_ram", close_guess_ids: ["action_gpu", "action_mobo", "action_psu"], points_reward: 250, feedbackCorrect: "Perfeito! Era um módulo de RAM com mau contato. Mesmo sem bipes (gabinete sem Speaker interno), o sintoma de girar tudo e não dar vídeo é um clássico da RAM!" },
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

    // --- ELEMENTOS E VARIÁVEIS ---
    const screens = {
        name: document.getElementById("name-input-screen"),
        start: document.getElementById("start-screen"),
        game: document.getElementById("game-container"),
        end: document.getElementById("end-screen"),
        admin: document.getElementById("admin-screen")
    };
    
    // Inputs Iniciais (Removido o de Turma)
    const nameInput = document.getElementById("name-input");
    const anoInput = document.getElementById("ano-input");
    const semInput = document.getElementById("semestre-input");
    const turnoInput = document.getElementById("turno-input");
    
    const filters = [document.getElementById("start-filter"), document.getElementById("end-filter"), document.getElementById("admin-filter")];

    let currentUserData = {};
    let currentProblemIndex = 0;
    let totalScore = 1000;
    let shuffledProblems = [];
    let allLeaderboardData = []; 
    let currentFilterSelection = "ALL"; 
    let timerInterval = null;
    let secondsElapsed = 0;

    function showScreen(screenId) {
        Object.values(screens).forEach(s => s.classList.add("hidden"));
        document.getElementById(screenId).classList.remove("hidden");
    }

    function addScoreToLeaderboard(scoreData) {
        db.ref('leaderboard').push(scoreData); 
    }

    window.deleteScore = function(firebaseKey) {
        if (confirm("Professor, tem certeza que deseja excluir esta pontuação?")) {
            db.ref('leaderboard/' + firebaseKey).remove();
        }
    };

    window.changeFilter = function(value) {
        currentFilterSelection = value;
        filters.forEach(f => f.value = value);
        renderLeaderboards(); 
    };

    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function setupLeaderboardListener() {
        db.ref('leaderboard').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                allLeaderboardData = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                updateFilterOptions(); 
            } else {
                allLeaderboardData = [];
            }
            renderLeaderboards();
        });
    }

    function updateFilterOptions() {
        const uniqueClasses = new Set();
        allLeaderboardData.forEach(entry => {
            if(entry.classKey) uniqueClasses.add(entry.classKey);
        });

        filters.forEach(select => {
            select.innerHTML = '<option value="ALL">Geral (Melhores da História)</option>';
            uniqueClasses.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = `Turma: ${c}`;
                if(c === currentFilterSelection) opt.selected = true;
                select.appendChild(opt);
            });
            select.value = currentFilterSelection; 
        });
    }

    function renderLeaderboards() {
        let filteredData = allLeaderboardData;
        if (currentFilterSelection !== "ALL") {
            filteredData = allLeaderboardData.filter(e => e.classKey === currentFilterSelection);
        }

        filteredData.sort((a, b) => {
            if (a.score !== b.score) return b.score - a.score;
            return a.time - b.time;
        });

        const limit = currentFilterSelection === "ALL" ? 15 : 30;
        filteredData = filteredData.slice(0, limit);

        drawList('start-leaderboard-display', filteredData, false);
        drawList('end-leaderboard-display', filteredData, false);
        drawList('admin-leaderboard-display', filteredData, true);
    }

    function drawList(elementId, dataArray, isAdmin) {
        const ul = document.getElementById(elementId);
        ul.innerHTML = "";
        if (dataArray.length === 0) {
            ul.innerHTML = "<li>Nenhum recorde encontrado para este filtro.</li>";
            return;
        }

        dataArray.forEach((entry, index) => {
            const li = document.createElement("li");
            let html = `<span>${index + 1}. ${entry.name}</span>
                        <span>${entry.score} pts</span>
                        <span>${formatTime(entry.time)}</span>`;
            if (isAdmin) {
                html += `<span style="font-size: 0.7em; color: #888;">[${entry.classKey || 'Sem Turma'}]</span>`;
                html += `<button class="delete-btn" onclick="deleteScore('${entry.id}')">Excluir</button>`;
            }
            li.innerHTML = html;
            ul.appendChild(li);
        });
    }

    // --- LÓGICA DO JOGO ---
    document.getElementById("submit-name-button").onclick = () => {
        const name = nameInput.value.trim();
        if (!name) return alert("Digite seu nome!");

        // Cria a string única apenas com os selects: "2026 - 1º Sem - Manhã"
        const classKey = `${anoInput.value} - ${semInput.value} - ${turnoInput.value}`;

        currentUserData = { name, classKey };
        document.getElementById("welcome-message").textContent = `Bem-vindo, ${name}! (${classKey})`;
        
        changeFilter(classKey);
        showScreen("start-screen");
    };

    function startGame() {
        totalScore = 1000; currentProblemIndex = 0;
        shuffledProblems = shuffleArray(problemsDB);
        document.getElementById("score-display").textContent = `Pontuação: ${totalScore}`;
        showScreen("game-container");
        startTimer(); loadProblem(0);
    }

    function endGame() {
        stopTimer();
        addScoreToLeaderboard({
            name: currentUserData.name,
            classKey: currentUserData.classKey,
            score: totalScore,
            time: secondsElapsed
        });
        document.getElementById("final-score-text").textContent = `Sua Pontuação Final é: ${totalScore}`;
        showScreen("end-screen");
    }

    function startTimer() {
        secondsElapsed = 0;
        timerInterval = setInterval(() => {
            secondsElapsed++;
            document.getElementById("timer-display").textContent = `Tempo: ${formatTime(secondsElapsed)}`;
        }, 1000);
    }
    function stopTimer() { clearInterval(timerInterval); }

    function shuffleArray(arr) {
        let newArr = [...arr];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }

    function createButtons() {
        const hc = document.getElementById("hardware-actions"), sc = document.getElementById("software-actions");
        allActionsDB.hardware.forEach(a => hc.appendChild(btn(a)));
        allActionsDB.software.forEach(a => sc.appendChild(btn(a)));
    }

    function btn(action) {
        const div = document.createElement("div");
        div.id = action.id; div.className = "action-button";
        div.onclick = () => checkAnswer(action.id);
        div.innerHTML = `<img src="${action.image}" alt="${action.text}"><span class="tooltip-text">${action.text}</span>`;
        return div;
    }

    function loadProblem(index) {
        const p = shuffledProblems[index];
        document.getElementById("symptom-text").textContent = p.symptom;
        document.getElementById("feedback-text").className = "";
        document.getElementById("feedback-text").textContent = "";
        document.getElementById("next-button").style.display = "none";
        document.querySelectorAll('.action-button').forEach(b => b.classList.remove("disabled"));
    }

    function checkAnswer(id) {
        if (document.getElementById(id).classList.contains("disabled")) return;
        const p = shuffledProblems[currentProblemIndex];
        const fb = document.getElementById("feedback-text");

        if (id === p.solution_id) {
            totalScore += p.points_reward;
            fb.textContent = `${p.feedbackCorrect} (+${p.points_reward} pts!)`; fb.className = "correct";
            document.getElementById("next-button").style.display = "block";
            document.querySelectorAll('.action-button').forEach(b => b.classList.add("disabled"));
        } else if (p.close_guess_ids.includes(id)) {
            fb.textContent = "Quase lá! Raciocínio correto, mas não resolve. (0 pts)"; fb.className = "close-guess";
            document.getElementById(id).classList.add("disabled");
        } else {
            totalScore -= 100;
            fb.textContent = "Incorreto. (-100 pts)"; fb.className = "incorrect";
            document.getElementById(id).classList.add("disabled");
        }
        document.getElementById("score-display").textContent = `Pontuação: ${totalScore}`;
    }

    // --- GATILHOS ---
    createButtons();
    setupLeaderboardListener();
    
    document.getElementById("start-button").onclick = startGame;
    document.getElementById("play-again-button").onclick = startGame;
    document.getElementById("next-button").onclick = () => {
        currentProblemIndex++;
        if (currentProblemIndex < shuffledProblems.length) loadProblem(currentProblemIndex);
        else endGame();
    };
    
    document.getElementById("open-admin-button").onclick = () => {
        if (prompt("Digite a senha do Professor:") === "professor123") showScreen("admin-screen");
        else alert("Senha incorreta!");
    };
    document.getElementById("close-admin-button").onclick = () => showScreen("start-screen");
    
    showScreen("name-input-screen");
});
