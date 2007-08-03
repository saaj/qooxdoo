/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

   ======================================================================

   This class contains code based on the following work:

   * jQuery Dimension Plugin
       http://jquery.com/
       Version 1.1.3

     Copyright:
       (c) 2007, Paul Bakaus & Brandon Aaron

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       Paul Bakaus
       Brandon Aaron

************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

/**
 * Query the location of an arbitrary DOM element in relation to its top
 * level body element. Works in all major browsers:
 *
 * * Mozilla 1.5 + 2.0
 * * Internet Explorer 6.0 + 7.0 (both standard & quirks mode)
 * * Opera 9.2
 * * Safari 3.0 beta
 */
qx.Class.define("qx.html2.element.Location",
{
  statics :
  {
    /**
     * Queries a style property for the given element
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @param style {String} Style property
     * @return {String} Value of given style property
     */
    __style : function(elem, style) {
      return qx.html2.element.Style.getComputed(elem, style);
    },


    /**
     * Queries a style property for the given element and parses it to a integer value
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @param style {String} Style property
     * @return {Integer} Value of given style property
     */
    __num : function(elem, style) {
      return parseInt(qx.html2.element.Style.getComputed(elem, style)) || 0;
    },


    /**
     * Computes the scroll offset of the given element relative to the document
     * <code>body</code>.
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @return {Map} Map which contains the <code>left</code> and <code>top</code> scroll offsets
     */
    __computeScroll : function(elem)
    {
      var left = 0, top = 0;

      // Use faster getBoundingClientRect() if available
      // Hint: The viewport workaround here only needs to be applied for
      // MSHTML currently. Gecko must always use the bottom code block -
      // independently from the availbility of getBoundingClientRect()
      if (qx.html2.client.Engine.MSHTML && elem.getBoundingClientRect)
      {
        // Find window
        var win = qx.html2.node.Util.getDefaultView(elem);

        // Reduce by viewport scrolling.
        // Hint: getBoundingClientRect returns the location of the
        // element in relation to the viewport which includes
        // the scrolling
        left -= qx.html2.Viewport.getScrollLeft(win);
        top -= qx.html2.Viewport.getScrollTop(win);
      }
      else
      {
        // Find body element
        var body = qx.html2.node.Util.getDocument(elem).body;

        // Only the parents are influencing the scroll position
        elem = elem.parentNode;

        // Get scroll offsets
        // stop at the relative node given or
        // stop at the body => the body scroll position is irrelevant
        while (elem && elem != body)
        {
          left += elem.scrollLeft;
          top += elem.scrollTop;

          // One level up (children hierarchy)
          elem = elem.parentNode;
        }
      }

      return {
        left : left,
        top : top
      };
    },


    /**
     * Computes the offset of the given element relative to the document
     * <code>body</code>.
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
     */
    __computeBody : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(elem)
      {
        // Find body element
        var doc = qx.html2.node.Util.getDocument(elem);
        var body = doc.body;

        // Start with the offset
        var left = body.offsetLeft;
        var top = body.offsetTop;

        // Substract the body border
        left -= this.__num(body, "borderLeftWidth");
        top -= this.__num(body, "borderTopWidth");

        // Add the margin when running in standard mode
        if (doc.compatMode === "CSS1Compat")
        {
          left += this.__num(body, "marginLeft");
          top += this.__num(body, "marginTop");
        }

        return {
          left : left,
          top : top
        };
      },

      "webkit" : function(elem)
      {
        // Find body element
        var doc = qx.html2.node.Util.getDocument(elem);
        var body = doc.body;

        // Start with the offset
        var left = body.offsetLeft;
        var top = body.offsetTop;

        // Correct substracted border
        left += this.__num(body, "borderLeftWidth");
        top += this.__num(body, "borderTopWidth");

        // Add the margin when running in standard mode
        if (doc.compatMode === "CSS1Compat")
        {
          left += this.__num(body, "marginLeft");
          top += this.__num(body, "marginTop");
        }

        return {
          left : left,
          top : top
        };
      },

      "gecko" : function(elem)
      {
        // Find body element
        var body = qx.html2.node.Util.getDocument(elem).body;

        // Start with the offset
        var left = body.offsetLeft;
        var top = body.offsetTop;

        // Correct substracted border (only in content-box mode)
        if (qx.html2.element.Util.getBoxSizing(body) !== "border-box")
        {
          left += this.__num(body, "borderLeftWidth");
          top += this.__num(body, "borderTopWidth");

          // For some unknown reason we must add the border two times
          // when there is no absolute positioned element in the DOM tree

          // This is not neededd if the offset is computed using
          // <code>getBoundingClientRect</code>
          if (!elem.getBoundingClientRect)
          {
            var hasAbs;

            while (elem)
            {
              if (this.__style(elem, "position") === "absolute" || this.__style(elem, "position") === "fixed")
              {
                hasAbs = true;
                break;
              }

              elem = elem.offsetParent;
            }

            if (!hasAbs)
            {
              left += this.__num(body, "borderLeftWidth");
              top += this.__num(body, "borderTopWidth");
            }
          }
        }

        return {
          left : left,
          top : top
        };
      },


      // At the moment only correctly supported by Opera
      "default" : function(elem)
      {
        // Find body element
        var body = qx.html2.node.Util.getDocument(elem).body;

        // Start with the offset
        var left = body.offsetLeft;
        var top = body.offsetTop;

        return {
          left : left,
          top : top
        };
      }
    }),


    /**
     * Computes the sum of all offsets of the given element node.
     *
     * Traditionally this is a loop which goes up the whole parent tree
     * and sums up all found offsets.
     *
     * But both <code>mshtml</code> and <code>gecko >= 1.9</code> support
     * <code>getBoundingClientRect</code> which allows a
     * much faster access to the offset position.
     *
     * Please note: When gecko 1.9 does not use the <code>getBoundingClientRect</code>
     * implementation, and therefor use the tranditional offset calculation
     * the gecko 1.9 fix in <code>__computeBody</code> must not be applied.
     *
     * @type static
     * @signature function(elem)
     * @param elem {Element} DOM element to query
     * @return {Map} Map which contains the <code>left</code> and <code>top</code> offsets
     */
    __computeOffset : qx.core.Variant.select("qx.client",
    {
      "mshtml|webkit" : function(elem)
      {
        var doc = qx.html2.node.Util.getDocument(elem);

        // Use faster getBoundingClientRect() if available
        // Note: This is not yet supported by Webkit.
        if (elem.getBoundingClientRect)
        {
          var rect = elem.getBoundingClientRect();

          var left = rect.left;
          var top = rect.top;

          // Internet Explorer (at least version 7.0) adds the border
          // when running in standard mode
          if (doc.compatMode === "CSS1Compat")
          {
            left -= this.__num(elem, "borderLeftWidth");
            top -= this.__num(elem, "borderTopWidth");
          }
        }
        else
        {
          // Offset of the incoming element
          var left = elem.offsetLeft;
          var top = elem.offsetTop;

          // Start with the first offset parent
          elem = elem.offsetParent;

          // Stop at the body
          var body = doc.body;

          // Border correction is only needed for each parent
          // not for the incoming element itself
          while (elem && elem != body)
          {
            // Add node offsets
            left += elem.offsetLeft;
            top += elem.offsetTop;

            // Fix missing border
            left += this.__num(elem, "borderLeftWidth");
            top += this.__num(elem, "borderTopWidth");

            // One level up (offset hierarchy)
            elem = elem.offsetParent;
          }
        }

        return {
          left : left,
          top : top
        }
      },

      "gecko" : function(elem)
      {
        // Use faster getBoundingClientRect() if available (gecko >= 1.9)
        if (elem.getBoundingClientRect)
        {
          var rect = elem.getBoundingClientRect();

          // Firefox 3.0 alpha 6 (gecko 1.9) returns floating point numbers
          // use Math.round() to round them to style compatible numbers
          // MSHTML returns integer numbers, maybe gecko will fix this in
          // the future, too
          var left = Math.round(rect.left);
          var top = Math.round(rect.top);
        }
        else
        {
          var left = 0;
          var top = 0;

          // Stop at the body
          var body = qx.html2.node.Util.getDocument(elem).body;
          var util = qx.html2.element.Util;

          if (util.getBoxSizing(elem) !== "border-box")
          {
            left -= this.__num(elem, "borderLeftWidth");
            top -= this.__num(elem, "borderTopWidth");
          }

          while (elem && elem !== body)
          {
            // Add node offsets
            left += elem.offsetLeft;
            top += elem.offsetTop;

            // Mozilla does not add the borders to the offset
            // when using box-sizing=content-box
            if (util.getBoxSizing(elem) !== "border-box")
            {
              left += this.__num(elem, "borderLeftWidth");
              top += this.__num(elem, "borderTopWidth");
            }

            // Mozilla does not add the border for a parent that has
            // overflow set to anything but visible
            if (elem.parentNode && this.__style(elem.parentNode, "overflow") != "visible")
            {
              left += this.__num(elem.parentNode, "borderLeftWidth");
              top += this.__num(elem.parentNode, "borderTopWidth");
            }

            // One level up (offset hierarchy)
            elem = elem.offsetParent;
          }
        }

        return {
          left : left,
          top : top
        }
      },

      // At the moment only correctly supported by Opera
      "default" : function(elem)
      {
        var left = 0;
        var top = 0;

        // Stop at the body
        var body = qx.html2.node.Util.getDocument(elem).body;

        // Add all offsets of parent hierarchy, do not include
        // body element.
        while (elem && elem !== body)
        {
          // Add node offsets
          left += elem.offsetLeft;
          top += elem.offsetTop;

          // One level up (offset hierarchy)
          elem = elem.offsetParent;
        }

        return {
          left : left,
          top : top
        }
      }
    }),


    /**
     * Computes the location of the given element in context of
     * the document dimenions.
     *
     * Supported modes:
     *
     * * <code>margin</code>: Align to the margin of the given element (incl. padding, border and margin)
     * * <code>box</code> (default): Align to the box of the given element (incl. padding and border)
     * * <code>border</code>: Align to the border of the given element (incl. padding)
     * * <code>content</code>: Align to the content of the given element (does not contain border, padding or margin)
     *
     * @type static
     * @param elem {Element} DOM element to query
     * @param mode {String} A supported option. See comment above.
     * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
     *   <code>right</code> and <code>bottom</code> which contains the distance
     *   of the element relative to the document.
     */
    get : function(elem, mode)
    {
      var body = this.__computeBody(elem);

      if (elem.tagName == "BODY")
      {
        var left = body.left;
        var top = body.top;
      }
      else
      {
        var offset = this.__computeOffset(elem);
        var scroll = this.__computeScroll(elem);

        var left = offset.left + body.left - scroll.left;
        var top = offset.top + body.top - scroll.top;
      }

      // qx.core.Init.getInstance().debug("Details left: " + offset.left + " | " + body.left + " | " + scroll.left);
      // qx.core.Init.getInstance().debug("Details top: " + offset.top + " | " + body.top + " | " + scroll.top);

      if (mode)
      {
        switch(mode)
        {
          case "margin":
            left -= this.__num(elem, "marginLeft");
            top -= this.__num(elem, "marginTop");
            break;

          case "content":
            left += this.__num(elem, "paddingLeft");
            top += this.__num(elem, "paddingTop");
            // no break here

          case "border":
            left += this.__num(elem, "borderLeftWidth");
            top += this.__num(elem, "borderTopWidth");
            break;
        }
      }

      return {
        left : left,
        top : top,
        right : left + elem.offsetWidth,
        bottom : top + elem.offsetHeight
      };
    },


    /**
     * Returns the distance between two DOM elements
     *
     * @type static
     * @param elem1 {Element} First element
     * @param elem2 {Element} Second element
     * @return {Map} Returns a map with <code>left</code> and <code>top</code>
     *   which contains the distance of the elements from each other.
     */
    getRelative : function(elem1, elem2)
    {
      var loc1 = this.get(elem1);
      var loc2 = this.get(elem2);

      return {
        left : loc1.left - loc2.left,
        top : loc1.top - loc2.top
      };
    }
  }
});
