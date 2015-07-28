from django.shortcuts import render, render_to_response
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from models import *
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth import logout
# Create your views here.
import subprocess, re,sys
from django.http import HttpResponse
from django.template import Context, loader
import json
from django.template import RequestContext
from django.core.context_processors import csrf
from django.views.decorators.csrf import csrf_exempt
from django.utils.datastructures import MultiValueDictKeyError
import simplejson
from django.http import JsonResponse
#from django.utils import simplejson
#from django.views.decorators.csrf import requires_csrf_exempt
#from django.template.context_processors import csrf

def userlogin(request):
	#latest_poll_list = Poll.objects.all().order_by('-pub_date')[:5]
	#entry = UserProfile.objects.get(pk=1)
	context = ""
	return render(request, 'index.html', context)
	
def dashboard(request):
	username = request.POST['username']
	password = request.POST['password']
	
	user = authenticate(username=username, password=password)
	context = ""
	if user:
		login(request, user)
		return HttpResponseRedirect("/dashboardview")
		
	else:
		messages.error(request, "Invalid login credentials!")
		return HttpResponseRedirect("/")
		return render(request, '/filesharing.html', context)
		

def dashboardview(request):
	context = ""
	return render(request, 'filesharing.html', context)

def drives(request):
	context = ""
	return render(request, 'drives.html', context)


def filesharing(request):
	context = ""
	return render(request, 'filesharing.html', context)


#start frm here.	
"""
def raid_list(request):
      cd=['sudo','./interface','-D']
      p = subprocess.Popen(cd, stdout = subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            stdin=subprocess.PIPE)
      print "PPPPPPPP",p

      line,err = p.communicate()
      #line = list(line.split())
      #line = re.sub('{','[', line.rstrip())
      #line = re.sub('}',']',line.rstrip())
      #line = re.sub('],','],',line.rstrip())
      b_string=""
      flag =0
      for c in reversed(line):
      	if (flag == 0 and c ==","): 
        # b_string = b_string+c
        	flag =flag+1 
     	else:
        	b_string = b_string+c
      st = ""
      for a in reversed(b_string): 
      	st = st+a 
      print st
#d = reversed(b_string)
#print b_string
#print(d)
      disk = json.loads(st)
      print disk
      #print disk.items()
      for d in disk.items():
      	print type(d) 
      #print "LLLLLLLLLine", line
      #print type(line)
      #li = line.split("],")
      #for l in li:
       #   print l
	#  print "aaaaaaaa"
      #context = ""
      context = RequestContext(request)
      #return render(request, 'share/raidtemplate.html', context )
      #return render_to_response('share/raidtemplate.html',
                         # line,
                         # context_instance=RequestContext(request))
      return render_to_response('share/raidtemplate.html', disk,context_instance=RequestContext(request))

      return render_to_response('bookmarks/bookmark_detail.html', {'title': line, 'title': d},context_instance=RequestContext(request))
"""
def data_disk(request):
      cd=['sudo','./interface','-D']
      p = subprocess.Popen(cd, stdout = subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            stdin=subprocess.PIPE)
      print "PPPPPPPP",p
      line,err = p.communicate()
      b_string=""
      flag =0
      for c in reversed(line):
      	if (flag == 0 and c ==","): 
        # b_string = b_string+c
          flag =flag+1
        else:
     		   b_string = b_string+c
      st = ""
      for a in reversed(b_string):
      	st = st+a
      count = st.count('{')
      #print cou
      st = '''{
    "totalRecords":'''+str(count)+''',
    "curPage" : 1,
    "data": [''' + st +"""]
}"""
      print st
#d = reversed(b_string)
#print b_string
#print(d)
      d = json.dumps(st)
      print d
      return HttpResponse(st,content_type="application/type")

def data_volume(request):
      cd=['sudo','./interface','-V']
      p = subprocess.Popen(cd, stdout = subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            stdin=subprocess.PIPE)
      print "PPPPPPPP",p
      line,err = p.communicate()
      b_string=""
      flag =0
      for c in reversed(line):
        if (flag == 0 and c ==","): 
        # b_string = b_string+c
          flag =flag+1
        else:
           b_string = b_string+c
      st = ""
      for a in reversed(b_string):
        st = st+a
      count = st.count('{')
      #print cou
      st = '''{
    "totalRecords":'''+str(count)+''',
    "curPage" : 1,
    "data": [''' + st +"""]
}"""
      print st
