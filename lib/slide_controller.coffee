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
				for direction in ["Left","Right","Up","Down","Prev","Next"]
					document.addEventListener("navigate#{direction}",((d) ->
						return () ->
							socket.emit("tell_browser#{app_id}",{direction:d})
					)(direction))
			else
				# Keep waiting until Reveal is setup
				setTimeout(upgradeNav,200)

		setTimeout(upgradeNav,200)
	)

document.addEventListener("DOMContentLoaded",setup)
