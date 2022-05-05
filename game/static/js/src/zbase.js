export class AcGame {
    constructor(id) {
        // this.id = id;
        // // 前面加$表示js对象，前面加#能够找到id对应的div
        // this.$ac_game = $('#' + id);
        // this.menu = new AcGameMenu(this);
        this.id = id;
        this.$ac_game = $('#' + id);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    start() {

    }
}

