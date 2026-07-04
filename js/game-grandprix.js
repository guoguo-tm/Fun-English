// ========================================
// 儿童英语趣味乐园 - 终极竞速（限时测验）
// ========================================

class GameGrandPrix {
    constructor(container) {
        this.container = container;
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.totalQuestions = 15;
        this.timeLimit = 60; // 60秒
        this.timeLeft = 60;
        this.timer = null;
        this.isPlaying = false;
        this.answered = false;
    }

    start() {
        this.renderStart();
    }

    beginRace() {
        // 从所有单词中随机抽取题目
        const allWords = getAllWords();
        const selected = shuffleArray(allWords).slice(0, this.totalQuestions);
        
        this.questions = selected.map(word => {
            const others = allWords.filter(w => w.en !== word.en);
            const distractors = shuffleArray(others).slice(0, 3);
            return {
                word,
                options: shuffleArray([word, ...distractors]),
                // 随机出题方式
                type: ['listen', 'image', 'zh'][Math.floor(Math.random() * 3)]
            };
        });
        
        this.currentQuestion = 0;
        this.score = 0;
        this.timeLeft = this.timeLimit;
        this.isPlaying = true;
        this.answered = false;
        
        audio.engineStart();
        this.renderRaceScreen();
        this.startTimer();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 10) {
                audio.tickTock();
            }
            
            // 更新计时器
            const timerEl = this.container.querySelector('#timerDisplay');
            if (timerEl) {
                timerEl.textContent = this.timeLeft;
                timerEl.className = `timer-display ${this.timeLeft <= 10 ? 'timer-warning' : ''}`;
            }
            
            // 更新速度表
            const speedValue = (this.timeLeft / this.timeLimit) * 100;
            const speedEl = this.container.querySelector('#speedFill');
            if (speedEl) {
                speedEl.style.width = speedValue + '%';
            }
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    answer(selectedWord) {
        if (this.answered || !this.isPlaying) return;
        this.answered = true;
        
        const correct = selectedWord.en === this.questions[this.currentQuestion].word.en;
        
        if (correct) {
            this.score++;
            audio.correctAnswer();
            audio.speakCorrect();
            storage.learnWord(this.questions[this.currentQuestion].word);
        } else {
            audio.wrongAnswer();
            audio.speakWrong();
        }
        
        this.showResult(correct);
    }

    showResult(correct) {
        const current = this.questions[this.currentQuestion];
        const options = this.container.querySelectorAll('.grandprix-option');
        options.forEach(opt => {
            opt.style.pointerEvents = 'none';
            if (opt.getAttribute('data-word') === current.word.en) {
                opt.classList.add('correct');
            }
        });
        
        const feedback = this.container.querySelector('#grandprixFeedback');
        if (feedback) {
            feedback.innerHTML = `
                <div class="grandprix-feedback ${correct ? 'correct' : 'wrong'}">
                    ${correct ? '🎉 正确！' : `❌ 答案是：<strong>${current.word.en}</strong> (${current.word.zh})`}
                </div>
            `;
        }
        
        setTimeout(() => this.nextQuestion(), 1000);
    }

    nextQuestion() {
        this.currentQuestion++;
        this.answered = false;
        
        const feedback = this.container.querySelector('#grandprixFeedback');
        if (feedback) feedback.innerHTML = '';
        
        if (this.currentQuestion >= this.questions.length) {
            this.finishRace();
        } else {
            this.renderQuestion();
        }
    }

    timeUp() {
        this.isPlaying = false;
        clearInterval(this.timer);
        audio.timeUp();
        this.finishRace();
    }

