class SkillIcon extends AcGameObject {
    constructor(player) {
        super();
        this.player = player;
        this.playground = this.player.playground;
        this.ctx = this.playground.game_map.ctx;
        this.operator = this.playground.operator;

        this.base_fireball_coldtime = 1;
        this.base_blink_coldtime = 3;
        this.base_shield_coldtime = 5;

        this.phone_skill_position = {
            "normal_attack": { x: 1.6, y: 0.8, r: 0.11 },
            "blink": { x: 1.31, y: 0.9, r: 0.055 },
            "fireball": { x: 1.4, y: 0.75, r: 0.055 },
            "shield": { x: 1.5, y: 0.62, r: 0.055 },
        };
        this.pc_skill_position = {
            "blink": { x: 1.62, y: 0.9, r: 0.04 },
            "fireball": { x: 1.5, y: 0.9, r: 0.04 },
            "shield": { x: 1.38, y: 0.9, r: 0.04 },
        };

        this.start();
    }

    start() {
        // 火球技能冷却时间（单位：秒）
        this.fireball_coldtime = this.base_fireball_coldtime;
        this.fireball_img = new Image();
        this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

        // 闪现技能冷却时间
        this.blink_coldtime = this.base_blink_coldtime;
        this.blink_img = new Image();
        this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";

        // 护盾技能图标
        this.shield_coldtime = this.base_shield_coldtime;
        this.shield_img = new Image();
        this.shield_img.src = "https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/BattleOfBalls/skill/shield.jfif";

        this.normal_attack = new Image();
        this.normal_attack.src = "https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/BattleOfBalls/normalattack.png";

        this.add_listening_events();
    }

    add_listening_events() {

    }

    get_touch_skill(tx, ty) {
        for (let skill_name in this.phone_skill_position) {
            let position = this.phone_skill_position[skill_name];
            if (this.player.get_dist(tx, ty, position.x, position.y) <= position.r) {
                return skill_name;
            }
        }
    }

    // 更新技能冷却时间
    update_coldtime() {
        this.render_skill_coldtime();

        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);

        this.shield_coldtime -= this.timedelta / 1000;
        this.shield_coldtime = Math.max(this.shield_coldtime, 0);
    }

    // 渲染技能图标和冷却时间蒙版
    render_skill_coldtime() {
        this.render_fireball_coldtime();
        this.render_blink_coldtime();
        this.render_shield_coldtime();

        if (this.operator === "phone") {
            this.render_normal_attack();
        }
    }

    render_shield_coldtime() {
        let x = null, y = null, r = null;
        if (this.operator === "phone") {
            x = this.phone_skill_position["shield"].x
            y = this.phone_skill_position["shield"].y
            r = this.phone_skill_position["shield"].r;
        } else {
            x = this.pc_skill_position["shield"].x
            y = this.pc_skill_position["shield"].y
            r = this.pc_skill_position["shield"].r;
        }
        let scale = this.playground.scale;

        // 渲染图片
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.clip();
        this.ctx.drawImage(this.shield_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        // 渲染护盾剩余冷却和时间蒙版
        if (this.shield_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.shield_coldtime / this.base_shield_coldtime) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.4)";
            this.ctx.fill();
        }
    }

    render_normal_attack() {
        let x = null, y = null, r = null;
        if (this.operator === "phone") {
            x = this.phone_skill_position["normal_attack"].x
            y = this.phone_skill_position["normal_attack"].y
            r = this.phone_skill_position["normal_attack"].r;
        } else {
            x = this.pc_skill_position["normal_attack"].x
            y = this.pc_skill_position["normal_attack"].y
            r = this.pc_skill_position["normal_attack"].r;
        }

        let scale = this.playground.scale;

        // 渲染图片
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.clip();
        this.ctx.drawImage(this.normal_attack, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
    }

    render_fireball_coldtime() {
        let x = null, y = null, r = null;
        if (this.operator === "phone") {
            x = this.phone_skill_position["fireball"].x
            y = this.phone_skill_position["fireball"].y
            r = this.phone_skill_position["fireball"].r;
        } else {
            x = this.pc_skill_position["fireball"].x
            y = this.pc_skill_position["fireball"].y
            r = this.pc_skill_position["fireball"].r;
        }
        let scale = this.playground.scale;

        // 渲染图片
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
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
        let x = null, y = null, r = null;
        if (this.operator === "phone") {
            x = this.phone_skill_position["blink"].x
            y = this.phone_skill_position["blink"].y
            r = this.phone_skill_position["blink"].r;
        } else {
            x = this.pc_skill_position["blink"].x
            y = this.pc_skill_position["blink"].y
            r = this.pc_skill_position["blink"].r;
        }
        let scale = this.playground.scale;

        // 渲染图片
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
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
}