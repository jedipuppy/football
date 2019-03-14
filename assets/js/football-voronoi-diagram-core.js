// 設定値
const AREAWIDTH = 800;
const AREAHEIGHT = 400;
const GOALRADIUS = 50;
const COLOR_RED = '#F45D52';
const COLOR_BLUE = '#465B73';
const COLOR_AQUA = '#49A1DE';
const COLOR_GREEN = '#f5f5dc';
const COLOR_BLACK = '#696969';
const COLOR_WHITE = '#FFFFFF';
const PLAYERRADIUS = 10;
const BALLRADIUS = 10;
const SPEED_DELTA = 0.001;
const TERRITORY_OPACITY = 0.3;
let ball_speed = 6;
let player_speed = 1;
let players = [];
let territorys = [];
let coverlines = [];
let ball;
let snap_obj;
let side = 1;
let player_add_feature = 0;
window.onload = function () {
  init();

};


function init() {
  let speedslider = new rSlider({
    target: '#speed-slider',
    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    range: false,
    set: [5],
    tooltip: false,
    onChange: function (vals) {
      console.log(vals);
      RefreshTerritory(vals);
    }
  });

  $('.ui.checkbox').checkbox();

  GenerateBackground();

  // 指定した要素を取得する
  let canvas = document.querySelector('.canvas');
  snap_obj.prependTo(canvas);
  //ballを配置
  GenerateBall(20, AREAHEIGHT / 2);
  side = -1;
  GeneratePlayer(AREAWIDTH / 2, AREAHEIGHT / 3, 1);
  GeneratePlayer(AREAWIDTH / 2, 2 * AREAHEIGHT / 3, 1);
  side = 1;
  GeneratePlayer(AREAWIDTH / 3, AREAHEIGHT / 3, 1);
  GeneratePlayer(AREAWIDTH / 3, 2 * AREAHEIGHT / 3, 1);
  //clickするとプレイヤーを追加する
  snap_obj.click(function (e) {
    if (Snap.getElementByPoint(e.clientX, e.clientY).objtype !== 'player' && Snap.getElementByPoint(e.clientX, e.clientY).objtype !== 'ball') {
      GeneratePlayer(e.clientX, e.clientY, 0);
    }
  });
  //ダブルクリックするとプレイヤーを削除する
  snap_obj.dblclick(function (e) {
    RemovePlayer(e.clientX, e.clientY, 0);
  });
}

function ChangeSide(flag) {
  if (flag === 0) {
    player_add_feature = !player_add_feature;
  } else if (flag === 1) {
    player_add_feature = 1;
    side = 1;
  } else {
    player_add_feature = 1;
    side = -1;
  }
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

function GeneratePlayer(x, y, flag) {
  if (player_add_feature || flag) {
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
      fillOpacity: TERRITORY_OPACITY
    });
  } else {
    territorys[id].attr({
      fill: COLOR_BLUE,
      fillOpacity: TERRITORY_OPACITY
    });
  }
  players[0].before(territorys[id]);
  if (players[id].side === 1) {
    CoverLine(AREAWIDTH, AREAHEIGHT / 2, apollonius_x, apollonius_y, apollonius_r, id, fresh_flag, side);
  } else {
    CoverLine(ball_x, ball_y, apollonius_x, apollonius_y, apollonius_r, id, fresh_flag, side);
  }
}

