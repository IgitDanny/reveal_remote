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
app.set('port',4101)

app.get('/js/slide_receiver.js',(req,res) ->
	fs.readFile("#{__dirname}/lib/slide_receiver.js",(err,content)->
		res.writeHeader(200)
		res.end(content)
	)
)

app.get('/js/slide_controller.js',(req,res) ->
	fs.readFile("#{__dirname}/lib/slide_controller.js",'utf8',(err,content)->
		res.writeHeader(200)
		res.end(content.replace(/__hostname__/,"#{ip}:#{app.get('port')}"))
	)
)

customReveal = (req,res) ->
	fs.readFile("#{__dirname}/lib/reveal.js",'utf8',(err,content) ->
		res.writeHeader(200)
		res.end(content)
	)

app.get('*/reveal.js',customReveal)
app.get('*/reveal.min.js',customReveal)

dir = optimist.argv._[0]
base_path = '' if dir.charAt(0) == "/" 
index = optimist.argv['index']||'index.html'
browser_slides = ''
phone_slides = ''

inject_scripts = (html,sname) ->
	[top,bottom] = html.split('</head>')
	top += '<script type="text/javascript" src="/socket.io/socket.io.js"></script>'
	top += "<script type='text/javascript' src='/js/#{sname}.js'></script>"
	[top,bottom].join('\n</head>')

browser_inject = (err,html) ->
	browser_slides = inject_scripts(html,'slide_receiver')

phone_inject = (err,html) ->
	phone_slides = inject_scripts(html,'slide_controller')

# Go through the supplied directory and use all of its resource directories
# like css,js,lib...
fs.readdir(dir,(err,list) ->
	list.forEach((file) ->
		if file == index
			fs.readFile("#{base_path}/#{dir}/#{file}",'utf8',browser_inject)
			fs.readFile("#{base_path}/#{dir}/#{file}",'utf8',phone_inject)
		fs.stat("#{base_path}#{dir}/#{file}", (err,stat) ->
			if stat && stat.isDirectory()
				console.log("found #{base_path}#{dir}/#{file}")
				app.use("/#{file}",express.static("#{base_path}/#{dir}/#{file}"))
		)
	)
)


app.get('/',(req,res) ->
	res.writeHeader(200)
	res.end(browser_slides)
)

app.get('/phone',(req,res) ->
	res.writeHeader(200)
	res.end(phone_slides)
)

# Ok, startup!
server = http.createServer(app).listen(app.get('port'),() ->
	console.log("Server started listening on port #{app.get('port')}\n\n")
	console.log("-------------------------------------------------------")

	if os.type() == "Darwin"
		exec = require('child_process').exec
		exec("open http://#{ip}:#{app.get('port')}")
	else
		console.log("Start your slideshow by going to http://#{ip}:#{app.get('port')} on your browsers computer")

	console.log("Point your phone to http://#{ip}:#{app.get('port')}/phone")
)

# Set up sockets...

io = require('socket.io').listen(server)

app_id = null
remote_map = {}
io.sockets.on('connection', (socket) ->
	socket.emit('startup')
	# Tell the client to "init" and the client will
	#   (if it's a browser) send back an app_id
	#   (if it's a phone) hook up with a browser if there's an app_id, or do nothing 
	socket.on('init',(data) ->
		if data.phone
			if app_id
				remote_map[app_id]['phone'] = socket
				socket.app_id = app_id
				socket.emit('app_id',{app_id: app_id})

				sock = remote_map[app_id]['computer']

				socket.on("tell_browser#{app_id}", ((aid,sock) ->
					(data) ->
						sock.emit("reveal_navigate#{aid}",data)
				)(app_id,sock))
		else
			app_id = parseInt(Math.random(100) * 1000,10)
			remote_map[app_id] = {computer:null,phone:null}
			socket.app_id = app_id

			# Tell the browser what it's app_id is
			socket.emit('app_id',{app_id:app_id})
			remote_map[app_id]['computer'] = socket))
