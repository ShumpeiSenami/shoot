//- global--------------------------------------------------
//html で記述したcanvasとpタグのinfoを参照するための変数screenCanvasとinfo
//run= ゲームの処理を継続するかどうかのフラグ（真偽値を格納）
//fps= ゲームの更新速度を表すFPS(1000㍉秒＝１秒)
//mouse= マウスカーソルの座標を格納する
//ctx= canvas2d コンテキスト格納用
//fire= ショットを発射するのかしないのかを真偽値で保持
//counter= シーンを管理するために使用
var screenCanvas, info;
var run = true;
var fps = 1000 / 30; //1秒に約30回更新されるゲーム
var mouse = new Point(); //変数mouseにはcommo.jsで記述したPointクラスを利用してマウスカーソルの座標1を格納するためのインスタンスを作っておく
var ctx;
var fire = false;
var counter = 0;

// -const -----------------------------------------------------
var CHARA_COLOR = 'rgba(0, 0, 255, 0.75)';
var CHARA_SHOT_COLOR = 'rgba(0, 255, 0, 0.75)';
var CHARA_SHOT_MAX_COUNT = 10; //画面上に出せるショット数の最大値の設定
var ENEMY_COLOR = 'rgba(255, 0, 0, 0.75)';
var ENEMY_MAX_COUNT = 10;
var ENEMY_SHOT_COLOR = 'rgba(255, 0, 255, 0.75)';
var ENEMY_SHOT_MAX_COUNT = 100;

//- main ----------------------------------------------------
window.onload = function () {
    //汎用変数
    var i, j;
    var p = new Point();

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

    //敵機初期化
    var enemy = new Array(ENEMY_MAX_COUNT);
    for (i = 0; i < ENEMY_MAX_COUNT; i++) {
        enemy[i] = new Enemy();
    }
    
    //敵機の弾の初期化
    var enemyShot = new Array(ENEMY_SHOT_MAX_COUNT);
    for(i = 0; i< ENEMY_SHOT_MAX_COUNT; i++){
        enemyShot[i] = new EnemyShot();
    }

    //ループ処理(レンダリング処理）を呼び出す
    (function () {
        //カウンタをインクリメント
        counter++;

        //HTML を更新
        info.innerHTML = mouse.x + ':' + mouse.y;

        // screen クリア
        ctx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);

        // 自機------------------------------
        // 自機パスの設定を開始
        ctx.beginPath();

        // 自機の位置を決定
        chara.position.x = mouse.x;
        chara.position.y = mouse.y;

        // 自機を描くパスを設定
        ctx.arc(
            chara.position.x,
            chara.position.y,
            chara.size,
            0, Math.PI * 2, false
        );

        // 自機の色を設定する
        ctx.fillStyle = CHARA_COLOR;

        // 自機を描く
        ctx.fill();

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
                }
            }
            // フラグを降ろしておく
            fire = false;
        }

        // 自機ショット--------------------------------------------
        // 自機ショットのパスの設定を開始
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

        // エネミーの出現管理-----------------------------------------------------
        //100フレームに一度出現させる
        if (counter % 100 === 0) {
            // 全てのエネミーを調査する
            for (i = 0; i < ENEMY_MAX_COUNT; i++) {
                // エネミーの生存フラグをチェック
                if (!enemy[i].alive) {
                    // タイプを決定するパラメータを算出
                    j = (counter % 200) / 100;
                    var enemySize = 15;
                    p.x = -enemySize + (screenCanvas.width + enemySize * 2) * j
                    p.y = screenCanvas.height / 2;
                    
                    // エネミーを新規にセット
                    enemy[i].set(p, enemySize, j);

                    // １体出現させたのでループを抜ける
                    break;
                }
            }
        }
        // エネミー
        // パスの設定を開始
        ctx.beginPath();

        // 全てのエネミーを調査する
        for (i = 0; i < ENEMY_MAX_COUNT; i++) {
            // エネミーの生存フラグをチェック
            if (enemy[i].alive) {
                // エネミーを動かす
                enemy[i].move();

                // エネミーを描くパスを設定
                ctx.arc(
                    enemy[i].position.x,
                    enemy[i].position.y,
                    enemy[i].size,
                    0, Math.PI * 2, false
                );

                //ショットを打つかどうかパラメータの値からチェック
                  //敵キャラの param プロパティはmoveメソッドが呼ばれるたび＋１される
                  //つまり毎フレーム１づつ増えていく
                  // enemy[i].param % 30 === 0   で３０フレームに一度処理される
                if(enemy[i].param % 30 === 0){
                    // エネミーショットを調査する
                    for(j =0; j< ENEMY_SHOT_MAX_COUNT; j++){
                        if(!enemyShot[j].alive){
                            //エネミーショットを新規にセットする
                            p = enemy[i].position.distance(chara.position);
                            p.normalize();
                            enemyShot[j].set(enemy[i].position, p, 5, 5);

                            // １個出現させたのでループを抜ける
                            break;
                        }
                    }
                }

                //パスを一旦閉じる
                ctx.closePath();
            }
        }

        //エネミーの色を設定する
        ctx.fillStyle = ENEMY_COLOR;

        //エネミーを描く
        ctx.fill();

        // - エネミーショット ----------------------------------------------------
        //パスの設定を開始
        ctx.beginPath();

        //全てのエネミーショットを調査する
        for(i = 0; i < ENEMY_SHOT_MAX_COUNT; i++){
            //エネミーショットがすでに発射されているかチェック
            if(enemyShot[i].alive){
                //エネミーショットを動かす
                enemyShot[i].move();

                //エネミーショットを描くパスを設定
                ctx.arc(
                    enemyShot[i].position.x,
                    enemyShot[i].position.y,
                    enemyShot[i].size,
                    0, Math.PI　* 2, false
                );

                //パスをいったん閉じる
                ctx.closePath();
            }
        }

        //エネミーショットの色を設定する
        ctx.fillStyle = ENEMY_SHOT_COLOR;

        //エネミーショットを描く
        ctx.fill();

        //フラグにより再帰呼び出し
        /**
         * setTimeoutを用いて無名関数自体を再帰的に呼び出す
         * mouse の中身は後述するイベント処理用の関数で更新するので
         * ここではループ処理の中には特に値を設定する処理は入れていない
         */
        if (run) {
            setTimeout(arguments.callee, fps);
        }

    })(); //ここまでが無名関数
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
