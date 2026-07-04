// ========================================
// 儿童英语趣味乐园 - 单词数据库
// ========================================

// 地形/关卡配置
const TERRAINS = [
    { id: 'desert', name: '狂野沙漠', emoji: '🏜️', icon: '🌵', class: 'animals' },
    { id: 'forest', name: '神秘森林', emoji: '🌲', icon: '🍃', class: 'fruits' },
    { id: 'mountain', name: '岩石山脉', emoji: '🏔️', icon: '⛰️', class: 'colors' },
    { id: 'snow', name: '冰晶雪原', emoji: '❄️', icon: '⛄', class: 'numbers' },
    { id: 'ocean', name: '深海探险', emoji: '🌊', icon: '🐚', class: 'body' },
    { id: 'food_canyon', name: '美食峡谷', emoji: '🍕', icon: '🍔', class: 'food' },
    { id: 'city', name: '知识都市', emoji: '🏙️', icon: '📚', class: 'school' },
    { id: 'town', name: '温馨小镇', emoji: '🏠', icon: '🏡', class: 'family' },
    { id: 'final', name: '终极赛道', emoji: '⭐', icon: '🏆', class: 'mixed' }
];

// 单词数据 - 按类别分
const WORD_CATEGORIES = {
    animals: {
        name: '动物',
        emoji: '🐱',
        words: [
            { en: 'cat', zh: '猫', emoji: '🐱', difficulty: 1 },
            { en: 'dog', zh: '狗', emoji: '🐶', difficulty: 1 },
            { en: 'pig', zh: '猪', emoji: '🐷', difficulty: 1 },
            { en: 'cow', zh: '牛', emoji: '🐮', difficulty: 1 },
            { en: 'duck', zh: '鸭子', emoji: '🦆', difficulty: 1 },
            { en: 'fish', zh: '鱼', emoji: '🐟', difficulty: 1 },
            { en: 'bird', zh: '鸟', emoji: '🐦', difficulty: 1 },
            { en: 'rabbit', zh: '兔子', emoji: '🐰', difficulty: 1 },
            { en: 'monkey', zh: '猴子', emoji: '🐵', difficulty: 2 },
            { en: 'tiger', zh: '老虎', emoji: '🐯', difficulty: 2 },
            { en: 'lion', zh: '狮子', emoji: '🦁', difficulty: 2 },
            { en: 'elephant', zh: '大象', emoji: '🐘', difficulty: 2 },
            { en: 'bear', zh: '熊', emoji: '🐻', difficulty: 2 },
            { en: 'horse', zh: '马', emoji: '🐴', difficulty: 2 },
            { en: 'sheep', zh: '羊', emoji: '🐑', difficulty: 2 }
        ]
    },
    fruits: {
        name: '水果',
        emoji: '🍎',
        words: [
            { en: 'apple', zh: '苹果', emoji: '🍎', difficulty: 1 },
            { en: 'banana', zh: '香蕉', emoji: '🍌', difficulty: 1 },
            { en: 'orange', zh: '橙子', emoji: '🍊', difficulty: 1 },
            { en: 'grape', zh: '葡萄', emoji: '🍇', difficulty: 1 },
            { en: 'pear', zh: '梨', emoji: '🍐', difficulty: 2 },
            { en: 'peach', zh: '桃子', emoji: '🍑', difficulty: 2 },
            { en: 'watermelon', zh: '西瓜', emoji: '🍉', difficulty: 2 },
            { en: 'strawberry', zh: '草莓', emoji: '🍓', difficulty: 2 },
            { en: 'mango', zh: '芒果', emoji: '🥭', difficulty: 2 },
            { en: 'lemon', zh: '柠檬', emoji: '🍋', difficulty: 2 },
            { en: 'cherry', zh: '樱桃', emoji: '🍒', difficulty: 2 },
            { en: 'kiwi', zh: '猕猴桃', emoji: '🥝', difficulty: 2 }
        ]
    },
    colors: {
        name: '颜色',
        emoji: '🎨',
        words: [
            { en: 'red', zh: '红色', emoji: '🔴', difficulty: 1 },
            { en: 'blue', zh: '蓝色', emoji: '🔵', difficulty: 1 },
            { en: 'green', zh: '绿色', emoji: '🟢', difficulty: 1 },
            { en: 'yellow', zh: '黄色', emoji: '🟡', difficulty: 1 },
            { en: 'orange', zh: '橙色', emoji: '🟠', difficulty: 1 },
            { en: 'purple', zh: '紫色', emoji: '🟣', difficulty: 1 },
            { en: 'pink', zh: '粉色', emoji: '🩷', difficulty: 2 },
            { en: 'black', zh: '黑色', emoji: '⚫', difficulty: 1 },
            { en: 'white', zh: '白色', emoji: '⚪', difficulty: 1 },
            { en: 'brown', zh: '棕色', emoji: '🟤', difficulty: 2 }
        ]
    },
    numbers: {
        name: '数字',
        emoji: '🔢',
        words: [
            { en: 'one', zh: '一', emoji: '1️⃣', difficulty: 1 },
            { en: 'two', zh: '二', emoji: '2️⃣', difficulty: 1 },
            { en: 'three', zh: '三', emoji: '3️⃣', difficulty: 1 },
            { en: 'four', zh: '四', emoji: '4️⃣', difficulty: 1 },
            { en: 'five', zh: '五', emoji: '5️⃣', difficulty: 1 },
            { en: 'six', zh: '六', emoji: '6️⃣', difficulty: 1 },
            { en: 'seven', zh: '七', emoji: '7️⃣', difficulty: 1 },
            { en: 'eight', zh: '八', emoji: '8️⃣', difficulty: 1 },
            { en: 'nine', zh: '九', emoji: '9️⃣', difficulty: 1 },
            { en: 'ten', zh: '十', emoji: '🔟', difficulty: 1 }
        ]
    },
    food: {
        name: '食物',
        emoji: '🍕',
        words: [
            { en: 'bread', zh: '面包', emoji: '🍞', difficulty: 1 },
            { en: 'rice', zh: '米饭', emoji: '🍚', difficulty: 1 },
            { en: 'milk', zh: '牛奶', emoji: '🥛', difficulty: 1 },
            { en: 'cake', zh: '蛋糕', emoji: '🎂', difficulty: 1 },
            { en: 'egg', zh: '鸡蛋', emoji: '🥚', difficulty: 1 },
            { en: 'pizza', zh: '披萨', emoji: '🍕', difficulty: 1 },
            { en: 'noodle', zh: '面条', emoji: '🍜', difficulty: 2 },
            { en: 'chicken', zh: '鸡肉', emoji: '🍗', difficulty: 2 },
            { en: 'hamburger', zh: '汉堡', emoji: '🍔', difficulty: 2 },
            { en: 'ice cream', zh: '冰淇淋', emoji: '🍦', difficulty: 2 },
            { en: 'cookie', zh: '饼干', emoji: '🍪', difficulty: 2 },
            { en: 'juice', zh: '果汁', emoji: '🧃', difficulty: 2 },
            { en: 'water', zh: '水', emoji: '💧', difficulty: 1 },
            { en: 'candy', zh: '糖果', emoji: '🍬', difficulty: 2 }
        ]
    },
    body: {
        name: '身体部位',
        emoji: '👀',
        words: [
            { en: 'eye', zh: '眼睛', emoji: '👁️', difficulty: 1 },
            { en: 'nose', zh: '鼻子', emoji: '👃', difficulty: 1 },
            { en: 'mouth', zh: '嘴巴', emoji: '👄', difficulty: 1 },
            { en: 'ear', zh: '耳朵', emoji: '👂', difficulty: 1 },
            { en: 'hand', zh: '手', emoji: '✋', difficulty: 1 },
            { en: 'foot', zh: '脚', emoji: '🦶', difficulty: 1 },
            { en: 'head', zh: '头', emoji: '🗣️', difficulty: 1 },
            { en: 'arm', zh: '手臂', emoji: '💪', difficulty: 2 },
            { en: 'leg', zh: '腿', emoji: '🦵', difficulty: 2 },
            { en: 'finger', zh: '手指', emoji: '👆', difficulty: 2 },
            { en: 'toe', zh: '脚趾', emoji: '🦶', difficulty: 2 },
            { en: 'tooth', zh: '牙齿', emoji: '🦷', difficulty: 2 }
        ]
    },
    school: {
        name: '学校用品',
        emoji: '🏫',
        words: [
            { en: 'book', zh: '书', emoji: '📖', difficulty: 1 },
            { en: 'pen', zh: '钢笔', emoji: '🖊️', difficulty: 1 },
            { en: 'pencil', zh: '铅笔', emoji: '✏️', difficulty: 1 },
            { en: 'ruler', zh: '尺子', emoji: '📏', difficulty: 1 },
            { en: 'desk', zh: '书桌', emoji: '🪑', difficulty: 1 },
            { en: 'chair', zh: '椅子', emoji: '💺', difficulty: 1 },
            { en: 'bag', zh: '书包', emoji: '🎒', difficulty: 1 },
            { en: 'teacher', zh: '老师', emoji: '👩‍🏫', difficulty: 2 },
            { en: 'school', zh: '学校', emoji: '🏫', difficulty: 1 },
            { en: 'eraser', zh: '橡皮', emoji: '🧹', difficulty: 2 },
            { en: 'paper', zh: '纸', emoji: '📄', difficulty: 1 },
            { en: 'crayon', zh: '蜡笔', emoji: '🖍️', difficulty: 2 }
        ]
    },
    family: {
        name: '家庭成员',
        emoji: '👨‍👩‍👧',
        words: [
            { en: 'father', zh: '爸爸', emoji: '👨', difficulty: 2 },
            { en: 'mother', zh: '妈妈', emoji: '👩', difficulty: 2 },
            { en: 'brother', zh: '哥哥/弟弟', emoji: '👦', difficulty: 2 },
            { en: 'sister', zh: '姐姐/妹妹', emoji: '👧', difficulty: 2 },
            { en: 'grandma', zh: '奶奶/外婆', emoji: '👵', difficulty: 2 },
            { en: 'grandpa', zh: '爷爷/外公', emoji: '👴', difficulty: 2 },
            { en: 'baby', zh: '宝宝', emoji: '👶', difficulty: 1 },
            { en: 'uncle', zh: '叔叔/舅舅', emoji: '👨‍🦱', difficulty: 2 },
            { en: 'aunt', zh: '阿姨/姑姑', emoji: '👩‍🦱', difficulty: 2 },
            { en: 'family', zh: '家庭', emoji: '👨‍👩‍👧‍👦', difficulty: 2 }
        ]
    }
};

