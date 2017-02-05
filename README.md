# GamesRoom

## TODO: 
### CodeNames
- ~~role/team updators & component~~
- ~~component to give clue~~
- __test with 4 arbitary users (current)__
- add chat to game 
- jsdoc the various functions
- document the package
- ~~should not subscribe to hiddenTeam at the start, 
only after game start and is cluegiver is confirmed~~
- ~~cluegiver is to see the colours~~
- confirm box for giving clues
- confirm box for changing team after game start
- ~~refactor schema due to DDP MergeBox limitations~~ https://github.com/meteor/meteor/issues/998
- ~~change team when clues run out, pass turn~~
- ~~cluegiver cannot pass turn~~
- (unsure whats wrong, doesnt occur all the time) fix subscription cluegiver not available, not reactive
when game is just started, but fine if role is changed

### Chat
- react ui component for chat, some sort of 
scrollable collapseable component

### Room
- component to select different games
- cleanup display of various stuff
- add session for currently active game
- ~~allow public rooms to be accessible directly via url, publication~~
- add a go back/lobby for room not found
- ~~add a join room if not inside~~
- disable room functions unless joined room
- ~~when in room, then somewhere else game is created, ui doesnt update new game list~~
(subscription issue)

### Router
- ~~unable to render when visiting the url directly~~
 (reason is simply because publication checks for whether user is supposed to be inside
 for privacy reasons, routing is fine)
- update react router

### App
- more tablet/phone friendly

### Note
- publication of array of collections is only safe if the secondary collections are static
with respect to the primary collection item since secondary collections are not tracked
i.e. room & chat is fine, but room & games are not
- for publication of collection with restricted fields, fields MUST be top level due to DDP
MergeBox limitations https://github.com/meteor/meteor/issues/998



## TODO (OLD, may still be relevant, to be reviewed):
* ~~create define methods for chat class~~
* ~~split chat & message js file~~
* ~~create client-side class for chat~~
* ~~add publication for chat~~
* ~~add collection as part of class static variable~~
* ~~add unblock to method calls~~
* ~~add documentation for chat-server package~~
* add documentation for chat-client package
* add documentation for message package
* split Chat and Message package
* test chat package
* create define methods for room class
* create client-side class for room
* add documentation for room package
* test room package
* create players/users package
* update Chat tests when players/users package is written
* add client-side collection for simulation
* consider add lodash
