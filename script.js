document.addEventListener("DOMContentLoaded", () => {

    // --- CONFIGURAÇÃO DO FIREBASE (V8.0) ---
    // Este é o objeto de configuração que você forneceu
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

    // Inicializa o Firebase e o Realtime Database
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();
    // -----------------------------------------


    // --- BANCO DE DADOS DE AÇÕES GLOBAIS (FIXO - V7.0) ---
    const allActionsDB = {
        hardware: [
            { id: "action_ram", text: "Verificar/Reencaixar Memória RAM", image: "imagens/acao_ram.png" },
            { id: "action_psu", text: "Verificar/Trocar Fonte de Alimentação", image: "imagens/acao_psu.png" },
            { id: "action_gpu", text: "Verificar/Trocar Placa de Vídeo", image: "imagens/acao_gpu.png" },
            { id: "action_storage", text: "Verificar Cabos/Trocar SSD/HD", image: "imagens/acao_storage.png" },
            { id: "action_cpu_cooler", text: "Verificar Cooler/Reaplicar Pasta Térmica", image: "imagens/acao_cpu_cooler.png" },
            { id: "action_mobo", text: "Trocar Placa-mãe", image: "imagens/acao_mobo.png" },
            { id: "action_cmos_reset", text: "Resetar CMOS (remover bateria da BIOS)", image: "imagens/acao_cmos_reset.png" }
        ],
        software: [
            { id: "action_bios", text: "Verificar Ordem de Boot (BIOS)", image: "imagens/acao_bios.png" },
            { id: "action_drivers", text: "Atualizar/Reinstalar Drivers (Vídeo, Áudio, Rede)", image: "imagens/acao_drivers.png" },
            { id: "action_format", text: "Formatar e Reinstalar S.O.", image: "imagens/acao_format.png" },
            { id: "action_antivirus", text: "Passar Antivírus e Anti-Malware", image: "imagens/acao_antivirus.png" },
            { id: "action_sfc", text: "Rodar 'sfc /scannow' (Verificador de Arquivos)", image: "imagens/acao_sfc.png" },
            { id: "action_bios_oc", text: "Desfazer Overclock (Resetar BIOS para Padrão)", image: "imagens/acao_bios_oc.png" }
        ]
    };

    // --- BANCO DE DADOS DE PROBLEMAS (DINÂMICO - V7.0 - 20 PROBLEMAS) ---
    const problemsDB = [
        // 1. action_ram
        {
            symptom: "Meu PC liga, todas as ventoinhas giram, mas não dá vídeo e minha placa-mãe não emite bipes.",
            solution_id: "action_ram",
            close_guess_ids: ["action_gpu", "action_mobo", "action_psu"],
            points_reward: 250,
            feedbackCorrect: "Perfeito! Era um módulo de RAM com mau contato. Você reencaixou e o PC deu vídeo."
        },
        // 2. action_psu
        {
            symptom: "PC desligou sozinho durante um jogo. Agora, ele liga e desliga após 5 segundos, antes de dar vídeo.",
            solution_id: "action_psu",
            close_guess_ids: ["action_cpu_cooler", "action_mobo"],
            points_reward: 250,
            feedbackCorrect: "Diagnóstico preciso. A fonte de alimentação estava com defeito."
        },
        // 3. action_gpu
        {
            symptom: "O PC liga, o Windows inicia (dá para ouvir o som), mas a tela está cheia de 'artefatos' (linhas, quadrados coloridos).",
            solution_id: "action_gpu",
            close_guess_ids: ["action_drivers", "action_ram"],
            points_reward: 250,
            feedbackCorrect: "Correto! A memória da placa de vídeo (VRAM) estava corrompida. A troca da GPU resolveu."
        },
        // 4. action_storage
        {
            symptom: "O PC liga, passa da BIOS, mas trava na tela de 'Carregando Windows' ou dá erro 'Disk Read Error'.",
            solution_id: "action_storage",
            close_guess_ids: ["action_bios", "action_ram"],
            points_reward: 250,
            feedbackCorrect: "Isso! O cabo de dados SATA do SSD estava solto. Reconectar resolveu."
        },
        // 5. action_cpu_cooler
        {
            symptom: "O PC funciona bem para navegar, mas após 10 minutos de jogo, ele trava ou desliga sozinho. Está muito quente.",
            solution_id: "action_cpu_cooler",
            close_guess_ids: ["action_psu", "action_bios_oc"],
            points_reward: 250,
            feedbackCorrect: "Exato! A pasta térmica do processador estava seca. Após a troca, as temperaturas voltaram ao normal."
        },
        // 6. action_mobo
        {
            symptom: "PC totalmente 'morto'. Não liga, não acende LED, não gira ventoinha. Já testei a fonte em outro PC e ela funciona.",
            solution_id: "action_mobo",
            close_guess_ids: ["action_psu", "action_ram"],
            points_reward: 350,
            feedbackCorrect: "Diagnóstico de mestre. A placa-mãe estava em curto. A troca dela resolveu."
        },
        // 7. action_cmos_reset
        {
            symptom: "Toda vez que desligo o PC da tomada, o relógio e a data da BIOS voltam para o ano 2000.",
            solution_id: "action_cmos_reset",
            close_guess_ids: ["action_bios", "action_mobo"],
            points_reward: 250,
            feedbackCorrect: "Isso mesmo! A bateria CR2032 da placa-mãe estava gasta. A troca resolveu o problema."
        },
        // 8. action_bios
        {
            symptom: "Acabei de instalar um SSD novo, mas o PC insiste em ligar pelo HD antigo.",
            solution_id: "action_bios",
            close_guess_ids: ["action_storage", "action_format"],
            points_reward: 250,
            feedbackCorrect: "Exato! Era só entrar na BIOS e definir o 'Windows Boot Manager' do SSD novo como prioridade #1."
        },
        // 9. action_drivers
        {
            symptom: "Acabei de formatar o PC, mas a imagem está 'esticada' (resolução 800x600) e não consigo me conectar à internet.",
            solution_id: "action_drivers",
            close_guess_ids: ["action_format", "action_sfc"],
            points_reward: 250,
            feedbackCorrect: "Correto. Faltava instalar os drivers de Chipset, Vídeo e Rede."
        },
        // 10. action_format
        {
            symptom: "O PC está MUITO lento, o antivírus detecta 50 'ameaças', remove, e elas voltam na próxima reinicialização.",
            solution_id: "action_format",
            close_guess_ids: ["action_antivirus", "action_sfc"],
            points_reward: 250,
            feedbackCorrect: "Infelizmente era a única solução. Um Rootkit se instalou. A formatação limpou o sistema."
        },
        // 11. action_antivirus
        {
            symptom: "O PC está normal, mas de vez em quando abre um pop-up de propaganda do nada, mesmo com o navegador fechado.",
            solution_id: "action_antivirus",
            close_guess_ids: ["action_format", "action_sfc"],
            points_reward: 250,
            feedbackCorrect: "Isso. Não era um vírus, mas um 'Adware' irritante. Uma passada de Malwarebytes resolveu."
        },
        // 12. action_sfc
        {
            symptom: "O Windows inicia, mas o Menu Iniciar não abre, a busca não funciona e o Painel de Controle dá erro.",
            solution_id: "action_sfc",
            close_guess_ids: ["action_format", "action_antivirus", "action_drivers"],
            points_reward: 250,
            feedbackCorrect: "Boa! Você rodou 'sfc /scannow' e ele reparou arquivos corrompidos do Windows."
        },
        // 13. action_bios_oc
        {
            symptom: "Tentei fazer um overclock na minha memória RAM e agora o PC liga e desliga em loop, sem dar vídeo.",
            solution_id: "action_bios_oc",
            close_guess_ids: ["action_ram", "action_psu", "action_cmos_reset"],
            points_reward: 250,
            feedbackCorrect: "Isso aí. O overclock estava instável. Você resetou as configurações da BIOS para o Padrão."
        },
        // 14. action_psu (Problema 2)
        {
            symptom: "Acabei de me mudar. Montei o PC na casa nova e agora ele não liga. Nenhum sinal de vida.",
            solution_id: "action_psu",
            close_guess_ids: ["action_mobo"],
            points_reward: 250,
            feedbackCorrect: "Isso! Na mudança, o cabo de força da fonte (interno ou externo) ficou frouxo. Reconectar resolveu."
        },
        // 15. action_drivers (Problema 2)
        {
            symptom: "O som do meu PC parou de funcionar do nada. Já verifiquei o volume e o fone de ouvido.",
            solution_id: "action_drivers",
            close_guess_ids: ["action_format", "action_sfc"],
            points_reward: 250,
            feedbackCorrect: "Correto. Uma atualização do Windows corrompeu o driver de áudio. Reinstalar o driver resolveu."
        },
        // 16. action_ram (Problema 2)
        {
            symptom: "O PC estava funcionando, mas adicionei um pente de memória novo e agora ele não liga mais (emite 3 bipes longos).",
            solution_id: "action_ram",
            close_guess_ids: ["action_mobo", "action_bios_oc"],
            points_reward: 250,
            feedbackCorrect: "Exato. O pente de memória novo era incompatível (ou com defeito). Retirar ele e deixar o antigo fez o PC voltar."
        },
        // 17. action_cpu_cooler (Problema 2)
        {
            symptom: "O PC liga, mas a ventoinha do processador faz um barulho muito alto, como se estivesse 'raspando', e o PC está lento.",
            solution_id: "action_cpu_cooler",
            close_guess_ids: ["action_psu", "action_gpu"],
            points_reward: 250,
            feedbackCorrect: "Isso mesmo. O cooler do processador estava travado de poeira e com defeito. A troca dele resolveu o barulho."
        },
        // 18. action_storage (Problema 2)
        {
            symptom: "Meu PC tem um HD de 1TB e um SSD, mas o HD 'sumiu' do 'Meu Computador'.",
            solution_id: "action_storage",
            close_guess_ids: ["action_drivers", "action_bios"],
            points_reward: 250,
            feedbackCorrect: "Boa. O cabo de energia SATA do HD estava solto. Reconectar fez ele 'reaparecer' no Windows."
        },
        // 19. action_gpu (Problema 2)
        {
            symptom: "O PC liga, funciona, mas quando abro qualquer jogo, o jogo fecha sozinho ou o PC reinicia.",
            solution_id: "action_gpu",
            close_guess_ids: ["action_drivers", "action_psu", "action_cpu_cooler"],
            points_reward: 250,
            feedbackCorrect: "Correto. A placa de vídeo estava superaquecendo por poeira. Uma limpeza resolveu."
        },
        // 20. action_cmos_reset (Problema 2)
        {
            symptom: "Eu mexi em algo na BIOS e agora o PC não liga mais. Os LEDs acendem, mas não dá vídeo.",
            solution_id: "action_cmos_reset",
            close_guess_ids: ["action_ram", "action_gpu", "action_bios_oc"],
            points_reward: 250,
            feedbackCorrect: "Perfeito. Você provavelmente mexeu em algo vital. Resetar o CMOS (tirando a bateria) restaurou as configurações de fábrica e o PC voltou."
        }
    ];

    // --- ELEMENTOS DO HTML (Telas) ---
    const nameInputScreen = document.getElementById("name-input-screen");
    const startScreen = document.getElementById("start-screen");
    const endScreen = document.getElementById("end-screen");
    const gameContainer = document.getElementById("game-container");
    
    // --- ELEMENTOS DO HTML (Botões) ---
    const submitNameButton = document.getElementById("submit-name-button");
    const startButton = document.getElementById("start-button");
    const playAgainButton = document.getElementById("play-again-button");
    const nextButton = document.getElementById("next-button");

    // --- ELEMENTOS DO HTML (Display) ---
    const nameInput = document.getElementById("name-input");
    const welcomeMessage = document.getElementById("welcome-message");
    const startLeaderboardDisplay = document.getElementById("start-leaderboard-display");
    const endLeaderboardDisplay = document.getElementById("end-leaderboard-display");
    const finalScoreText = document.getElementById("final-score-text");
    
    const symptomText = document.getElementById("symptom-text");
    const hardwareContainer = document.getElementById("hardware-actions");
    const softwareContainer = document.getElementById("software-actions");
    const feedbackText = document.getElementById("feedback-text");
    const scoreDisplay = document.getElementById("score-display");
    const timerDisplay = document.getElementById("timer-display");

    // --- VARIÁVEIS DE JOGO ---
    let username = "";
    let currentProblemIndex = 0;
    let totalScore = 1000;
    let shuffledProblems = [];
    let leaderboard = [];
    let timerInterval = null;
    let secondsElapsed = 0;

    /**
     * Mostra uma tela e esconde as outras
     */
    function showScreen(screenId) {
        [nameInputScreen, startScreen, gameContainer, endScreen].forEach(screen => {
            if (screen.id === screenId) {
                screen.classList.remove("hidden");
            } else {
                screen.classList.add("hidden");
            }
        });
    }

    // --- FUNÇÕES DE PLACAR (LEADERBOARD - V8.0 FIREBASE) ---

    /**
     * Envia um novo placar para o Firebase
     */
    function addScoreToLeaderboard(name, score, time) {
        const leaderboardRef = db.ref('leaderboard');
        const newScore = { name, score, time };
        leaderboardRef.push(newScore); // Adiciona o novo score à lista no Firebase
    }

    /**
     * Formata o tempo de segundos para MM:SS
     */
    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Exibe o placar em um elemento HTML (UL/LI)
     */
    function displayLeaderboard(elementId) {
        const displayElement = document.getElementById(elementId);
        displayElement.innerHTML = ""; // Limpa a lista

        if (leaderboard.length === 0) {
            displayElement.innerHTML = "<li>Nenhum recorde ainda. Seja o primeiro!</li>";
            return;
        }

        leaderboard.forEach((entry, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${index + 1}. ${entry.name}</span>
                <span>${entry.score} pts</span>
                <span>${formatTime(entry.time)}</span>
            `;
            displayElement.appendChild(li);
        });
    }

    /**
     * (V8.0) - Escuta por mudanças no placar em TEMPO REAL
     */
    function setupLeaderboardListener() {
        const leaderboardRef = db.ref('leaderboard');
        
        // Ouve por 'valor' (on 'value'). Isso é chamado 1x no início
        // e depois toda vez que os dados mudam no Firebase.
        leaderboardRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Converte o objeto do Firebase (com chaves únicas) em um array
                leaderboard = Object.values(data);
                
                // Ordena: Maior pontuação primeiro, depois Menor tempo
                leaderboard.sort((a, b) => {
                    if (a.score !== b.score) {
                        return b.score - a.score; // Pontuação decrescente
                    }
                    return a.time - b.time; // Tempo crescente (desempate)
                });

                // Limita aos 10 melhores
                leaderboard = leaderboard.slice(0, 10);

            } else {
                leaderboard = []; // Nenhum dado
            }
            
            // Atualiza AMBAS as listas (Início e Fim)
            // Isso garante que se um aluno jogar, a tela de início de outro aluno
            // será atualizada em tempo real.
            displayLeaderboard('start-leaderboard-display');
            displayLeaderboard('end-leaderboard-display');
        });
    }


    // --- FUNÇÕES DO TIMER ---

    function startTimer() {
        secondsElapsed = 0;
        timerDisplay.textContent = "Tempo: 00:00";
        timerInterval = setInterval(() => {
            secondsElapsed++;
            timerDisplay.textContent = `Tempo: ${formatTime(secondsElapsed)}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    // --- FUNÇÕES DE LÓGICA DO JOGO ---

    function handleNameSubmit() {
        const name = nameInput.value.trim();
        if (name === "") {
            alert("Por favor, digite seu nome.");
            return;
        }
        username = name;
        welcomeMessage.textContent = `Seja bem-vindo, ${username}!`;
        // Não precisa mais chamar displayLeaderboard aqui, o listener faz isso.
        showScreen("start-screen");
    }

    function startGame() {
        totalScore = 1000;
        currentProblemIndex = 0;
        shuffledProblems = shuffleArray(problemsDB);
        
        updateScoreDisplay();
        scoreDisplay.style.display = "block";
        timerDisplay.style.display = "block";
        
        showScreen("game-container");
        startTimer();
        loadProblem(currentProblemIndex);
    }

    function endGame() {
        stopTimer();
        // Salva a pontuação no Firebase
        addScoreToLeaderboard(username, totalScore, secondsElapsed);
        
        finalScoreText.textContent = `Sua Pontuação Final é: ${totalScore}`;
        // Não precisa chamar displayLeaderboard, o listener já atualizou.
        
        showScreen("end-screen");
        scoreDisplay.style.display = "none";
        timerDisplay.style.display = "none";
    }

    function shuffleArray(array) {
        let newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = `Pontuação: ${totalScore}`;
    }

    function createActionButtons() {
        hardwareContainer.innerHTML = "";
        softwareContainer.innerHTML = "";
        allActionsDB.hardware.forEach(action => hardwareContainer.appendChild(createButton(action)));
        allActionsDB.software.forEach(action => softwareContainer.appendChild(createButton(action)));
    }

    function createButton(action) {
        const buttonDiv = document.createElement("div");
        buttonDiv.id = action.id;
        buttonDiv.classList.add("action-button");
        buttonDiv.onclick = () => checkAnswer(action.id);
        const img = document.createElement("img");
        img.src = action.image;
        img.alt = action.text;
        const tooltip = document.createElement("span");
        tooltip.classList.add("tooltip-text");
        tooltip.textContent = action.text;
        buttonDiv.appendChild(img);
        buttonDiv.appendChild(tooltip);
        return buttonDiv;
    }

    function loadProblem(index) {
        const problem = shuffledProblems[index];
        symptomText.textContent = problem.symptom;
        feedbackText.textContent = "";
        feedbackText.className = "";
        nextButton.style.display = "none";
        document.querySelectorAll('.action-button').forEach(btn => {
            btn.classList.remove("disabled");
        });
    }

    function checkAnswer(clickedActionId) {
        if (document.getElementById(clickedActionId).classList.contains("disabled")) {
            return;
        }

        const problem = shuffledProblems[currentProblemIndex];

        if (clickedActionId === problem.solution_id) {
            totalScore += problem.points_reward;
            feedbackText.textContent = `${problem.feedbackCorrect} (+${problem.points_reward} pontos!)`;
            feedbackText.className = "correct";
            nextButton.style.display = "block";
            document.querySelectorAll('.action-button').forEach(btn => {
                btn.classList.add("disabled");
            });
        } else if (problem.close_guess_ids.includes(clickedActionId)) {
            feedbackText.textContent = "Quase lá! Sua linha de raciocínio está correta, mas não é a solução final. (0 pontos perdidos)";
            feedbackText.className = "close-guess";
            document.getElementById(clickedActionId).classList.add("disabled");
        } else {
            totalScore -= 100;
            feedbackText.textContent = "Incorreto. Tente outra coisa. (-100 pontos)";
            feedbackText.className = "incorrect";
            document.getElementById(clickedActionId).classList.add("disabled");
        }
        updateScoreDisplay();
    }

    function nextProblem() {
        currentProblemIndex++;
        if (currentProblemIndex < shuffledProblems.length) {
            loadProblem(currentProblemIndex);
        } else {
            endGame();
        }
    }

    // --- INICIALIZAÇÃO DO JOGO (V8.0) ---
    
    createActionButtons(); // Cria os botões (eles ficam nos containers escondidos)
    setupLeaderboardListener(); // (V8.0) Inicia o "ouvinte" do Firebase
    
    // Configura os gatilhos
    submitNameButton.onclick = handleNameSubmit;
    startButton.onclick = startGame;
    playAgainButton.onclick = startGame;
    nextButton.onclick = nextProblem;
    
    // Mostra a primeira tela (Pedir Nome)
    showScreen("name-input-screen");
});
