// ===============================================
//
// common.js
//
// 汎用クラスの定義を記述したファイルです。
// このファイルには、以下のクラスが含まれています。
// 
// ・Point クラス
//
// ===============================================

// - Point ---------------------------------------
//xとyの二つの座標情報を格納するためのクラス
function Point(){
    this.x = 0;
    this.y =0;
}

//distance メソッド
Point.prototype.distance = function(p){
    var q = new Point();
    q.x = p.x - this.x;
    q.y = p.y - this.y;
    return q;
};

//length メソッド
Point.prototype.length = function(){
    //ベクトルの大きさは Xの２乗＋Yの２乗の平方根
    //Math.sqrt(n) nの平方根（nの1/2 乗） の値が return で返る
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

//normalize メソッド
Point.prototype.normalize = function(){
    var i = this.length();
    if(i > 0){
        //ベクトルの大きさを１になるようにX とYの値を調整する
        var j = 1 / i;
        this.x *= j;
        this.y *= j;
    }
};
