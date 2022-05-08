class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        // 建立websocket连接
        this.ws = new WebSocket("wss://app383.acapp.acwing.com.cn:31443/wss/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }

    // 从前端接收信息
    receive() {
        let outer = this;

        this.ws.onmessage = function (e) {
            // 将一个字符串加载成字典
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;
            console.log(uuid, data.username, data.photo);

            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
        };
    }

    send_create_player(username, photo) {
        let outer = this;

        // 向后端服务器发送信息
        // JSON.stringify：将一个json封装成字符串
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

    // 多人模式里在前端创建其他玩家
    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }
}