#d = reversed(b_string)
#print b_string
#print(d)
      d = json.dumps(st)
      print d
      #print d.totalRecords
      return HttpResponse(st,content_type="application/type")

def applications(request):
	return render_to_response("applications.html",
                              locals(),
                              context_instance= RequestContext(request))

def backup(request):
	return render_to_response("backup.html",
                              locals(),
                              context_instance= RequestContext(request))
def services(request):
	return render_to_response("services.html",
                              locals(),
                              context_instance= RequestContext(request))

def webservices(request):
	return render_to_response("webservices.html",
                              locals(),
                              context_instance= RequestContext(request))
def network(request):
	return render_to_response("network.html",
                              locals(),
                              context_instance= RequestContext(request))

def management(request):
	return render_to_response("management.html",
                              locals(),
                              context_instance= RequestContext(request))
def no_disks(request):
      cd=['sudo','./interface','-D']
      p = subprocess.Popen(cd, stdout = subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            stdin=subprocess.PIPE)
      print "PPPPPPPP",p
      line,err = p.communicate()
      b_string=""
      flag =0
      for c in reversed(line):
        if (flag == 0 and c ==","): 
        # b_string = b_string+c
          flag =flag+1
        else:
           b_string = b_string+c
      st = ""
      for a in reversed(b_string):
        st = st+a
      count = st.count('{')
      #print cou
      st ='''{ "count":'''+str(count)+'''} ''';
      print st;
  
#d = reversed(b_string)
#print b_string
#print(d)
      d = json.dumps(st)
      print d
      return HttpResponse(st,content_type="application/type")

@csrf_exempt
def create_volume(request):
  c = {}
  c.update(csrf(request));

  #Name = str(request.POST['vol_name'])
  #print "NNNNNNNNNNNNNN", Name
  #return render_to_response("",c);
  data = request.POST["vol_name"]
  print "DATA", data
  #data = str(data)
  response_data = {}
  print "RESPONSE DATA", response_data
  response_data['msg'] = data;
  print "RESPONSE_DATA[mmgggggggg]", response_data['msg']
  print(type(data))
  print "volume detailsssss", response_data['msg']
  print "I got called"
  if (os.path.isfile("/tmp/vol.js")):
    #os.system(" touch /tmp/vol.js")
    f = open("/tmp/"+"vol.js","w")
    f.write(data)
    f.close()
  else :
    os.system(" touch /tmp/vol.js")
    f = open("/tmp/"+"vol.js","w")
    f.write(data)
    f.close()
  command = ('sudo', './interface', '-a')
  with open('/tmp/vol.js') as input_stream:
    p = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=input_stream)
    stdout, stderr = p.communicate()
    print "PRINT STDOUT", stdout
    print "PRINT STRERR", stderr


  return HttpResponse(json.dumps(response_data),content_type="application/type")

def user_logout(request):
	logout(request)
	messages.error(request, "Successfully logout.")
	# Redirect to a success page.
	#return HttpResponseRedirect("/")
	return render(request, 'index.html')

def data_user(request):
  #import json
  #import subprocess
  command_array = ['quota', '-u', 'goutham']

  p = subprocess.Popen(command_array,
                       stdout=subprocess.PIPE,
                       stderr=subprocess.PIPE,
                       stdin=subprocess.PIPE)

  out,err=p.communicate()

  outt=out.splitlines()

  #print outt[2]
  out1=outt[3].split()
  #print out1

  dictionary_output= {}

  dictionary_output['uid'] = outt[2]
  dictionary_output['blocks']= out1[0]
  dictionary_output['quota']=out1[1]
  dictionary_output['limit']=out1[2]
  dictionary_output['files']=out1[3]
  dictionary_output['qf']=out1[4]
  dictionary_output['lf']=out1[5]

  json_data=json.dumps(dictionary_output)
  count = json_data.count('{')
  json_data ='''{
    "totalRecords":'''+str(count)+''',
    "curPage" : 1,
    "data": [''' + json_data +"""]
}"""
  return HttpResponse(json_data,content_type="application/type")
  #print json_data

