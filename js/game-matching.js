// ========================================
// 儿童英语趣味乐园 - 零件配对（记忆翻牌）
// ========================================

class GameMatching {
    constructor(container) {
        this.container = container;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 6;
        this.isLocked = false;
        this.moves = 0;
        this.category = 'animals';
    }

    start() {
        this.renderCategorySelect();
    }

    selectCategory(category) {
        this.category = category;
        this.startGame();
    }

    startGame() {
        const words = getWordsByCategory(this.category);
        if (words.length < this.totalPairs) {
            this.totalPairs = Math.min(4, words.length);
        }
        
        const selected = shuffleArray([...words]).slice(0, this.totalPairs);
        
        // 创建卡片对：英文 + Emoji
        this.cards = [];
        selected.forEach((word, index) => {
            this.cards.push({
                id: index,
                pairId: index,
                type: 'en',
                content: word.en,
                emoji: word.emoji,
                word: word,
                flipped: false,
                matched: false
            });
            this.cards.push({
                id: index + selected.length,
                pairId: index,
                type: 'emoji',
                content: word.emoji,
                emoji: word.emoji,
                word: word,
                flipped: false,
                matched: false
            });
        });

        this.cards = shuffleArray(this.cards);
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isLocked = false;
        
        this.render();
    }

    flipCard(cardId) {
        if (this.isLocked) return;
        
        const card = this.cards.find(c => c.id === cardId);
        if (!card || card.flipped || card.matched) return;
        
        // 如果已有两张翻开的牌，不允许再翻
        if (this.flippedCards.length >= 2) return;
        
        audio.cardFlip();
        card.flipped = true;
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.checkMatch();
        }
        
        this.renderGrid();
    }

    checkMatch() {
        this.isLocked = true;
        const [card1, card2] = this.flippedCards;
        
        if (card1.pairId === card2.pairId && card1.type !== card2.type) {
            // 匹配成功
            setTimeout(() => {
                card1.matched = true;
                card2.matched = true;
                this.matchedPairs++;
                this.flippedCards = [];
                this.isLocked = false;
                audio.matchSuccess();
                
                // 自动朗读单词（英文+中文）
                audio.speakWord(card1.word.en, 0.9, card1.word.zh);
                
                // 记录学习
                storage.learnWord(card1.word);
                
                this.renderGrid();
                
                // 检查是否全部完成
                if (this.matchedPairs === this.totalPairs) {
                    this.finishGame();
                }
            }, 500);
        } else {
            // 不匹配，翻回去
            setTimeout(() => {
                card1.flipped = false;
                card2.flipped = false;
                this.flippedCards = [];
                this.isLocked = false;
                this.renderGrid();
            }, 800);
        }
    }

    finishGame() {
        audio.levelComplete();
        const stars = this.moves <= this.totalPairs * 2 ? 3 : this.moves <= this.totalPairs * 3 ? 2 : 1;
        
        setTimeout(() => {
            this.container.innerHTML = `
                <div class="game-matching">
                    <div class="matching-finish">
                        <div class="finish-emoji">🔧</div>
                        <h2>零件配对完成！</h2>
                        <div class="finish-stats">
                            <div class="stat-item">
                                <span class="stat-value">${this.moves}</span>
                                <span class="stat-label">翻牌次数</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${this.totalPairs}</span>
                                <span class="stat-label">配对组数</span>
                            </div>
                        </div>
                        <div class="finish-stars">
                            ${Array(3).fill().map((_, i) => `<span class="star ${i < stars ? 'earned' : ''}">⭐</span>`).join('')}
                        </div>
                        <div class="finish-actions">
                            <button class="btn btn-primary" onclick="gameMatching.startGame()">🔄 再来一局</button>
                            <button class="btn btn-secondary" onclick="gameMatching.renderCategorySelect()">📂 换类别</button>
                        </div>
                    </div>
                </div>
            `;
        }, 1000);
    }

    renderCategorySelect() {
        const cats = Object.entries(WORD_CATEGORIES);
        this.container.innerHTML = `
            <div class="game-matching">
                <div class="back-nav">
                    <button class="btn btn-back" onclick="app.navigateTo('home')">🏠 返回大厅</button>
                    <span class="back-title">🏎️ 儿童英语趣味乐园</span>
                </div>
                <div class="matching-header">
                    <h2>🔧 零件配对</h2>
                    <p class="matching-subtitle">翻开引擎盖，找出匹配的单词零件对！</p>
                </div>
                <div class="matching-categories">
                    ${cats.map(([key, cat]) => `
                        <div class="matching-cat-card" onclick="audio.btnClick(); gameMatching.selectCategory('${key}')">
                            <div class="matching-cat-emoji">${cat.emoji}</div>
                            <div class="matching-cat-name">${cat.name}</div>
                            <div class="matching-cat-count">${cat.words.length} 个单词</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderGrid() {
        this.container.innerHTML = `
            <div class="game-matching">
                <div class="back-nav">
                    <button class="btn btn-back" onclick="gameMatching.renderCategorySelect()">🔙 换类别</button>
                    <span class="back-title">🏎️ 儿童英语趣味乐园</span>
                </div>
                <div class="matching-header">
                    <h2>🔧 零件配对</h2>
                    <div class="matching-stats">
                        <span>🔄 ${this.moves} 步</span>
                        <span>✅ ${this.matchedPairs}/${this.totalPairs} 对</span>
                        <button class="btn btn-small" onclick="gameMatching.startGame()">🔄 重来</button>
                        <button class="btn btn-small btn-secondary" onclick="gameMatching.renderCategorySelect()">📂 换类别</button>
                    </div>
                </div>
                <div class="matching-grid">
                    ${this.cards.map(card => `
                        <div class="matching-card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''}"
                             onclick="gameMatching.flipCard(${card.id})">
                            <div class="matching-card-inner">
                                <div class="matching-card-back">🔧</div>
                                <div class="matching-card-front">
                                    ${card.type === 'en' ? card.content : card.content}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    render() {
        this.renderGrid();
    }
}

let gameMatching;