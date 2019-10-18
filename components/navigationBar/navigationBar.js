Component({
    properties: {
        statusBarHeight: {
            type: String,
            value: getApp().globalData.statusBarHeight
        },
        navBarHeight: {
            type: String,
            value: getApp().globalData.navBarHeight
        },
        navTitle: {
            type: String
        },
        bg: {
            type: String
        },
        titleColor: String
    },

    methods: {
        navigateBack(e) {
            wx.navigateBack();
        }
    }
})