@csrf_exempt
def delete_volume(request):
  c = {}
  c.update(csrf(request));

  #Name = str(request.POST['vol_name'])
  #print "NNNNNNNNNNNNNN", Name
  #return render_to_response("",c);
  data = request.POST["vol_name"]
  print "DATA", data
  #data = str(data)
  response_data = {}
  print "RESPONSE DATA", response_data
  response_data['msg'] = data;
  print "RESPONSE_DATA[mmgggggggg]", response_data['msg']
  print(type(data))
  print "volume detailsssss", response_data['msg']
  print "I got called"
  if (os.path.isfile("/tmp/del.js")):
    #os.system(" touch /tmp/vol.js")
    f = open("/tmp/"+"del.js","w")
    f.write(data)
    f.close()
  else :
    os.system(" touch /tmp/vol.js")
    f = open("/tmp/"+"del.js","w")
    f.write(data)
    f.close()
  command = ('sudo', './interface', '-e')
  with open('/tmp/del.js') as input_stream:
    p = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=input_stream)
    stdout, stderr = p.communicate()
    print "PRINT STDOUT", stdout
    print "PRINT STRERR", stderr


  return HttpResponse(json.dumps(response_data),content_type="application/type")

@csrf_exempt
def claim_disk(request):
  c = {}
  c.update(csrf(request));

  #Name = str(request.POST['vol_name'])
  #print "NNNNNNNNNNNNNN", Name
  #return render_to_response("",c);
  data = request.POST["disk_name"]
  print "DATA", data
  #data = str(data)
  response_data = {}
  print "RESPONSE DATA", response_data
  response_data['msg'] = data;
  print "RESPONSE_DATA[mmgggggggg]", response_data['msg']
  print(type(data))
  print "volume detailsssss", response_data['msg']
  print "I got called"
  if (os.path.isfile("/tmp/claim.js")):
    #os.system(" touch /tmp/vol.js")
    f = open("/tmp/"+"claim.js","w")
    f.write(data)
    f.close()
  else :
    os.system(" touch /tmp/claim.js")
    f = open("/tmp/"+"claim.js","w")
    f.write(data)
    f.close()
  command = ('sudo', './interface', '-C')
  with open('/tmp/claim.js') as input_stream:
    p = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=input_stream)
    stdout, stderr = p.communicate()
    print "PRINT STDOUT", stdout
    print "PRINT STRERR", stderr


  return HttpResponse(json.dumps(response_data),content_type="application/type")

def data_network(request):

    os.system(" touch /tmp/network.js")
    f = open("/tmp/"+"network.js","r")
      #f.write(data)
    f.close()
    command = ('sudo', './net_interface', '-n')
    with open('/tmp/network.js') as input_stream:
      p = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=input_stream)
      stdout, stderr = p.communicate()
      print "PRINT STDOUT", stdout
      print "PRINT STRERR", stderr
      #line,err = p.communicate()
    b_string=""
    flag =0
    line = stdout
    print line
    
    st = line
    
    count = st.count('{')
        #print cou
    st = '''{
      "totalRecords":'''+str(count)+''',
      "curPage" : 1,
      "data": [''' + st +"""]
  }"""
    print st;
    return HttpResponse(st,content_type="application/type")



def data_shared_folder(request):
  cd=['sudo','sharedFolder','-a']
  p = subprocess.Popen(cd, stdout = subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            stdin=subprocess.PIPE)
  print "PPPPPPPP",p
  st,err = p.communicate()
  j = json.loads(st)
  final_js = """{
    "totalRecords":"""+str(len(j['list']))+""",
    "curPage" : 1,
    "data": [ """
  for k,v in j['list'].items():
    print k 
    js = {}
    js['sharedFolderName']=v['sharedFolderName']
    js['ownerName']=v['ownerName']
    js['volumeName']=v['volumeName']
    js['description'] = v['description']
    js['uniqueID'] = v['uniqueID']
    js['public'] = v['public']
    js.update(v['services'])
    final_js += str(js)+',' 
  final_js += "]}"
  print final_js
  b_string = ""
  st = ""
  flag =0
  for c in reversed(final_js):
    if (flag == 0 and c ==","): 
        # b_string = b_string+c
        flag =flag+1
    else:
        b_string = b_string+c
    #st = ""
  for a in reversed(b_string):
        st = st+a
  st = st.replace("u'"," '")
  st = st.replace("'",'"')
  return HttpResponse(st,content_type="application/type")

