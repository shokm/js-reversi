// 設定画面の指定を反映させる関数、変数
let playMode, yourName, partnerName;
function numberOfPeople(number) {
    if (number === 1) {
        playMode = 1;
        partnerName = '（CPU）';
    } else if (number === 2) {
        playMode = 2;
        partnerName = '（相手）';
    }

    let inputName = document.getElementById('inputName').value
    yourName = '（' + inputName + '）';
    // #settingを削除する
    document.getElementById('settings').remove();
    // 盤面を描写
    draw();
}

// トップに戻るボタンを押した際、確認画面を出す
function moveTop() {
    let agree = confirm('本当にトップに戻りますか？（ゲームは保存されません）');
    if (agree === true) {
        location.reload();
    }
}

// プレーヤーの色
let player = 1; // ->'black'
let opponent = 2; // ->'white'
// base64化した画像を入れる変数
let imageBase64;
// CPU対戦時のパス判定に使用
let passAuto;
// 盤面の初期設定
let array = [
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0, 0, 2, 1, 0, 0, 0, -1],
    [-1, 0, 0, 0, 1, 2, 0, 0, 0, -1],
    [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0, 0, 0, 0, 0, 0, 0, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
];
// 方向判定
let direction = [[-1, -1],[-1, 0],[-1, 1],[0, -1],[0, 0],[0, 1],[1, -1],[1, 0],[1, 1]];
/* direction = [[左上],[左],[左下],[上],[原点],[下],[右上],[右],[右下]]; */

