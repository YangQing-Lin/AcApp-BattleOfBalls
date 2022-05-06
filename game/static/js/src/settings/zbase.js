class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";

        this.start();
    }

    start() {
        this.getinfo();
    }

    // 打开注册界面
    register() {

    }

    // 打开登陆界面
    login() {

    }

    getinfo() {
        let outer = this;
        $.ajax({
            url: "https://app383.acapp.acwing.com.cn:31443/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function (resp) {
                console.log(resp);
                // 从数据库中获取用户信息是否成功
                if (resp.result === "success") {
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            },
        });
    }

    hide() {

    }

    show() {

    }
}