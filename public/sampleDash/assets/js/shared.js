var stepLabels = ["NOT SET - REQUIRES ATTENTION",
                  "Created First Prototype",
                  "Loaded Initial Data",
                  "Downloaded Demo",
                  "Validated Initial Results",
                  "Updated Parameters",
                  "Reinstalled Demo",
                  "Engaged Thrusters",
                  "Success Verified",
                  "Incorporated Feedback",
                  "Continued Support"
];           
// These are materialize color class names we use for the steps.
var stepColors = ["",
              "red",
              "amber darken-4",
              "amber darken-3",
              "amber darken-2",
              "amber darken-1",
              "yellow",
              "green accent-3",
              "blue"

];
// settings used to draw graphs
var graphOptions = {
  vAxis: {
    minValue: 0,
    gridlines: {
        color: 'white'
    }
  },
  chartArea: {'width': '85%', 'height': '80%'},
  legend: 'in',
  animation: {
    startup:true,
    duration: 1000,
    easing: 'out'
  }
}

// variables used for sorting systems
var sortAscending = true;
var currentSortFunc = null;

// A shorthand function for constructing a google chart.
function drawChart(data, options, chartDiv) {
  var chart = new google.visualization.AreaChart(document.getElementById(chartDiv));
  chart.draw(google.visualization.arrayToDataTable(data), options);
}

/************************************************************************************
 * SECTION: API INTERACTIONS
 * Contains functions used to pull down and handle data from other places.
 * Currently, that means our internal endpoints and the CRM API.
 */

/**
 * Returns the base auth payload for all requests to our internal API endpoints.
 */
function getBasePayload() {
  // Some code removed for sample version.
  return {};
}

/**
 * Used as the success action for post requests that edit data.
 * Reloads the page so that the new edited data is displayed.
 */
function onSuccessfulEdit(data) {
  window.location.reload();
}

/**
 * General purpose function for communicating with our internal API endpoints.
 * Boots you back to the login screen if auth doesn't check out,
 * alerts with any other errors that arise.
 * Accepts:
 * A string representing which endpoint to post to
 * A payload of auth info and any additional data such as an appID
 * A callback function to handle the returned data
 */
function sendPayload(endpoint, payload, onSuccess) {
  /* Not used for sample website.
  var postURL = "POST_URL";
  $.post(postURL + endpoint, payload).done(function (data, status, xhr) {
    console.log(data);
    if (data.status == 200) {
      onSuccess(data);
    } else if (data.status == 500) {
      //boot user back to login
      window.location.assign('../');
    } else {
      alert("Customer database returned error " + data.status + ". Are you logged in?");
    }
  }).fail(function() {
    alert("Error: Couldn't connect to customer database");
  });
  */
  Materialize.toast("Functionality disabled for sample version.", 4000);
}

/**
 * Loads a deal activity ("touchpoint") from the CRM API, attaches
 * it as a paramater to a passed-in customer object so that the customer can
 * in the future be sorted by touchpoint date, and puts a string
 * representation of the loaded touchpoint into the DOM through touchPointElement.
 * If the touchpoint can't be loaded, an error message gets put into
 * touchPointElement instead.
 * Accepts a CRM API token for the organization, a customer object,
 * and a DOM element where the touchpoint should go.
 */

function loadAndConstructTouchPoint(token, customer, touchPointElement) {
  var getURL = "CRM_URL" + customer.status.CRMID + token;
  $.get(getURL).done(function (data, status, xhr) {
    if (data.success) {
      customer.touchPoint = data.data[0]; // first touchpoint
      var dateStr = moment(customer.touchPoint.due_date, "YYYY-MM-DD").format("MMM D, YYYY");
      if (customer.touchPoint.done == false) {
        touchPointElement.text(customer.touchPoint.subject + " on " + dateStr);
        touchPointElement.attr("href", "CRM_LINK"
                                        + customer.status.CRMID);
      }
    } else {
      touchPointElement.text("ERROR: CRM API connection unsuccessful.");
      touchPointElement.css("color", "red");
    }
  }).fail(function () {
    touchPointElement.text("ERROR: Could not connect to CRM API for deal ID " +  customer.status.CRMID);
    touchPointElement.css("color", "red");
  });
}
/************************************************************************************/


/************************************************************************************
 * SECTION: SORTING FUNCTIONS
 * Contains functions used to compare objects and sort DOM elements, like
 * cards in the dashboard or history items in the customer page.
 */

/**
 * Comparator function for customer objects, returns result
 * based on customer name.
 */
function compareCustomersByName(a, b) {
  var progressDiff = a.name.localeCompare(b.name);
  return sortAscending ? progressDiff : -1 * progressDiff;
}

/**
 * Comparator function for customer objects, returns result
 * based on customer status.
 */
