from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    # 创建连接
    async def connect(self):
        self.room_name = None

        # 暴力枚举所有房间（暂定最多1000个）
        for i in range(1000):
            name = "room-%d" % (i)
            # 如果当前房间名不存在 或者 当前房间人数不足设定的最大人数 就拿出这个房间
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break

        # 房间数不够了
        if not self.room_name:
            return

        await self.accept()

        # 创建房间
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600)  # 房间有效期1小时

        for player in cache.get(self.room_name):
            # json.dumps：将一个字典封装成字符串
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
            }))

        # 将当前连接加到组里
        await self.channel_layer.group_add(self.room_name, self.channel_name)


    # 断开连接（但用户离线并不一定会执行这个函数）
    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)


    async def create_player(self, data):
        players = cache.get(self.room_name)
        # 将当前玩家加入到房间里
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo'],
        })
        # 记得要将新的玩家数组更新到数据库里
        cache.set(self.room_name, players, 3600)  # 有效期1小时
        # 群发消息的API
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_create_player",
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'],
            }
        )


    # 将data发送到前端（函数名与'type'关键字一致）
    async def group_create_player(self, data):
        await self.send(text_data=json.dumps(data))
    

    # 处理前端向后端发的请求
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
