// 設定値
const AREASIZE = 600;
const COLOR_RED = '#F45D52';
const COLOR_BLUE = '#465B73';
const COLOR_AQUA = '#49A1DE';
const COLOR_GREEN = '#f5f5dc';
const COLOR_BLACK = '#696969';
const PLAYERRADIUS = 10;
const BALLRADIUS = 10;
let ball_speed = 3;
let player_speed = 1;
let players = [];
let territorys = [];
let coverlines = [];
let ball;
let snap_obj;
let side = 1;
window.onload = function () {
  init();

};




function init() {


GenerateBackground();

  // 指定した要素を取得する
  let canvas = document.querySelector('.canvas');
  snap_obj.prependTo(canvas);
  //ballを配置
  GenerateBall(80, 120);

  //clickするとプレイヤーを追加する
  snap_obj.click(function (e) {
    if (Snap.getElementByPoint(e.clientX, e.clientY).objtype !== 'player' && Snap.getElementByPoint(e.clientX, e.clientY).objtype !== 'ball') {
      GeneratePlayer(e.clientX, e.clientY);
    }
  });
  //ダブルクリックするとプレイヤーを削除する
  snap_obj.dblclick(function (e) {
    RemovePlayer(e.clientX, e.clientY);
  });
}

function ChangeSide() {
  side *= -1;
}

function GenerateBall(x, y) {

  ball = snap_obj.circle(x, y, BALLRADIUS);
  ball.x = x;
  ball.y = y;
  ball.objtype = 'ball';
  ball.attr({
    fill: COLOR_BLACK
  });
  ball.drag(DragMove, DragStart, DragStop);
  console.log('generate ball');
}

function GeneratePlayer(x, y) {

  id = players.length;
  console.log(x, y);
  players.push(snap_obj.circle(x, y, PLAYERRADIUS));
  players[id].side = side;
  players[id].x = x;
  players[id].y = y;
  players[id].id = id;
  players[id].objtype = 'player';
  GenerateTerritory(ball.x, ball.y, x, y, id, side, 1);


  if (side === 1) {
    players[id].attr({
      fill: COLOR_RED
    });
  } else {
    players[id].attr({
      fill: COLOR_BLUE
    });
  }
  players[id].drag(DragMove, DragStart, DragStop);


}

function GenerateTerritory(ball_x, ball_y, player_x, player_y, id, side, fresh_flag) {
  [apollonius_x, apollonius_y, apollonius_r] = CalcApollonius(ball_x, ball_y, player_x, player_y);
  if (fresh_flag) {
    territorys.push(snap_obj.circle(apollonius_x, apollonius_y, apollonius_r));
  } else {
    territorys.splice(id, 0, snap_obj.circle(apollonius_x, apollonius_y, apollonius_r));
  }
  territorys[id].id = id;
  territorys[id].side = side;
  if (side === 1) {
    territorys[id].attr({
      fill: COLOR_RED,
      fillOpacity: 0.5
    });
  } else {
    territorys[id].attr({
      fill: COLOR_BLUE,
      fillOpacity: 0.5
    });
  }
  players[id].before(territorys[id]);
  if (players[id].side === -1) {
    CoverLine(ball_x, ball_y, apollonius_x, apollonius_y, apollonius_r, id, fresh_flag);
  }

}

