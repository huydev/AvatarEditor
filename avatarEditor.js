/**
 * AvatarEditor
 * @param {[object]} options [配置对象]
 * @author huydev
 * 可配置参数：
 * container 必填 包裹图片编辑框的元素(可以传字符串形式 .xxx #xxx 或 原生dom)
 * fileinput 必填 获取图片的input元素(可以传字符串形式 .xxx #xxx 或 原生dom)
 * uploadcallback 选填 选择图片成功回调函数 回调函数返回 input 对象
 * width 选填 图片宽度 默认：200
 * height 选填 图片高度 默认：200
 * zoomInMax 选填 放大倍数限制 默认：2
 * maxSize 选填 图片大小限制 默认：200000(200kb)
 */
function AvatarEditor(options){
  this.container = this._$(options.container);
  this.fileobj = this._$(options.fileinput);
  this.uploadcb = options.uploadcallback || function(){};
  this.width = options.width || 200;
  this.height = options.height || 200;
  this.ae_realbox = null;
  this.ae_ghostbox = null;
  this.img = null;

  this.imgscalew = 0;
  this.imgscaleh = 0;
  this.scale = 1;
  this.zoomInMax = options.zoomInMax || 2;
  this.zoomOutMax = 1;
  this.zoomValue = 0.02;

  this.startX = 0;
  this.startY = 0;
  this.imgEndX = 0;
  this.imgEndY = 0;
  this.ae_down = false;
  //上传图片相关
  this.typeFilter = /^image\//i;
  this.maxSize = options.maxSize || 200000;// 200kb以内

  this._init();
}
AvatarEditor.prototype._$ = function(container){
  return typeof container === 'string' ? document.querySelector(container) : container;
}
AvatarEditor.prototype._$$ = function(container){
  return typeof container === 'string' ? document.querySelectorAll(container) : container;
}
AvatarEditor.prototype._setStyle = function(element, options){
  for(var key in options){
    element.style[key] = options[key];
  }
}
AvatarEditor.prototype._createBox = function(){
  if(!this._$('.ae_container')){
    var ae_container = document.createElement('div');
    ae_container.classList.add('ae_container');
    this._setStyle(ae_container, {
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      cursor: 'move'
    });
  }
  if(!this._$('.ae_realbox')){
    var ae_realbox = document.createElement('div');
    ae_realbox.classList.add('ae_realbox');
    this._setStyle(ae_realbox, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: this.width + 'px',
      height: this.height + 'px',
      webkitTransform: 'translate(-50%, -50%)',
      transform: 'translate(-50%, -50%)'
    });
  }
  if(!this._$('.ae_ghostbox')){
    var ae_ghostbox = document.createElement('div');
    ae_ghostbox.classList.add('ae_ghostbox');
    this._setStyle(ae_ghostbox, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: this.width + 'px',
      height: this.height + 'px',
      webkitTransform: 'translate(-50%, -50%)',
      transform: 'translate(-50%, -50%)',
      boxShadow: '0 0 1px '+ this.width +'px rgba(0,0,0,.5)'
    });
  }
  this.ae_realbox = ae_realbox;
  this.ae_ghostbox = ae_ghostbox;
  ae_container.appendChild(ae_realbox);
  ae_container.appendChild(ae_ghostbox);
  this.container.appendChild(ae_container);
}

