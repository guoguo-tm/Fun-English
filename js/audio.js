// ========================================
// 儿童英语趣味乐园 - 音效引擎
// 使用 Web Audio API 程序化生成音效
// ========================================

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.initialized = false;
    }

    // 初始化音频上下文（需要在用户交互后调用）
    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('🔊 音效引擎已就绪！');
        } catch (e) {
            console.warn('⚠️ 音频初始化失败:', e);
        }
    }

    // 确保已初始化
    ensureInit() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // ===== 基础音效生成函数 =====
    playTone(freq, duration, type = 'sine', volume = 0.3, delay = 0) {
        this.ensureInit();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, this.ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    }

    playNoise(duration, volume = 0.1, delay = 0) {
        this.ensureInit();
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = buffer;
        gain.gain.setValueAtTime(volume, this.ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(this.ctx.currentTime + delay);
    }

    // ===== 按钮点击音效 =====
    btnClick() {
        this.playTone(800, 0.08, 'sine', 0.15);
        this.playTone(1000, 0.06, 'sine', 0.1, 0.02);
    }

    // ===== 游戏音效 =====
    
    // 答对音效 —— 欢快的上行音阶
    correctAnswer() {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            this.playTone(freq, 0.15, 'sine', 0.2, i * 0.1);
        });
        // 加一个闪亮的高音
        this.playTone(1318, 0.3, 'sine', 0.15, 0.4); // E6
    }

    // 答对中文语音 —— "沈亦舟你真酷！"
    speakCorrect() {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance('图图你真酷！');
            utterance.lang = 'zh-CN';
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            const voices = window.speechSynthesis.getVoices();
            const zhVoice = voices.find(v => v.lang.startsWith('zh'));
            if (zhVoice) utterance.voice = zhVoice;
            window.speechSynthesis.speak(utterance);
        }, 500);
    }

    // 答错中文语音 —— "嘎嘎嘎、、、"
    speakWrong() {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance('嘎嘎嘎');
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;
            utterance.pitch = 0.8;
            const voices = window.speechSynthesis.getVoices();
            const zhVoice = voices.find(v => v.lang.startsWith('zh'));
            if (zhVoice) utterance.voice = zhVoice;
            window.speechSynthesis.speak(utterance);
        }, 300);
    }

    // 答错音效 —— 低沉的两声
    wrongAnswer() {
        this.playTone(200, 0.2, 'square', 0.15);
        this.playTone(150, 0.3, 'square', 0.15, 0.25);
    }

    // 通关音效 —— 胜利号角
    levelComplete() {
        const fanfare = [523, 659, 784, 1047, 784, 1047, 1318];
        fanfare.forEach((freq, i) => {
            const dur = (i === fanfare.length - 1) ? 0.5 : 0.15;
            this.playTone(freq, dur, 'triangle', 0.25, i * 0.12);
        });
    }

    // 赛车引擎声 —— 低频嗡嗡声
    engineStart() {
        this.ensureInit();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.5);
        osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.3);
        gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);
    }

    // 氮气加速音效
    nitroBoost() {
        this.playNoise(0.3, 0.08);
        // 快速上升音
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    // 赛车变形音效 —— 机械变换声
    transformSound() {
        for (let i = 0; i < 3; i++) {
            this.playNoise(0.08, 0.06, i * 0.1);
        }
        this.playTone(300, 0.15, 'square', 0.1, 0.1);
        this.playTone(500, 0.2, 'square', 0.1, 0.2);
        this.playTone(800, 0.3, 'square', 0.12, 0.3);
        // 最终亮音
        this.playTone(1200, 0.4, 'triangle', 0.2, 0.5);
    }

    // 成就解锁音效 —— 华丽钟声
    achievementUnlocked() {
        const chimes = [1047, 1318, 1568, 2093]; // C6, E6, G6, C7
        chimes.forEach((freq, i) => {
            this.playTone(freq, 0.3, 'triangle', 0.25, i * 0.15);
        });
    }

    // 翻牌音效
    cardFlip() {
        this.playTone(600, 0.05, 'sine', 0.1);
        this.playTone(900, 0.08, 'sine', 0.1, 0.03);
    }

    // 匹配成功
    matchSuccess() {
        this.playTone(600, 0.1, 'triangle', 0.2);
        this.playTone(800, 0.1, 'triangle', 0.2, 0.1);
        this.playTone(1000, 0.2, 'triangle', 0.2, 0.2);
    }

    // 拼写字母输入音效 —— 打字声
    typeLetter() {
        this.playTone(440, 0.03, 'square', 0.06);
    }

    // 星星收集音效
    starCollect() {
        this.playTone(988, 0.1, 'sine', 0.2);
        this.playTone(1318, 0.15, 'sine', 0.2, 0.1);
    }

    // 倒计时滴答声
    tickTock() {
        this.playTone(1000, 0.05, 'sine', 0.1);
    }

    // 时间到警告
    timeUp() {
        this.playTone(440, 0.2, 'square', 0.15);
        this.playTone(440, 0.3, 'square', 0.2, 0.3);
    }

    // ===== 语音朗读（TTS） =====
    // 存储当前单词的中文，用于英文朗读后跟读中文
    _pendingZh = null;

    speakWord(word, rate = 0.9, chinese = null) {
        if (!window.speechSynthesis) {
            console.warn('⚠️ 浏览器不支持语音合成');
            return;
        }
        window.speechSynthesis.cancel(); // 取消当前朗读

        // 存储中文，在 onend 回调中朗读
        if (chinese) {
            this._pendingZh = chinese;
        } else {
            this._pendingZh = null;
        }

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        utterance.pitch = 1.1;
        
        // 尝试选择英语语音
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;

        // 英文读完后自动读中文
        const self = this;
        utterance.onend = function() {
            if (self._pendingZh) {
                const zh = self._pendingZh;
                self._pendingZh = null;
                setTimeout(() => {
                    const zhUtterance = new SpeechSynthesisUtterance(zh);
                    zhUtterance.lang = 'zh-CN';
                    zhUtterance.rate = 0.85;
                    zhUtterance.pitch = 1.0;
                    const zhVoices = window.speechSynthesis.getVoices();
                    const zhVoice = zhVoices.find(v => v.lang.startsWith('zh'));
                    if (zhVoice) zhUtterance.voice = zhVoice;
                    window.speechSynthesis.speak(zhUtterance);
                }, 200);
            }
        };
        
        window.speechSynthesis.speak(utterance);
    }
}

// 创建全局音效引擎实例
const audio = new AudioEngine();

// 预加载语音列表
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

console.log('🔊 音效引擎模块已加载！');