// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------


// let scoreText = "成績分數: " + finalScore + "/" + maxScore;
// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字

// 新增：煙火相關全域變數
let fireworks = [];         // 儲存所有火箭/爆炸
let gravity;                // 重力向量
let isFireworksActive = false;
let fireworksEndTime = 0;
const FIREWORK_DURATION = 3000; // 毫秒，煙火持續時間

window.addEventListener('message', function (event) {
    // 執行來源驗證...
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製 (見方案二)
        // ----------------------------------------
        if (typeof redraw === 'function') {
            // 如果是優異成績，啟動煙火動畫 (會自動停止)
            let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;
            if (percentage >= 90) {
                startFireworks();
            }
            redraw(); 
        }
    }
}, false);


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    // ... (其他設置)
    createCanvas(windowWidth / 2, windowHeight / 2); 
    background(255); 
    noLoop(); // 如果您希望分數只有在改變時才繪製，保留此行

    // 初始化重力
    gravity = createVector(0, 0.18);
} 

// Firework 與 Particle 類別 (簡單實作)
class Particle {
    constructor(x, y, hu, firework=false) {
        this.pos = createVector(x, y);
        this.firework = firework; // 若為火箭（向上飛），則 true
        this.lifespan = 255;
        this.hu = hu || random(0, 360);
        if (this.firework) {
            this.vel = createVector(random(-1,1), random(-12, -8));
        } else {
            // 爆炸粒子
            let angle = random(TWO_PI);
            let speed = random(1, 8);
            this.vel = p5.Vector.fromAngle(angle).mult(speed);
        }
        this.acc = createVector(0,0);
    }
    applyForce(f) {
        this.acc.add(f);
    }
    update() {
        if (!this.firework) {
            this.vel.mult(0.98); // 空氣阻力
            this.lifespan -= 4;
        }
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }
    done() {
        return (!this.firework && this.lifespan <= 0);
    }
    show() {
        colorMode(HSB);
        if (this.firework) {
            strokeWeight(4);
            stroke(this.hu, 255, 255);
            point(this.pos.x, this.pos.y);
        } else {
            strokeWeight(2);
            stroke(this.hu, 255, 255, this.lifespan);
            point(this.pos.x, this.pos.y);
        }
        colorMode(RGB);
    }
}

class Firework {
    constructor() {
        this.hu = random(0, 360);
        this.firework = new Particle(random(width*0.1, width*0.9), height, this.hu, true);
        this.exploded = false;
        this.particles = [];
    }
    update() {
        if (!this.exploded) {
            this.firework.applyForce(gravity);
            this.firework.update();
            // 到達最高點或速度向下時爆炸
            if (this.firework.vel.y >= 0) {
                this.exploded = true;
                this.explode();
            }
        }
        for (let p of this.particles) {
            p.applyForce(gravity);
            p.update();
        }
        // 移除已完成的粒子
        this.particles = this.particles.filter(p => !p.done());
    }
    explode() {
        for (let i = 0; i < 80; i++) {
            let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
            this.particles.push(p);
        }
    }
    done() {
        return this.exploded && this.particles.length === 0;
    }
    show() {
        if (!this.exploded) {
            this.firework.show();
        }
        for (let p of this.particles) {
            p.show();
        }
    }
}

// score_display.js 中的 draw() 函數片段

function draw() { 
    background(255); // 清除背景

    // 計算百分比
    let percentage = (maxScore > 0) ? (finalScore / maxScore) * 100 : 0;

    textSize(80); 
    textAlign(CENTER);
    
    // -----------------------------------------------------------------
    // A. 根據分數區間改變文本顏色和內容 (畫面反映一)
    // -----------------------------------------------------------------
    if (percentage >= 90) {
        // 滿分或高分：顯示鼓勵文本，使用鮮豔顏色
        fill(0, 200, 50); // 綠色 [6]
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
    } else if (percentage >= 60) {
        // 中等分數：顯示一般文本，使用黃色 [6]
        fill(255, 181, 35); 
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage > 0) {
        // 低分：顯示警示文本，使用紅色 [6]
        fill(200, 0, 0); 
        text("需要加強努力！", width / 2, height / 2 - 50);
        
    } else {
        // 尚未收到分數或分數為 0
        fill(150);
        text(scoreText, width / 2, height / 2);
    }

    // 顯示具體分數
    textSize(50);
    fill(50);
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (畫面反映二)
    // -----------------------------------------------------------------
    
    if (percentage >= 90) {
        // 畫一個大圓圈代表完美 [7]
        fill(0, 200, 50, 150); // 帶透明度
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 60) {
        // 畫一個方形 [4]
        fill(255, 181, 35, 150);
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, 150, 150);
    }
    
    // 如果您想要更複雜的視覺效果，還可以根據分數修改線條粗細 (strokeWeight) 
    // 或使用 sin/cos 函數讓圖案的動畫效果有所不同 [8, 9].

    // -----------------------------------------------------------------
    // 新增：當優異成績時顯示煙火特效（動畫）
    // -----------------------------------------------------------------
    if (isFireworksActive) {
        // 在畫布上繼續更新與繪製煙火
        // 每隔一些幀隨機產生新的火箭，以豐富效果
        if (random(1) < 0.07) {
            fireworks.push(new Firework());
        }
        for (let i = fireworks.length - 1; i >= 0; i--) {
            let f = fireworks[i];
            f.update();
            f.show();
            if (f.done()) {
                fireworks.splice(i, 1);
            }
        }

        // 當到達結束時間且所有煙火都結束後停止動畫循環
        if (millis() > fireworksEndTime && fireworks.length === 0) {
            isFireworksActive = false;
            noLoop(); // 停止 p5 的動畫循環，回到僅在 redraw() 被呼叫時繪製
        }
    }
}

// 新增：啟動煙火動畫函式
function startFireworks() {
    // 若已在執行則延長或重置結束時間
    isFireworksActive = true;
    fireworksEndTime = millis() + FIREWORK_DURATION;
    // 立即生成一些火箭
    for (let i = 0; i < 4; i++) {
        fireworks.push(new Firework());
    }
    loop(); // 啟動 draw 的持續呼叫以執行動畫
}

// 保留原有可能的其他程式碼
