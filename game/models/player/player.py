from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    # 玩家和用户一一对应，并且用户删除的时候也会同时删除玩家
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    photo = models.URLField(max_length=256, blank=True)
    
    # 定义列表中显示的字符串样式
    def __str__(self):
        return str(self.user)