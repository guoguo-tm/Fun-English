// ========================================
// 儿童英语趣味乐园 - 改装车间（拼写练习）
// ========================================

class GameWorkshop {
    constructor(container) {
        this.container = container;
        this.currentWord = null;
        this.userAnswer = '';
        this.score = 0;
        this.totalRounds = 10;
        this.currentRound = 0;
        this.words = [];
        this.category = 'animals';
    }

    start() {
        this.renderCategorySelect();
    }

    selectCategory(category) {
        this.category = category;
        this.currentRound = 0;
        this.score = 0;
        this.words = shuffleArray(getWordsByCategory(category));
        if (this.words.length > this.totalRounds) {
            this.words = this.words.slice(0, this.totalRounds);
        }
        this.totalRounds = this.words.length;
        this.nextWord();
    }

    nextWord() {
        if (this.currentRound >= this.totalRounds) {
            this.finishGame();
            return;
        }
        
        this.currentWord = this.words[this.currentRound];
        this.userAnswer = '';
        
        // 随机显示模式：看emoji拼写 或 看中文拼写
        this.mode = Math.random() > 0.5 ? 'emoji' : 'zh';
        
        this.renderWorkshop();
    }

    typeLetter(letter) {
        if (this.userAnswer.length >= this.currentWord.en.length) return;
        this.userAnswer += letter;
        audio.typeLetter();
        this.renderLetterInput();
    }

    deleteLetter() {
        this.userAnswer = this.userAnswer.slice(0, -1);
        audio.btnClick();
        this.renderLetterInput();
    }

    submitAnswer() {
        if (this.userAnswer.length === 0) return;
        
        const isCorrect = this.userAnswer.toLowerCase() === this.currentWord.en.toLowerCase();
        
        if (isCorrect) {
            this.score++;
            audio.correctAnswer();
            audio.speakCorrect();
            const result = storage.learnWord(this.currentWord);
            if (result.newWord || true) {
                storage.recordSpellingCorrect();
            }
        } else {
            audio.wrongAnswer();
            audio.speakWrong();
        }
        
        this.showFeedback(isCorrect);
    }

    showFeedback(isCorrect) {
        const feedback = this.container.querySelector('#workshopFeedback');
        if (!feedback) return;
        
        feedback.innerHTML = `
            <div class="workshop-feedback ${isCorrect ? 'correct' : 'wrong'}">
                ${isCorrect ? 
                    `<span>🎉 拼写正确！</span><span class="correct-word">${this.currentWord.en}</span>` :
                    `<span>😅 正确答案是：</span><span class="correct-word">${this.currentWord.en}</span>
                     <span class="zh-hint">${this.currentWord.zh}</span>`
                }
                <div class="car-upgrade-anim">
                    ${isCorrect ? '🔧⚙️ 零件安装成功！赛车性能+1' : '💔 零件不匹配，再试一次吧'}
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.currentRound++;
            this.nextWord();
        }, 2000);
    }

    finishGame() {
        audio.levelComplete();
        storage.recordRaceCompletion(this.score, this.totalRounds);
        
        this.container.innerHTML = `
            <div class="game-workshop">
                <div class="workshop-finish">
                    <div class="finish-emoji">🔧</div>
                    <h2>改装完成！</h2>
                    <div class="score-circle">
                        <span class="score-value">${this.score}</span>
                        <span class="score-total">/ ${this.totalRounds}</span>
                    </div>
                    <div class="finish-stars">
                        ${Array(3).fill().map((_, i) => {
                            const ratio = this.score / this.totalRounds;
                            const earned = (i === 0 && ratio >= 0.3) || (i === 1 && ratio >= 0.6) || (i === 2 && ratio >= 0.9);
                            return `<span class="star ${earned ? 'earned' : ''}">⭐</span>`;
                        }).join('')}
                    </div>
                    <div class="finish-actions">
                        <button class="btn btn-primary" onclick="gameWorkshop.selectCategory(gameWorkshop.category)">🔄 再改装一次</button>
                        <button class="btn btn-secondary" onclick="gameWorkshop.renderCategorySelect()">📂 换类别</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderCategorySelect() {
        const cats = Object.entries(WORD_CATEGORIES);
        this.container.innerHTML = `
            <div class="game-workshop">
                <div class="back-nav">
                    <button class="btn btn-back" onclick="app.navigateTo('home')">🏠 返回大厅</button>
                    <span class="back-title">🏎️ 儿童英语趣味乐园</span>
                </div>
                <div class="workshop-header">
                    <h2>🔧 改装车间</h2>
                    <p class="workshop-subtitle">拼对单词，为赛车加装升级部件！</p>
                </div>
                <div class="workshop-categories">
                    ${cats.map(([key, cat]) => `
                        <div class="workshop-cat-card" onclick="gameWorkshop.selectCategory('${key}')">
                            <div class="workshop-cat-emoji">${cat.emoji}</div>
                            <div class="workshop-cat-name">${cat.name}</div>
                            <div class="workshop-cat-count">${cat.words.length} 个单词</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderWorkshop() {
        const progress = (this.currentRound / this.totalRounds) * 100;
        
        this.container.innerHTML = `
            <div class="game-workshop" id="workshopScreen">
                <div class="back-nav">
                    <button class="btn btn-back" onclick="gameWorkshop.renderCategorySelect()">🔙 换类别</button>
                    <span class="back-title">🏎️ 儿童英语趣味乐园</span>
                </div>
                <div class="workshop-progress">
                    <div class="workshop-progress-bar">
                        <div class="workshop-progress-fill" style="width: ${progress}%">🔧</div>
                    </div>
                    <div class="workshop-stats">
                        <span>第 ${this.currentRound + 1}/${this.totalRounds} 个零件</span>
                        <span>⭐ ${this.score} / ${this.currentRound}</span>
                    </div>
                </div>
                <div class="workshop-question">
                    <div class="workshop-prompt">
                        <div class="workshop-emoji">${this.currentWord.emoji}</div>
                        <div class="workshop-hint">
                            ${this.mode === 'zh' ? `中文：${this.currentWord.zh}` : '看emoji拼写英文单词'}
                        </div>
                    </div>
                    <div class="workshop-letter-input" id="letterInput">
                        ${this.renderLetterSlots()}
                    </div>
                    <div class="workshop-keyboard" id="workshopKeyboard">
                        ${this.renderKeyboard()}
                    </div>
                    <div class="workshop-actions">
                        <button class="btn btn-delete" onclick="gameWorkshop.deleteLetter()">⌫ 删除</button>
                        <button class="btn btn-submit" onclick="gameWorkshop.submitAnswer()">✅ 提交</button>
                        <button class="btn btn-listen-small" onclick="audio.speakWord('${this.currentWord.en}', 0.9, '${this.currentWord.zh}')">🔊</button>
                    </div>
                </div>
                <div class="workshop-feedback-area" id="workshopFeedback"></div>
            </div>
        `;
    }

    renderLetterSlots() {
        const word = this.currentWord.en;
        let html = '';
        for (let i = 0; i < word.length; i++) {
            const letter = this.userAnswer[i] || '';
            html += `<div class="letter-slot ${letter ? 'filled' : ''}">${letter || '_'}</div>`;
        }
        return html;
    }

    renderKeyboard() {
        // 打乱字母排列
        const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
        return letters.map(l => 
            `<button class="keyboard-key" onclick="gameWorkshop.typeLetter('${l}')">${l}</button>`
        ).join('');
    }

    renderLetterInput() {
        const input = this.container.querySelector('#letterInput');
        if (input) {
            input.innerHTML = this.renderLetterSlots();
        }
    }
}

let gameWorkshop;