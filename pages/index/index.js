import {base64, shareWithList} from '../../utils/util';
const app = getApp();

let ctx;
Page({
    data: {
        sharePath: "https://app.spsing.cn/Content/Images/poster2.png",
        shareWithList: shareWithList
    },

    onLoad() {
        let this_ = this;
        let canvasW = Math.round(app.globalData.screenWidth * 0.84)
        let canvasH = canvasW * 1.7786 // 图片宽高比
        this_.setData({
            pixelRatio: app.globalData.pixelRatio, // 图片像素比
            canvasW,
            canvasH
        })
        this_.getBase64Img();
    },

    onReady() {
        ctx = wx.createCanvasContext('myCanvas', this);
    },

    getBase64Img() {
        // 后端接口返回给前端待生成图片的base64
        this.setData({
            qrCodeBase64: decodeURIComponent(base64)
        })
    },

    goInvite() {
        this.setData({
            visible: true
        });

        this.drawPoster();
    },

    computedPercent(value) {
        let currentWidth = this.data.canvasW
        let oldWidth = 288
        return Math.floor(value * currentWidth / oldWidth)
    },

    drawPoster() {
        let this_ = this;
        wx.getImageInfo({
            src: 'https://app.spsing.cn/Content/Images/poster2.png',
            success(res) {
                let tempFilePath = res.path
                // ctx.drawImage(tempFilePath, 0, 0, 300, 600);
                ctx.setFillStyle('#333333')
                ctx.drawImage(tempFilePath, 0, 0, this_.data.canvasW, this_.data.canvasH)
                ctx.draw(true);
                ctx.save();
                this_.drawQrCode();
            },
            fail(e) {
                console.log(e);
            }
        })
    },

    drawQrCode() {
        wx.showLoading()
        let this_ = this;
        const filePath = `${wx.env.USER_DATA_PATH}/temp_image.png`;
        wx.getFileSystemManager().writeFile({
            filePath,
            data: this_.data.qrCodeBase64,
            encoding: 'base64',
            success() {
                // 截圆形背景
                let r = 36;
                let x = 12;
                let y = 432;
                let cx = x + r;
                let cy = y + r;
                let d = 2 * r;

                // 画圆环
                ctx.beginPath()
                ctx.arc(this_.computedPercent(cx), this_.computedPercent(cy), this_.computedPercent(r + 2), 0, Math.PI * 2, false)
                ctx.setFillStyle('#eee')
                ctx.fill()
                ctx.save()

                ctx.beginPath()
                ctx.arc(this_.computedPercent(cx), this_.computedPercent(cy), this_.computedPercent(r), 0, 2 * Math.PI);
                ctx.setFillStyle('#fff')
                ctx.fill()

                ctx.clip();
                ctx.closePath();

                // 画小程序码
                ctx.drawImage(filePath, this_.computedPercent(x), this_.computedPercent(y), this_.computedPercent(d), this_.computedPercent(d));
                ctx.restore();

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
    },

    checkAuthorityBeforeSave() {
        let this_ = this;
        wx.showLoading()
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) { //判断权限
                    wx.authorize({ //获取权限
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            wx.hideLoading()
                            this_.savePosterLocally()
                        },
                        fail() {
                            wx.hideLoading()
                            this_.setData({
                                showPhotoAlbumAuthRequest: true
                            });
                        }
                    })
                } else {
                    wx.hideLoading()
                    this_.savePosterLocally()
                }
            },
            fail(err) {
                wx.hideLoading()
                console.log(err)
            }
        })
    },

    savePosterLocally() {
        wx.showLoading("保存中…")
        // 不是第一次画
        let this_ = this;
        wx.canvasToTempFilePath({
            x: 0, // 起点横坐标
            y: 0, // 起点纵坐标
            width: this_.data.canvasW, // canvas 当前的宽
            height: this_.data.canvasH, // canvas 当前的高
            destWidth: this_.data.canvasW * this_.data.pixelRatio, // canvas 当前的宽 * 设备像素比
            destHeight: this_.data.canvasH * this_.data.pixelRatio, // canvas 当前的高 * 设备像素比
            canvasId: 'myCanvas',
            fileType: 'png',
            quality: 1,
            success(res) {
                this_.saveImageToPhotosAlbum(res.tempFilePath)
            },
            fail(err) {
                wx.hideLoading()
            }
        })
    },

    saveImageToPhotosAlbum(tempFilePath) {
        wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success() {
                wx.hideLoading()
                wx.showToast({
                    title: '保存成功',
                    icon: 'success',
                    duration: 1500
                })
            },
            fail() {
                wx.hideLoading()
            }
        })
    },

    /* 关闭poster-container弹窗 */
    onClose() {
        this.setData({
            visible: false
        })
    },

    /* 拉起授权 */
    openSettings() {
        let this_ = this;
        this.setData({
            showPhotoAlbumAuthRequest: false
        })
        wx.openSetting({
            success(res) {
                if (res.authSetting['scope.writePhotosAlbum']) {
                    wx.setStorageSync("writePhotosAlbum", true)
                    this_.savePosterLocally()
                }
            }
        })
    },

    closeDialog() {
        this.setData({
            showPhotoAlbumAuthRequest: false
        })
    }
})