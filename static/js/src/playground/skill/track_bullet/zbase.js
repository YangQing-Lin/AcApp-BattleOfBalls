class TrackBullet extends FireBall {
    constructor(playground, player, x, y, vx, vy) {
        super(playground, player, x, y, vx, vy);
        this.color = "gold";
        this.damage = 0.01;
        this.hp_damage = 8;
        this.max_speed = 0.7;
        this.slow_down_time = 0.4;  // 追踪球减速时间
        this.accelerate_time = 1;  // 追踪球加速时间
        this.temp_time = this.slow_down_time;
        this.is_accelerate = false;  // 是否在加速

    }

    start() {

    }

    late_update() {
        this.update_speed();
    }

    update_speed() {
        if (!this.is_accelerate) {
            this.temp_time -= this.timedelta / 1000;
            this.speed = this.max_speed * (this.temp_time / this.slow_down_time);

            // 减速时间结束后就开始加速
            if (this.temp_time <= this.eps) {
                this.is_accelerate = true;
                this.temp_time = 0;
            }
        } else {
            this.temp_time += this.timedelta / 1000;
            this.temp_time = Math.min(this.temp_time, this.accelerate_time);
            this.speed = this.max_speed * (this.temp_time / this.accelerate_time);
        }
    }
}