// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------

let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; 
// (其他變數不變)
let fireworks = [];        
let fireworksActive = false;
let fireworksDuration = 4000; 
let fireworksStartTime = 0;  

// 新增一個變數來儲存 p5.js Canvas 元素本身
let p5Canvas;

window.addEventListener('message', function (event) {
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // --- 關鍵步驟 1: 讓 Canvas 顯示出來 ---
        // 由於我們在 CSS 中預設隱藏，現在成績收到後要讓它顯示
        if (p5Canvas) {
            p5Canvas.style('display', 'block');
        }

        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製 
        // ----------------------------------------
        if (typeof redraw === 'function') {
            redraw(); 
        }
    }
}, false);


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    // 取得 H5P iframe 的尺寸
    const iframe = document.getElementById('h5pIframe');
    const w = iframe ? iframe.width : 800;
    const h = iframe ? iframe.height : 600;

    // 創建 Canvas，並將其附加到指定的容器 (父容器的 ID)
    // Canvas 的尺寸應與 iframe 相同
    p5Canvas = createCanvas(w, h); 
    p5Canvas.parent('scoreDisplayContainer'); 

    background(255); 
    noLoop(); // 如果您希望分數只有在改變時才繪製，保留此行
    textFont('Arial');
} 

// ... (Particle / Firework 類別 和 startFireworks/maybeSpawnMoreFireworks/stopFireworksIfDone 函數不變) ...

// 對於視窗大小改變時的處理 (必須同步更新 Canvas 尺寸和其父容器的尺寸)
function windowResized() {
    const container = document.getElementById('scoreDisplayContainer');
    const w = container ? container.clientWidth : windowWidth / 2;
    const h = container ? container.clientHeight : windowHeight / 2;
    
    // 重新設定 Canvas 尺寸
    resizeCanvas(w, h);
    redraw();
}

// ... (draw 函數不變) ...
