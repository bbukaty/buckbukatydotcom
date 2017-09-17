google.charts.load("current", {"packages":["corechart"]});
google.charts.setOnLoadCallback(loadDash);

//Initialize cosmetic javascript on document ready
$(document).ready(function(){
    $('.modal').modal();
    $('select').material_select();
    
    // display sort button feature discovery prompt after a delay
    setTimeout(function() {
      $('.tap-target').tapTarget('open');
      $(".tap-target-origin").click(function() {
        $('.fixed-action-btn').openFAB();
      });
    }, 9000);
  });

/************************************************************************************
 * SECTION: LOAD DATA
 * Use methods from shared.js to load dashboard data.
 * These call methods to construct the dashboard in the DOM once done loading.
 */
 
/**
 * Requests a list of customer objects and stores it in window.dashData,
 * calls constructDash which uses the list to construct the dashboard.
 */
function loadDash() {
  // disabled for sample
  /*
  if (login verification removed for sample version) {
    alert("Please log in to view/edit customer pages.");
    window.location.assign('../');
  }
  var payload = {
    removed for sample version
  };
  sendPayload("API_ENDPOINT", payload, function (data) {
    data.apps.sort(compareCustomersByStatus);
    window.dashData = data;
    constructDash();
    loadTouchPoints();
  });
  */
  window.dashData = sampleDashData; // from sampleData.js
  window.dashData.apps.sort(compareCustomersByName);
  constructDash();
  loadTouchPoints();
}

/**
 * Makes a request to the CRM API for each customer and loads the next
 * touchpoint into their corresponding card.
 */
function loadTouchPoints() {
  window.dashData.apps.forEach(function (customer) {
    //each card already has an empty touchpoint element constructed, find it
    var touchPointElement = $("#" + customer.appID + "-touchPoint");
    /*
    if (customer.status.CRMID == 0) {
      touchPointElement.text("CRM ID not set");
      touchPointElement.css("color", "red");
    } else {
      loadAndConstructTouchPoint(window.dashData.CRMToken,
                                customer, touchPointElement);
    }
    */
    // For sample version, some sample touchpoint data is already stored,
    // so we just use that instead of loadAndConstructTouchpoint.
    if (customer.touchPoint !== undefined) {
      var dateStr = moment(customer.touchPoint.due_date, "YYYY-MM-DD").format("MMM D, YYYY");
      touchPointElement.text(customer.touchPoint.subject + " on " + dateStr);
      touchPointElement.attr("href", "javascript:void(0);"); //so that the cursor goes to pointer on hover
      touchPointElement.click(function() {
        Materialize.toast("Normally this links to our CRM service; disabled for sample version.", 5000);
      });
    }
  });
}

/************************************************************************************/


/************************************************************************************
 * SECTION: CONSTRUCT DASHBOARD
 * Methods for adding and editing DOM elements to construct the dashboard
 * from loaded data.
 */

/**
 * Uses loaded data to construct a card for each custoemr and KPI and
 * initializes card sorting system.
 */
function constructDash() {
  window.dashData.summary.forEach(createKPICard);
  window.dashData.apps.forEach(createCustomerCard);
  //intialize new tabs for active cards
  $('ul.tabs').tabs();
  initializeSearchBar();
  //initialize sort buttons with onSortButtonClick call
  $("#sortBtn-name").click(function() {
    sortDivElements("customerCardsDiv", getCustomerFromElement, compareCustomersByName);
  });
  $("#sortBtn-status").click(function() {
    sortDivElements("customerCardsDiv", getCustomerFromElement, compareCustomersByStatus);
  });
  $("#sortBtn-touchPoint").click(function() {
    sortDivElements("customerCardsDiv", getCustomerFromElement, compareCustomersByTouchpoint);
  });
  //initialize add customer submit button
  $("#addCustomer-submit").click(addCustomer);
}

/**
 * Constructs a large blank card, then adds a graph for the passed in KPI object.
 */
function createKPICard(KPI) {
  var card = constructBlankCard("s12 m6 l6", KPI.type);
  card.children().first().append(
    $("<div>", {"class": "card-content", "style": "padding: 0px"}).append(
      $("<div>", {"id": KPI.type + "-div", "style": "height: 200px"})
    )
  );
  $("#KPICardsDiv").append(card);
  drawChart(KPI.data, graphOptions, KPI.type + "-div");
}

/**
 * Constructs either an integrating or active card depending on
 * the integration status of the customer.
 */
function createCustomerCard(customer) {
  if (customer.name === null || customer.name === undefined || customer.name === "") {
    customer.name = "Error - Name Missing";
  }
  if (customer.status.progress < 9) {
    constructIntegratingCard(customer);
  } else {
    constructActiveCard(customer);
    //appID used for tab element ids
    //drawChart(tempData, optionsCard, customer.appID.toString() + "-tab2");
  }
}

/**
 * Constructs a grid column and a card with a title and icon,
 * then appends the new card to contentDiv. Returns the innermost
 * HTML element created so that you can call append to add content
 * inside the new card.
 */
function constructBlankCard(width, title, id, href, img) {
  var imgElement = null;
  if (img != "" && img != null) {
    imgElement = $("<img>", {"class": "card-icon"});
    imgElement.attr("src", img);
  }
  var card = $("<div>", {"class": "col " + width, "id": id}).append(
    $("<div>", {"class": "card small white"}).append(
      $("<div>", {"class": "card-content card-title-section"}).append(
        $("<span>", {"class": "title"}).append(
          imgElement,
          $("<a>", {"href": href}).text(title)
        ),
        $("<div>", {"class": "divider"})
      )
    )
  )
  return card;
}

