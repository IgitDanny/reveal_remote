socket = io.connect("http://#{window.location.hostname}")
phone = navigator.userAgent.match(/iPhone/)
app_id = null

setup = () ->
	socket.on('startup',(data) ->
		socket.emit('init',{phone:phone}))

	socket.on('app_id',(data) ->
		app_id = data['app_id'] unless(app_id)

		socket.on("reveal_navigate#{app_id}",(data) ->
			console.log('got message',data['direction'].toLowerCase())
			switch data['direction'].toLowerCase()
				when "left" then Reveal.navigateLeft()
				when "right" then Reveal.navigateRight()
				when "up" then Reveal.navigateUp()
				when "down" then Reveal.navigateDown()
				when "prev" then Reveal.navigatePrev()
				when "next" then Reveal.navigateNext()
				else console.log('invalid instruction'))
	)

document.addEventListener("DOMContentLoaded",setup)
