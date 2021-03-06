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
var mouse = new Point(); //変数mouseにはcommon.jsで記述したPointクラスを利用してマウスカーソルの座標1を格納するためのインスタンスを作っておく
var ctx;
var fire = false;
var score = 0;
var counter = 0;
var message = '';

// -const -----------------------------------------------------
var CHARA_COLOR = 'rgba(0, 0, 255, 0.75)';
var CHARA_SHOT_COLOR = 'rgba(0, 255, 0, 0.75)';
var CHARA_SHOT_MAX_COUNT = 10; //画面上に出せるショット数の最大値の設定
var ENEMY_COLOR = 'rgba(255, 0, 0, 0.75)';
var ENEMY_MAX_COUNT = 10;
var ENEMY_SHOT_COLOR = 'rgba(255, 0, 255, 0.75)';
var ENEMY_SHOT_MAX_COUNT = 100;
var BOSS_COLOR = 'rgba(128, 128, 128, 0.75)';
var BOSS_BIT_COLOR = 'rgba(64, 64, 64, 0.75)';
var BOSS_BIT_COUNT = 5;

//- main ----------------------------------------------------
window.onload = function () {
    //汎用変数
    var i, j;
    var p = new Point();

    

    //スクリーンの初期化
    screenCanvas = document.getElementById('screen');
    screenCanvas.width = 256; //横幅を256ピクセルに変更
    screenCanvas.height = 256; //縦幅を256ピクセルに変更

    // 自機の初期位置を修正
    mouse.x = screenCanvas.width / 2;
    mouse.y = screenCanvas.height -20;

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

    // エネミー初期化
    var enemy = new Array(ENEMY_MAX_COUNT);
    for (i = 0; i < ENEMY_MAX_COUNT; i++) {
        enemy[i] = new Enemy();
    }

    // エネミーショットの初期化
    var enemyShot = new Array(ENEMY_SHOT_MAX_COUNT);
    for (i = 0; i < ENEMY_SHOT_MAX_COUNT; i++) {
        enemyShot[i] = new EnemyShot();
    }

    // ボスの初期化
    var boss = new Boss();

    // ボスのビットを初期化
    var bit = new Array(BOSS_BIT_COUNT);
    for(i = 0; i <BOSS_BIT_COUNT; i++){
        bit[i] = new Bit();
    }

    //ループ処理(レンダリング処理）を呼び出す
    (function () {
        //カウンタをインクリメント
        counter++;

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
        if (counter % 100 === 0 && counter < 1000) {
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
        }else if(counter === 1000){
            // 1000 フレーム目にボスを出現させる
            //x座標はスクリーンの半分の位置
            p.x = screenCanvas.width / 2;
            //y座標はボスサイズが５０のため−80の位置から（画面上から30だけボスが見えてるとこスタート
            p.y = -80;
            //boss.jsのset メソッド呼び出し.座標p、サイズ50、ライフ30
            boss.set(p, 50, 30);

            // 同時にビットも出現させる
            for(i = 0; i < BOSS_BIT_COUNT; i++){
                j = 360 / BOSS_BIT_COUNT;
                //bitのsetメソッド呼び出し
                //引数にparentをboss,サイズ15、ライフ5、パラメータi*j
                bit[i].set(boss, 15, 5, i * j);
                console.log('ボスが現れた');
            }
        }

        // カウンターの値によってシーン分岐
        switch (true) {
            // カウンターが７０より小さい
            case counter < 60:
                message = 'READDY...';
                break;
            case counter < 70:
                message = '3';
                break;
            case counter < 80:
                message = '2';
                break;
            case counter < 90:
                message = '1';
                break;
        
            //カウンターが７０以上１００未満
            case counter < 100:
                message = 'GO!!';
                break;

            //カウンターが１００以上
            default:
                message = '';

                // エネミー ------------------------------------------
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
                        if (enemy[i].param % 30 === 0) {
                            // エネミーショットを調査する
                            for (j = 0; j < ENEMY_SHOT_MAX_COUNT; j++) {
                                if (!enemyShot[j].alive) {
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
                for (i = 0; i < ENEMY_SHOT_MAX_COUNT; i++) {
                    //エネミーショットがすでに発射されているかチェック
                    if (enemyShot[i].alive) {
                        //エネミーショットを動かす
                        enemyShot[i].move();

                        //エネミーショットを描くパスを設定
                        ctx.arc(
                            enemyShot[i].position.x,
                            enemyShot[i].position.y,
                            enemyShot[i].size,
                            0, Math.PI * 2, false
                        );

                        //パスをいったん閉じる
                        ctx.closePath();
                    }
                }

                //エネミーショットの色を設定する
                ctx.fillStyle = ENEMY_SHOT_COLOR;

                //エネミーショットを描く
                ctx.fill();

            // ボス ---------------------------------------------------
            //お明日の設定を開始
            ctx.beginPath();

            //ボスの出現フラグをチェック　
            if(boss.alive){
                // ボスを動かす
                boss.move();

                // ボスを描くパスを設定
                ctx.arc(
                    boss.position.x,
                    boss.position.y,
                    boss.size,
                    0, Math.PI * 2, false
                );

                //パスをいったん閉じる
                ctx.closePath();
            }

            // ボスの色を設定する
            ctx.fillStyle = BOSS_COLOR;

            //ボスを描く
            ctx.fill();

            // ビット------------------------------------------------------
            //パスの設定を開始
            ctx.beginPath();

            //全てのビットを調査する
            for(i = 0; i < BOSS_BIT_COUNT; i++){
                // ビットの出現フラグをチェック
                if(bit[i].alive){
                    //ビットを動かす
                    bit[i].move();

                    //ビットを描くパスを設定
                    ctx.arc(
                        bit[i].position.x,
                        bit[i].position.y,
                        bit[i].size,
                        0, Math.PI * 2, false
                    );

                    //ショットを打つかどうかパラメータの値からチェック
                    if(bit[i].param % 25 === 0){
                        //エネミーショットを調査する
                        for(j = 0; j < ENEMY_SHOT_MAX_COUNT; j++){
                            if(!enemyShot[j].alive){
                                // エネミーショットを新規にセットする
                                p = bit[i].position.distance(chara.position);
                                p.normalize();
                                enemyShot[j].set(bit[i].position, p, 4, 1.5);

                                //１個出現させたのでループを抜ける
                                break;
                            }
                        }
                    }

                    //パスを一旦閉じる
                    ctx.closePath();
                }
            }

            //ビットの色を設定する
            ctx.fillStyle = BOSS_BIT_COLOR;

            //ビットを描く
            ctx.fill();

                //衝突判定 -------------------------------------
                //すべての自機ショットを調査する
                for (i = 0; i < CHARA_SHOT_MAX_COUNT; i++) {
                    //自機ショットの生存フラグをチェック
                    if (charaShot[i].alive) {
                        //自機ショットとエネミーとの衝突判定
                        for (j = 0; j < ENEMY_MAX_COUNT; j++) {
                            // エネミーの生存フラグをチェック
                            if (enemy[j].alive) {
                                // エネミーと自機ショットの距離を計測
                                p = enemy[j].position.distance(charaShot[i].position);
                                // エネミーと自機ショットの距離がエネミーのサイズよりも小さい（近ければ）弾が衝突と判定
                                if (p.length() < enemy[j].size) {
                                    //衝突したら敵と自機ショットの生存フラグを降ろす
                                    enemy[j].alive = false;
                                    charaShot[i].alive = false;
                                    console.log("敵を倒した");
                                    //スコアを更新するためにインクリメント
                                    score++;
                                    //衝突があったのでループを抜ける
                                    break;
                                }
                            }
                        }

                        //自機ショットとボスビットとの衝突判定
                        for(j = 0; j < BOSS_BIT_COUNT; j++){
                            // ビットの生存フラグをチェック
                            if(bit[j].alive){
                                // ビットと自機ショットとの距離を計測
                                p = bit[j].position.distance(charaShot[i].position);
                                if(p.length() < bit[j].size){
                                    //衝突していたら耐久値をデクリメントする
                                    bit[j].life--;

                                    //自機ショットの生存フラグを降ろす
                                    if(bit[j].life < 0){
                                        bit[j].alive = false;
                                        score += 3;
                                    }

                                    //衝突があったのでループを抜ける
                                    break;
                                }
                        }
                    }
                    //ボスの生存フラグをチェック
                    if(boss.alive){
                        //自機ショットとボスとの衝突判定
                        p = boss.position.distance(charaShot[i].position);
                        if(p.length() < boss.size){
                            // 衝突していたら耐久値をデクリメントする
                            boss.life--;

                            //自機ショットの生存フラグを降ろす
                            charaShot[i].alive = false;
                            
                            //耐久値がマイナスになったらクリア
                            if(boss.life < 0){
                                score += 10;
                                run = false;
                                message = 'CEAR!!';
                                console.log('clear');
                            }
                        }
                    }
                }
            }
                //自機とエネミーショットとの衝突判定
                for (i = 0; i < ENEMY_SHOT_MAX_COUNT; i++) {
                    // エネミーショットの生存フラグをチェック
                    if (enemyShot[i].alive) {
                        // 自機とエネミーショットとの距離を計測
                        p = chara.position.distance(enemyShot[i].position);
                        //衝突していたら生存フラグを降ろす
                        if (p.length() < chara.size) {
                            chara.alive = false;

                            // 衝突があったのでパラメータを変更してループを抜ける
                            run = false;
                            message = 'GAME OVER !!' + '<br>' +'更新ボタンを押して再チャレンジしてね';
                            console.log("game_over");
                            break;
                        }
                    }
                }
                
                break;
        }

            switch(true){
                case score < 2:
                title = 'Lank:1';
                break;
                case score < 3:
                title = 'Lank:2';
                break;
                case score < 5:
                title = 'Lank:3';
                break;
                case score >= 5:
                title = 'Lank:Master';
                break;
            };

        // HTML を更新
        info.innerHTML = message + '<br>' + 'SCORE:' + (score * 100) + '<br>' + title;
        
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