function CoverLine(ball_x, ball_y, apollonius_x, apollonius_y, apollonius_r, id, fresh_flag, side) {
  let dx = ball_x - apollonius_x;
  let dy = ball_y - apollonius_y;
  let l2 = dx * dx + dy * dy;
  let D = l2 - apollonius_r * apollonius_r;
  if (D > 0) {
    let sqrtD = Math.sqrt(D);
    let a = apollonius_r * (apollonius_r * dx + sqrtD * dy) / l2;
    let b = apollonius_r * (apollonius_r * dy - sqrtD * dx) / l2;
    let d = AREAWIDTH * AREAWIDTH / Math.sqrt(a * a + b * b);
    let va = b * d;
    let vb = -a * d;


    let a2 = apollonius_r * (apollonius_r * dx - sqrtD * dy) / l2;
    let b2 = apollonius_r * (apollonius_r * dy + sqrtD * dx) / l2;
    let d2 = AREAWIDTH * AREAWIDTH / Math.sqrt(a2 * a2 + b2 * b2);
    let va2 = b2 * d2;
    let vb2 = -a2 * d2;
    if (side == 1) {
      line_temp = snap_obj.line(a + apollonius_x, b + apollonius_y, AREAWIDTH, AREAHEIGHT / 2).attr({
        stroke: COLOR_RED,
        strokeWidth: 2,
      });
      line_temp2 = snap_obj.line(a2 + apollonius_x, b2 + apollonius_y, AREAWIDTH, AREAHEIGHT / 2).attr({
        stroke: COLOR_RED,
        strokeWidth: 2
      });
    } else {
      line_temp = snap_obj.line(a + apollonius_x, b + apollonius_y, a + apollonius_x + va, b + apollonius_y + vb).attr({
        stroke: COLOR_BLUE,
        strokeWidth: 2
      });
      line_temp2 = snap_obj.line(a2 + apollonius_x - va2, b2 + apollonius_y - vb2, a2 + apollonius_x, b2 + apollonius_y).attr({
        stroke: COLOR_BLUE,
        strokeWidth: 2
      });
    }




    if (fresh_flag) {
      coverlines[id] = [];
      coverlines[id].push(line_temp);
      coverlines[id].push(line_temp2);
    } else {
      coverlines[id][0].remove();
      coverlines[id][1].remove();
      coverlines.splice(id, 1);
      coverlines.splice(id, 0, []);
      coverlines[id].push(line_temp);
      coverlines[id].push(line_temp2);
    }
  } else {
    coverlines[id][0].remove();
    coverlines[id][1].remove();
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
  snap_obj = Snap(AREAWIDTH, AREAHEIGHT);

  field_line = []
  field_line[0] = snap_obj.line(AREAWIDTH / 2, 0, AREAWIDTH / 2, AREAHEIGHT).attr({
    fill: COLOR_GREEN,
    stroke: COLOR_BLACK,
    strokeWidth: 2,
  });;
  background = snap_obj.circle(0, AREAHEIGHT / 2, GOALRADIUS).attr({
    fill: COLOR_BLACK,
    fillOpacity: TERRITORY_OPACITY
  });
  background = snap_obj.circle(AREAWIDTH, AREAHEIGHT / 2, GOALRADIUS).attr({
    fill: COLOR_BLACK,
    fillOpacity: TERRITORY_OPACITY
  });
}

function RemovePlayer(x, y, flag) {
  if (player_add_feature || flag) {

    remove_player = Snap.getElementByPoint(x, y);
    console.log(remove_player)

    coverlines[remove_player.id][0].remove();
    coverlines[remove_player.id][1].remove();
    coverlines.splice(remove_player.id, 1);

    remove_player.remove();

    players.splice(remove_player.id, 1);
    territorys[remove_player.id].remove();
    territorys.splice(remove_player.id, 1);
  }

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
  ball_speed = parseFloat(speed) + SPEED_DELTA;

  for (i = 0; i < territorys.length; i++) {
    console.log("start", i, territorys.length);
    side_temp = territorys[i].side;
    territorys[i].remove();
    territorys.splice(i, 1);
    GenerateTerritory(ball.x, ball.y, players[i].x, players[i].y, i, side_temp, 0);
  }
}

function Save() {

  let blob = new Blob([snap_obj.outerSVG()], {
    'type': 'image/svg+xml'
  });
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(blob, 'football-area.svg');

    // msSaveOrOpenBlobの場合はファイルを保存せずに開ける
    window.navigator.msSaveOrOpenBlob(blob, 'football-area.svg');
  } else {
    console.log(snap_obj.outerSVG());
    document.getElementById('save').href = window.URL.createObjectURL(blob);
  }
}