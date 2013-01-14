MagicScrollWebReader
====================

For live demo see: http://www.magicscroll.net/ScrollTheWeb.html

Readability.js is based on the code originally by Arc Labs.

It is released under the Apache 2 License.  As is the rest of this code.

The icons are taken from the Gnome High Contrast Theme and used under the terms of the creative commons share-alike license.

Touch Control Status
--------------------

Touch controls have been tested on a Samsung Galaxy Tab 7.1, with Android's native browser and Chrome.

http://shaunew.github.com/MagicScrollWebReader/demo.htm

The mouse controls currently emulate the touch controls accurately, but touch motions do not work on a mobile device yet.

Scroll Design
-------------

Listed below are the three possible states that the scroll guide can be
in before the user touches the screen.

* TOP: the scroll guide is at the very top of the screen, meaning the current page has a zero height.
* MID: the scroll guide is somewhere between the top and bottom.
* BOT: the scroll guide is at the very bottom of the screen, meaning the current page has full height.

<pre>
         TOP        MID       BOT
     +========+ +--------+ +--------+   ^
     |        | |        | |        |   | Top Snap/Grab Radius
     |        | |        | |        |   v
     |        | |        | |        |
     |        | |        | |        |   ^
     |        | |========| |        |   | Mid Grab Radius
     |        | |        | |        |   | (relative to current guide)
     |        | |        | |        |   v
     |        | |        | |        |
     |        | |        | |        |   ^
     |        | |        | |        |   | Bottom Snap/Grab Radius
     +--------+ +--------+ +========+   v
</pre>

### On Touch Start

A touch starting within any radii listed above will cause
the scroll guide to snap to the cursor.

In the TOP state, touching within the BOT's radius
should execute "showPrevPage", bringing us to the
BOT state of the previous page.

In the BOT state, touching within the TOP's radius
should execute "showNextPage", bringing us to the
TOP state of the next page.

### On Touch Move:

Any move will drag the scroll guide if it is currently snapped to the cursor.

In the MID state, any move within the radii of the scroll guide
should cause it to snap to the cursor.

### On Touch End:

Any touch ending within the top or bottom radii will snap to that
respective edge.