// キャンバス準備
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// 盤面を描写する関数
function draw() {
    // 上部のプレイヤー名書き換え
    if (player === 1) {
        document.getElementById('nowPlayer').innerHTML = '黒' + yourName;
    } else {
        document.getElementById('nowPlayer').innerHTML = '白' + partnerName;
    }

    // 念の為リセット
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // キャンバス背景を白色に
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 400, 400);

    for (let x = 1; x <= 8; x++) {
        for (let y = 1; y <= 8; y++) {

            // 配列に従って描写する色を変更
            let position = array[x][y];

            // canvas描写用変数＆描写処理
            let drawX = (y - 1) * 50;
            let drawY = (x - 1) * 50;

            // まず、全面を緑に塗る
            ctx.fillStyle = 'green';
            ctx.fillRect(drawX, drawY, 49, 49);

            if (position === 1) {
                // 黒石表示
                ctx.beginPath();
                ctx.arc(drawX + 24.5, drawY + 24.5, 22, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
                ctx.fillStyle = 'black';
                ctx.fill();
            } else if (position === 2) {
                // 白石表示
                ctx.beginPath();
                ctx.arc(drawX + 24.5, drawY + 24.5, 22, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
                ctx.fillStyle = 'white';
                ctx.fill();
            }

            // 置ける場所を判定・描写
            let result = canPut(x, y);

            if (result[9] === 1) {
                if (player === 1) { // ->'black'
                    // 黒石表示
                    ctx.beginPath();
                    ctx.arc((y - 1 ) * 50 + 24.5, (x - 1) * 50 + 24.5, 5, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
                    ctx.fillStyle = 'black';
                    ctx.fill();
                } else { // ->'white'
                    // 白石表示
                    ctx.beginPath();
                    ctx.arc((y - 1) * 50 + 24.5, (x - 1) * 50 + 24.5, 5, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
                    ctx.fillStyle = 'white';
                    ctx.fill();
                }
            }
        }
    }
    imageBase64 = canvas.toDataURL("image/png");
}

// その場所が置ける場所か、またひっくり返す方向を判定する関数
// 引数(numberX, numberY) -> (X位置(1~8), Y位置(1~8))
function canPut(numberX, numberY) {
    // 上下左右が置ける位置か判定
    let result = [];
    /* 
        result(出力例) = [false,true,false,false,false,false,false,false,false]; (->この場合、左側に置ける)
        result(方向) = [[左上],[左],[左下],[上],[原点],[下],[右上],[右],[右下]];
    */
   // let allOver 0ならどこも置けない、1ならどこか置ける。result[9]から取得
   let allOver = 0;
   for (let i = 0; i <= 8; i++) {
       if (array[numberX+direction[i][0]][numberY+direction[i][1]] === opponent && array[numberX][numberY] === 0) { // 上下左右に[相手の色](白(==2))がある場合 && そこが空いている(==0)マスか
            // 現在の8つの方向を記録
            let c = direction[i][0];
            let d = direction[i][1];
            // とりあえずfalse
            let TorF = false;

            // 置いた先に自分の色があるか探索する処理
            while (true) {
            // もし、先に黒があり、置けるのであればtrue
                if (array[numberX+c][numberY+d] === player) {
                    TorF = true;
                    allOver = 1;
                    break;
                }
                // 壁・緑に当たったら終了
                if (array[numberX+c][numberY+d] === -1 || array[numberX+c][numberY+d] === 0) {
                    break;
                }
                c += direction[i][0];
                d += direction[i][1];
            }
            result.push(TorF)
        } else {
            result.push(false)
        }
    }
    result.push(allOver);
    // 結果を返却
    return result;
}

// クリック取得
canvas.addEventListener('click', mouseDown, false);
function mouseDown(event) {

    /* https://tech-blog.s-yoshiki.com/entry/90 (参考) */
    // クリック地点の座標を取得
    let rect = event.target.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    /* ここまで */

    // クリックされた四角の配列上での位置を取得する（正方形の一辺は50なので、座標を50で割り、1を足す）
    let numberX = Math.floor(y / 50 + 1);
    let numberY = Math.floor(x / 50 + 1);

    let result = canPut(numberX, numberY);
    if (result[9] === 1) {
        reverse(numberX, numberY);
        if (playMode === 1 && passAuto == false) {
            setTimeout(opponentAuto, 300);
        } 
    }
}

// 対戦CPUの関数（ランダムで置いているだけなのでとても弱い）
function opponentAuto() {
    while (true) {
        let a = Math.floor( Math.random() * (8 + 1 - 1) ) + 1;
        let b = Math.floor( Math.random() * (8 + 1 - 1) ) + 1;
        let result = canPut(a, b);
        if (result[9] === 1) {
            reverse(a, b);
            break;
        }
    }
}

// ひっくり返す処理
function reverse(numberX, numberY) {
    // 判定プログラムから結果呼び出し
    let result = canPut(numberX, numberY);

    for (let i = 0; i <= 8; i++) {
        if (result[i] == true) {
            let c = direction[i][0];
            let d = direction[i][1];
            while (true) {
                array[numberX+c][numberY+d] = player;
                // 一個先に黒があったらbreak              
                if (array[numberX+direction[i][0]+c][numberY+direction[i][1]+d] === player) {
                    break;
                }
                c += direction[i][0];
                d += direction[i][1];
            }
        }
    }
    if (result[9] === 1) {
        // 自分のクリックしたところも反転
        array[numberX][numberY] = player;

        // プレイヤーの反転
        if (player === 1) {
            player = 2; // ->'white'
            opponent = 1; // ->'black'
        } else {
            player = 1; // ->'black'
            opponent = 2; // ->'white'
        }
        draw();
        judgePass();
    }
}

// 全体に置ける場所があるか判定する関数
function canPutAll() {
    let count = false;
    for (let x = 1; x <= 8; x++) {
        for (let y = 1; y <= 8; y++) {
            // 置ける場所を判定
            let result = canPut(x, y);

            if (result[9] === 1) { // 置ける石がある
                count = true;
                // 一箇所でも置けるならそれ以上調べる必要ないのでbreak
                break;
            }
        }
        if (count == true) {
            // 一箇所でも置けるならそれ以上調べる必要ないので外側のfor文でもbreak
            break;
        }
    }
    // countがtrueなら置ける石がある
    return count;
}

// パス・終了判定
function judgePass() {
    passAuto = false;
    if (canPutAll() == false) { // 置ける場所がない
        if (player === 1) {
            // プレイヤーの反転
            player = 2; // ->'white'
            opponent = 1; // ->'black'
        } else {
            // プレイヤーの反転
            player = 1; // ->'black'
            opponent = 2; // ->'white'
        }
        if (canPutAll() == true) { // 置ける石がある
            if (player === 1) {
                alert('白はパスされました。');
            } else {
                alert('黒はパスされました。');
            }
            passAuto = true;
            draw();
        } else {
            passAuto = true;
            document.getElementById('result').innerHTML = '<input type="button" value="結果を表示" class="btn btn-outline-primary" onclick="result();">';
            result();
        }
    }
}

// 結果を表示
function result() {
    let black = 0;
    let white = 0;
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            if (array[i][j] === 1) {
                black++;
            } else if (array[i][j] === 2) {
                white++;
            }
        }
    }
    if (black > white) {
        alert('白:' + white + ', 黒:' + black + ', 黒' + yourName + 'の勝ち');
    } else if (black < white) {
        alert('白:' + white + ', 黒:' + black + ', 白' + partnerName + 'の勝ち');
    } else {
        alert('白:' + white + ', 黒:' + black + ', 引き分け');
    }
}

// 以下マウスオーバー時に色をつける処理
canvas.addEventListener('mousemove', mouseOver, false);
function mouseOver(e) {
    /* https://tech-blog.s-yoshiki.com/entry/90 (参考。先ほどと同様のものです) */
    // クリック地点の座標を取得
    let rect = e.target.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    /* ここまで */

    // クリックされた四角の配列上での位置を取得する（正方形の一辺は50なので、座標を50で割り、1を足す）
    let numberX = Math.floor(y / 50 + 1);
    let numberY = Math.floor(x / 50 + 1);

    // 更新時、生成した盤面画像を読み込む
    let img = new Image();
    img.src = imageBase64;
    ctx.drawImage(img, 0, 0);

    // 色を付ける
    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.fillRect((numberY - 1) * 50, (numberX - 1) * 50, 49, 49);
}
// マウスアウト時に付けた色を解除する処理
canvas.addEventListener('mouseout', mouseOut, false);
function mouseOut() {
    // 更新時、生成した盤面画像を読み込む
    let img = new Image();
    img.src=imageBase64;
    ctx.drawImage(img, 0, 0);
}