/**
 * Constructs a card using constructBlankCard, then adds card content
 * for an integrating customer.
 */
function constructIntegratingCard(customer) {
  var step = customer.status.progress;
  var userPageLink = "customer.html?appID=12345"; //+ customer.appID.toString();
  var card = constructBlankCard("s12 m6 l4", customer.name, customer.appID,
                    userPageLink, customer.icon);
  // Get to the inside div of the card
  card.children().first().append(
    $("<div>", {"class": "card-content"}).append(
      $("<span>", {"class": "subtitle"}).text(stepLabels[step]),
      $("<div>", {"class": "progress grey lighten-2"}).append(
        $("<div>", {"class": "determinate " + stepColors[step],
                    "style": "width: "+ ((step/8) * 100).toString() + "%"}
        )
      )
    ),
    $("<div>", {"class": "card-action"}).append(
      //make an empty link, only populated with text if CRMID exists
      $("<a>", {"target":"_blank", "id": customer.appID + "-touchPoint"})
    )
  );
  $("#customerCardsDiv").append(card);
}

/**
 * Constructs a card using constructBlankCard, then adds card content
 * for an active customer. Tab system currently inactive until we get stuff
 * to put there.
 */
function constructActiveCard(customer) {
  // use appID for tab element ids
  var tabPrefix = customer.appID.toString();
  var userPageLink = "customer.html?appID=12345"; // + customer.appID.toString();
  var card = constructBlankCard("s12 m6 l4", customer.name, customer.appID,
                      userPageLink, customer.icon);
  card.children().first().append(
    $("<div>", {"class": "card-content", "style": "padding: 0px"}).append(
      $("<div>", {"id": tabPrefix + "-tab1", "style": "padding: 12px 24px"}).append(
        $("<span>", {"class": "subtitle"}).text(stepLabels[customer.status.progress]),
        $("<div>", {"class": "row"}).append(
          $("<div>", {"class": "col s6"}).append(
            $("<div>", {"class": "card-panel stat-panel blue lighten-4"}).append(
              $("<p>", {"class": "kpi center-align title"}).text("24"),
              $("<p>", {"class": "center-align"}).text("% Current")
            )
          ),
          $("<div>", {"class": "col s6"}).append(
            $("<div>", {"class": "card-panel stat-panel blue lighten-4"}).append(
              $("<p>", {"class": "kpi center-align title"}).text("42"),
              $("<p>", {"class": "center-align"}).text("% Cumulative")
            )
          )
        )
        //$("<p>", {"class": "subtitle center-align"}).text("5800P Total Users D+")
      )/*,
      $("<div>", {"id": tabPrefix + "-tab2", "style": "height: 257px"}),
      $("<div>", {"id": tabPrefix + "-tab3", "style": "padding: 24px"})
      */
    ),
    $("<div>", {"class": "card-action"}).append(
      //make an empty link, only populated with text if CRMID exists
      $("<a>", {"target":"_blank", "id": customer.appID + "-touchPoint"})
    )
    /*card-action-tabs"}).append(
      $("<div>", {"class": "card-tabs"}).append(
        $("<ul>", {"class": "tabs tabs-fixed-width"}).append(
          $("<li>", {"class": "tab"}).append(
            $("<a>", {"class": "active", "href": "#" + tabPrefix + "-tab1"}).text("Overview")
          ),
          $("<li>", {"class": "tab"}).append(
            $("<a>", {"href": "#" + tabPrefix + "-tab2"}).text("Chart")
          ),
          $("<li>", {"class": "tab"}).append(
            $("<a>", {"href": "#" + tabPrefix + "-tab3"}).text("TBD")
          )
        )
      )
    )
    */
  );
  $("#customerCardsDiv").append(card);
}

/**
 * Gets customer info from window.dashData and plugs it into
 * the page's materialize autocomplete search bar.
 */
function initializeSearchBar() {
  var autocompleteParams = {};
  autocompleteParams.limit = 6;
  autocompleteParams.data = {};
  window.dashData.apps.forEach(function (customer) {
    autocompleteParams.data[customer.name + " - appID #" + customer.appID] = null;
  });
  autocompleteParams.onAutocomplete = function(val) {
    // Callback function when value is autcompleted.
    var appID = val.split("#").splice(-1)[0];
    window.location.assign("customer.html?appID=" + appID);
  };
  $("#searchBar").autocomplete(autocompleteParams).prop("disabled", false);
}

/************************************************************************************/


/************************************************************************************
 * SECTION: ADD CUSTOMER
 * 
 */

function addCustomer() {
  var payload = getBasePayload();
  payload.name = $("#addCustomer-name").val().trim();
  if (payload.name == "") {
    Materialize.toast("Please enter an app name.", 3000);
    return;
  }
  var stakeholder = {};
  stakeholder.name = $("#addCustomer-stakeholder").val().trim();
  stakeholder.email = $("#addCustomer-email").val().trim();
  payload.stakeholder = JSON.stringify(stakeholder);
  payload.vertical = $("#addCustomer-vertical").val();
  payload.product = $("#addCustomer-product").val();
  sendPayload("API_ENDPOINT", payload, function(data) {
    // redirect to newly created customer page
    // but don't, actually, for the sample version ;)
    //window.location.assign("customer.html?appID=" + data.appID);
  });
}
  