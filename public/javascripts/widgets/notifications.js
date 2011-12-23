
/*   Copyright (c) 2010-2011, Diaspora Inc.  This file is
*   licensed under the Affero General Public License version 3 or later.  See
*   the COPYRIGHT file.
*/

(function() {
  var Notifications = function() {
    var self = this;
    
    this.subscribe("widget/ready", function(evt, notificationArea, badge) {
      $.extend(self, {
        badge: badge,
        count: parseInt(badge.html()) || 0,
        notificationArea: notificationArea
      });

      $(".stream_element.unread,.stream_element.read").live("mousedown", function() {
        if ( $(this).hasClass("unread") ) {
          self.decrementCount();
          $(this).removeClass("unread").addClass( "read" )
        }
        else {
          self.incrementCount();
          $(this).removeClass("read").addClass( "unread" )
        }
        $.ajax({
          url: "notifications/" + $(this).data("guid"),
          data: { unread: $(this).hasClass("unread") },
          type: "PUT"
        });
      });

      $("a.more").live("click", function(evt) {
        evt.preventDefault();
        $(this).hide()
          .next(".hidden")
          .removeClass("hidden");
      });
    });
    
    this.showNotification = function(notification) {
      $(notification.html).prependTo(this.notificationArea)
				.fadeIn(200)
				.delay(8000)
				.fadeOut(200, function() {
	  			$(this).detach();
				});

      if(typeof notification.incrementCount === "undefined" || notification.incrementCount) {
				this.incrementCount();
      }
    };

    this.changeNotificationCount = function(change) {
      self.count += change;

      if(self.badge.text() !== "") {
				self.badge.text(self.count);
        $( ".notification_count" ).text(self.count);

				if(self.count === 0) {
	  			self.badge.addClass("hidden");
          $( ".notification_count" ).removeClass("unread");
				}
				else if(self.count === 1) {
	  			self.badge.removeClass("hidden");
          $( ".notification_count" ).addClass("unread");
				}
      }
    };

    this.decrementCount = function() {
      self.changeNotificationCount(-1);
    };

    this.incrementCount = function() {
      self.changeNotificationCount(1);
    };
  };

  Diaspora.Widgets.Notifications = Notifications;
})();
