// ============================================================
// sugaku-club.com CAPTCHA Question Bank Generator v1.0
// 50 template generators × 200+ variations = 10,000+ unique questions
// ============================================================

var QuestionBankGenerator = (function(){

  // ── ユーティリティ ──
  function ri(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function rf(min,max,dec){ return parseFloat((Math.random()*(max-min)+min).toFixed(dec)); }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function shuffle(arr){ return arr.slice().sort(function(){return Math.random()-.5;}); }

  // 不正解の選択肢（ディストラクタ）生成
  function numDistractors(correct, count, spread){
    spread = spread || 0.3;
    var opts = [correct];
    var attempts = 0;
    while(opts.length < count && attempts < 100){
      attempts++;
      var delta = ri(1, Math.max(2, Math.round(Math.abs(correct)*spread)));
      var candidate = correct + pick([-1,1]) * delta * ri(1,3);
      if(opts.indexOf(candidate) === -1 && candidate !== correct) opts.push(candidate);
    }
    // 足りない場合は固定で足す
    var pad = [correct-1, correct+1, correct-2, correct+2, correct*2, Math.round(correct/2)];
    pad.forEach(function(p){ if(opts.length < count && opts.indexOf(p)===-1 && p!==correct) opts.push(p); });
    return opts.slice(0,count);
  }

  // 選択肢をシャッフルして正解インデックスを返す
  function makeOpts(correct, distractors){
    var all = numDistractors(correct, 4).map(function(n){ return n; });
    all[0] = correct;
    var shuffled = shuffle(all);
    return {
      opts: shuffled.map(function(n){ return String(n); }),
      ans: shuffled.indexOf(correct)
    };
  }

  // ── テンプレート生成関数群 ──

  var TEMPLATES = [

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 【算数・数学】
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // T01: 整数の加算
    function(){ var a=ri(10,999),b=ri(10,999); var c=a+b; var o=makeOpts(c,null);
      return {type:"ch",cat:"計算",icon:"➕",diff:2,
        q:a+" + "+b+" = ？",hint:"足し算です",vis:null,opts:o.opts,ans:o.ans,
        exp:a+" + "+b+" = "+c}; },

    // T02: 整数の減算
    function(){ var a=ri(50,999),b=ri(10,a-1); var c=a-b; var o=makeOpts(c,null);
      return {type:"ch",cat:"計算",icon:"➖",diff:2,
        q:a+" − "+b+" = ？",hint:"引き算です",vis:null,opts:o.opts,ans:o.ans,
        exp:a+" − "+b+" = "+c}; },

    // T03: 整数の乗算
    function(){ var a=ri(2,25),b=ri(2,25); var c=a*b; var o=makeOpts(c,null);
      return {type:"ch",cat:"計算",icon:"✖️",diff:2,
        q:a+" × "+b+" = ？",hint:"かけ算です",vis:null,opts:o.opts,ans:o.ans,
        exp:a+" × "+b+" = "+c}; },

    // T04: 整数の除算
    function(){ var b=ri(2,12),c=ri(2,30); var a=b*c; var o=makeOpts(c,null);
      return {type:"ch",cat:"計算",icon:"➗",diff:2,
        q:a+" ÷ "+b+" = ？",hint:"割り算です（割り切れます）",vis:null,opts:o.opts,ans:o.ans,
        exp:a+" ÷ "+b+" = "+c}; },

    // T05: 二乗の計算
    function(){ var a=ri(2,20); var c=a*a; var o=makeOpts(c,null);
      return {type:"ch",cat:"べき乗",icon:"🔢",diff:3,
        q:a+"² = ？（"+a+"の2乗）",hint:"同じ数を2回かけます",vis:null,opts:o.opts,ans:o.ans,
        exp:a+"² = "+a+"×"+a+" = "+c}; },

    // T06: 三乗の計算
    function(){ var a=ri(2,10); var c=a*a*a; var o=makeOpts(c,null);
      return {type:"ch",cat:"べき乗",icon:"🔢",diff:4,
        q:a+"³ = ？（"+a+"の3乗）",hint:"同じ数を3回かけます",vis:null,opts:o.opts,ans:o.ans,
        exp:a+"³ = "+a+"×"+a+"×"+a+" = "+c}; },

    // T07: 合計・平均（3数）
    function(){
      var a=ri(10,90),b=ri(10,90),c=ri(10,90);
      var avg=Math.round((a+b+c)/3);
      var o=makeOpts(avg,null);
      return {type:"ch",cat:"統計",icon:"📊",diff:3,
        q:a+"、"+b+"、"+c+" の平均を求めよ",hint:"合計÷個数",vis:null,opts:o.opts,ans:o.ans,
        exp:"合計="+(a+b+c)+"、平均="+(a+b+c)+"÷3="+avg}; },

    // T08: 合計・平均（5数）
    function(){
      var ns=[ri(10,80),ri(10,80),ri(10,80),ri(10,80),ri(10,80)];
      var sum=ns.reduce(function(a,b){return a+b;},0);
      var avg=Math.round(sum/ns.length);
      var o=makeOpts(avg,null);
      return {type:"ch",cat:"統計",icon:"📊",diff:4,
        q:ns.join("、")+" の平均を求めよ（小数点以下は四捨五入）",hint:"5個の合計÷5",
        vis:null,opts:o.opts,ans:o.ans,
        exp:"合計="+sum+"、平均="+sum+"÷5≈"+avg}; },

    // T09: 割合計算（〇%は何個）
    function(){
      var total=pick([50,100,200,500,1000]);
      var pct=pick([10,20,25,30,40,50,60,75,80]);
      var c=total*pct/100;
      var o=makeOpts(c,null);
      return {type:"ch",cat:"割合",icon:"💯",diff:3,
        q:total+"個の"+pct+"% は何個？",hint:"合計×(割合÷100)",vis:null,opts:o.opts,ans:o.ans,
        exp:total+"×"+pct+"/100 = "+c+"個"}; },

    // T10: 割引計算
    function(){
      var pct=pick([10,20,25,30,40,50]);
      var base=ri(2,20)*100;
      var c=base*(100-pct)/100;
      var o=makeOpts(c,null);
      return {type:"ch",cat:"割引",icon:"🏷️",diff:3,
        q:"定価"+base+"円の"+pct+"%引きはいくら？",hint:"定価×(1-"+pct+"/100)",
        vis:null,opts:o.opts,ans:o.ans,
        exp:base+"×"+(100-pct)+"/100 = "+c+"円"}; },

    // T11: 速さ × 時間 = 距離
    function(){
      var speed=pick([30,40,50,60,80,100,120]);
      var time=pick([1,1.5,2,2.5,3,4]);
      var c=speed*time;
      var o=makeOpts(c,null);
      return {type:"ch",cat:"速さ",icon:"🚗",diff:3,
        q:"時速"+speed+"kmで"+time+"時間走ると何km？",hint:"速さ×時間=距離",
        vis:null,opts:o.opts,ans:o.ans,
        exp:speed+"×"+time+" = "+c+"km"}; },

    // T12: 距離 ÷ 速さ = 時間
    function(){
      var speed=pick([40,50,60,80,100]);
      var time=pick([1,2,3,4]);
      var dist=speed*time;
      var o=makeOpts(time,null);
      return {type:"ch",cat:"速さ",icon:"⏱️",diff:3,
        q:dist+"kmの道のりを時速"+speed+"kmで走ると何時間？",hint:"距離÷速さ=時間",
        vis:null,opts:o.opts,ans:o.ans,
        exp:dist+"÷"+speed+" = "+time+"時間"}; },

    // T13: 三角形の面積
    function(){
      var base=ri(2,20);var h=ri(2,20);var c=base*h/2;
      var o=makeOpts(c,null);
      return {type:"ch",cat:"面積",icon:"📐",diff:2,
        q:"底辺"+base+"cm、高さ"+h+"cmの三角形の面積は？",hint:"底辺×高さ÷2",
        vis:null,opts:o.opts,ans:o.ans,
        exp:base+"×"+h+"÷2 = "+c+"cm²"}; },

    // T14: 長方形の面積
    function(){
      var w=ri(2,30);var h=ri(2,30);var c=w*h;
      var o=makeOpts(c,null);
      return {type:"ch",cat:"面積",icon:"📐",diff:1,
        q:"縦"+h+"cm、横"+w+"cmの長方形の面積は？",hint:"縦×横",
        vis:null,opts:o.opts,ans:o.ans,
        exp:h+"×"+w+" = "+c+"cm²"}; },

    // T15: 円の面積（π=3.14）
    function(){
      var r=pick([2,3,4,5,6,7,8,10]);
      var c=parseFloat((3.14*r*r).toFixed(2));
      var o=makeOpts(c,null);
      return {type:"ch",cat:"面積",icon:"⭕",diff:3,
        q:"半径"+r+"cmの円の面積は？（π=3.14）",hint:"π×半径²",
        vis:null,opts:o.opts,ans:o.ans,
        exp:"3.14×"+r+"² = 3.14×"+r*r+" = "+c+"cm²"}; },

    // T16: 一次方程式（xを求めよ）
    function(){
      var a=ri(2,10),x=ri(1,20);var c=a*x;
      var o=makeOpts(x,null);
      return {type:"ch",cat:"方程式",icon:"🔤",diff:3,
        q:a+"x = "+c+" のとき、x = ？",hint:"両辺を"+a+"で割る",
        vis:null,opts:o.opts,ans:o.ans,
        exp:a+"x="+c+" → x="+c+"/"+a+" = "+x}; },

    // T17: 一次方程式（ax+b=c）
    function(){
      var a=ri(2,8),b=ri(1,20),x=ri(1,15);var c=a*x+b;
      var o=makeOpts(x,null);
      return {type:"ch",cat:"方程式",icon:"🔤",diff:4,
        q:a+"x + "+b+" = "+c+" のとき、x = ？",hint:"両辺から"+b+"を引いて、"+a+"で割る",
        vis:null,opts:o.opts,ans:o.ans,
        exp:a+"x="+c+"-"+b+"="+(c-b)+" → x="+(c-b)+"/"+a+" = "+x}; },

    // T18: 等差数列の次の項
    function(){
      var a=ri(1,50), d=pick([2,3,4,5,6,7,8,10]);
      var seq=[a,a+d,a+2*d,a+3*d];
      var c=a+4*d;
      var o=makeOpts(c,null);
      return {type:"ch",cat:"数列",icon:"🔢",diff:3,
        q:seq.join("、")+"、__ 次の数は？",hint:"等差数列（差が一定）",
        vis:null,opts:o.opts,ans:o.ans,
        exp:"公差"+d+"の等差数列。次は"+seq[3]+"+"+d+" = "+c}; },

    // T19: 等比数列の次の項
    function(){
      var a=ri(1,10), r=pick([2,3,4]);
      var seq=[a,a*r,a*r*r,a*r*r*r];
      var c=a*r*r*r*r;
      var o=makeOpts(c,null);
      return {type:"ch",cat:"数列",icon:"🔢",diff:4,
        q:seq.join("、")+"、__ 次の数は？",hint:"等比数列（比が一定）",
        vis:null,opts:o.opts,ans:o.ans,
        exp:"公比"+r+"の等比数列。次は"+seq[3]+"×"+r+" = "+c}; },

    // T20: 素数判定
    function(){
      var primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97];
      var nonPrimes=[4,6,8,9,10,12,14,15,16,18,20,21,22,24,25,26,27,28];
      var isP=Math.random()<0.5;
      var n=isP?pick(primes):pick(nonPrimes);
      var opts=['素数である','素数でない','判断できない','0と1の間にある'];
      var ans=isP?0:1;
      return {type:"ch",cat:"数論",icon:"🔍",diff:3,
        q:n+" は素数ですか？",hint:"素数 = 1と自分自身以外に約数がない自然数",
        vis:null,opts:opts,ans:ans,
        exp:n+(isP?"は素数（"+n+"=1×"+n+"のみ）":"は素数でない（1と"+n+"以外の約数がある）")}; },

    // T21: 最大公約数
    function(){
      var g=pick([2,3,4,5,6]),a=g*ri(2,8),b=g*ri(2,8);
      while(a===b)b=g*ri(2,8);
      var c=g;
      // 実際のGCDを計算
      function gcd(x,y){return y?gcd(y,x%y):x;}
      c=gcd(a,b);
      var o=makeOpts(c,null);
      return {type:"ch",cat:"数論",icon:"🔢",diff:4,
        q:a+" と "+b+" の最大公約数は？",hint:"両方を割り切れる最大の数",
        vis:null,opts:o.opts,ans:o.ans,
        exp:"gcd("+a+","+b+") = "+c}; },

    // T22: 文章題（りんごの分配）
    function(){
      var people=ri(2,8),each=ri(2,15);var total=people*each;
      var o=makeOpts(total,null);
      return {type:"ch",cat:"文章題",icon:"🍎",diff:2,
        q:people+"人に"+each+"個ずつ配ると、合計何個必要？",hint:"人数×個数",
        vis:null,opts:o.opts,ans:o.ans,
        exp:people+"×"+each+" = "+total+"個"}; },

    // T23: 文章題（仕事率）
    function(){
      var days=ri(2,10);var works=ri(2,5)*days;
      var daily=works/days;
      var newdays=ri(2,10);
      var c=daily*newdays;
      var o=makeOpts(c,null);
      return {type:"ch",cat:"文章題",icon:"🏗️",diff:3,
        q:days+"日で"+works+"個作る工場。"+newdays+"日では何個？",hint:"1日あたりの個数×日数",
        vis:null,opts:o.opts,ans:o.ans,
        exp:"1日="+daily+"個、"+newdays+"日="+daily+"×"+newdays+" = "+c+"個"}; },

    // T24: 文章題（定員・残り）
    function(){
      var cap=ri(20,200);var filled=ri(5,cap-1);var rem=cap-filled;
      var o=makeOpts(rem,null);
      return {type:"ch",cat:"文章題",icon:"🪑",diff:2,
        q:"定員"+cap+"人のバス。"+filled+"人乗っています。あと何人乗れますか？",hint:"定員−現在",
        vis:null,opts:o.opts,ans:o.ans,
        exp:cap+"-"+filled+" = "+rem+"人"}; },

    // T25: 時刻の計算
    function(){
      var h1=ri(0,22),m1=pick([0,15,30,45]);
      var addH=ri(0,4),addM=pick([0,15,30,45]);
      var totalMin=(h1*60+m1)+(addH*60+addM);
      var h2=Math.floor(totalMin/60)%24;var m2=totalMin%60;
      var fmt=function(h,m){return String(h).padStart(2,'0')+":"+String(m).padStart(2,'0');};
      var c=fmt(h2,m2);
      var opts=[c,
        fmt((h2+1)%24,m2),
        fmt(h2,(m2+15)%60),
        fmt((h2-1+24)%24,m2)];
      return {type:"ch",cat:"時刻",icon:"⏰",diff:3,
        q:fmt(h1,m1)+"から"+addH+"時間"+addM+"分後の時刻は？",
        hint:"時と分を別々に足して繰り上がりに注意",
        vis:null,opts:shuffle(opts),ans:opts.indexOf(c),
        exp:fmt(h1,m1)+"＋"+addH+"時間"+addM+"分 = "+c}; },

    // T26: 百分率の逆算（定価を求める）
    function(){
      var pct=pick([80,75,70,60,50]);
      var sale=ri(2,20)*100;
      var original=sale*100/pct;
      if(!Number.isInteger(original)){sale=pick([200,300,400,500,600,800,1000,1200,1500,2000]);}
      original=sale*100/pct;
      var o=makeOpts(original,null);
      return {type:"ch",cat:"割合・逆算",icon:"🔄",diff:4,
        q:pct+"%引きのセールで"+sale+"円。定価はいくら？",
        hint:"売値÷(1-割引率)＝定価",
        vis:null,opts:o.opts,ans:o.ans,
        exp:sale+"÷("+(pct/100)+") = "+original+"円"}; },

    // T27: 単位換算（km↔m）
    function(){
      var isKtoM=Math.random()<0.5;
      if(isKtoM){
        var km=rf(0.5,10,1);var m=km*1000;
        var o=makeOpts(m,null);
        return {type:"ch",cat:"単位変換",icon:"📏",diff:2,
          q:km+"km = 何m？",hint:"1km = 1000m",vis:null,opts:o.opts,ans:o.ans,
          exp:km+"km = "+km+"×1000 = "+m+"m"};
      }else{
        var m2=pick([500,1500,2000,3500,5000]);var km2=m2/1000;
        var o2=makeOpts(km2,null);
        return {type:"ch",cat:"単位変換",icon:"📏",diff:2,
          q:m2+"m = 何km？",hint:"1000mで1km",vis:null,opts:o2.opts,ans:o2.ans,
          exp:m2+"÷1000 = "+km2+"km"};
      }
    },

    // T28: 消費税計算
    function(){
      var base=ri(1,30)*100;
      var tax=pick([8,10]);
      var c=Math.round(base*(1+tax/100));
      var o=makeOpts(c,null);
      return {type:"ch",cat:"消費税",icon:"🧾",diff:3,
        q:base+"円（税込"+tax+"%）の支払額は？",hint:"税込価格=本体価格×(1+税率)",
        vis:null,opts:o.opts,ans:o.ans,
        exp:base+"×1."+String(tax).padStart(2,'0')+" = "+c+"円"}; },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 【論理・推論】
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // T29: 人数問題（AはBより○人多い）
    function(){
      var bNum=ri(5,50);var diff=ri(1,20);var aNum=bNum+diff;
      var names=[["太郎","花子"],["AさんはBさんより"],["赤チームは青チームより"]];
      var n=pick(names);
      var o=makeOpts(aNum,null);
      return {type:"ch",cat:"論理推論",icon:"🧩",diff:3,
        q:n[0]||"A"+" は "+(n[1]||"B")+" より "+diff+" 人多い。"+(n[1]||"B")+" が "+bNum+" 人なら "+(n[0]||"A")+" は？",
        hint:"多い方=少ない方+差",vis:null,opts:o.opts,ans:o.ans,
        exp:bNum+"+"+diff+" = "+aNum+"人"}; },

    // T30: 倍数問題
    function(){
      var b=ri(3,30);var mult=ri(2,6);var a=b*mult;
      var who=pick(["A","太郎","赤チーム"]);var other=pick(["B","花子","青チーム"]);
      var o=makeOpts(a,null);
      return {type:"ch",cat:"論理推論",icon:"🧩",diff:3,
        q:who+" は "+other+" の "+mult+" 倍。"+other+" が "+b+" 個なら "+who+" は何個？",
        hint:"倍数をかける",vis:null,opts:o.opts,ans:o.ans,
        exp:b+"×"+mult+" = "+a}; },

    // T31: 残り計算（集合）
    function(){
      var total=ri(20,100);var used=ri(5,total-1);var rem=total-used;
      var o=makeOpts(rem,null);
      return {type:"ch",cat:"集合",icon:"🎯",diff:2,
        q:"全部で"+total+"個。"+used+"個使った。残りは何個？",
        hint:"全体−使用数",vis:null,opts:o.opts,ans:o.ans,
        exp:total+"-"+used+" = "+rem}; },

    // T32: 整数の順位
    function(){
      var nums=[];for(var i=0;i<5;i++)nums.push(ri(10,99));
      while(new Set(nums).size!==5)nums[ri(0,4)]=ri(10,99);
      var sorted=[].concat(nums).sort(function(a,b){return b-a;});
      var rank=pick([1,2,3]);
      var c=sorted[rank-1];
      var o=makeOpts(c,null);
      return {type:"ch",cat:"順位",icon:"🏆",diff:3,
        q:nums.join("、")+" を大きい順に並べたとき、"+rank+"番目は？",
        hint:"大きい順に並べ直す",vis:null,opts:o.opts,ans:o.ans,
        exp:"大きい順："+sorted.join("→")+"。"+rank+"番目は"+c}; },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 【物理・自然科学】テンプレート群
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // T33: 密度・重さ判断
    function(){
      var mats=[
        {n:"鉄",d:7.8},{n:"アルミ",d:2.7},{n:"木",d:0.6},
        {n:"プラスチック",d:1.2},{n:"水",d:1.0},{n:"金",d:19.3},
        {n:"銅",d:8.9},{n:"コンクリート",d:2.4}
      ];
      var picked=shuffle(mats).slice(0,4);
      var heaviest=picked.reduce(function(a,b){return a.d>b.d?a:b;});
      var opts=picked.map(function(m){return m.n;});
      var ans=opts.indexOf(heaviest.n);
      return {type:"ch",cat:"物理直感",icon:"⚖️",diff:3,
        q:"同じ体積（1リットル）なら、最も重いのはどれ？\n"+picked.map(function(m){return m.n+"（密度"+m.d+"g/cm³）";}).join("、"),
        hint:"密度が高い=同体積で重い",vis:null,opts:opts,ans:ans,
        exp:heaviest.n+"（密度"+heaviest.d+"g/cm³）が最大"}; },

    // T34: 熱伝導率（触ったとき）
    function(){
      var temps=[
        {n:"真冬の鉄棒",cond:"高"},
        {n:"木のベンチ",cond:"低"},
        {n:"プラスチックの椅子",cond:"低"},
        {n:"コンクリートの床",cond:"中"}
      ];
      var q=pick([temps]);
      var coldest={n:"真冬の鉄棒",reason:"金属は熱伝導率が高く体温を急速に奪う"};
      return {type:"ch",cat:"熱・物性",icon:"🌡️",diff:3,
        q:"冬（気温0°C）の屋外で手で触ったとき、最も冷たく感じるのは？",
        hint:"熱伝導率の高い素材が体温を奪いやすい",vis:null,
        opts:["真冬の鉄棒","木のベンチ","プラスチック椅子","コンクリート床"],ans:0,
        exp:"鉄（金属）は熱伝導率が木・プラスチックの10〜100倍。同じ温度でも冷たく感じる"}; },

    // T35: 圧力・面積
    function(){
      var items=[
        {n:"画鋲の先端",f:"小面積",p:"高"},
        {n:"スニーカーの底",f:"大面積",p:"低"},
        {n:"スキー板",f:"超大面積",p:"超低"},
        {n:"ハイヒールのかかと",f:"極小面積",p:"超高"}
      ];
      var o=pick([items[0],items[3]]);
      return {type:"ch",cat:"物理直感",icon:"👟",diff:4,
        q:"同じ力（体重60kg）をかけるとき、最も圧力（単位面積当たり力）が大きいのは？",
        hint:"圧力=力÷面積。面積が小さいほど圧力は大きい",vis:null,
        opts:["ハイヒールのかかと（3cm²）","スニーカーの底（300cm²）","スキー板（2000cm²）","素足（150cm²）"],ans:0,
        exp:"圧力=力/面積。ハイヒール先端（3cm²）は最も面積が小さく圧力が最大"}; },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 【日常常識・生活】
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // T36: 調理・温度常識
    function(){
      var scenarios=[
        {q:"水を沸騰させる温度（標準気圧）は？",opts:["60°C","80°C","100°C","120°C"],ans:2,exp:"水は100°C（1気圧）で沸騰します"},
        {q:"冷蔵庫の適切な保存温度は？",opts:["−5〜0°C","2〜5°C","10〜15°C","20°C"],ans:1,exp:"冷蔵庫内は2〜5°Cが食品の鮮度保持に最適"},
        {q:"体温として最も正常に近いのは？",opts:["35.0°C","36.5°C","38.0°C","40.0°C"],ans:1,exp:"平熱は36〜37°C程度。38°C以上は発熱"},
      ];
      var s=pick(scenarios);
      return {type:"ch",cat:"生活常識",icon:"🌡️",diff:2,
        q:s.q,hint:"日常生活の知識から判断",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // T37: 方向・地理の常識
    function(){
      var qs=[
        {q:"日本で太陽が南中（最も高い位置）する方角は？",opts:["東","西","南","北"],ans:2,exp:"北半球では太陽は南の空を通る"},
        {q:"コンパスで北を指すのはどの針？（一般的な磁気コンパス）",opts:["赤い針","青い針","どちらでも同じ","針の種類による"],ans:0,exp:"赤い針が北（N）を指すのが一般的"},
        {q:"地図の一般的な方位で、上はどの方角？",opts:["東","西","南","北"],ans:3,exp:"地図は通常、上が北"},
      ];
      var s=pick(qs);
      return {type:"ch",cat:"生活常識",icon:"🧭",diff:2,
        q:s.q,hint:"一般常識から考える",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // T38: お金・経済の常識
    function(){
      var qs=[
        {q:"銀行に100万円預けると、元本保証はいくらまで？（ペイオフ制度）",
         opts:["50万円","100万円","1000万円","無制限"],ans:2,
         exp:"預金保険制度（ペイオフ）で1金融機関あたり1000万円+利息まで保護"},
        {q:"消費税が10%のとき、1000円の商品の税込価格は？",
         opts:["1010円","1050円","1100円","1200円"],ans:2,
         exp:"1000×1.1=1100円"},
        {q:"複利と単利で同じ元本・期間・金利なら、最終的に多いのは？",
         opts:["単利","複利","同じ","金利による"],ans:1,
         exp:"複利は利息にも利息がつくため、長期では単利より大きく増える"},
      ];
      var s=pick(qs);
      return {type:"ch",cat:"経済常識",icon:"💴",diff:3,
        q:s.q,hint:"日本の経済・金融の常識",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // T39: 健康・身体の常識
    function(){
      var qs=[
        {q:"成人の安静時心拍数として正常範囲に最も近いのは？",
         opts:["20〜30拍/分","60〜100拍/分","120〜150拍/分","160〜200拍/分"],ans:1,
         exp:"成人の安静時心拍数は60〜100拍/分が正常範囲"},
        {q:"人間の平均的な睡眠で必要とされる時間（成人）は？",
         opts:["3〜4時間","5〜6時間","7〜9時間","10〜12時間"],ans:2,
         exp:"成人の推奨睡眠時間は7〜9時間（個人差あり）"},
        {q:"骨の主成分（ミネラル）は？",
         opts:["カリウム","鉄","カルシウム","ナトリウム"],ans:2,
         exp:"骨の約70%はリン酸カルシウムで構成される"},
      ];
      var s=pick(qs);
      return {type:"ch",cat:"健康常識",icon:"💪",diff:2,
        q:s.q,hint:"一般的な健康知識",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // T40: テクノロジー常識
    function(){
      var qs=[
        {q:"1GBは何MBか？",opts:["100MB","512MB","1024MB","2000MB"],ans:2,
         exp:"1GB = 1024MB（2進数ベース）"},
        {q:"WiFiの一般的な周波数帯として正しいのは？",
         opts:["100MHz帯","500MHz帯","2.4GHz / 5GHz帯","100GHz帯"],ans:2,
         exp:"WiFi（802.11規格）は主に2.4GHzと5GHz帯を使用"},
        {q:"HTTPSのSは何を意味する？",
         opts:["Speed（高速）","Secure（安全）","Server（サーバー）","Standard（標準）"],ans:1,
         exp:"HTTPS = HyperText Transfer Protocol Secure。通信を暗号化"},
      ];
      var s=pick(qs);
      return {type:"ch",cat:"IT常識",icon:"💻",diff:3,
        q:s.q,hint:"ITの基礎知識",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 【判断力・文脈理解】高難度
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // T41: 状況別最適行動
    function(){
      var scenarios=[
        {q:"プログラムのバグを修正中、正解がわからない。最も効率的な次の行動は？",
         opts:["とりあえず全部書き直す","ログを確認し原因を絞り込む","同僚に全部任せる","ランダムに変更を試す"],
         ans:1,exp:"デバッグの基本はログ確認→原因特定→修正。闇雲な変更は混乱を招く"},
        {q:"大事な会議中にスマホが鳴った。最も適切な対応は？",
         opts:["そのまま電話に出る","すぐに席を外して出る","サイレントにして後でかけ直す","電源を切る"],
         ans:2,exp:"緊急でなければサイレント→後でかけ直し。緊急なら一言断って退席"},
        {q:"レストランで料理に髪の毛が入っていた。最も建設的な対応は？",
         opts:["大声で怒鳴る","黙って食べる","静かに店員を呼んで知らせる","SNSに即時投稿"],
         ans:2,exp:"冷静に店員へ報告が最も建設的。怒鳴ると解決より摩擦が増える"},
      ];
      var s=pick(scenarios);
      return {type:"ch",cat:"判断力",icon:"🧭",diff:4,
        q:s.q,hint:"感情ではなく「最も効果的な行動」を選ぶ",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // T42: 因果関係の誤謬
    function(){
      var cases=[
        {q:"「水泳選手は肩幅が広い。だから水泳をすると肩幅が広くなる」この推論の問題は？",
         opts:["完全に正しい","逆の因果かもしれない（肩幅が広い人が水泳に向いている）","サンプル数が少ない","水泳以外の要因がある"],
         ans:1,exp:"逆の因果（selection bias）。肩幅が広い体型の人が水泳を選んでいる可能性"},
        {q:"「アイスが売れる日は水難事故が多い。アイスが危険だ」この論理の誤りは？",
         opts:["アイスは確かに危険","第三の要因（夏・暑さ）が両方に影響している","サンプルが少ない","統計が間違い"],
         ans:1,exp:"交絡因子（暑い→アイス購入増＋水泳増→事故増）。相関≠因果"},
      ];
      var s=pick(cases);
      return {type:"ch",cat:"批判的思考",icon:"🔍",diff:5,
        q:s.q,hint:"相関と因果の違いを考える",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // T43: 優先度マトリクス
    function(){
      var combos=[
        {u:"高",i:"高",task:"本番サーバーが落ちている",rank:1},
        {u:"低",i:"高",task:"月次レポートの作成",rank:3},
        {u:"高",i:"低",task:"上司からの急な質問への回答",rank:2},
        {u:"低",i:"低",task:"デスクの整理",rank:4},
      ];
      var q=shuffle(combos);
      var top=q.find(function(c){return c.rank===1;});
      return {type:"ch",cat:"優先順位",icon:"📋",diff:5,
        q:"アイゼンハワーマトリクス（緊急×重要）で最優先は？\n\nA:"+q[0].task+"\nB:"+q[1].task+"\nC:"+q[2].task+"\nD:"+q[3].task,
        hint:"緊急かつ重要なものが最優先",vis:null,
        opts:["A:"+q[0].task,"B:"+q[1].task,"C:"+q[2].task,"D:"+q[3].task],
        ans:q.findIndex(function(c){return c.rank===1;}),
        exp:"緊急×重要が最優先。本番障害は即対応が必要"}; },

    // T44: 日本語の敬語・文脈
    function(){
      var cases=[
        {q:"上司に「了解しました」と返すのは正しいですか？",
         opts:["正しい（丁寧な表現）","誤り（「承知しました」が正しい敬語）","どちらでもよい","状況による"],
         ans:1,exp:"「了解」は同等・目下に使う表現。上司には「承知しました」「かしこまりました」が適切"},
        {q:"「おっしゃる」は誰の動作を指す言葉？",
         opts:["自分の動作","相手（目上）の動作","どちらでも使える","誰でもよい"],
         ans:1,exp:"「おっしゃる」は尊敬語。相手の「言う」を丁寧に表す。自分には「申す」"},
        {q:"「参ります」は誰の動作に使う謙譲語？",
         opts:["相手の動作","自分の動作","第三者の動作","どれでも使える"],
         ans:1,exp:"「参ります」は謙譲語で自分の「行く・来る」を表す。相手には「いらっしゃる」"},
      ];
      var s=pick(cases);
      return {type:"ch",cat:"日本語・敬語",icon:"📝",diff:4,
        q:s.q,hint:"日本語の敬語体系から判断",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // T45: 数学的証明の反例
    function(){
      var cases=[
        {q:"「奇数×奇数=奇数」は常に成り立つか？反例として成り立たないケースは？",
         opts:["3×5=15（奇数）←成り立つ","1×1=1（奇数）←成り立つ","反例は存在しない（常に成り立つ）","2×3=6（偶数）←でも2は偶数なので無効"],
         ans:2,exp:"奇数×奇数は必ず奇数。(2k+1)(2m+1)=4km+2k+2m+1=偶数+1=奇数"},
        {q:"「すべての素数は奇数」は正しいか？",
         opts:["正しい（素数の定義より）","誤り（2は素数だが偶数）","ほぼ正しいが例外がある","数学的に証明不可能"],
         ans:1,exp:"2は偶数かつ素数。唯一の偶素数。したがって命題は偽"},
      ];
      var s=pick(cases);
      return {type:"ch",cat:"数学的思考",icon:"🔬",diff:5,
        q:s.q,hint:"反例を1つ見つけるだけで命題は偽になる",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // T46: 統計の罠
    function(){
      var cases=[
        {q:"「平均年収600万円の会社」で「自分の年収が400万円」。これは？",
         opts:["平均以下なので会社に問題がある","平均は少数の高収入者に引き上げられる可能性がある","自分の仕事能力が低い","統計が間違っている"],
         ans:1,exp:"平均は外れ値に敏感。役員が1億円なら全体平均を大きく引き上げる。中央値の方が実態を反映"},
        {q:"「薬Aは90%の患者に効果あり」。この統計だけで薬Aを選ぶべきか？",
         opts:["はい、90%なら十分","いいえ、比較対照（プラセボ）との比較が必要","はい、副作用がなければ","効果の定義が重要"],
         ans:1,exp:"RCT（ランダム化比較試験）では対照群との比較が必須。プラセボ効果で80%効く場合、Aは10%しか上乗せしない"},
      ];
      var s=pick(cases);
      return {type:"ch",cat:"統計リテラシー",icon:"📊",diff:5,
        q:s.q,hint:"統計の数字だけでなく文脈を読む",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // T47: プログラミング論理
    function(){
      var cases=[
        {q:"for(var i=0; i<5; i++){} の実行後、i の値は？",
         opts:["4","5","6","0"],ans:1,
         exp:"ループはi=0,1,2,3,4で実行（5回）。i<5が偽になるのはi=5のとき"},
        {q:"配列 [3, 1, 4, 1, 5] の長さ（length）は？",
         opts:["4","5","6","3"],ans:1,
         exp:"要素数は5個（インデックスは0〜4）。length=5"},
        {q:"'hello'.length の値は？",
         opts:["4","5","6","エラー"],ans:1,
         exp:"h-e-l-l-o の5文字。length=5"},
      ];
      var s=pick(cases);
      return {type:"ch",cat:"プログラミング",icon:"💻",diff:4,
        q:s.q,hint:"コードを頭でトレースしてみる",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // T48: 日本の一般知識
    function(){
      var qs=[
        {q:"日本の都道府県の数は？",opts:["43","45","47","50"],ans:2,exp:"1都1道2府43県の計47都道府県"},
        {q:"日本の国旗（日の丸）の赤い丸は何を表す？",opts:["血","太陽","火","情熱"],ans:1,exp:"日の丸の赤い円は太陽を象徴。国名「日本（日の本）」にも由来"},
        {q:"日本の首相はどこが選ぶ？",opts:["国民の直接選挙","天皇が任命","国会（衆参両院議員）","内閣"],ans:2,exp:"首相（内閣総理大臣）は国会議員の中から国会で指名される"},
        {q:"日本で最も高い山は？",opts:["北岳","白山","富士山","穂高岳"],ans:2,exp:"富士山（3,776m）が日本最高峰"},
      ];
      var s=pick(qs);
      return {type:"ch",cat:"一般知識",icon:"🗾",diff:2,
        q:s.q,hint:"日本の基礎知識",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // T49: 環境・科学の常識
    function(){
      var qs=[
        {q:"CO₂（二酸化炭素）を最も多く吸収するのは？",
         opts:["海","草原","熱帯雨林","砂漠"],ans:2,
         exp:"熱帯雨林は地球最大の炭素吸収源。ただし海も大きな割合を占める"},
        {q:"太陽から地球への光の到達時間は約？",
         opts:["1秒","8分20秒","1時間","1日"],ans:1,
         exp:"光速30万km/sで太陽〜地球の距離1.5億kmを割ると約499秒≈8分20秒"},
        {q:"リサイクルマークの番号「1」のプラスチック（PET）の主な用途は？",
         opts:["ポリ袋","ペットボトル","発泡スチロール","塩ビ管"],ans:1,
         exp:"1=PET（ポリエチレンテレフタラート）はペットボトルに使用"},
      ];
      var s=pick(qs);
      return {type:"ch",cat:"環境・科学",icon:"🌱",diff:3,
        q:s.q,hint:"環境・理科の基礎知識",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },

    // T50: 確率の直感
    function(){
      var cases=[
        {q:"コインを3回投げてすべて表が出る確率は？",
         opts:["1/4","1/6","1/8","1/3"],ans:2,
         exp:"(1/2)³ = 1/8。各回の結果は独立"},
        {q:"サイコロを2回振って両方6が出る確率は？",
         opts:["1/12","1/36","1/6","2/36"],ans:1,
         exp:"(1/6)² = 1/36。各回独立"},
        {q:"52枚のトランプからエースを引く確率は？",
         opts:["1/52","1/26","4/52 (= 1/13)","1/4"],ans:2,
         exp:"エースは4枚、全体52枚。4/52 = 1/13"},
      ];
      var s=pick(cases);
      return {type:"ch",cat:"確率",icon:"🎲",diff:4,
        q:s.q,hint:"確率=望む場合の数÷全体の場合の数",vis:null,opts:s.opts,ans:s.ans,exp:s.exp}; },
  ];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 問題バンク生成（指定数まで生成）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function generateBank(size){
    var bank = [];
    var attempts = 0;
    var maxAttempts = size * 5;
    while(bank.length < size && attempts < maxAttempts){
      attempts++;
      try {
        var gen = TEMPLATES[Math.floor(Math.random()*TEMPLATES.length)];
        var q = gen();
        if(q && q.q && q.opts && q.opts.length >= 2) bank.push(q);
      } catch(e) { /* スキップ */ }
    }
    return bank;
  }

  // フィルタ付きランダム取得
  function getRandom(bank, filters){
    filters = filters || {};
    var pool = bank.filter(function(q){
      if(filters.cat && q.cat !== filters.cat) return false;
      if(filters.minDiff && q.diff < filters.minDiff) return false;
      if(filters.maxDiff && q.diff > filters.maxDiff) return false;
      return true;
    });
    if(pool.length === 0) pool = bank;
    return pool[Math.floor(Math.random()*pool.length)];
  }

  return {
    generateBank: generateBank,
    getRandom: getRandom,
    templateCount: TEMPLATES.length
  };
})();