// 获取所有单词
function getAllWords() {
    const all = [];
    for (const catKey in WORD_CATEGORIES) {
        WORD_CATEGORIES[catKey].words.forEach(w => {
            all.push({ ...w, category: catKey, categoryName: WORD_CATEGORIES[catKey].name });
        });
    }
    return all;
}

// 按类别获取单词
function getWordsByCategory(category) {
    if (!WORD_CATEGORIES[category]) return [];
    return WORD_CATEGORIES[category].words.map(w => ({
        ...w,
        category: category,
        categoryName: WORD_CATEGORIES[category].name
    }));
}

// 随机获取N个单词
function getRandomWords(n, excludeCategory = null) {
    let pool = getAllWords();
    if (excludeCategory) {
        pool = pool.filter(w => w.category !== excludeCategory);
    }
    shuffleArray(pool);
    return pool.slice(0, n);
}

// 数组洗牌
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 获取总单词数
function getTotalWordCount() {
    let count = 0;
    for (const catKey in WORD_CATEGORIES) {
        count += WORD_CATEGORIES[catKey].words.length;
    }
    return count;
}

console.log('📚 单词数据库已加载！共 ' + getTotalWordCount() + ' 个单词，' + Object.keys(WORD_CATEGORIES).length + ' 个类别。');