    finishRace() {
        this.isPlaying = false;
        clearInterval(this.timer);
        
        const timeUsed = this.timeLimit - this.timeLeft;
        const newAchs = storage.recordQuizCompletion(this.score, this.questions.length, timeUsed);
        
        if (this.score >= this.totalQuestions * 0.8) {
            audio.levelComplete();
        }
        
        const ratio = this.score / this.questions.length;
        const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : ratio >= 0.3 ? 1 : 0;
        
        this.container.innerHTML = `
            <div class="game-grandprix">
                <div class="grandprix-finish">
                    <div class="finish-flag">🏁</div>
                    <h2>🏆 终极竞速结束！</h2>
                    <div class="finish-stats-grandprix">
                        <div class="stat-card">
                            <span class="stat-icon">🎯</span>
                            <span class="stat-value">${this.score}/${this.totalQuestions}</span>
                            <span class="stat-label">正确数</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-icon">⏱️</span>
                            <span class="stat-value">${timeUsed}秒</span>
                            <span class="stat-label">用时</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-icon">💨</span>
                            <span class="stat-value">${Math.round((this.score / Math.max(timeUsed, 1)) * 60)}</span>
                            <span class="stat-label">速度分</span>
                        </div>
                    </div>
                    <div class="finish-stars">
                        ${Array(3).fill().map((_, i) => `<span class="star ${i < stars ? 'earned' : ''}">⭐</span>`).join('')}
                    </div>
                    <div class="finish-actions">
                        <button class="btn btn-primary" onclick="gameGrandPrix.beginRace()">🔄 再来一局</button>
                        <button class="btn btn-secondary" onclick="gameGrandPrix.renderStart()">🏠 返回</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderStart() {
        this.isPlaying = false;
        clearInterval(this.timer);
        this.container.innerHTML = `
            <div class="game-grandprix">
                <div class="back-nav">
                    <button class="btn btn-back" onclick="app.navigateTo('home')">🏠 返回大厅</button>
                    <span class="back-title">🏎️ 儿童英语趣味乐园</span>
                </div>
                <div class="grandprix-header">
                    <h2>🏆 终极竞速</h2>
                    <p class="grandprix-subtitle">计时答题挑战！60秒内答对尽可能多的单词！</p>
                </div>
                <div class="grandprix-intro">
                    <div class="grandprix-rules">
                        <div class="rule-item">📝 随机 ${this.totalQuestions} 道单词选择题</div>
                        <div class="rule-item">⏱️ 限时 ${this.timeLimit} 秒完成</div>
                        <div class="rule-item">🎯 涵盖所有单词类别</div>
                        <div class="rule-item">🏎️ 速度快、正确率高才能拿高分！</div>
                    </div>
                    <button class="btn btn-start-race" onclick="gameGrandPrix.beginRace()">
                        🏎️ 引擎启动！出发！
                    </button>
                </div>
            </div>
        `;
    }

    renderRaceScreen() {
        const q = this.questions[this.currentQuestion];
        
        this.container.innerHTML = `
            <div class="game-grandprix">
                <div class="back-nav">
                    <button class="btn btn-back" onclick="gameGrandPrix.renderStart()">⚠️ 退出竞速</button>
                    <span class="back-title">🏎️ 儿童英语趣味乐园</span>
                </div>
                <div class="grandprix-dashboard">
                    <div class="speedometer">
                        <div class="speed-label">⏱️ 剩余</div>
                        <div class="timer-display" id="timerDisplay">${this.timeLeft}</div>
                        <div class="speed-bar">
                            <div class="speed-fill" id="speedFill" style="width: 100%"></div>
                        </div>
                    </div>
                    <div class="grandprix-status">
                        <span>📝 ${this.currentQuestion + 1}/${this.totalQuestions}</span>
                        <span>⭐ ${this.score}分</span>
                    </div>
                </div>
                <div class="grandprix-question">
                    <div class="grandprix-type">
                        ${q.type === 'listen' ? '🎧 听发音选词' : q.type === 'image' ? '👀 看图选词' : '🇨🇳 看中文选英文'}
                    </div>
                    <div class="grandprix-prompt" id="grandprixPrompt"></div>
                    <div class="grandprix-options" id="grandprixOptions"></div>
                    <div class="grandprix-feedback-area" id="grandprixFeedback"></div>
                </div>
            </div>
        `;

        // 渲染 prompt（通过 DOM 以避免引号转义问题）
        const promptContainer = this.container.querySelector('#grandprixPrompt');
        if (promptContainer) {
            if (q.type === 'listen') {
                const listenBtn = document.createElement('button');
                listenBtn.className = 'btn btn-listen-big';
                listenBtn.textContent = '🔊 点击听发音';
                listenBtn.addEventListener('click', () => {
                    audio.speakWord(q.word.en, 0.9, q.word.zh);
                });
                promptContainer.appendChild(listenBtn);
            } else if (q.type === 'image') {
                promptContainer.innerHTML = `<div class="grandprix-emoji">${q.word.emoji}</div>`;
            } else {
                promptContainer.innerHTML = `<div class="grandprix-zh">"${q.word.zh}"</div>`;
            }
        }

        // 通过 DOM 绑定事件以避免 JSON.stringify 的引号问题
        const optionsContainer = this.container.querySelector('#grandprixOptions');
        if (optionsContainer) {
            q.options.forEach((w, i) => {
                const btn = document.createElement('button');
                btn.className = 'grandprix-option';
                btn.setAttribute('data-word', w.en);
                btn.innerHTML = `<span class="option-mark">${String.fromCharCode(65 + i)}</span><span>${w.en}</span>`;
                const wordCopy = Object.assign({}, w);
                btn.addEventListener('click', () => {
                    gameGrandPrix.answer(wordCopy);
                    btn.classList.add('selected');
                });
                optionsContainer.appendChild(btn);
            });
        }
        
        // 自动播放听力题
        if (q.type === 'listen') {
            setTimeout(() => audio.speakWord(q.word.en, 0.9, q.word.zh), 400);
        }
    }

    renderQuestion() {
        this.renderRaceScreen();
        const q = this.questions[this.currentQuestion];
        if (q.type === 'listen') {
            setTimeout(() => audio.speakWord(q.word.en, 0.9, q.word.zh), 400);
        }
    }
}

let gameGrandPrix;