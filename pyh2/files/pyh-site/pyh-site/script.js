/* ==========================================================================
   PYH - Phenomenal Youth Hub | script.js
   This file controls what the page DOES (behaviour and animation).

   It has two parts:
     1. The sign-up form message
     2. The orbit animation (circles moving along the half ring)
   ========================================================================== */


/* ---------- 1. SIGN-UP FORM ----------
   When someone presses "Sign up", we stop the page from reloading
   and show a thank-you message instead.
   NOTE: this does not save the email anywhere yet. Saving emails needs a
   backend (a server), which you can add later. */
document.getElementById("form").addEventListener("submit", function (e) {
  e.preventDefault();   // stops the browser's normal form behaviour (page reload)
  document.getElementById("msg").textContent = "Thank you. You are on the list.";
  this.reset();         // clears the email box
});


/* ---------- 2. ORBIT ANIMATION ----------
   Idea: each circle has a "progress" number p between 0 and 1.
     p = 0    -> start of the arc (bottom)
     p = 0.5  -> middle of the arc (left side)
     p = 1    -> end of the arc (top)
   As time passes, p grows. When it reaches 1 it wraps back to 0,
   so the circle disappears at the top and reappears at the bottom.
   From p we work out where the circle is, how big it is, and how visible it is.

   The code is wrapped in (function () { ... })(); so its variables stay
   private and do not clash with other code. */
(function () {

  // --- Find the things we need on the page ---
  var orbit = document.querySelector(".orbit");   // the invisible square holding the arc
  if (!orbit) return;                             // if it is not on the page, stop here

  // All the circles (each has the class "badge"), turned into a normal list
  var badges = Array.prototype.slice.call(orbit.querySelectorAll(".badge"));

  // Did the person ask their device to reduce motion? (true or false)
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Settings you can change ---
  var LAP = 24000;     // time for one circle to travel the whole arc, in milliseconds
                       // (24000 = 24 seconds; bigger number = slower)
  var RADIUS = 0.38;   // size of the arc as a fraction of the orbit size
                       // (bigger number = bigger curve)
  var FADE = 0.12;     // how much of the arc is used to fade in and out
                       // (0.12 = the first and last 12%)

  var size = 0;        // current width of the orbit, filled in by measure()

  // Reads the orbit's current width in pixels
  function measure() {
    size = orbit.clientWidth;
  }

  // Makes a number between 0 and 1 change gently (slow at the ends, faster in the
  // middle) instead of in a straight line. This makes the fade look smooth.
  function smooth(x) {
    return x * x * (3 - 2 * x);
  }

  // Puts every circle in the right place for the time "t" (in milliseconds)
  function place(t) {
    var c = size / 2;        // the centre of the orbit (same for x and y)
    var r = size * RADIUS;   // the radius of the arc in pixels

    badges.forEach(function (b, i) {   // i = 0, 1, 2 for the three circles

      // 1) PROGRESS: how far along the arc this circle is (0 to 1).
      //    "% 1" wraps the number back to 0 after it reaches 1.
      //    "i / badges.length" spaces the circles evenly apart.
      //    With reduced motion we use fixed positions so nothing moves.
      var p = reduce ? [0.2, 0.5, 0.8][i] : ((t / LAP) + i / badges.length) % 1;

      // 2) ANGLE: turns progress into an angle on a circle.
      //    Starts at the bottom (90 degrees) and moves half a turn (180 degrees)
      //    up to the top. Angles here are in radians (Math.PI = 180 degrees).
      var a = Math.PI / 2 + Math.PI * p;

      // 3) VISIBILITY (opacity): 0 at the very start and end of the arc,
      //    1 everywhere else. This is the fade in and fade out.
      var vis = reduce ? 1 : smooth(Math.max(0, Math.min(1, p / FADE, (1 - p) / FADE)));

      // 4) POSITION: cos and sin turn the angle into x and y on the circle.
      //    We subtract half the circle's width so its CENTRE sits on the arc,
      //    not its top-left corner.
      var w = b.offsetWidth;
      var bob = reduce ? 0 : Math.sin(t / 1400 + i * 2) * size * 0.01;   // tiny up-and-down floating
      var x = c + r * Math.cos(a) - w / 2;
      var y = c + r * Math.sin(a) - w / 2 + bob;

      // 5) SIZE: Math.sin(PI * p) is 0 at the ends and 1 in the middle.
      //    So the circle is small when it appears, biggest in the middle,
      //    and small again when it disappears.
      var m = reduce ? 1 : Math.sin(Math.PI * p);
      var sc = 0.35 + 0.65 * m;   // scale from 35% (smallest) up to 100% (biggest)

      // 6) APPLY everything to the circle on the page
      b.style.opacity = vis;
      b.style.transform = "translate(" + x + "px," + y + "px) scale(" + sc + ")";
    });
  }

  // Runs again and again (about 60 times a second) to keep things moving.
  // "now" is the time in milliseconds given by the browser.
  function frame(now) {
    place(now);
    requestAnimationFrame(frame);   // ask the browser to call frame() again for the next screen refresh
  }

  // --- Start everything ---
  measure();                                   // read the size once at the start
  window.addEventListener("resize", function () {   // and again if the window size changes
    measure();
    place(performance.now());
  });
  place(performance.now());                    // draw the first position straight away
  if (!reduce) requestAnimationFrame(frame);   // start the animation (unless motion is reduced)

})();
