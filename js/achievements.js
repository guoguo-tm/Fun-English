// ========================================
// 儿童英语趣味乐园 - 成就系统 & 数据持久化
// ========================================

const STORAGE_KEY = 'english_racing_game';

// 成就定义
const ACHIEVEMENTS = [
    { id: 'first_word', name: '初出茅庐', emoji: '🌱', desc: '学会第1个单词', icon: '⭐' },
    { id: 'ten_words', name: '小有成就', emoji: '🌟', desc: '学会10个单词', icon: '⭐' },
    { id: 'twenty_words', name: '词汇达人', emoji: '💫', desc: '学会20个单词', icon: '⭐' },
    { id: 'fifty_words', name: '单词大师', emoji: '✨', desc: '学会50个单词', icon: '⭐' },
    { id: 'hundred_words', name: '词海霸主', emoji: '👑', desc: '学会100个单词', icon: '🏆' },
    { id: 'first_race', name: '初上赛道', emoji: '🏁', desc: '完成第1次赛道闯关', icon: '🏎️' },
    { id: 'five_races', name: '赛道老手', emoji: '🏆', desc: '完成5次赛道闯关', icon: '🏎️' },
    { id: 'first_perfect', name: '完美首秀', emoji: '💯', desc: '闯关获得满分', icon: '🎯' },
    { id: 'flash_master', name: '闪电记忆', emoji: '⚡', desc: '完成1次翻牌配对', icon: '🃏' },
    { id: 'spell_master', name: '拼写大师', emoji: '✍️', desc: '拼对10个单词', icon: '🔧' },
    { id: 'speed_demon', name: '速度狂魔', emoji: '💨', desc: '在30秒内完成1次测验', icon: '⏱️' },
    { id: 'all_categories', name: '全能车手', emoji: '🔄', desc: '学过所有类别单词', icon: '🗺️' },
];

// 默认游戏数据
const DEFAULT_GAME_DATA = {
    learnedWords: {},        // { 'cat': true, 'dog': true, ... }
    learnedCount: 0,
    learnedCategories: {},   // { 'animals': 5, 'fruits': 3, ... }
    raceCompletions: 0,
    raceBestScore: 0,
    quizBestScore: 0,
    totalCorrectAnswers: 0,
    totalQuestions: 0,
    achievements: {},        // { 'first_word': timestamp, ... }
    carLevel: 1,
    lastPlayed: null,
    streak: 0,               // 连续学习天数
    lastStreakDate: null,
};

class GameStorage {
    constructor() {
        this.data = this.load();
    }

