# AvatarEditor

## 可配置参数：

container 必填 包裹图片编辑框的元素(可以传字符串形式 .xxx #xxx 或 原生dom)

fileinput 必填 获取图片的input元素(可以传字符串形式 .xxx #xxx 或 原生dom)

uploadcallback 选填 选择图片成功回调函数 回调函数返回 input 对象

width 选填 图片宽度 默认：200

height 选填 图片高度 默认：200

zoomInMax 选填 放大倍数限制 默认：2

maxSize 选填 图片大小限制 默认：200000(200kb)

## 可用方法

zoomOut 缩小

zoomIn 放大

toImg 获得图片数据

## 使用方法

```
var ae = new AvatarEditor({
  container: '.content',
  fileinput: '#test',
  uploadcallback: function(input){
    //input.parentNode.removeChild(input);
  }
});
```
更多详情，参考demo。