function CoverLine(ball_x, ball_y, apollonius_x, apollonius_y, apollonius_r, id, fresh_flag) {
  let dx = ball_x - apollonius_x;
  let dy = ball_y - apollonius_y;
  let l2 = dx * dx + dy * dy;
  let D = l2 - apollonius_r * apollonius_r;
  if (D > 0) {
    let sqrtD = Math.sqrt(D);
    let a = apollonius_r * (apollonius_r * dx + sqrtD * dy) / l2;
    let b = apollonius_r * (apollonius_r * dy - sqrtD * dx) / l2;
    let d = AREASIZE * AREASIZE / Math.sqrt(a * a + b * b);
    let va = b * d;
    let vb = -a * d;
    line_temp = snap_obj.line(a + apollonius_x, b + apollonius_y, a + apollonius_x + va, b + apollonius_y + vb).attr({
      stroke: COLOR_BLUE,
      strokeWidth: 2
    });

    let a2 = apollonius_r * (apollonius_r * dx - sqrtD * dy) / l2;
    let b2 = apollonius_r * (apollonius_r * dy + sqrtD * dx) / l2;
    let d2 = AREASIZE * AREASIZE / Math.sqrt(a2 * a2 + b2 * b2);
    let va2 = b2 * d2;
    let vb2 = -a2 * d2;
    line_temp2 = snap_obj.line(a2 + apollonius_x - va2, b2 + apollonius_y - vb2, a2 + apollonius_x, b2 + apollonius_y).attr({
      stroke: COLOR_BLUE,
      strokeWidth: 2
    });



    if (fresh_flag) {
      coverlines[id] = [];
      coverlines[id].push(line_temp);
      coverlines[id].push(line_temp2);
    } else {
      console.log(coverlines, id);
      coverlines[id][0].remove();
      coverlines[id][1].remove();
      coverlines.splice(id, 1);
      coverlines.splice(id, 0, []);
      coverlines[id].push(line_temp);
      coverlines[id].push(line_temp2);
    }

  }
}

function CalcApollonius(ball_x, ball_y, player_x, player_y) {
  apollonius_x = ((-player_speed * player_speed * ball_x) + (ball_speed * ball_speed * player_x)) / (ball_speed * ball_speed - player_speed * player_speed);
  apollonius_y = ((-player_speed * player_speed * ball_y) + (ball_speed * ball_speed * player_y)) / (ball_speed * ball_speed - player_speed * player_speed);
  length = Math.sqrt((ball_x - player_x) * (ball_x - player_x) + (ball_y - player_y) * (ball_y - player_y));
  apollonius_r = (player_speed * ball_speed) / (ball_speed * ball_speed - player_speed * player_speed) * length;
  return [apollonius_x, apollonius_y, apollonius_r];
}

function GenerateBackground() {
    // Snapオブジェクトを作成しサイズも指定
    snap_obj = Snap(600, 600);
    background = snap_obj.rect(0,0,AREASIZE,AREASIZE).attr({
      fill: COLOR_GREEN,
      stroke: COLOR_BLACK,
      strokeWidth: 2,
    });
    field_line = []
    field_line[0]=snap_obj.line(0,AREASIZE/2,AREASIZE,AREASIZE/2).attr({
      fill: COLOR_GREEN,
      stroke: COLOR_BLACK,
      strokeWidth: 2,
    });;
    field_line[1]=snap_obj.line(AREASIZE/2,0,AREASIZE/2,AREASIZE,).attr({
      fill: COLOR_GREEN,
      stroke: COLOR_BLACK,
      strokeWidth: 2,
    });;
}

function RemovePlayer(x, y) {
  remove_player = Snap.getElementByPoint(x, y);
  console.log(remove_player)
  if(remove_player.side === -1){
    coverlines[remove_player.id][0].remove();
    coverlines[remove_player.id][1].remove();
    coverlines.splice(remove_player.id, 1);
  }
  remove_player.remove();

  players.splice(remove_player.id, 1);
  territorys[remove_player.id].remove();
  territorys.splice(remove_player.id, 1);


}


function DragStart() {
  this.data('origTransform', this.transform().local);
  this.dx = 0;
  this.dy = 0;
}

function DragStop(dx, dy) {
  this.x += this.dx;
  this.y += this.dy;
  if (this.objtype === 'ball') {
    RefreshTerritory(ball_speed);
  }
}

function DragMove(dx, dy, x, y) {
  this.attr({
    transform: this.data('origTransform') + (this.data('origTransform') ? 'T' : 't') + [dx, dy]
  });
  if (this.objtype === 'player') {
    side_temp = territorys[this.id].side;
    territorys[this.id].remove();
    territorys.splice(this.id, 1);
    GenerateTerritory(ball.x, ball.y, x, y, this.id, side_temp, 0);
  }


  this.dx = dx;
  this.dy = dy;
}


function RefreshTerritory(speed) {
  ball_speed = speed;
  for (i = 0; i < territorys.length; i++) {
    console.log(ball_speed);
    side_temp = territorys[i].side;
    territorys[i].remove();
    territorys.splice(i, 1);
    GenerateTerritory(ball.x, ball.y, players[i].x, players[i].y, i, side_temp, 0);
  }
}