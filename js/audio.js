// ========================================
// 儿童英语趣味乐园 - 音效引擎
// 使用 Web Audio API 程序化生成音效
// 移动端语音播报兼容（iOS/Android）
// ========================================

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.voicesCache = [];
        this.voicesLoaded = false;
        this.speechUnlocked = false;
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
        // 同时预热 SpeechSynthesis：加载 voices 并解锁 iOS
        this._warmUpSpeech();
    }

    // 预热 SpeechSynthesis（关键：解锁 iOS 移动端语音播报）
    _warmUpSpeech() {
        if (!window.speechSynthesis) {
            console.warn('⚠️ 浏览器不支持语音合成');
            return;
        }
        // 加载 voices（移动端可能异步返回，用 onvoiceschanged 兜底）
        const loadVoices = () => {
            this.voicesCache = window.speechSynthesis.getVoices();
            if (this.voicesCache.length > 0) {
                this.voicesLoaded = true;
                console.log('🗣️ 语音列表已加载:', this.voicesCache.length, '个语音');
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        // iOS 关键修复：在用户手势同步回调中调用一次 speak() 来解锁
        // iOS Safari 要求首次 SpeechSynthesis.speak() 必须发生在用户交互的同步上下文中
        // 否则后续 setTimeout/fetch 回调中的 speak() 都会被静默阻止
        try {
            const dummyUtterance = new SpeechSynthesisUtterance(' ');
            dummyUtterance.volume = 0;
            dummyUtterance.rate = 1.5;
            window.speechSynthesis.speak(dummyUtterance);
            this.speechUnlocked = true;
            console.log('🔓 iOS 语音播报已解锁');
        } catch (e) {
            console.warn('⚠️ 语音解锁失败:', e);
        }
    }

    // 确保已初始化
    ensureInit() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // 确保 voices 已加载（移动端异步加载场景兜底）
    _ensureVoices() {
        if (!this.voicesLoaded || this.voicesCache.length === 0) {
            this.voicesCache = window.speechSynthesis.getVoices();
            if (this.voicesCache.length > 0) {
                this.voicesLoaded = true;
            }
        }
        return this.voicesCache;
    }

    // 恢复被暂停的 SpeechSynthesis（iOS 长时间不活动会自动暂停）
    _resumeSpeech() {
        if (!window.speechSynthesis) return;
        try {
            // 通过发送一个无声的短 utterance 来恢复语音上下文
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }
        } catch (e) { /* 忽略 */ }
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

    // 答对中文语音 —— "图图你真酷！"
    speakCorrect() {
        this._speakZh('图图你真酷！', 0.9, 1.1, 500);
    }

    // 答错中文语音 —— "嘎嘎嘎"
    speakWrong() {
        this._speakZh('嘎嘎嘎', 0.8, 0.8, 300);
    }

    // 中文语音播报核心方法（iOS/Android 兼容）
    _speakZh(text, rate = 0.9, pitch = 1.0, delay = 0) {
        if (!window.speechSynthesis) {
            console.warn('⚠️ 浏览器不支持语音合成');
            return;
        }

        // 确保音频已初始化
        this.ensureInit();

        const doSpeak = () => {
            try {
                this._resumeSpeech();
                window.speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'zh-CN';
                utterance.rate = rate;
                utterance.pitch = pitch;
                utterance.volume = 1;

                const voices = this._ensureVoices();
                const zhVoice = voices.find(v => v.lang.startsWith('zh'));
                if (zhVoice) {
                    utterance.voice = zhVoice;
                    console.log('🔊 使用中文语音:', zhVoice.name, zhVoice.lang);
                } else {
                    console.warn('⚠️ 未找到中文语音，使用默认语音');
                }

                utterance.onerror = (e) => {
                    if (e.error !== 'canceled' && e.error !== 'interrupted') {
                        console.warn('⚠️ 中文语音播报失败:', e.error);
                    }
                };

                utterance.onstart = () => {
                    console.log('🔊 开始播报中文:', text);
                };

                // 再次确保语音合成已解锁（针对 iOS）
                if (!this.speechUnlocked) {
                    try {
                        const dummy = new SpeechSynthesisUtterance('');
                        dummy.volume = 0;
                        window.speechSynthesis.speak(dummy);
                        this.speechUnlocked = true;
                    } catch (e) {
                        console.warn('⚠️ 语音解锁失败:', e);
                    }
                }

                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.warn('⚠️ 中文语音播报异常:', e);
            }
        };

        if (delay > 0) {
            setTimeout(doSpeak, delay);
        } else {
            doSpeak();
        }
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
    _pendingZh = null;

    speakWord(word, rate = 0.9, chinese = null) {
        if (!window.speechSynthesis) {
            console.warn('⚠️ 浏览器不支持语音合成');
            alert('您的浏览器不支持语音播报功能，请使用 Chrome 或 Safari 浏览器。');
            return;
        }

        // 确保音频已初始化
        this.ensureInit();

        this._pendingZh = chinese || null;

        // 恢复可能暂停的语音合成 + 取消当前朗读
        try {
            this._resumeSpeech();
            window.speechSynthesis.cancel();
        } catch (e) { /* 忽略取消错误 */ }

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        utterance.pitch = 1.1;
        utterance.volume = 1;

        // 使用缓存的 voices，增强语音选择逻辑
        const voices = this._ensureVoices();
        console.log('🔊 可用语音数量:', voices.length);
        
        // 优先选择美式英语，其次选择任何英语语音
        let enVoice = voices.find(v => v.lang === 'en-US');
        if (!enVoice) {
            enVoice = voices.find(v => v.lang.startsWith('en'));
        }
        if (enVoice) {
            utterance.voice = enVoice;
            console.log('🔊 使用语音:', enVoice.name, enVoice.lang);
        } else {
            console.warn('⚠️ 未找到英语语音，使用默认语音');
        }

        utterance.onerror = (e) => {
            if (e.error !== 'canceled' && e.error !== 'interrupted') {
                console.warn('⚠️ 英文语音播报失败 (' + word + '):', e.error);
                alert('语音播报失败: ' + e.error);
            }
        };

        utterance.onstart = () => {
            console.log('🔊 开始播报:', word);
        };

        // 英文读完后自动读中文
        const self = this;
        utterance.onend = function () {
            console.log('🔊 播报完成:', word);
            if (self._pendingZh) {
                const zh = self._pendingZh;
                self._pendingZh = null;
                setTimeout(() => {
                    try {
                        self._resumeSpeech();
                        const zhUtterance = new SpeechSynthesisUtterance(zh);
                        zhUtterance.lang = 'zh-CN';
                        zhUtterance.rate = 0.85;
                        zhUtterance.pitch = 1.0;
                        zhUtterance.volume = 1;
                        const zhVoices = self._ensureVoices();
                        const zhVoice = zhVoices.find(v => v.lang.startsWith('zh'));
                        if (zhVoice) zhUtterance.voice = zhVoice;
                        zhUtterance.onerror = (e2) => {
                            if (e2.error !== 'canceled' && e2.error !== 'interrupted') {
                                console.warn('⚠️ 中文跟读失败 (' + zh + '):', e2.error);
                            }
                        };
                        window.speechSynthesis.speak(zhUtterance);
                    } catch (e) {
                        console.warn('⚠️ 中文跟读异常:', e);
                    }
                }, 200);
            }
        };

        // 再次确保语音合成已解锁（针对 iOS）
        if (!this.speechUnlocked) {
            try {
                const dummy = new SpeechSynthesisUtterance('');
                dummy.volume = 0;
                window.speechSynthesis.speak(dummy);
                this.speechUnlocked = true;
            } catch (e) {
                console.warn('⚠️ 语音解锁失败:', e);
            }
        }

        window.speechSynthesis.speak(utterance);
    }
}

// 创建全局音效引擎实例
const audio = new AudioEngine();

console.log('🔊 音效引擎模块已加载！');