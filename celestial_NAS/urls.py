from django.conf.urls import patterns, include, url
from django.contrib import admin

from NAS import views

urlpatterns = patterns('',
    # Examples:
    # url(r'^blog/', include('blog.urls')),
	
    #url(r'^$', views.index, name='index'),
    url(r'^$', views.userlogin, name='userlogin'),
    url(r'^dashboard/', views.dashboard, name='dashboard'),
    url(r'^dashboardview/', views.dashboardview, name='dashboardview'),
    url(r'^drives/', views.drives, name='drives'),
    url(r'^filesharing/', views.filesharing, name='filesharing'),
    # url(r'^raid_list/', views.raid_list, name='raid_list'),
    url(r'^data_disk/', views.data_disk, name='data_disk'),
    url(r'^data_user/', views.data_user, name='data_user'),
    url(r'^data_volume/', views.data_volume, name='data_volume'),
    url(r'^vol_list/', views.vol_list, name='vol_list'),
    url(r'^data_shared_folder/', views.data_shared_folder, name='data_shared_folder'),
    url(r'^no_disks/', views.no_disks, name='no_disks'),
    url(r'^create_volume/', views.create_volume, name='create_volume'),
    url(r'^delete_volume/', views.delete_volume, name='delete_volume'),
    url(r'^delete_folder/', views.delete_folder, name='delete_folder'),
    url(r'^claim_disk/', views.claim_disk, name='claim_disk'),
    url(r'^create_folder/', views.create_folder, name='create_folder'),
    url(r'^data_network/', views.data_network, name='data_network'),
    #url(r'^create_vol_form/', views.data_volume, name='data_volume'),
	#url(r'^dashboardview/', views.dashboardview, name='dashboardview'),
    url(r'^services/', views.services, name='services'),
    url(r'^webservices/', views.webservices, name='webservices'),
    url(r'^applications/', views.applications, name='applications'),
    url(r'^network/', views.network, name='network'),
    url(r'^backup/', views.backup, name='backup'),
    url(r'^management/', views.management, name='management'),
    
    url(r'^logout/', views.user_logout, name='user_logout'),
    url(r'^admin/', include(admin.site.urls)),
)