function compareCustomersByStatus(a, b) {
  var progressDiff = a.status.progress - b.status.progress;
  return sortAscending ? progressDiff : -1 * progressDiff;
}

/**
 * Comparator function for customer objects, returns result
 * based on touchpoint date, if one is loaded and if the touchpoint
 * is not done yet.
 */
function compareCustomersByTouchpoint(a, b) {
  // check if undefined, then if done
  // that way touchPoints that are done show up before ones with errors
  if (a.touchPoint == undefined && b.touchPoint == undefined) {
    return 0;
  } else if (a.touchPoint == undefined) {
    return 1;
  } else if (b.touchPoint == undefined) {
    return -1;
  } else if (a.touchPoint.done && b.touchPoint.done) {
    return 0;
  } else if (a.touchPoint.done) {
    return 1;
  } else if (b.touchPoint.done) {
    return -1;
  }
  var timeDiff = moment(a.touchPoint.due_date + " " + a.touchPoint.due_time,
                        "YYYY-MM-DD HH:mm").valueOf()
               - moment(b.touchPoint.due_date + " " + b.touchPoint.due_time,
                        "YYYY-MM-DD HH:mm").valueOf();
  return sortAscending ? timeDiff : -1 * timeDiff;
}

/**
 * Comparator function for customer history items, returns result
 * based on item timestamp.
 */
function compareHistoryItemsByTime (a, b) {
  var sortValue = moment(a.timestamp).valueOf() - moment(b.timestamp).valueOf()
  return sortAscending ? -1 * sortValue : sortValue;
}

/**
 * Comparator function for customer history items, returns result
 * based on string comparison of the associated stakeholder.
 */
function compareHistoryItemsByStakeholder (a, b) {
  var aName = getStakeholderFromHistoryItem(a);
  var bName = getStakeholderFromHistoryItem(b);
  var sortValue = aName.localeCompare(bName);
  return sortAscending ? sortValue : -1 * sortValue;
}

/**
 * Accepts a DOM element which is assumed to represent a customer in
 * the customers array and have an id corresponding to the customers
 * appID. Returns the actual customer item that has this appID.
 */
function getCustomerFromElement(appElem) {
  var cardID = $(appElem).attr("id");
  return window.dashData.apps.find(function (app) {
    return app.appID == cardID;
  });
}

/**
 * Accepts a DOM element which is assumed to represent an item in
 * the customer history array and have an id corresponding to its
 * index in the array. Returns the actual history item at this index.
 */
function getHistoryItemFromElement(itemElem) {
  // itemElem's id is its index in history array
  return window.customerData.history[$(itemElem).attr("id")];
}

/**
 * Sorts the DOM elements in a div according to their corresponding
 * objects in some internal array. Ex - sort elements in history table
 * by their corresponding history items in memory.
 *
 * Accepts:
 * divToSort - the div containing the elements to be sorted
 * compareFunc - A function to compare the objects (ex. customer object)
 * whose parameters are used as the basis for the sort
 * objFromElementFunc - A function to get said object from its corresponding
 * element in div in the first place.
 */
function sortDivElements(divToSort, objFromElementFunc, compareFunc) {
  if (compareFunc == currentSortFunc) {
    // if same sort button is clicked twice, switch sort order
    sortAscending = !sortAscending;
  } else {
    currentSortFunc = compareFunc;
  }
  $("#" + divToSort).children().sortElements(function (a, b) {
    var objectA = objFromElementFunc(a);
    var objectB = objFromElementFunc(b);
    return compareFunc(objectA, objectB);
  });
}

/**
 * Sorts an array of DOM elements by a passed in comparator function.
 * Used as foundation for onSortButtonClick.
 * Courtesy of James Padolsey https://j11y.io/javascript/sorting-elements-with-jquery/
 */
jQuery.fn.sortElements = (function(){
  var sort = [].sort;
  return function(comparator, getSortable) {
    getSortable = getSortable || function(){return this;};
    var placements = this.map(function(){
      var sortElement = getSortable.call(this),
        parentNode = sortElement.parentNode,
        // Since the element itself will change position, we have
        // to have some way of storing its original position in
        // the DOM. The easiest way is to have a 'flag' node:
        nextSibling = parentNode.insertBefore(
          document.createTextNode(''),
          sortElement.nextSibling
        );
      return function() {
        if (parentNode === this) {
          throw new Error(
            "You can't sort elements if any one is a descendant of another."
          );
        }
        // Insert before flag:
        parentNode.insertBefore(this, nextSibling);
        // Remove flag:
        parentNode.removeChild(nextSibling);
      };
    });
    return sort.call(this, comparator).each(function(i){
        placements[i].call(getSortable.call(this));
    });
  };
})();