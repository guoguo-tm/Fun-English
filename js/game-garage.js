// ========================================
// 儿童英语趣味乐园 - 赛车车库（闪卡学习）
// ========================================

class GameGarage {
    constructor(container) {
        this.container = container;
        this.currentCategory = 'animals';
        this.currentIndex = 0;
        this.words = [];
        this.isFlipped = false;
    }

    start() {
        this.render();
    }

    selectCategory(category) {
        this.currentCategory = category;
        this.currentIndex = 0;
        this.isFlipped = false;
        this.words = getWordsByCategory(category);
        this.render();
    }

    nextWord() {
        if (this.words.length === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.words.length;
        this.isFlipped = false;
        this.renderFlashcard();
        audio.cardFlip();
    }

    prevWord() {
        if (this.words.length === 0) return;
        this.currentIndex = (this.currentIndex - 1 + this.words.length) % this.words.length;
        this.isFlipped = false;
        this.renderFlashcard();
        audio.cardFlip();
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        audio.cardFlip();
        if (this.isFlipped && this.words[this.currentIndex]) {
            const word = this.words[this.currentIndex];
            audio.speakWord(word.en, 0.9, word.zh);
        }
        this.renderFlashcard();
    }

    markLearned() {
        if (this.words.length === 0) return;
        const word = this.words[this.currentIndex];
        const result = storage.learnWord(word);
        
        if (result.newWord) {
            audio.correctAnswer();
            audio.speakCorrect();
            if (result.carUpgraded) {
                this.showCarUpgrade(result.newLevel);
            }
            this.showStarBurst();
        }
        this.renderFlashcard();
    }

    showStarBurst() {
        const card = this.container.querySelector('.flashcard');
        if (!card) return;
        for (let i = 0; i < 8; i++) {
            const star = document.createElement('span');
            star.className = 'star-particle';
            star.textContent = '⭐';
            star.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 1000;
                animation: starBurst 0.8s ease-out forwards;
                left: ${50 + (Math.random() - 0.5) * 60}%;
                top: ${50 + (Math.random() - 0.5) * 60}%;
                animation-delay: ${Math.random() * 0.2}s;
                font-size: ${1 + Math.random() * 1.5}rem;
            `;
            document.body.appendChild(star);
            setTimeout(() => star.remove(), 1000);
        }
    }

    showCarUpgrade(newLevel) {
        audio.transformSound();
        const overlay = document.createElement('div');
        overlay.className = 'upgrade-overlay';
        overlay.innerHTML = `
            <div class="upgrade-popup animate-bounceIn">
                <div class="upgrade-emoji">${newLevel.emoji}</div>
                <h2>🏆 赛车进化！</h2>
                <p class="upgrade-name">${newLevel.name}</p>
                <p class="upgrade-desc">${newLevel.description}</p>
                <div class="upgrade-features">
                    ${newLevel.features.map(f => `<span class="feature-tag">🔧 ${f}</span>`).join('')}
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">酷！继续学习！✨</button>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 5000);
    }

    render() {
        this.container.innerHTML = `
            <div class="game-garage">
                <div class="back-nav">
                    <button class="btn btn-back" onclick="app.navigateTo('home')">🏠 返回大厅</button>
                    <span class="back-title">🏎️ 儿童英语趣味乐园</span>
                </div>
                <div class="garage-header">
                    <h2>🏠 赛车车库</h2>
                    <p class="garage-subtitle">选择赛道，学习单词，升级赛车！</p>
                </div>
                <div class="category-selector" id="categorySelector"></div>
                <div class="flashcard-area" id="flashcardArea"></div>
                <div class="flashcard-controls" id="flashcardControls">
                    <button class="btn btn-circle" onclick="gameGarage.prevWord()" title="上一个">⬅️</button>
                    <button class="btn btn-speaker" onclick="gameGarage.speakCurrent()" title="听发音">🔊</button>
                    <button class="btn btn-circle" onclick="gameGarage.nextWord()" title="下一个">➡️</button>
                </div>
            </div>
        `;
        this.renderCategorySelector();
        this.renderFlashcard();
    }

    renderCategorySelector() {
        const selector = this.container.querySelector('#categorySelector');
        if (!selector) return;
        
        selector.innerHTML = TERRAINS.map(t => {
            const cat = WORD_CATEGORIES[t.class];
            if (!cat) return '';
            const progress = storage.data.learnedCategories[t.class] || 0;
            const total = cat.words.length;
            const isActive = this.currentCategory === t.class;
            return `
                <div class="category-card ${isActive ? 'active' : ''}" 
                     onclick="gameGarage.selectCategory('${t.class}')">
                    <div class="category-icon">${t.emoji}</div>
                    <div class="category-name">${t.name}</div>
                    <div class="category-type">${cat.emoji} ${cat.name}</div>
                    <div class="category-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(progress / total) * 100}%"></div>
                        </div>
                        <span class="progress-text">${progress}/${total}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderFlashcard() {
        const area = this.container.querySelector('#flashcardArea');
        if (!area) return;
        
        if (this.words.length === 0) {
            area.innerHTML = `<div class="empty-state">请先选择一个赛道类别 📚</div>`;
            return;
        }

        const word = this.words[this.currentIndex];
        const isLearned = storage.isWordLearned(word.en);

        area.innerHTML = `
            <div class="flashcard ${this.isFlipped ? 'flipped' : ''}" onclick="gameGarage.flipCard()">
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <div class="flashcard-emoji">${word.emoji}</div>
                        <div class="flashcard-word">${word.en}</div>
                        <div class="flashcard-hint">👆 点击翻面看中文</div>
                    </div>
                    <div class="flashcard-back">
                        <div class="flashcard-emoji">${word.emoji}</div>
                        <div class="flashcard-zh">${word.zh}</div>
                        <div class="flashcard-en-small">${word.en}</div>
                        <div class="flashcard-hint">👆 点击翻回</div>
                    </div>
                </div>
            </div>
            <div class="flashcard-info">
                <span class="word-counter">${this.currentIndex + 1} / ${this.words.length}</span>
                <span class="word-category">${word.categoryName}</span>
                <span class="word-learned ${isLearned ? 'learned' : ''}">${isLearned ? '✅ 已学会' : '📖 新单词'}</span>
            </div>
            <button class="btn btn-learned ${isLearned ? 'btn-learned-done' : ''}" 
                    onclick="event.stopPropagation(); gameGarage.markLearned()">
                ${isLearned ? '✅ 已学会' : '🎓 我会了！'}
            </button>
        `;
    }

    speakCurrent() {
        if (this.words.length > 0) {
            const word = this.words[this.currentIndex];
            audio.speakWord(word.en, 0.9, word.zh);
        }
    }
}

// 全局实例
let gameGarage;