// ========================================
// 儿童英语趣味乐园 - 赛车进化数据
// ========================================

const CAR_EVOLUTION = [
    {
        level: 1,
        name: '越野吉普',
        emoji: '🚙',
        icon: '🛞',
        description: '结实耐用的越野吉普车，适合各种地形！',
        color: '#4CAF50',
        requiredWords: 0,
        unlocked: true,
        features: ['基础引擎', '普通轮胎', '标准悬挂'],
        terrainEffect: '🏜️ 沙漠通行'
    },
    {
        level: 2,
        name: '沙漠赛车',
        emoji: '🏎️',
        icon: '💨',
        description: '流线型沙漠赛车，速度飞快！',
        color: '#FF9800',
        requiredWords: 20,
        unlocked: false,
        features: ['涡轮引擎', '宽幅轮胎', '运动悬挂'],
        terrainEffect: '🏜️ 沙漠加速'
    },
    {
        level: 3,
        name: '雪地巨轮',
        emoji: '🚛',
        icon: '⛓️',
        description: '巨型轮胎的雪地卡车，碾压一切障碍！',
        color: '#2196F3',
        requiredWords: 40,
        unlocked: false,
        features: ['极寒引擎', '防滑雪链', '重型悬挂'],
        terrainEffect: '❄️ 雪地通行'
    },
    {
        level: 4,
        name: '水上快艇',
        emoji: '🚤',
        icon: '🌊',
        description: '变形为水上快艇，劈波斩浪！',
        color: '#00BCD4',
        requiredWords: 60,
        unlocked: false,
        features: ['喷水引擎', '船体变体', '水上飘移'],
        terrainEffect: '🌊 水面航行'
    },
    {
        level: 5,
        name: '飞行赛车',
        emoji: '🚁',
        icon: '🪶',
        description: '加装旋翼飞上天空，鸟瞰大地！',
        color: '#E91E63',
        requiredWords: 80,
        unlocked: false,
        features: ['飞行旋翼', '空中悬浮', '三栖模式'],
        terrainEffect: '🪂 空中飞行'
    },
    {
        level: 6,
        name: '太空飞梭',
        emoji: '🚀',
        icon: '⭐',
        description: '终极形态！遨游太空的飞梭！',
        color: '#9C27B0',
        requiredWords: 100,
        unlocked: false,
        features: ['超光速引擎', '太空护盾', '全地形适应'],
        terrainEffect: '🌟 太空自由'
    }
];

// 获取当前解锁的赛车形态
function getCurrentCarLevel(learnedCount) {
    for (let i = CAR_EVOLUTION.length - 1; i >= 0; i--) {
        if (learnedCount >= CAR_EVOLUTION[i].requiredWords) {
            return CAR_EVOLUTION[i];
        }
    }
    return CAR_EVOLUTION[0];
}

// 获取下一个要解锁的赛车
function getNextCarLevel(learnedCount) {
    for (let i = 0; i < CAR_EVOLUTION.length; i++) {
        if (learnedCount < CAR_EVOLUTION[i].requiredWords) {
            return CAR_EVOLUTION[i];
        }
    }
    return null; // 全部解锁
}

console.log('🚗 赛车数据已加载！共 ' + CAR_EVOLUTION.length + ' 种形态。');