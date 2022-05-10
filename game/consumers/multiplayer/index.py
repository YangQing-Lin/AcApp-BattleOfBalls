from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

from match_system.src.match_server.match_service import Match
# from game.models.player.player import Player
# from channels.db import database_sync_to_async

class MultiPlayer(AsyncWebsocketConsumer):
    # 创建连接
    async def connect(self):
        await self.accept()
        


    # 断开连接（但用户离线并不一定会执行这个函数）
    async def disconnect(self, close_code):
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name)


    # 为了适配thrift匹配系统需要重写这个函数
    async def create_player(self, data):
        self.room_name = None
        self.uuid = data['uuid']
        # Make socket
        transport = TSocket.TSocket('127.0.0.1', 9090)
        # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)

        # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)

        # Create a client to use the protocol encoder
        client = Match.Client(protocol)

        # def db_get_player():
        #     return Player.objects.get(user__username=data['username'])

        # player = await database_sync_to_async(db_get_player)()

        # Connect!
        transport.open()

        client.add_player(1500, data['uuid'], data['username'], data['photo'], self.channel_name)

        # Close!
        transport.close()
        
        # # 先搜索可以加入的房间（或直接创建一个新的）
        # self.room_name = None

        # # 为了方便调试，这里做一个判断，如果加入的玩家不是自己，房间号就从10000开始创建
        # # 这样就可以把自己放到单独的房间里，方便调试而不用受到其他玩家的干扰
        # start = 0
        # if data['username'] != "lqc":
        #     start = 10000
        
        # # 暴力枚举所有房间（暂定最多1000个）
        # for i in range(start, 100000):
        #     name = "room-%d" % (i)
        #     # 如果当前房间名不存在 或者 当前房间人数不足设定的最大人数 就拿出这个房间
        #     if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
        #         self.room_name = name
        #         break

        # # 房间数不够了
        # if not self.room_name:
        #     return

        # # 创建房间
        # if not cache.has_key(self.room_name):
        #     cache.set(self.room_name, [], 3600)  # 房间有效期1小时

        # for player in cache.get(self.room_name):
        #     # json.dumps：将一个字典封装成字符串
        #     await self.send(text_data=json.dumps({
        #         'event': "create_player",
        #         'uuid': player['uuid'],
        #         'username': player['username'],
        #         'photo': player['photo'],
        #     }))

        # # 将当前连接加到组里
        # await self.channel_layer.group_add(self.room_name, self.channel_name)
        
        
        
        # # 创建玩家
        # players = cache.get(self.room_name)
        # # 将当前玩家加入到房间里
        # players.append({
        #     'uuid': data['uuid'],
        #     'username': data['username'],
        #     'photo': data['photo'],
        # })
        # # 记得要将新的玩家数组更新到数据库里
        # cache.set(self.room_name, players, 3600)  # 有效期1小时
        # # 群发消息的API
        # await self.channel_layer.group_send(
        #     self.room_name,
        #     {
        #         'type': "group_send_event",
        #         'event': "create_player",
        #         'uuid': data['uuid'],
        #         'username': data['username'],
        #         'photo': data['photo'],
        #     }
        # )


    # 将data发送到前端（函数名与'type'关键字一致）
    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))


    async def move_to(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "move_to",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )
    

    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "shoot_fireball",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
                'ball_uuid': data['ball_uuid'],
            }
        )


    async def attack(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "attack",
                'uuid': data['uuid'],
                'attackee_uuid': data['attackee_uuid'],
                'x': data['x'],
                'y': data['y'],
                'angle': data['angle'],
                'damage': data['damage'],
                'ball_uuid': data['ball_uuid'],
            }
        )


    async def blink(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "blink",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )


    async def message(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "message",
                'uuid': data['uuid'],
                'username': data['username'],
                'text': data['text'],
            }
        )
    

    # 处理前端向后端发的请求
    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "message":
            await self.message(data)
