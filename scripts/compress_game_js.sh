#! /bin/bash


JS_PATH=/home/bob/AcApp-BattleOfBalls/game/static/js/
JS_PATH_DIST=${JS_PATH}dist/
JS_PATH_SRC=${JS_PATH}src/

# 合并代码
find . $JS_PATH_SRC -type f -name '*.js' | sort | xargs cat > ${JS_PATH_DIST}game-version-1.0.js

# 同步静态文件
echo yes | python3 /home/bob/AcApp-BattleOfBalls/manage.py collectstatic

# 启动uwsgi服务
uwsgi --ini /home/bob/AcApp-BattleOfBalls/scripts/uwsgi.ini