#! /usr/bin/env python3

import glob
import sys
# 改了路径才能引用Django原项目里面的包
sys.path.insert(0, glob.glob('../../')[0])

# 引入自己写的Match
from match_server.match_service import Match
# 引入python里面自带的消息队列（线程安全的，不会出现读写冲突）
from queue import Queue
from time import sleep
from threading import Thread

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer


# 全局的消息队列
queue = Queue()


class Player:
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0  # 等待时间


class Pool:
    def __init__(self):
        self.players = []
    
    def add_player(self, player):
        self.players.append(player)
    
    def check_match(self, a, b):
        # 不会和自己匹配（调试的时候要注释掉）
        # if a.username == b.username:
        #     return false
        dt = abs(a.score - b.score)
        a_max_dif = a.waiting_time * 50
        b_max_dif = b.waiting_time * 50
        return dt <= a_max_dif and dt <= b_max_dif

    def match_success(self, ps):
        print("Match Success: %s %s %s" % (ps[0].username, ps[1].username, ps[2].username))
    
    def increase_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

    def match(self):
        while len(self.players) >= 3:
            self.players = sorted(self.players, key=lambda p: p.score)
            flag = False
            for i in range(len(self.players) - 2):
                a, b, c = self.players[i], self.players[i + 1], self.players[i + 2]
                if (self.check_match(a, b) and self.check_match(a, c) and self.check_match(b, c)):
                    # 输出成功信息
                    self.match_success([a, b, c])
                    # 匹配成功之后删除成功的三个人
                    self.players = self.players[:i] + self.players[i + 3:]
                    flag = True
                    break
            if not flag:
                break
        
        self.increase_waiting_time()


class MatchHandler:
    def add_player(self, score, uuid, username, photo, channel_name):
        print("Add Player: %s %d" % (username, score))
        player = Player(score, uuid, username, photo, channel_name)
        queue.put(player)
        return 0



# 从消息队列里面取元素
def get_player_from_queue():
    # get_nowait()：有元素就会返回元素，没有就会报异常
    try:
        return queue.get_nowait()
    except:
        return None


# 消费者模型
def worker():
    pool = Pool()
    while True:
        player = get_player_from_queue()
        if player:
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)



if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    # 单线程
    # server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)

    # 一个请求一个线程
    server = TServer.TThreadedServer(
        processor, transport, tfactory, pfactory)

    # 匹配池server，在匹配池里面预先开启几个线程，然后把请求丢到匹配池里
    # server = TServer.TThreadPoolServer(
    #     processor, transport, tfactory, pfactory)

    # 开启一个线程
    # daemon=True：杀掉主线程之后当前子线程也会关掉
    Thread(target=worker, daemon=True).start()

    print('Starting the server...')
    server.serve()
    print('done.')