var w = window.innerWidth,
    h = window.innerHeight,
    canvas = document.getElementById('test'),
    ctx = canvas.getContext('2d'),
    rate = 100,
    arc = 20,
    time,
    count,
    size = 25,
    speed = 2,
    parts = new Array,
    colors = ['#84ff6b88', '#cd4ebe88'];
canvas.setAttribute('width',w);
canvas.setAttribute('height',h);

function create() {
  time = 0;
  count = 0;
  for(var i = 0; i < arc; i++) {
    parts[i] = {
      x: Math.ceil(Math.random() * w),
      y: Math.ceil(Math.random() * h),
      toX: Math.random() * 5 - 1,
      toY: Math.random() * 2 - 1,
      c: colors[Math.floor(Math.random()*colors.length)],
      size: Math.random() * size
    }
  }
}

function particles() {
  ctx.clearRect(0,0,w,h);
  for(var i = 0; i < arc; i++) {
    var li = parts[i];
    ctx.beginPath();
    ctx.arc(li.x,li.y,li.size,0,Math.PI*2,false);
    ctx.fillStyle = li.c;
    ctx.strokeStyle=li.c;
    if (i%2==0) ctx.stroke();
    else ctx.fill();
    
    li.x = li.x + li.toX * (time * 0.05);
    li.y = li.y + li.toY * (time * 0.05);
    
    if(li.x > w) li.x = 0; 
    if(li.y > h) li.y = 0;
    if(li.x < 0) li.x = w; 
    if(li.y < 0) li.y = h; 
  }
  if(time < speed) time++;
  setTimeout(particles,1000/rate);
}
function DistanceBetween(p1,p2) {
   var dx = p2.x-p1.x;
   var dy = p2.y-p1.y;
   return Math.sqrt(dx*dx + dy*dy);
}

create();
particles();