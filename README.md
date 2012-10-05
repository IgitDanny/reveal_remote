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
coffee index.coffee /path/to/presentation
Point your phone to http://{ip_address}:4101/phone
```

# How to Install (when I get it published)
```$
npm install -g reveal_remote
```

# How to Use
```$
reveal_remote my_presentation/
Point your phone to http://{ip_address}:4101/phone
```

# Todo
-  Add controller end stuff, like a timer, and/or notes.  Yes I know there's a presenter notes plugin...

