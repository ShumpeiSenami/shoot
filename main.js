

//- global--------------------------------------------------
//html で記述したcanvasとpタグのinfoを参照するための変数screenCanvasとinfo
//run= ゲームの処理を継続するかどうかのフラグ（真偽値を格納）
//fps= ゲームの更新速度を表すFPS(1000㍉秒＝１秒)
//mouse= マウスカーソルの座標を格納する
//ctx= canvas2d コンテキスト格納用
//fire= ショットを発射するのかしないのかを真偽値で保持
var screenCanvas, info;
var run = true;
var fps = 1000 / 30; //1秒に約30回更新されるゲーム
var mouse = new Point(); //変数mouseにはcommo.jsで記述したPointクラスを利用してマウスカーソルの座標1を格納するためのインスタンスを作っておく
var ctx;
var fire = false;

// -const -----------------------------------------------------
var CHARA_COLOR = 'rgba(0, 0, 255, 0.75)';
var CHARA_SHOT_COLOR = 'rgba(0, 255, 0, 0.75)';
var CHARA_SHOT_MAX_COUNT = 10; //画面上に出せるショット数の最大値の設定

//- main ----------------------------------------------------
window.onload = function () {

    //スクリーンの初期化
    screenCanvas = document.getElementById('screen');
    screenCanvas.width = 256; //横幅を256ピクセルに変更
    screenCanvas.height = 256; //縦幅を256ピクセルに変更

    //2dコンテキスト
    ctx = screenCanvas.getContext('2d');

    //イベントの登録
    //イベントの登録には addEventListener を使う
    //マウスカーソルの位置を検知するための関数一つとキー入力を検知するための関数２つを登録
    screenCanvas.addEventListener('mousemove', mouseMove, true);
    screenCanvas.addEventListener('mousedown', mouseDown, true);
    window.addEventListener('keydown', keyDown, true);

    //エレメント関連
    //変数 info にはHTML内のpタグへの参照を入れる
    //このpタグの中身を動的に書き換えてコンソール出力の様な感じで使用
    info = document.getElementById('info');

    //自機初期化
    var chara = new Character();
    chara.init(10); //init メソッドによって自機キャラクターサイズを１０へ設定
    //自機ショットの初期化
    var charaShot = new Array(CHARA_SHOT_MAX_COUNT);
    for (var i = 0; i < CHARA_SHOT_MAX_COUNT; i++) {
        charaShot[i] = new CharacterShot();
    }

    //ループ処理(レンダリング処理）を呼び出す

    (function () {
        //HTML を更新
        info.innerHTML = mouse.x + ':' + mouse.y;

        // fireフラグの値により分岐
        if (fire) {
            // すべての自機ショットを調査する
            for (i = 0; i < CHARA_SHOT_MAX_COUNT; i++) {
                // 自機ショットが既に発射されているかチェック
                if (!charaShot[i].alive) {
                    // 自機ショットを新規にセット
                    charaShot[i].set(chara.position, 3, 5);
                    // ループを抜ける
                    break;
                };
            };
            // フラグを降ろしておく
            fire = false;
        };

        // screen クリア
        ctx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);

        //パスの設定を開始
        ctx.beginPath();

        //自機の位置を決定
        chara.position.x = mouse.x;
        chara.position.y = mouse.y;

        //自機を描くパスを設定
        ctx.arc(chara.position.x, chara.position.y, chara.size, 0, Math.PI * 2, false);

        //自機の色を設定する
        ctx.fillStyle = CHARA_COLOR;

        //自機を描く
        ctx.fill();

        //パスの設定を開始
        ctx.beginPath();
        // すべての自機ショットを調査する
        for (i = 0; i < CHARA_SHOT_MAX_COUNT; i++) {
            // 自機ショットが既に発射されているかチェック
            if (charaShot[i].alive) {
                // 自機ショットを動かす
                charaShot[i].move();

                // 自機ショットを描くパスを設定
                ctx.arc(
                    charaShot[i].position.x,
                    charaShot[i].position.y,
                    charaShot[i].size,
                    0, Math.PI * 2, false
                );

                // パスをいったん閉じる
                ctx.closePath();
            }
        }

        // 自機ショットの色を設定する
        ctx.fillStyle = CHARA_SHOT_COLOR;

        // 自機ショットを描く
        ctx.fill();


        //フラグにより再帰呼び出し
        /**
         * setTimeoutを用いて無名関数自体を再帰的に呼び出す
         * mouse の中身は後述するイベント処理用の関数で更新するので
         * ここではループ処理の中には特に値を設定する処理は入れていない
         */
        if(run){setTimeout(arguments.callee, fps);}

    })();
}; //ここまでが window.onload関数

// - event --------------------------------------------
/**
 * マウスカーソルの位置を拾うためのmouseMove
 * @param {mouseMove} event 
 */
function mouseMove(event) {
    //マウスカーソル座標の更新
    mouse.x = event.clientX - screenCanvas.offsetLeft;
    mouse.y = event.clientY - screenCanvas.offsetTop;
};
//マウスがクリックされた際の処理
function mouseDown(event) {
    //フラグを立てる
    fire = true;
};
/**
 * キーの入力を拾うためのkeyDown
 * @param {keyDown} event 
 */
function keyDown(event) {
    //キーコードを取得
    var ck = event.keyCode;
    //Escキーが押されていたらフラグを降ろす
    if (ck === 27) {
        run === false;
        console.log('Escキーが押されたので処理を中断します');
    }
};

