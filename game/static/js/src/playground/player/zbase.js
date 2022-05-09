class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;  // x方向的速度
        this.vy = 0;  // y方向的速度
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;  // 移动的直线距离
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;

        this.eps = 0.01;
        this.friction = 0.9;  // 阻尼
        this.spent_time = 0;
        this.enemy_cold_time = 3;  // 敌人3秒之后开始战斗
        this.fireballs = [];  // 自己发出的所有子弹
        this.base_fireball_coldtime = 1;
        this.base_blink_coldtime = 3;

        this.cur_skill = null;

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }

        if (this.character === "me") {
            // 火球技能冷却时间（单位：秒）
            this.fireball_coldtime = this.base_fireball_coldtime;
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            // 闪现技能冷却时间
            this.blink_coldtime = this.base_blink_coldtime;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
    }

    start() {
        // 在创建玩家的时候更新玩家人数并且重新绘制文字
        this.playground.player_count++;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "人");

        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("fighting");
        }

        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    // 监听鼠标事件
    add_listening_events() {
        let outer = this;

        // 关闭右键菜单功能
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });

        // 监听鼠标右键点击事件，获取鼠标位置
        this.playground.game_map.$canvas.mousedown(function (e) {

            // 非战斗状态不能移动
            if (outer.playground.state !== "fighting") {
                return true;
            }

            // 项目在acapp的小窗口上运行会有坐标值的不匹配的问题，这里做一下坐标映射
            // 这里canvas前面不能加&，会报错
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);

                // 如果是多人模式就要同时发送移动信息
                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            } else if (e.which === 1) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.cur_skill === "fireball" && outer.fireball_coldtime <= outer.eps) {
                    let fireball = outer.shoot_fireball(tx, ty);
                    console.log("shoot fireball");

                    // 如果是多人模式就广播发射火球的行为
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                } else if (outer.cur_skill === "blink" && outer.blink_coldtime <= outer.eps) {
                    outer.blink(tx, ty);
                } else {
                    let fireball = outer.shoot_fireball(tx, ty);
                    console.log("shoot bullet");

                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                }

                outer.cur_skill = null;
            }
        });

        $(window).keydown(function (e) {

            // 非战斗状态不能攻击
            if (outer.playground.state !== "fighting") {
                return true;
            }

            if (e.which === 81 && outer.fireball_coldtime <= outer.eps) {  // Q键
                outer.cur_skill = "fireball";
                return false;
            } else if (e.which === 70 && outer.blink_coldtime <= outer.eps) {  // F键
                outer.cur_skill = "blink";
                return false;
            }

            return true;
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 0.8;

        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        // 将新生成的火球放进自己的火球数组里
        this.fireballs.push(fireball);

        this.fireball_coldtime = this.base_fireball_coldtime;

        // 返回刚刚发射的火球（用于在room里同步所有子弹的uuid）
        return fireball;
    }

    // 通过uuid来删除火球
    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    // 闪现技能
    blink(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        // 闪现距离最大为高度的0.6倍
        d = Math.min(d, 0.6);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        // 技能进入冷却
        this.blink_coldtime = this.base_blink_coldtime;

        // 闪现之后停下来
        this.move_length = 0;
    }

    // 获取两点之间的直线距离
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);  // 移动角度
        this.vx = Math.cos(angle);  // 横向速度
        this.vy = Math.sin(angle);  // 纵向速度
    }

    is_attacked(angle, damage) {
        // 每次被击中先绘制粒子效果
        for (let i = 0; i < 20 + Math.random() * 8; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.15;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 6;
            let move_length = this.radius * Math.random() * 7;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

        this.radius -= damage;
        // 小球半径不够就死了
        if (this.radius < this.eps) {
            this.on_destroy();
            this.destroy();
            // 敌人死亡后再加入新的敌人
            if (this.character === "robot") {
                this.playground.add_enemy();
            }
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 1.1;
    }

    // 多人模式下玩家接收到被攻击的信息
    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    update() {
        this.update_move();

        // 只有自己，并且在fighting状态下才更新冷却时间
        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_codetime();
        }

        this.render();
    }

    // 更新技能冷却时间
    update_codetime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    // 更新玩家移动
    update_move() {
        this.spent_time += this.timedelta / 1000;
        // 自动攻击：不是玩家 & 冷静一段时间 & 玩家个数大于1 & 一定概率
        if (this.character === "robot" && this.spent_time > this.enemy_cold_time && this.playground.players.length > 1 && Math.random() < 1 / 180.0) {
            // 初始化将要选择的玩家
            let player = this.playground.players[0];
            // 如果随机到的攻击对象是自己的话就重新选择
            while (true) {
                player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
                if (player !== this) {
                    break;
                }
            }
            this.shoot_fireball(player.x, player.y);
        }

        // 击退的过程中强制移动
        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            } else {
                // 计算出的移动距离 和 按照当前速度一帧移动的距离 取最小值（不能移出界）
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    render() {
        let scale = this.playground.scale;

        // 如果是自己就画出头像，如果是敌人就用颜色代替
        if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_coldtime();
        }
    }

    // 渲染技能图标和冷却时间蒙版
    render_skill_coldtime() {
        this.render_fireball_coldtime();
        this.render_blink_coldtime();
    }

    render_fireball_coldtime() {
        let x = 1.5, y = 0.9, r = 0.04;
        let scale = this.playground.scale;

        // 渲染图片
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        // 渲染火球剩余冷却和时间蒙版
        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / this.base_fireball_coldtime) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.4)";
            this.ctx.fill();
        }
    }

    render_blink_coldtime() {
        let x = 1.62, y = 0.9, r = 0.04;
        let scale = this.playground.scale;

        // 渲染图片
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        // 渲染闪现剩余冷却和时间蒙版
        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / this.base_blink_coldtime) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.4)";
            this.ctx.fill();
        }
    }

    // 玩家死亡后将其从this.playground.players里面删除
    // 这个函数和基类的destroy不同，基类的是将其从AC_GAME_OBJECTS数组里面删除
    on_destroy() {
        if (this.character === "me") {
            this.playground.state = "over";
        }

        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}

