// ========================================
// 儿童英语趣味乐园 - 赛道闯关
// ========================================

class GameRacing {
    constructor(container) {
        this.container = container;
        this.currentTerrain = null;
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.totalQuestions = 10;
        this.isPlaying = false;
        this.answered = false;
    }

    start() {
        this.renderTerrainSelect();
    }

    startRace(terrain) {
        this.currentTerrain = terrain;
        this.currentQuestion = 0;
        this.score = 0;
        this.answered = false;
        
        // 准备题目
        const catWords = getWordsByCategory(terrain.class);
        if (catWords.length < 4) {
            alert('该类别单词不足，请选择其他赛道！');
            return;
        }
        
        // 生成题目：正确选项 + 3个干扰项
        this.questions = [];
        const shuffled = shuffleArray([...catWords]);
        const questionCount = Math.min(this.totalQuestions, shuffled.length);
        
        for (let i = 0; i < questionCount; i++) {
            const correctWord = shuffled[i];
            const otherWords = getAllWords().filter(w => w.en !== correctWord.en);
            const distractors = shuffleArray(otherWords).slice(0, 3);
            const options = shuffleArray([correctWord, ...distractors]);
            
            this.questions.push({
                correctWord,
                options,
                type: Math.random() > 0.5 ? 'image' : 'listen' // 一半看图选、一半听音选
            });
        }
        
        this.audioStart = true; // 标记首次答题需要初始化音频
        this.isPlaying = true;
        this.renderRaceScreen();
    }

    answer(selectedWord) {
        if (this.answered) return;
        this.answered = true;
        
        const current = this.questions[this.currentQuestion];
        const isCorrect = selectedWord.en === current.correctWord.en;
        
        if (isCorrect) {
            this.score++;
            audio.correctAnswer();
            audio.speakCorrect();
            storage.learnWord(current.correctWord);
        } else {
            audio.wrongAnswer();
            audio.speakWrong();
        }
        
        this.showFeedback(isCorrect, current.correctWord);
    }

    showFeedback(isCorrect, correctWord) {
        const feedback = this.container.querySelector('.race-feedback');
        if (!feedback) return;
        
        const options = this.container.querySelectorAll('.race-option');
        options.forEach(opt => {
            opt.style.pointerEvents = 'none';
            const wordEn = opt.getAttribute('data-word');
            if (wordEn === correctWord.en) {
                opt.classList.add('correct');
            }
            if (opt.classList.contains('selected') && !isCorrect) {
                opt.classList.add('wrong');
            }
        });
        
        feedback.innerHTML = `
            <div class="feedback-content ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}">
                <span class="feedback-icon">${isCorrect ? '🎉' : '😅'}</span>
                <span>${isCorrect ? '太棒了！' : '正确答案是：'}</span>
                ${!isCorrect ? `<strong>${correctWord.en}</strong> <small>${correctWord.zh}</small>` : ''}
            </div>
        `;
        
        setTimeout(() => this.nextQuestion(), 1500);
    }

    nextQuestion() {
        this.currentQuestion++;
        this.answered = false;
        
        if (this.currentQuestion >= this.questions.length) {
            this.finishRace();
        } else {
            this.renderQuestion();
        }
    }

    finishRace() {
        this.isPlaying = false;
        const newAchs = storage.recordRaceCompletion(this.score, this.questions.length);
        
        if (this.score >= this.questions.length * 0.8) {
            audio.levelComplete();
        }
        
        // 检查是否有新成就
        if (newAchs.length > 0) {
            setTimeout(() => this.showAchievements(newAchs), 500);
        }
        
        this.container.querySelector('#raceScreen').innerHTML = `
            <div class="race-finish">
                <div class="finish-flag">🏁</div>
                <h2>闯关完成！</h2>
                <div class="finish-score">
                    <div class="score-circle">
                        <span class="score-value">${this.score}</span>
                        <span class="score-total">/ ${this.questions.length}</span>
                    </div>
                </div>
                <div class="finish-stars">
                    ${this.getStars().map(s => `<span class="star ${s ? 'earned' : ''}">⭐</span>`).join('')}
                </div>
                <p class="finish-msg">${this.getMessage()}</p>
                <div class="finish-actions">
                    <button class="btn btn-primary" onclick="gameRacing.startRace(gameRacing.currentTerrain)">🔄 再跑一次</button>
                    <button class="btn btn-secondary" onclick="gameRacing.renderTerrainSelect()">🗺️ 换条赛道</button>
                </div>
            </div>
        `;
    }

    getStars() {
        const ratio = this.score / this.questions.length;
        if (ratio >= 0.9) return [true, true, true];
        if (ratio >= 0.6) return [true, true, false];
        if (ratio >= 0.3) return [true, false, false];
        return [false, false, false];
    }

