// ========================================
// 儿童英语趣味乐园 - 主控制器
// ========================================

class App {
    constructor() {
        this.currentScreen = 'home';
        this.gameContainer = null;
        this.init();
    }

    init() {
        this.gameContainer = document.getElementById('gameContainer');
        
        // 初始化音效（用户首次交互时，同时支持桌面端点击和移动端触摸）
        const initAudio = () => {
            audio.init();
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };
        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('touchstart', initAudio, { once: true });
        
        // 更新连续学习天数
        storage.updateStreak();
        
        // 渲染主页
        this.showHome();
        
        console.log('🏁 儿童英语趣味乐园已启动！');
        console.log(`📊 已学会 ${storage.data.learnedCount} 个单词`);
        console.log(`🏎️ 当前赛车：${getCurrentCarLevel(storage.data.learnedCount).name}`);
    }

    showHome() {
        this.currentScreen = 'home';
        const stats = storage.getStats();
        const currentCar = getCurrentCarLevel(stats.learnedCount);
        const nextCar = getNextCarLevel(stats.learnedCount);
        
        this.gameContainer.innerHTML = `
            <div class="home-screen">
                <!-- 顶部横幅 -->
                <div class="home-banner">
                    <div class="banner-car">${currentCar.emoji}</div>
                    <h1 class="banner-title">🏎️ 儿童英语趣味乐园</h1>
                    <p class="banner-subtitle">驾驶赛车，穿越英语世界！</p>
                    <div class="banner-car-info">
                        <span>${currentCar.emoji} ${currentCar.name}</span>
                        <span class="car-level">Lv.${currentCar.level}</span>
                    </div>
                </div>

                <!-- 统计面板 -->
                <div class="stats-panel">
                    <div class="stat-item">
                        <span class="stat-icon">📚</span>
                        <span class="stat-val">${stats.learnedCount}</span>
                        <span class="stat-lbl">已学单词</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🎯</span>
                        <span class="stat-val">${stats.accuracy}%</span>
                        <span class="stat-lbl">正确率</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🔥</span>
                        <span class="stat-val">${stats.streak}天</span>
                        <span class="stat-lbl">连续学习</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🏆</span>
                        <span class="stat-val">${stats.achievements}/${stats.totalAchievements}</span>
                        <span class="stat-lbl">成就</span>
                    </div>
                </div>

                <!-- 赛车升级进度 -->
                <div class="car-evolution-bar">
                    <div class="evolution-title">🚗 赛车进化之路</div>
                    <div class="evolution-track">
                        ${CAR_EVOLUTION.map(car => {
                            const unlocked = stats.learnedCount >= car.requiredWords;
                            return `
                                <div class="evolution-node ${unlocked ? 'unlocked' : 'locked'}">
                                    <div class="evolution-emoji">${car.emoji}</div>
                                    <div class="evolution-name">${car.name}</div>
                                    <div class="evolution-requirement">${car.requiredWords}词</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    ${nextCar ? `
                        <div class="evolution-progress">
                            <span>距离解锁 ${nextCar.emoji} ${nextCar.name} 还需学习</span>
                            <strong>${nextCar.requiredWords - stats.learnedCount}</strong>
                            <span>个单词</span>
                        </div>
                    ` : '<div class="evolution-progress">🎉 全部赛车已解锁！你是顶级赛车手！</div>'}
                </div>

                <!-- 游戏入口 -->
                <div class="game-entries">
                    <h2 class="entries-title">🎮 选择冒险模式</h2>
                    <div class="entries-grid">
                        <div class="entry-card entry-garage" onclick="app.navigateTo('garage')">
                            <div class="entry-icon">🏠</div>
                            <div class="entry-name">赛车车库</div>
                            <div class="entry-desc">浏览闪卡，学习新单词</div>
                        </div>
                        <div class="entry-card entry-racing" onclick="app.navigateTo('racing')">
                            <div class="entry-icon">🏁</div>
                            <div class="entry-name">赛道闯关</div>
                            <div class="entry-desc">选择赛道，看图听音闯关</div>
                        </div>
                        <div class="entry-card entry-matching" onclick="app.navigateTo('matching')">
                            <div class="entry-icon">🔧</div>
                            <div class="entry-name">零件配对</div>
                            <div class="entry-desc">记忆翻牌，找出配对零件</div>
                        </div>
                        <div class="entry-card entry-workshop" onclick="app.navigateTo('workshop')">
                            <div class="entry-icon">⚙️</div>
                            <div class="entry-name">改装车间</div>
                            <div class="entry-desc">拼写单词，改装升级赛车</div>
                        </div>
                        <div class="entry-card entry-grandprix" onclick="app.navigateTo('grandprix')">
                            <div class="entry-icon">🏆</div>
                            <div class="entry-name">终极竞速</div>
                            <div class="entry-desc">限时答题挑战，测试实力</div>
                        </div>
                        <div class="entry-card entry-honor" onclick="app.navigateTo('honor')">
                            <div class="entry-icon">🏅</div>
                            <div class="entry-name">荣誉车库</div>
                            <div class="entry-desc">查看成就、赛车和统计</div>
                        </div>
                    </div>
                </div>

                <!-- 底部 -->
                <div class="home-footer">
                    <button class="btn btn-reset" onclick="app.resetData()">🔄 重置数据</button>
                    <span class="footer-text">🏎️ 儿童英语趣味乐园 v1.0</span>
                </div>
            </div>
        `;
    }

    navigateTo(screen) {
        audio.btnClick();
        
        // 如果计时器在跑，先清除
        if (gameGrandPrix && gameGrandPrix.timer) {
            clearInterval(gameGrandPrix.timer);
        }
        
        this.currentScreen = screen;
        
        switch (screen) {
            case 'home':
                this.showHome();
                break;
            case 'garage':
                gameGarage = new GameGarage(this.gameContainer);
                gameGarage.start();
                break;
            case 'racing':
                gameRacing = new GameRacing(this.gameContainer);
                gameRacing.start();
                break;
            case 'matching':
                gameMatching = new GameMatching(this.gameContainer);
                gameMatching.start();
                break;
            case 'workshop':
                gameWorkshop = new GameWorkshop(this.gameContainer);
                gameWorkshop.start();
                break;
            case 'grandprix':
                gameGrandPrix = new GameGrandPrix(this.gameContainer);
                gameGrandPrix.start();
                break;
            case 'honor':
                this.showHonorGarage();
                break;
        }
        
        window.scrollTo(0, 0);
    }

    addBackButton() {
        // 在 gameContainer 顶部插入返回按钮
        const existing = this.gameContainer.querySelector('.back-nav');
        if (existing) return;
        
        const backNav = document.createElement('div');
        backNav.className = 'back-nav';
        backNav.innerHTML = `
            <button class="btn btn-back" onclick="app.navigateTo('home')">🏠 返回大厅</button>
            <span class="back-title">🏎️ 儿童英语趣味乐园</span>
        `;
        this.gameContainer.insertBefore(backNav, this.gameContainer.firstChild);
    }

    showHonorGarage() {
        this.currentScreen = 'honor';
        const stats = storage.getStats();
        const achievements = storage.getAchievements();
        const currentCar = getCurrentCarLevel(stats.learnedCount);
        const learnedWords = storage.getLearnedWordKeys();
        
        this.addBackButton();
        
        const backNav = this.gameContainer.querySelector('.back-nav');
        if (backNav) backNav.remove();
        
        this.gameContainer.innerHTML = `
            <div class="honor-garage">
                <div class="back-nav">
                    <button class="btn btn-back" onclick="app.navigateTo('home')">🏠 返回大厅</button>
                    <span class="back-title">🏎️ 儿童英语趣味乐园</span>
                </div>

                <!-- 当前赛车展示 -->
                <div class="honor-section">
                    <h2>🏎️ 当前赛车</h2>
                    <div class="current-car-display">
                        <div class="current-car-emoji">${currentCar.emoji}</div>
                        <div class="current-car-name">${currentCar.name}</div>
                        <div class="current-car-level">Lv.${currentCar.level}</div>
                        <div class="current-car-desc">${currentCar.description}</div>
                        <div class="current-car-features">
                            ${currentCar.features.map(f => `<span class="feature-tag">🔧 ${f}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <!-- 赛车进化路线 -->
                <div class="honor-section">
                    <h2>🚗 赛车进化路线</h2>
                    <div class="car-collection">
                        ${CAR_EVOLUTION.map(car => {
                            const unlocked = stats.learnedCount >= car.requiredWords;
                            return `
                                <div class="car-card ${unlocked ? 'unlocked' : 'locked'}">
                                    <div class="car-card-emoji">${car.emoji}</div>
                                    <div class="car-card-name">${car.name}</div>
                                    <div class="car-card-level">Lv.${car.level}</div>
                                    <div class="car-card-status">${unlocked ? '✅ 已解锁' : `🔒 ${car.requiredWords}词解锁`}</div>
                                    <div class="car-card-features">
                                        ${car.features.map(f => `<small>🔧 ${f}</small>`).join('<br>')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- 学习统计 -->
                <div class="honor-section">
                    <h2>📊 学习统计</h2>
                    <div class="stats-grid">
                        <div class="stat-card-honor">
                            <span class="stat-val-h">${stats.learnedCount} / ${stats.totalWords}</span>
                            <span class="stat-lbl-h">已学单词</span>
                        </div>
                        <div class="stat-card-honor">
                            <span class="stat-val-h">${stats.raceCompletions}</span>
                            <span class="stat-lbl-h">赛道次数</span>
                        </div>
                        <div class="stat-card-honor">
                            <span class="stat-val-h">${stats.accuracy}%</span>
                            <span class="stat-lbl-h">答题正确率</span>
                        </div>
                        <div class="stat-card-honor">
                            <span class="stat-val-h">🔥${stats.streak}天</span>
                            <span class="stat-lbl-h">连续学习</span>
                        </div>
                        <div class="stat-card-honor">
                            <span class="stat-val-h">${stats.raceBestScore}</span>
                            <span class="stat-lbl-h">赛道最佳</span>
                        </div>
                        <div class="stat-card-honor">
                            <span class="stat-val-h">${stats.quizBestScore}</span>
                            <span class="stat-lbl-h">竞速最佳</span>
                        </div>
                        <div class="stat-card-honor">
                            <span class="stat-val-h">${stats.categoriesLearned}/${stats.totalCategories}</span>
                            <span class="stat-lbl-h">已学类别</span>
                        </div>
                        <div class="stat-card-honor">
                            <span class="stat-val-h">${stats.achievements}/${stats.totalAchievements}</span>
                            <span class="stat-lbl-h">成就收集</span>
                        </div>
                    </div>
                </div>

                <!-- 成就墙 -->
                <div class="honor-section">
                    <h2>🏆 成就墙</h2>
                    <div class="achievements-grid">
                        ${achievements.map(a => `
                            <div class="achievement-card ${a.earned ? 'earned' : ''}">
                                <div class="achievement-emoji">${a.earned ? a.emoji : '🔒'}</div>
                                <div class="achievement-name">${a.name}</div>
                                <div class="achievement-desc">${a.desc}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    resetData() {
        if (confirm('确定要重置所有学习数据吗？这将清除所有进度！此操作不可撤销！')) {
            storage.reset();
            audio.wrongAnswer();
            this.showHome();
            alert('✅ 数据已重置！赛车已回到车库，重新开始冒险吧！');
        }
    }
}

// 启动应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});