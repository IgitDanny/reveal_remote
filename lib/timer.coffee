timer_setup = () ->
	timer = document.createElement('div')
	timer.setAttribute('id','timer')
	document.getElementsByTagName('body')[0].appendChild(timer)
	secs = 0
	addSecond = () ->
	  secs += 1
	  document.getElementById('timer').innerText = (([parseInt(secs/60/60,10),parseInt(secs/60,10)%60,(secs%60)].map (v) -> if v < 10 then '0' + v  else v).join(':'))
	  setTimeout(addSecond,1000)
	addSecond()

document.addEventListener("DOMContentLoaded",timer_setup)
