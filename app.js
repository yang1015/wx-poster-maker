App({
    onLaunch() {
        let res = wx.getSystemInfoSync();
        this.globalData.version = res.SDKVersion;
        this.globalData.windowHeight = res.windowHeight;
        this.globalData.windowWidth = res.windowWidth;
        this.globalData.screenWidth = res.screenWidth;
        this.globalData.screenHeight = res.screenHeight;
        this.globalData.canIUseOpenData = wx.canIUse('open-data.type.userAvatarUrl');
        this.globalData.statusBarHeight = res.statusBarHeight; // 手机状态栏高度
        this.globalData.pixelRatio = res.pixelRatio;
        let reg = /ios/i;
        this.globalData.navBarHeight = reg.test(res.system) ? 44 : 48;
    },

    onShow() {

    },

    globalData: {

    }
})