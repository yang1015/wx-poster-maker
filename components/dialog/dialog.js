Component({
    properties: {
        first: String,
        second: String, // 简化的定义方式
        confirmText: String,
        cancelText: String,
        buttonType: Number, // 1有且只有确定 0有且只有cancel 2 两个按钮都有
        clickOk: {
            type: Boolean,
            value: false
        },
        clickCancel: {
            type: Boolean,
            value: false
        },
        changedTop: {
            type: String,
            value: .62 * getApp().globalData.windowHeight + 'rpx'
        }
    },
    options: {
        addGlobalClass: true
    },

    data: {
        clickOk: false,
        clickCancel: false,
    }, // 私有数据，可用于模板渲染

    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached() {
            const res = wx.getSystemInfoSync();
            // 如果sh==wh说明组件当前所使用的页面是全屏模式的
            let fullScreenVersion = res.screenHeight == res.windowHeight;
            this.setData({
                changedTop: fullScreenVersion? .36 * res.windowHeight : .26 * res.screenHeight
            });
        }
    },

    methods: {
        // 点击取消 关闭toast
        onConfirm() {
            this.triggerEvent('okdialog');
            this.setData({
                clickOk: true
            });
        },
        onClose(){
            this.triggerEvent('nodialog');
            this.setData({
                clickCancel: true
            });
        }
    }

})