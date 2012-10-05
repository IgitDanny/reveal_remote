socket = io.connect("http://__hostname__")
app_id = null

setup = () ->
	from_socket = false
	
	socket.on('startup',() ->	socket.emit('init'))

	socket.on('app_id',(data) ->
		app_id = data['app_id'] unless(app_id)
		socket.on("reveal_navigate#{app_id}",(data) ->
			from_socket = true
			Reveal.navigateTo(data.h,data.v))
	
		document.addEventListener("slidechanged",() ->
			socket.emit("tell_#{app_id}",Reveal.getIndices()) unless from_socket
			from_socket = false
		)
	)
	
	
document.addEventListener("DOMContentLoaded",setup)
