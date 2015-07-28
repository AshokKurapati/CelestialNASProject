import  subprocess

from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
        return '<form action="/echo" method="GET"><input name="text"><input type="submit" value="Echo"></form>'

@app.route('/echo')
def hello_world():
      cd=['sudo','./interface','-D']
      p = subprocess.Popen(cd, stdout = subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            stdin=subprocess.PIPE)

      out,err = p.communicate()
      return out

@app.route('/projects')
def projects():
    return call(['sudo','./interfacee','-D'])

if __name__ == '__main__':
    app.run()