    getMessage() {
        const ratio = this.score / this.questions.length;
        if (ratio >= 0.9) return '🏆 你简直是单词赛车冠军！';
        if (ratio >= 0.7) return '👍 不错哦，继续加油！';
        if (ratio >= 0.5) return '💪 还需要多练练，再来一次？';
        return '📚 别灰心，去车库多学学单词吧！';
    }

    showAchievements(achievements) {
        achievements.forEach(ach => {
            audio.achievementUnlocked();
            const toast = document.createElement('div');
            toast.className = 'achievement-toast';
            toast.innerHTML = `
                <span class="ach-icon">${ach.emoji}</span>
                <div>
                    <strong>成就解锁！</strong>
                    <span>${ach.name} - ${ach.desc}</span>
                </div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        });
    }

    renderTerrainSelect() {
        this.container.innerHTML = `
            <div class="game-racing">
                <div class="back-nav">
                    <button class="btn btn-back" onclick="app.navigateTo('home')">🏠 返回大厅</button>
                    <span class="back-title">🏎️ 儿童英语趣味乐园</span>
                </div>
                <div class="racing-header">
                    <h2>🏁 赛道闯关</h2>
                    <p class="racing-subtitle">选择一条赛道，答对单词障碍冲刺终点！</p>
                </div>
                <div class="terrain-grid" id="terrainGrid"></div>
            </div>
        `;

        // 通过 DOM 绑定事件，避免 JSON.stringify 引号问题
        const grid = this.container.querySelector('#terrainGrid');
        if (grid) {
            TERRAINS.forEach(t => {
                const cat = WORD_CATEGORIES[t.class];
                if (!cat) return;
                const card = document.createElement('div');
                card.className = 'terrain-card';
                card.innerHTML = `
                    <div class="terrain-emoji">${t.emoji}</div>
                    <div class="terrain-name">${t.name}</div>
                    <div class="terrain-cat">${cat.emoji} ${cat.name}</div>
                    <div class="terrain-desc">${cat.words.length} 个单词等你征服！</div>
                    <div class="terrain-action">🏎️ 出发！</div>
                `;
                card.addEventListener('click', () => {
                    gameRacing.startRace(t);
                });
                grid.appendChild(card);
            });
        }
    }

    renderRaceScreen() {
        const progress = (this.currentQuestion / this.questions.length) * 100;
        const q = this.questions[this.currentQuestion];
        
        this.container.innerHTML = `
            <div class="game-racing" id="raceScreen">
                <div class="back-nav">
                    <button class="btn btn-back" onclick="gameRacing.renderTerrainSelect()">⚠️ 退出赛道</button>
                    <span class="back-title">🏎️ 儿童英语趣味乐园</span>
                </div>
                <div class="race-progress-bar">
                    <div class="race-track">
                        <div class="race-car" style="left: ${progress}%">🏎️</div>
                        <div class="race-track-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="race-stats">
                        <span>第 ${this.currentQuestion + 1}/${this.questions.length} 题</span>
                        <span>⭐ ${this.score} 分</span>
                    </div>
                </div>
                <div class="race-question-area">
                    <div class="race-type-badge">
                        ${q.type === 'listen' ? '🎧 听音选词' : '👀 看图选词'}
                    </div>
                    <div class="race-prompt">
                        ${q.type === 'listen' ? 
                            `<button class="btn btn-listen" onclick="audio.speakWord('${q.correctWord.en}', 0.9, '${q.correctWord.zh}')">
                                🔊 点击听发音
                            </button>` :
                            `<div class="race-emoji-big">${q.correctWord.emoji}</div>`
                        }
                    </div>
                    <div class="race-options" id="raceOptions"></div>
                </div>
                <div class="race-feedback"></div>
            </div>
        `;

        // 通过 DOM 绑定选项事件，避免 JSON.stringify 引号问题
        const optsContainer = this.container.querySelector('#raceOptions');
        if (optsContainer) {
            q.options.forEach((w, i) => {
                const btn = document.createElement('button');
                btn.className = 'race-option';
                btn.setAttribute('data-word', w.en);
                btn.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + i)}</span>${w.en}`;
                const wordCopy = Object.assign({}, w);
                btn.addEventListener('click', () => {
                    gameRacing.answer(wordCopy);
                    btn.classList.add('selected');
                });
                optsContainer.appendChild(btn);
            });
        }
        
        // 如果第一题是听力题，自动播放
        if (q.type === 'listen' && this.audioStart) {
            this.audioStart = false;
            setTimeout(() => audio.speakWord(q.correctWord.en, 0.9, q.correctWord.zh), 500);
        }
    }

    renderQuestion() {
        this.renderRaceScreen();
        const q = this.questions[this.currentQuestion];
        if (q.type === 'listen') {
            setTimeout(() => audio.speakWord(q.correctWord.en, 0.9, q.correctWord.zh), 300);
        }
    }
}

let gameRacing;