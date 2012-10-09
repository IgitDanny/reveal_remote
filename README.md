# Reveal Remote

Reveal Remote is a simple tool that you point at a reveal.js presentation.
It will tell you where to point your phone so that it can control the presentation
via websockets

# How to Install (locally)
```$
cd reveal_remote
npm install
```

# How to Use (locally)

```$
node index /path/to/presenation
Point your controlling browser to http://{ip_address}:{port}/controller
```
## or

```$
coffee index.coffee /path/to/presentation
Point your controlling browser to http://{ip_address}:{port}/controller
```

# Todo
-  Add controller end stuff, like a timer, and/or notes.  Yes I know there's a presenter notes plugin...