    // 从 localStorage 加载
    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return { ...DEFAULT_GAME_DATA, ...parsed };
            }
        } catch (e) {
            console.warn('⚠️ 数据加载失败，使用默认数据');
        }
        return { ...DEFAULT_GAME_DATA };
    }

    // 保存到 localStorage
    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('⚠️ 数据保存失败');
        }
    }

    // 记录学会的单词
    learnWord(wordObj) {
        const key = wordObj.en;
        if (!this.data.learnedWords[key]) {
            this.data.learnedWords[key] = true;
            this.data.learnedCount++;
            
            // 更新分类计数
            if (wordObj.category) {
                if (!this.data.learnedCategories[wordObj.category]) {
                    this.data.learnedCategories[wordObj.category] = 0;
                }
                this.data.learnedCategories[wordObj.category]++;
            }
            
            // 检查成就
            this.checkAchievements();
            
            // 检查赛车升级
            const newLevel = getCurrentCarLevel(this.data.learnedCount);
            const wasUpgraded = newLevel.level > this.data.carLevel;
            this.data.carLevel = newLevel.level;
            
            this.save();
            
            // 返回是否有升级
            return { newWord: true, carUpgraded: wasUpgraded, newLevel: newLevel };
        }
        return { newWord: false, carUpgraded: false };
    }

    // 检查所有成就
    checkAchievements() {
        const newAchievements = [];
        const checks = {
            'first_word': this.data.learnedCount >= 1,
            'ten_words': this.data.learnedCount >= 10,
            'twenty_words': this.data.learnedCount >= 20,
            'fifty_words': this.data.learnedCount >= 50,
            'hundred_words': this.data.learnedCount >= 100,
            'first_race': this.data.raceCompletions >= 1,
            'five_races': this.data.raceCompletions >= 5,
            'all_categories': Object.keys(this.data.learnedCategories).length >= 8,
        };

        for (const [id, earned] of Object.entries(checks)) {
            if (earned && !this.data.achievements[id]) {
                this.data.achievements[id] = Date.now();
                const ach = ACHIEVEMENTS.find(a => a.id === id);
                if (ach) newAchievements.push(ach);
            }
        }
        return newAchievements;
    }

    // 记录赛道完成
    recordRaceCompletion(score, total) {
        this.data.raceCompletions++;
        this.data.totalQuestions += total;
        this.data.totalCorrectAnswers += score;
        if (score > this.data.raceBestScore) {
            this.data.raceBestScore = score;
        }
        if (score === total) {
            if (!this.data.achievements['first_perfect']) {
                this.data.achievements['first_perfect'] = Date.now();
            }
        }
        const newAchs = this.checkAchievements();
        this.save();
        return newAchs;
    }

    // 记录测验完成
    recordQuizCompletion(score, total, timeSeconds) {
        this.data.totalQuestions += total;
        this.data.totalCorrectAnswers += score;
        if (score > this.data.quizBestScore) {
            this.data.quizBestScore = score;
        }
        if (timeSeconds <= 30 && score >= total * 0.8) {
            if (!this.data.achievements['speed_demon']) {
                this.data.achievements['speed_demon'] = Date.now();
            }
        }
        const newAchs = this.checkAchievements();
        this.save();
        return newAchs;
    }

    // 记录拼写正确
    recordSpellingCorrect() {
        this.data.totalCorrectAnswers++;
        if (!this.data.spellCorrect) this.data.spellCorrect = 0;
        this.data.spellCorrect++;
        if (this.data.spellCorrect >= 10 && !this.data.achievements['spell_master']) {
            this.data.achievements['spell_master'] = Date.now();
            this.save();
            return [ACHIEVEMENTS.find(a => a.id === 'spell_master')];
        }
        this.save();
        return [];
    }

    // 更新连续学习天数
    updateStreak() {
        const today = new Date().toDateString();
        if (this.data.lastStreakDate !== today) {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (this.data.lastStreakDate === yesterday) {
                this.data.streak++;
            } else {
                this.data.streak = 1;
            }
            this.data.lastStreakDate = today;
            this.save();
        }
        return this.data.streak;
    }

    // 获取已学会的单词key集合
    getLearnedWordKeys() {
        return Object.keys(this.data.learnedWords);
    }

    // 检查单词是否已学会
    isWordLearned(en) {
        return !!this.data.learnedWords[en];
    }

    // 获取统计信息
    getStats() {
        const accuracy = this.data.totalQuestions > 0 
            ? Math.round((this.data.totalCorrectAnswers / this.data.totalQuestions) * 100) 
            : 0;
        
        return {
            learnedCount: this.data.learnedCount,
            totalWords: getTotalWordCount(),
            raceCompletions: this.data.raceCompletions,
            raceBestScore: this.data.raceBestScore,
            quizBestScore: this.data.quizBestScore,
            accuracy: accuracy,
            streak: this.data.streak,
            carLevel: this.data.carLevel,
            achievements: Object.keys(this.data.achievements).length,
            totalAchievements: ACHIEVEMENTS.length,
            categoriesLearned: Object.keys(this.data.learnedCategories).length,
            totalCategories: Object.keys(WORD_CATEGORIES).length,
        };
    }

    // 获取已解锁的成就列表
    getAchievements() {
        return ACHIEVEMENTS.map(a => ({
            ...a,
            earned: !!this.data.achievements[a.id],
            earnedAt: this.data.achievements[a.id] || null
        }));
    }

    // 重置所有数据
    reset() {
        this.data = { ...DEFAULT_GAME_DATA };
        this.save();
    }
}

// 创建全局存储实例
const storage = new GameStorage();

console.log('🏆 成就系统已加载！', storage.getStats());