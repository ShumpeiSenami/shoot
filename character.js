// ============================================================================
// 
// character.js
// 
// 自機キャラクターのショットやエネミーキャラクターの挙動を管理するクラスを記述
// したファイルです。このファイルには以下のクラスが含まれます。
// 
// ・Characterクラス
// ・CharacterShotクラス
// ・Enemyクラス
// ============================================================================

// - 自機のcharacterクラス作成 -----------------------------------
function Character() {
    this.position = new Point();
    this.size = 0;
};

//自機のサイズ指定を init メソッドで行う
Character.prototype.init = function (size) {
    this.size = size;
};

// - 自機の弾を扱う CharacterShotoクラスの作成 -------------------
function CharacterShot() {
    this.position = new Point();
    this.size = 0;
    this.speed = 0;
    this.alive = false;
}
//set メソッドは引数を３つほど受け取りそれと共に自機ショットを初期化
//引数にはショットの初期位置とサイズ、スピード与えます
//このメソッドが呼び出されることで this.alive=true も自動で呼び出され生存フラグが立つ
CharacterShot.prototype.set = function (p, size, speed) {
    //座標をセット
    this.position.x = p.x;
    this.position.y = p.y;

    //サイズ、スピードをセット
    this.size = size;
    this.speed = speed;

    //生存フラグを立てる
    this.alive = true;
};
// moveメソッドはショットの動きに関する処理を持つ
//自機は画面下から画面上に向かってショットを打つので座標では　y軸は数字が小さくなる（左上が座標０、０のため)

CharacterShot.prototype.move = function () {
    // 座標を真上にspeed分だけ移動させる
    this.position.y -= this.speed;

    //一定以上の座標に到達していたら生存フラグを降ろす
    if (this.position.y < -this.size) {
        this.alive = false;
    }
};
//- 敵機のcharacterクラス作成 -------------------------------
function Enemy() {
    this.position = new Point();
    this.size = 0;
    this.type = 0;
    this.param = 0;
    this.alive = false;
}

Enemy.prototype.set = function (p, size, type) {
    //座標をセット
    this.position.x = p.x;
    this.position.y = p.y;

    //サイズ、タイプをセット
    this.size = size;
    this.type = type;

    //パラメーターをリセット
    this.param = 0;

    //生存フラグを立てる
    this.alive = true;
};

Enemy.prototype.move = function () {
    //パラメーターをインクリメント
    this.param++;
    switch (this.type) {
        case 0:
            // X 報告へまっすぐ進む
            this.position.x += 2;
            //すくりーんの右端より奥へ到達したら生存フラグを降ろす
            if (this.position.x > this.size + screenCanvas.width) {
                this.alive = false
            }
            break;
        case 1:
            // マイナス X 方向へまっすぐ進む
            this.position.x -= 2;
            if (this.position.x < -this.size) {
                this.alive = false;
            }
            break;
    }
};

// - 敵機の弾を扱うクラス -------------------------------------------
function EnemyShot(){
    this.position = new Point();
    this.vector = new Point();
    this.size = 0;
    this.speed = 0;
    this.alive =false;
}

//set メソッド
EnemyShot.prototype.set = function(p, vector, size, speed){
    //座標、ベクトルをセット
    this.position.x = p.x;
    this.position.y = p.y;
    this.vector.x = vector.x;
    this.vector.y = vector.y;

    //サイズ、スピードをセット
    this.size = size;
    this.speed = speed;

    //生存フラグを立てる
    this.alive = true;
};

//move メソッド
EnemyShot.prototype.move = function(){
    //座標をベクトルに応じて speed 分だけ移動させる(ベクトルの大きさは1にcommon.jsのnormalizeメソッドで調整されている)
    this.position.x += this.vector.x * this.speed;
    this.position.y += this.vector.y * this.speed;

    //一定以上の座標に到達していたら生存フラグを降ろす
    if(
        this.position.x < -this.size ||
        this.position.y < -this.size ||
        this.position.x > this.size + screenCanvas.width ||
        this.position.y > this.size + screenCanvas.height
    ){
          this.alive = false;
    } 
  };
