import os
from django.db import models
from django.contrib.auth.models import User
from datetime import date

# Create your models here.

class UserProfile(models.Model):
	user = models.ForeignKey(User, unique=True)
	full_name = models.CharField(max_length=200)
	password = models.CharField(max_length=200)
	email = models.CharField(max_length=255)
	role = models.CharField(max_length=100)
	created_date = models.DateTimeField(auto_now_add=True, blank=True)
	
	def __unicode__(self):
		return u'%s' % (self.user)



