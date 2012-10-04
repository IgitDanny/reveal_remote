socket = io.connect("http://__hostname__")
phone = true
app_id = null

setup = () ->
	socket.on('startup',(data) ->
		socket.emit('init',{phone:phone}))

	socket.on('app_id',(data) ->
		app_id = data['app_id'] unless(app_id)
		upgradeNav = () ->
			if Reveal and Reveal.navigateNext
				document.addEventListener("slidechanged",() ->
					socket.emit("tell_browser#{app_id}",Reveal.getIndices())
				)
			else
				# Keep waiting until Reveal is setup
				setTimeout(upgradeNav,200)

		setTimeout(upgradeNav,200)
	)

document.addEventListener("DOMContentLoaded",setup)
