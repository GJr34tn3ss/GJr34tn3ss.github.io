/**
 * main.js — Portfolio interactivity for Gorden Jin
 *
 * Currently handles: the Contact nav button dropdown.
 * The Home and 中文 buttons are disabled in HTML and require no JS.
 */

/*
  DOMContentLoaded fires when the HTML is fully parsed and the DOM is ready.
  The <script> tag is already at the bottom of <body>, so the DOM IS ready
  when this file runs — but the event listener is kept as a clear signal of
  intent and a defensive guard against future script-tag repositioning.
*/
document.addEventListener('DOMContentLoaded', () => {

  const contactBtn = document.getElementById('contact-btn');
  const dropdown   = document.getElementById('contact-dropdown');

  /*
    Guard: if either element is missing (e.g. future template change removes
    the contact section), bail out silently rather than throwing a TypeError
    that would break any future JS added below this block.
  */
  if (!contactBtn || !dropdown) return;


  /* -------------------------------------------------------------------------
     OPEN / CLOSE HELPERS
     Separated into named functions so the toggle handler, outside-click
     handler, and Escape handler all call the same code path — no duplication.
  -------------------------------------------------------------------------- */

  function openDropdown() {
    /*
      Two-step process to get the CSS transition to fire:

      Step 1: Remove [hidden] so the element enters the layout.
              At this point it's in the DOM but still opacity:0 (invisible).

      Step 2: requestAnimationFrame defers adding .is-open until the next
              paint frame. This gives the browser time to register the element
              at opacity:0 and translateY(-6px) *before* we change those values.
              Without rAF, the browser collapses steps 1 and 2 into the same
              frame and skips straight to the final state — no animation.
    */
    dropdown.removeAttribute('hidden');
    requestAnimationFrame(() => {
      dropdown.classList.add('is-open');
    });

    /* Tell screen readers the menu is now expanded */
    contactBtn.setAttribute('aria-expanded', 'true');

    /*
      Move keyboard focus into the first menu item immediately.
      This means keyboard users don't have to Tab through the entire
      dropdown after opening it — they land on the first option.
    */
    const firstItem = dropdown.querySelector('[role="menuitem"]');
    if (firstItem) firstItem.focus();
  }


  function closeDropdown() {
    dropdown.classList.remove('is-open');
    contactBtn.setAttribute('aria-expanded', 'false');

    /*
      Wait for the CSS opacity/transform transition to finish before
      adding [hidden] back. Adding [hidden] immediately would cut the
      closing animation short.

      { once: true } automatically removes this listener after it fires once —
      no manual removeEventListener needed, and no risk of it stacking up if
      closeDropdown() is called multiple times.
    */
    dropdown.addEventListener('transitionend', () => {
      dropdown.setAttribute('hidden', '');
    }, { once: true });
  }


  /* -------------------------------------------------------------------------
     TOGGLE ON BUTTON CLICK
  -------------------------------------------------------------------------- */
  contactBtn.addEventListener('click', (e) => {
    /*
      stopPropagation prevents this click from immediately bubbling up to the
      document-level "outside click" listener (registered below), which would
      close the dropdown the same frame it was opened.
    */
    e.stopPropagation();

    const isOpen = contactBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });


  /* -------------------------------------------------------------------------
     CLOSE ON OUTSIDE CLICK
     Clicking anywhere outside the dropdown (or its trigger button) closes it.
     Because the button uses stopPropagation, its own clicks never reach here.
  -------------------------------------------------------------------------- */
  document.addEventListener('click', () => {
    if (contactBtn.getAttribute('aria-expanded') === 'true') {
      closeDropdown();
      /*
        Don't return focus to contactBtn here — the user clicked elsewhere
        intentionally, so moving focus would be disruptive.
      */
    }
  });


  /* -------------------------------------------------------------------------
     CLOSE ON ESCAPE KEY
     Required by WCAG 2.1 SC 4.1.3 and the WAI-ARIA menu button pattern:
     pressing Escape while a menu is open must close it and return focus
     to the control that opened it.
  -------------------------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactBtn.getAttribute('aria-expanded') === 'true') {
      closeDropdown();
      contactBtn.focus(); /* return focus to the trigger — standard ARIA behaviour */
    }
  });


  /* -------------------------------------------------------------------------
     ARROW KEY NAVIGATION INSIDE THE DROPDOWN
     WAI-ARIA menu button pattern: ArrowDown/Up move focus between items.
     This is expected behaviour for menus by screen reader users.
  -------------------------------------------------------------------------- */
  dropdown.addEventListener('keydown', (e) => {
    /* Only handle keys we care about; let others (Enter, Space) work naturally */
    if (!['ArrowDown', 'ArrowUp', 'Tab'].includes(e.key)) return;

    const items = [...dropdown.querySelectorAll('[role="menuitem"]')];
    const currentIndex = items.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault(); /* prevent page scroll */
      /*
        Modulo wraps from last item back to first.
        Example with 2 items: (1 + 1) % 2 = 0 → wraps to first item.
      */
      const nextIndex = (currentIndex + 1) % items.length;
      items[nextIndex].focus();

    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); /* prevent page scroll */
      /* Add items.length before modulo to handle -1 (no item focused yet) */
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      items[prevIndex].focus();

    } else if (e.key === 'Tab') {
      /*
        When a keyboard user presses Tab while inside the menu, close it.
        We do NOT call preventDefault here — we let Tab move focus naturally
        to whatever comes next in the tab order. This is correct behaviour:
        the user is deliberately leaving the menu.
      */
      closeDropdown();
    }
  });

});