AvatarEditor.prototype._init = function(){
  if(!this.container){
    console.error('There is not container.');
  }
  if(!this.fileobj){
    console.erroe('There is not fileinput.');
  }
  var cw = this.container.width;
  var ch = this.container.height;
  if(cw < this.width || ch < this.height){
    console.error('The container is too small.');
    return;
  }
  this._createBox();
  this._uploadBind();
  this._bindEvent();
}
AvatarEditor.prototype._uploadBind = function(){
  var _this = this;
  _this.fileobj.addEventListener('change', function(){
    var file = this.files[0];
    var size = file.size;
    var type = file.type;
    if(size > this.maxSize){
      alert('图片太大，必须在'+ this.maxSize/1000 +'bk以内');
      this.value = '';
      file = null;
      return;
    }
    if(!_this.typeFilter.test(type)){
      alert('请选择图片格式的文件');
      this.value = '';
      file = null;
      return;
    }

    var fileReader = new FileReader();
    fileReader.onload = function(e){
      var src = e.target.result;
      var image = new Image();
      var imgw = 0;
      var imgh = 0;
      image.onload = function(){
        imgw = image.width;
        imgh = image.height;
        var tmpw, tmph;
        var scale = imgw / imgh;
        if(scale >= 1){ //宽大
          tmph = _this.height;
          tmpw = scale * _this.width;
        }else{ //高大
          tmpw = _this.width;
          tmph = _this.height / scale;
        }
        if(_this._$('.ae_img')){
          _this._$('.ae_img').parentNode.removeChild(_this._$('.ae_img'));
        }
        var img = document.createElement('img');
        _this._setStyle(img, {
          position: 'absolute',
          top: 0,
          left: 0
        });
        img.classList.add('ae_img');
        _this.imgscalew = img.width = tmpw;
        _this.imgscaleh = img.height = tmph;
        img.src = src;
        _this.ae_realbox.appendChild(img);
        _this.img = img;
        if(_this.uploadcb){
          _this.uploadcb(_this.fileobj);
        }
      }
      image.src = src;
    }
    fileReader.readAsDataURL(file);
  });
}
AvatarEditor.prototype._bindEvent = function(){
  var _this = this;
  var boxRect = _this.ae_ghostbox.getBoundingClientRect();
  _this.ae_ghostbox.addEventListener('mousedown', start);
  
  _this.ae_ghostbox.addEventListener('mousemove', move);

  _this.ae_ghostbox.addEventListener('mouseup', end);

  _this.ae_ghostbox.addEventListener('mouseout', end);

  _this.ae_ghostbox.addEventListener('touchstart', start);
  _this.ae_ghostbox.addEventListener('touchmove', move);
  _this.ae_ghostbox.addEventListener('touchend', end);

  function start(e){
    var _e = e;
    var event = e.touches ? e.touches[0] : e;
    _this.startX = event.clientX - boxRect.left;
    _this.startY = event.clientY - boxRect.top;
    _this.ae_down = true;
    _e.stopPropagation();
    _e.preventDefault();
    return false;
  }
  function move(e){
    var _e = e;
    var event = e.touches ? e.touches[0] : e;
    if(_this.ae_down){
      var cx = event.clientX - boxRect.left;
      var cy = event.clientY - boxRect.top;
      if(_this.img){  //如果图片存在
        var tmpX = cx - _this.startX + _this.imgEndX;
        var tmpY = cy - _this.startY + _this.imgEndY;
        if(tmpX >= 0){  //左边有空白
          _this.img.style.left = 0;
        }else{
          if(tmpX + _this.img.offsetWidth < boxRect.width){ //右边有空白
            _this.img.style.left = boxRect.width - _this.img.offsetWidth + 'px';
          }else{
            _this.img.style.left = tmpX + 'px';
          }
        }
        if(tmpY >= 0){  //上面有空白
          _this.img.style.top = 0;
        }else{
          if(tmpY + _this.img.offsetHeight < boxRect.height){ //下面有空白
            _this.img.style.top = boxRect.height - _this.img.offsetHeight + 'px';
          }else{
            _this.img.style.top = tmpY + 'px';
          }
        }
      }
    }
    _e.stopPropagation();
    _e.preventDefault();
    return false;
  }
  function end(e){
    var _e = e;
    _this.ae_down = false;
    if(_this.img){
      _this.imgEndX = parseInt(_this.img.style.left) ? parseInt(_this.img.style.left) : 0;
      _this.imgEndY = parseInt(_this.img.style.top) ? parseInt(_this.img.style.top) : 0;
    }
    _e.stopPropagation();
    _e.preventDefault();
    return false;
  }
}
AvatarEditor.prototype.zoomIn = function(){ //放大
  if(this.img){
    if(this.scale >= this.zoomInMax){
      return;
    }
    this.scale += this.zoomValue;
    this.img.style.width = this.imgscalew * this.scale + 'px';
    this.img.style.height = this.imgscaleh * this.scale + 'px';
  }
}
AvatarEditor.prototype.zoomOut = function(){  //缩小
  if(this.img){
    if(this.scale <= this.zoomOutMax){
      return;
    }
    this.scale -= this.zoomValue;
    this.img.style.width = this.imgscalew * this.scale + 'px';
    this.img.style.height = this.imgscaleh * this.scale + 'px';
  }
}
AvatarEditor.prototype.toImg = function(){
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = this.width;
  canvas.height = this.height;
  if(this.img){
    var imgW = this.img.offsetWidth,
        imgH = this.img.offsetHeight,
        imgLeft = this.img.offsetLeft,
        imgTop = this.img.offsetTop;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.img, imgLeft, imgTop, imgW, imgH);
    var imgData = canvas.toDataURL('image/png');
    return imgData;
  }else{
    return null;
  }
}