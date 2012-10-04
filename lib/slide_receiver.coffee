socket = io.connect("http://#{window.location.hostname}")
app_id = null

setup = () ->
	socket.on('startup',(data) ->
		socket.emit('init',{phone:false}))

	socket.on('app_id',(data) ->
		app_id = data['app_id'] unless(app_id)

		socket.on("reveal_navigate#{app_id}",(data) ->
			Reveal.navigateTo(data.h,data.v))
	)

document.addEventListener("DOMContentLoaded",setup)
