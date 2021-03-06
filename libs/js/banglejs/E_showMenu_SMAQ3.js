(function(items) {
  g.clearRect(0,0,175,174);
  if (Bangle.buttons) {E.removeListener("touch",Bangle.buttons); Bangle.buttons=undefined;}
  if (!items){ g.flip(); return; }
  var w = g.getWidth();
  var h = g.getHeight();
  var menuItems = Object.keys(items);
  var options = items[""];
  if (options) menuItems.splice(menuItems.indexOf(""),1);
  if (!(options instanceof Object)) options = {};
  options.fontHeight=8;
  options.x=0;
  options.x2=w-2;
  options.y=0;
  options.y2=150;
  if (options.selected === undefined)
    options.selected = 0;
  var x = 0|options.x;
  var x2 = options.x2||(g.getWidth()-1);
  var y = 0|options.y;
  var y2 = options.y2||(g.getHeight()-1);
  if (options.title)
    y += options.fontHeight+2;
  var cBg = 0; // background col
  var cFg = 7; // foreground col
  var cHighlightBg = 3;
  var cHighlightFg = 7;
  var l = {
    draw : function() {
      g.reset();
      g.setColor(cFg);
      g.setFont('Vector',18).setFontAlign(0,-1,0);
      if (options.title) {
        g.drawString(options.title,(x+x2)/2,y-options.fontHeight-2);
        g.drawLine(x,y-2,x2,y-2);
      }
      var rows = 0|Math.min((y2-y) / options.fontHeight,menuItems.length);
      var idx = E.clip(options.selected-(rows>>1),0,menuItems.length-rows);
      if (idx!=l.lastIdx) rowmin=undefined; // redraw all if we scrolled
      l.lastIdx = idx;      
      var iy = y;
      g.reset().setFontAlign(0,-1,0);
      if (rowmin===undefined && options.title) {
        g.setFont('4x6',2).drawString(options.title,(x+x2)/2,y-12-2);
        g.drawLine(x,y-2,x2,y-2);
      }
      g.setFont('6x8');
      if (rowmin!==undefined) {
        if (idx<rowmin) {
          iy += options.fontHeight*(rowmin-idx);
          idx=rowmin;
        }
        if (idx+rows>rowmax) {
          rows = 1+rowmax-rowmin;
        }
      }
      var less = idx>0;
      while (rows--) {
        var name = menuItems[idx];
        var item = items[name];
        var hl = (idx==options.selected && !l.selectEdit);
        g.setColor(hl ? g.theme.bgH : g.theme.bg);
        g.fillRect(x,iy,x2,iy+options.fontHeight-1);
        g.setColor(hl ? g.theme.fgH : g.theme.fg);
        g.setFontAlign(-1,-1);
        g.drawString(name,x,iy);
        if ("object" == typeof item) {
          var xo = x2;
          var v = item.value;
          if (item.format) v=item.format(v);
          if (l.selectEdit && idx==options.selected) {
            xo -= 24 + 1;
            g.setColor(g.theme.bgH).fillRect(xo-(g.stringWidth(v)+4),iy,x2,iy+options.fontHeight-1);
            g.setColor(g.theme.fgH).drawImage("\x0c\x05\x81\x00 \x07\x00\xF9\xF0\x0E\x00@",xo,iy+(options.fontHeight-10)/2,{scale:2});
          }
          g.setFontAlign(1,-1);
          g.drawString(v,xo-2,iy);
        }
        g.setColor(g.theme.fg);
        iy += options.fontHeight;
        idx++;
      }
      g.setFontAlign(-1,-1);
      var more = idx<menuItems.length;      
      g.setColor(more?-1:0);
      g.fillPoly([104,175,136,175,120,179]);
      g.flip();
    },
    select : function(dir) {
      var item = items[menuItems[options.selected]];
      if ("function" == typeof item) item(l);
      else if ("object" == typeof item) {
        // if a number, go into 'edit mode'
        if ("number" == typeof item.value)
          l.selectEdit = l.selectEdit?undefined:item;
        else { // else just toggle bools
          if ("boolean" == typeof item.value) item.value=!item.value;
          if (item.onchange) item.onchange(item.value);
        }
        l.draw();
      }
    },
    move : function(dir) {
      if (l.selectEdit) {
        var item = l.selectEdit;
        item.value -= (dir||1)*(item.step||1);
        if (item.min!==undefined && item.value<item.min) item.value = item.min;
        if (item.max!==undefined && item.value>item.max) item.value = item.max;
        if (item.onchange) item.onchange(item.value);
        l.draw(options.selected,options.selected);
      } else {
        var a=options.selected;
        options.selected = (dir+options.selected)%menuItems.length;
        if (options.selected<0) options.selected += menuItems.length;
        l.draw(Math.min(a,options.selected), Math.max(a,options.selected));
      }
    }
  };
  var selbut = -1;
  var butdefs = [{x1:8,y1:150,x2:44,y2:175,poly:[8,175,26,150,44,175]},
                 {x1:69,y1:150,x2:105,y2:175,poly:[69,150,105,150,69,175,105,175]},
                 {x1:130,y1:150,x2:166,y2:175,poly:[130,150,166,150,148,175]}];
  var drawButton = function(d,sel){
       (sel?g.setColor(3):g.setColor(1)).fillRect(d.x1,d.y1,d.x2,d.y2);
       g.setColor(-1).fillPoly(d.poly).flip();
  };
  for(var i=0;i<3;i++)drawButton(butdefs[i],false);
  var isPressed = function(p,n) {
      var d = butdefs[n];
      var bb = (p.x>d.x1 && p.x<d.x2 && p.y>130);
      if (bb) {selbut=n; drawButton(d,true);setTimeout(()=>{drawButton(d,false);},150);}
      return bb;
  };
  Bangle.buttons = function(p){
    if (isPressed(p,0)) l.move(-1);
    else if (isPressed(p,1)) l.select(); 
    else if (isPressed(p,2)) l.move(1);
    else selbut=-1;
  };
  l.draw();
  E.on("touch",Bangle.buttons);
  return l;  
})