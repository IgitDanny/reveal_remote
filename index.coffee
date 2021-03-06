fs = require 'fs'
os = require 'os'
express = require 'express'
http = require 'http'
optimist = require 'optimist'

base_path = process.cwd()

ip = false
ifaces = os.networkInterfaces()

for iface of ifaces
	ifaces[iface].forEach((addr)->
		ip = addr.address if addr.family == 'IPv4' unless ip || addr.address == '127.0.0.1'
	)

app = express() 
app.set('port',optimist.argv['port']||4101)

app.get('/js/reveal_remote.js',(req,res) ->
	fs.readFile("#{__dirname}/lib/reveal_remote.js",'utf8',(err,content)->
		res.writeHeader(200)
		res.end(content.replace(/__hostname__/,"#{ip}:#{app.get('port')}"))
	)
)

app.use('/js',express.static("#{__dirname}/lib"))
app.use('/css',express.static("#{__dirname}/css"))

dir = optimist.argv._[0]
base_path = '' if dir.charAt(0) == "/" 
index = optimist.argv['index']||'index.html'
receiver_slides = ''
controller_slides = ''

inject_scripts = (html,scripts...) ->
	[top,bottom] = html.split('</head>')
	top += '<script type="text/javascript" src="/socket.io/socket.io.js"></script>'
	for sname in scripts 
		top += "<script type='text/javascript' src='/js/#{sname}.js'></script>"
	[top,bottom].join('\n</head>')
	
inject_style = (html,styles...) ->
	[top,bottom] = html.split('</head>')
	for sname in styles
		top += "<link rel='stylesheet' href='/css/#{sname}.css'/>"
	[top,bottom].join('\n</head>')

receiver_inject = (err,html) ->
	receiver_slides = inject_scripts(html,'reveal_remote')

controller_inject = (err,html) ->
	controller_slides = inject_scripts(html,'reveal_remote','timer')
	controller_slides = inject_style(controller_slides,'rr')

# Go through the supplied directory and use all of its resource directories
# like css,js,lib...
fs.readdir(dir,(err,list) ->
	list.forEach((file) ->
		if file == index
			fs.readFile("#{base_path}/#{dir}/#{file}",'utf8',receiver_inject)
			fs.readFile("#{base_path}/#{dir}/#{file}",'utf8',controller_inject)
		fs.stat("#{base_path}#{dir}/#{file}", (err,stat) ->
			if stat && stat.isDirectory()
				console.log("found #{base_path}#{dir}/#{file}")
				app.use("/#{file}",express.static("#{base_path}/#{dir}/#{file}"))
		)
	)
)

app.get('/',(req,res) ->
	res.writeHeader(200)
	res.end(receiver_slides)
)

app.get('/controller',(req,res) ->
	res.writeHeader(200)
	res.end(controller_slides)
)

server = http.createServer(app).listen(app.get('port'),() ->
	console.log("Server started listening on port #{app.get('port')}\n\n")
	console.log("-------------------------------------------------------")

	if os.type() == "Darwin"
		exec = require('child_process').exec
		exec("open http://#{ip}:#{app.get('port')}")
	else
		console.log("Start your slideshow by going to http://#{ip}:#{app.get('port')} on your browsers computer")

	console.log("Point your controlling browser to http://#{ip}:#{app.get('port')}/controller")
)

# Set up sockets...

io = require('socket.io').listen(server)

app_id = null
remote_map = {}

rnav = (aid,sock) ->
	(data) ->
		sock.emit("reveal_navigate#{aid}",data)

io.sockets.on('connection', (socket) ->
	if app_id
		socket.emit('init',{app_id: app_id})

		sock = remote_map[app_id]

		socket.on("tell_#{app_id}",rnav(app_id,sock))
		sock.on("tell_#{app_id}",rnav(app_id,socket))
		app_id = null
	else
		app_id = parseInt(Math.random(100) * 1000,10)
		remote_map[app_id] = {}

		# Tell the receiver what it's app_id is
		socket.emit('init',{app_id:app_id})
		remote_map[app_id] = socket
)