def vol_list(request):
      li =[]
      cd=['sudo','./interface','-V']
      p = subprocess.Popen(cd, stdout = subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            stdin=subprocess.PIPE)
      print "PPPPPPPP",p
      line,err = p.communicate()
      b_string=""
      flag =0
      for c in reversed(line):
        if (flag == 0 and c ==","): 
        # b_string = b_string+c
          flag =flag+1
        else:
           b_string = b_string+c
      st = ""
      for a in reversed(b_string):
        st = st+a
      count = st.count('{')
      vol_li =[]
      li = st.split("},")
      for a in li[0:-1]:
        a=a+'}'
        s = json.loads(a)
        vol_li.append(s['name'])
      t= json.loads(li[-1])
      vol_li.append(t['name'])
      #print vol_li
      b ='''{"volume":['''
      for a in vol_li[0:-1]:
        b = b+'"'+a+'",'
      b =b+'"'+str(vol_li[-1])+'"'
      b =b+"]}"
      print b
      d = json.dumps(b)
      print d
      return HttpResponse(b,content_type="application/type")


@csrf_exempt
def create_folder(request):
  c = {}
  c.update(csrf(request))
  data ={}
  data['sharedFolderName'] = request.POST["sharedFolderName"]
  data['ownerName'] = request.POST["ownerName"]
  data ['volumeName'] = request.POST["volumeName"]
  data ['description'] = request.POST["description"]
  data ['uniqueID'] = request.POST["uniqueID"]
  data ['public'] = request.POST["public"]
  data ['services'] = request.POST["services"]
  if "backup" in request.POST:
    data ['backup'] = request.POST["backup"]
  #data ['backup'] = request.POST["backup"]
  json_data = json.dumps(data)
  st ='''{"sharedFolder":'''+json_data+'''}'''
  st = st.replace('''\\''', '')
  st = st.replace('"{"','{"')
  st = st.replace('"}"','"}')
  if (os.path.isfile("/tmp/sf.js")):
    #os.system(" touch /tmp/vol.js")
    f = open("/tmp/"+"sf.js","w")
    f.write(st)
    f.close()
  else :
    os.system(" touch /tmp/sf.js")
    f = open("/tmp/"+"sf.js","w")
    f.write(st)
    f.close()
  command = ('sudo', 'sharedFolder', '-s')
  with open('/tmp/sf.js') as input_stream:
      p = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=input_stream)
      stdout, stderr = p.communicate()
      print "PRINT STDOUT", stdout
      print "PRINT STRERR", stderr
  print st
  return HttpResponse(json_data,content_type="application/type")

@csrf_exempt
def delete_folder(request):
  c = {}
  c.update(csrf(request));

  #Name = str(request.POST['vol_name'])
  #print "NNNNNNNNNNNNNN", Name
  #return render_to_response("",c);
  data = request.POST["folder_name"]
  print "DATA", data
  #data = str(data)
  response_data = {}
  print "RESPONSE DATA", response_data
  response_data['msg'] = data;
  print "RESPONSE_DATA[mmgggggggg]", response_data['msg']
  print(type(data))
  print "volume detailsssss", response_data['msg']
  print "I got called"
  if (os.path.isfile("/tmp/sf_del.js")):
    #os.system(" touch /tmp/vol.js")
    f = open("/tmp/"+"sf_del.js","w")
    f.write(data)
    f.close()
  else :
    os.system(" touch /tmp/sf_del.js")
    f = open("/tmp/"+"sf_del.js","w")
    f.write(data)
    f.close()
  command = ('sudo', 'sharedFolder', '-d')
  with open('/tmp/sf_del.js') as input_stream:
    p = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=input_stream)
    stdout, stderr = p.communicate()
    print "PRINT STDOUT", stdout
    print "PRINT STRERR", stderr


  return HttpResponse(json.dumps(response_data),content_type="application/type")