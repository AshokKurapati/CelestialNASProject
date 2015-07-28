import subprocess
command = ('sudo', './interface', '-a')
with open('/tmp/vol.js') as input_stream:
    p = subprocess.Popen(command, stdout=subprocess.PIPE, 
                         stderr=subprocess.PIPE, stdin=input_stream)
    stdout, stderr = p.communicate()
    print stdout
    print stderr
