class Fsvjoy extends AcGameObject {
    constructor(player) {
        super();
        this.player = player;
        this.playground = this.player.playground;
        this.ctx = this.playground.game_map.ctx;
        this.rockerbg_x = 0.20;
        this.rockerbg_y = 0.78;
        this.base_rocker_x = this.rockerbg_x;
        this.base_rocker_y = this.rockerbg_y;
        this.rocker_x = this.base_rocker_x;
        this.rocker_y = this.base_rocker_y;

        this.rockerbg_r = 0.12;
        this.rocker_r = 0.04;

        //虚拟控制器
        // this.rockerbg = new PIXI.Graphics();//绘制摇杆背景
        // this.rockerbg.lineStyle(0);
        // this.rockerbg.beginFill(0x000000, 0.3);
        // this.radius = Math.max(phoneWidth, phoneHeight) / 10;
        // this.rockerbg.drawCircle(0, 0, this.radius);
        // this.rockerbg.endFill();
        // this.parent.addChild(this.rockerbg);
        // this.rocker = new PIXI.Graphics();//绘制摇杆
        // this.rocker.lineStyle(0);
        // this.rocker.beginFill(0xf0f0f0, 0.7);
        // this.rocker.drawCircle(0, 0, this.rockerbg.height / 8);
        // this.rocker.endFill();
        // this.rockerbg.addChild(this.rocker);
        // this.rockerbg.visible = false;

        // this.obj = null;
        // this.speed = { x: 0, y: 0 };
        // app.stage.interactive = true;//开启舞台交互

    }

    setobj(role) {
        this.obj = role;
    }

    getSpeed() {
        return this.speed;
    }

    start() {
        // this.add_listening_events();
    }

    freshing() {
        this.rocker_x = this.base_rocker_x;
        this.rocker_y = this.base_rocker_y;
    }

    late_update() {
        this.render();
    }

    render() {
        this.draw_rockerbg();
        this.draw_rocker();
    }

    draw_rockerbg() {
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.rockerbg_x * scale, this.rockerbg_y * scale, this.rockerbg_r * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = "rgba(192, 192, 192, 0.2)";
        this.ctx.fill();
    }

    draw_rocker() {
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.rocker_x * scale, this.rocker_y * scale, this.rocker_r * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = "white";
        this.ctx.fill();
    }

    // add_listening_events() {
    //     let outer = this;

    //     app.stage.on("pointerdown", function (event) {
    //         //在鼠标按下位置显示控制器
    //         let pos = event.data.getLocalPosition(app.stage);
    //         rockerbg.x = pos.x;
    //         rockerbg.y = pos.y;
    //         rockerbg.visible = true;
    //     });

    //     app.stage.on("pointerup", function () {
    //         //鼠标抬起时控制器隐藏,速度归零
    //         rocker.x = 0;
    //         rocker.y = 0;
    //         rockerbg.visible = false;
    //         speed = {
    //             x: 0, y: 0
    //         };
    //     });

    //     rocker.interactive = true;//开启摇杆交互
    //     rocker.on("pointermove", function (event) {
    //         //利用判断控制器在控制器背景原点的方向进行设置角色移动方向
    //         let pos = event.data.getLocalPosition(app.stage);
    //         let A = rockerbg.x - pos.x;//摇杆起始点与鼠标X轴距离
    //         let B = rockerbg.y - pos.y;//摇杆起始点与鼠标Y轴距离
    //         let Z = radius;//控制器背景的半径
    //         let X = pos.x - rockerbg.x;//获取鼠标X轴位置
    //         let Y = pos.y - rockerbg.y;//获取鼠标Y轴位置
    //         if (Z * Z < A * A + B * B) {
    //             //判断鼠标位置是否超出摇杆移动范围
    //             let angle = Math.atan((pos.y - rockerbg.y) / (pos.x - rockerbg.x));//计算鼠标与摇杆起始点角度
    //             if (pos.x < rockerbg.x) {
    //                 //判断鼠标是否在摇杆左侧
    //                 X = -Z * Math.cos(angle);
    //                 Y = -Z * Math.sin(angle);
    //             } else {
    //                 //判断鼠标是否在摇杆左侧
    //                 X = Z * Math.cos(angle);
    //                 Y = Z * Math.sin(angle);
    //             }
    //         }
    //         speed = {
    //             x: 0, y: 0
    //         };
    //         let movescope = rockerbg.width / 6;//设置控制器移动的最小范围（当超过这个值时则可设置方向与速度）
    //         if (Math.abs(X) > Math.abs(Y) && Math.abs(X) > movescope) {

    //             if (X < 0) {

    //                 obj.moveState = true;
    //                 obj.direction = "a";
    //                 speed.x = -3;
    //             } else if (X > 0) {

    //                 obj.moveState = true;
    //                 obj.direction = "d";
    //                 speed.x = 3;
    //             }
    //         } else if (Math.abs(X) < Math.abs(Y) && Math.abs(Y) > movescope) {

    //             if (Y < 0) {

    //                 obj.moveState = true;
    //                 obj.direction = "w";
    //                 speed.y = -3;
    //             } else if (Y > 0) {

    //                 obj.moveState = true;
    //                 obj.direction = "s";
    //                 speed.y = 3;
    //             }
    //         }
    //         rocker.x = X;
    //         rocker.y = Y;
    //     });
    // }

}

