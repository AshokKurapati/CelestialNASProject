import subprocess
cd=['sudo','./interface','-a']
f = open ('/tmp/vol.js','r')
p = subprocess.Popen(cd, stdout = subprocess.PIPE,stderr=subprocess.PIPE, stdin=f, shell= True)
print p.communicate()
