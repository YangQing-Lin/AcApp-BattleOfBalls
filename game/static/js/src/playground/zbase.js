class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        this.hide();

        // 在show()之前append，为了之后实时更新地图大小
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    add_enemy() {
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
    }

    get_random_color() {
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() {
        let outer = this;

        // 用户改变窗口大小的时候就会触发这个事件
        $(window).resize(function () {
            outer.resize();
        });
    }

    // 让界面的长宽比固定为16：9，并且等比例放到最大
    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;

        // 基准
        this.scale = this.height;

        // 调用一下GameMap的resize()
        if (this.game_map) this.game_map.resize();
    }

    show(mode) {  // 打开playground界面
        let outer = this;

        this.$playground.show();

        this.resize();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.mode = mode;
        this.state = "waiting";  // waiting -> fighting -> over
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;

        this.resize();

        this.players = [];
        // 绘制玩家
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if (mode === "single mode") {
            // 绘制若干敌人
            for (let i = 0; i < 12; i++) {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        } else if (mode === "multi mode") {
            // 添加聊天框
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            // 使用自己的uuid（自己永远是第一个被加入数组里面的）
            this.mps.uuid = this.players[0].uuid;

            // 连接创建成功时的回调函数
            this.mps.ws.onopen = function () {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}