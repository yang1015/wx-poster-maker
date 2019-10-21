
## 需求
1. 绘制海报背景图
2. 绘制动态生成的小程序码
3. 绘制海报底部文案

---

## 重/难点
1. canvas画图（base64&网络地址）及关键api
2. 图片按比适配
3. 小程序端用户文件的存储空间、临时地址以及下载到本地
4. 应对用户拒绝相册授权

---


## 流程分解
### 创建画布

```
const ctx = wx.createCanvasContext('myCanvas', this);
```

### 画背景图(网络地址)
poster背景是一张高清的图片，放在本地resources里渲染会很慢。所以预先存在了服务器上，需要的时候使用url来进行获取。

#### 根据具体手机来计算画布的宽高
先获取当前手机的系统信息，返回机型像素比，并计算画布的宽高
画布的宽度 = 手机屏幕尺寸 * 缩放比
画布的高度 = 画布的宽度 * 海报背景图片的宽高比
(比如你的图片是750X1334的 那么就是750 / 1334得出图片宽高比)

```
let this_ = this;
let canvasW = Math.round(app.globalData.screenWidth * 0.84)
let canvasH = canvasW * 1.7786 // 图片宽高比
this_.setData({
    pixelRatio: app.globalData.pixelRatio, // 图片像素比
    canvasW,
    canvasH
})
```

#### 将网络图片导出临时文件路径以进行绘制
canvas.drawImage文档中提到:
string imageResource 要绘制的图片资源（网络图片要通过 getImageInfo / downloadFile 先下载）


开始画图

```
let this_ = this;
wx.getImageInfo({
    src: 网络图片地址,
    success(res) {
        let tempFilePath = res.path; // 临时文件地址
        ctx.setFillStyle('#333333') // 画布背景底色
        ctx.drawImage(tempFilePath, 0, 0,
        his_.data.canvasW, this_.data.canvasH) // 从坐标系0,0的位置 完成整个海报背景的绘制
        ctx.draw(true); // 保留之前绘制内容，并将新的部分绘制上去; 默认是false
        ctx.save();
        this_.drawQrCode(); // 继续绘制小程序码
    },
    fail(e) {
        console.log(e);
    }
})
```

### 绘制小程序码
1. 后端返回小程序码的base64
2. 创建在用户文件中生成的临时文件路径

```
const filePath = `${wx.env.USER_DATA_PATH}/temp_image.png`;
```

3. 用wx.getFileSystemManager().writeFile来进行绘制

```
wx.getFileSystemManager().writeFile({
    filePath,
    data: this_.data.qrCodeBase64,
    encoding: 'base64',
    success() {
        // 截圆形背景
        let r = 36, d = 2 * r; // 圆形小程序码的半径和直径
        let x = 12, y = 432; // 剪裁开始的坐标
        let cx = x + r, cy = y + r; //

        // 画外层大直径圆 小程序码外层就会有一圈留白
        ctx.beginPath()
        ctx.arc(this_.computedPercent(cx), this_.computedPercent(cy), this_.computedPercent(r + 2), 0, Math.PI * 2, false)
        ctx.setFillStyle('#eee')
        ctx.fill()
        ctx.save() // 先保存再继续画

        // 画小直径圆形背景
        ctx.beginPath()
        ctx.arc(this_.computedPercent(cx), this_.computedPercent(cy), this_.computedPercent(r), 0, 2 * Math.PI);
        ctx.setFillStyle('#fff')
        ctx.fill()

        ctx.clip();  // 剪裁
        ctx.closePath();

        // 画小程序码
        ctx.drawImage(filePath, this_.computedPercent(x), this_.computedPercent(y), this_.computedPercent(d), this_.computedPercent(d));
        ctx.restore(); // 不restore的话画布会越剪越小

        // 写字
        let gapAfterQR = 82;
        ctx.setFillStyle('#fff')
        ctx.setFontSize(this_.computedPercent(14))
        ctx.fillText('扫码洗车', this_.computedPercent(x + gapAfterQR), this_.computedPercent(y + 22))
        ctx.setFontSize(this_.computedPercent(12))
        ctx.fillText('首单一元洗车,更有超多优惠享不停,', this_.computedPercent(x + gapAfterQR), this_.computedPercent(y + 22 + 20))
        ctx.fillText('还不赶快进来看看呀！', this_.computedPercent(x + gapAfterQR), this_.computedPercent(y + 22 + 20 + 17))
        ctx.setTextAlign('center')
        ctx.draw(true);
        wx.hideLoading()
    },
    fail(e) {
        console.log(e)
    }
});
```
