google.charts.load("current", {"packages":["corechart"]});
google.charts.setOnLoadCallback(loadCustomerPage);
//get appID from url to load customer data
window.appID = "12345"; //getParameterByName("appID");

/************************************************************************************
 * SECTION: LOAD DATA
 * Use methods from shared.js to load data for the customer page.
 */

/**
 * Requests customer data for the app ID found in the url and
 * uses it to construct the customer page.
 */
function loadCustomerPage() {
  /* Not used for sample version.
  //verify login
  if (login verification removed for sample) {
    alert("Please log in to view/edit customer pages.");
    window.location.assign('../');
  } else {   
    sendPayload("API_ENDPOINT", getBasePayload(), function (data) {
      window.customerData = data.appData;
      window.CRMToken = data.CRMToken;
      constructCustomerPage();
    });
  }
  */
  window.customerData = sampleCustomerData.appData;
  constructCustomerPage();
}
/************************************************************************************/


/************************************************************************************
 * SECTION: CONSTRUCT CUSTOMER PAGE
 * Methods for adding and editing DOM elements to construct the customer page
 * from loaded data.
 * Most of the functions here are pretty self-explanatory.
 */
 
function constructCustomerPage() {
  // customer name, icon initialized in constructStatusPage
  constructStatusPage(window.customerData, window.CRMToken);
  constructIntegrationPage(window.customerData.integration);
  constructStakeholdersPage(window.customerData.stakeholders);
  constructContractPage(window.customerData.contract);
  constructHistoryPage(window.customerData.history, window.customerData.stakeholders);
  constructAnalysisPage(window.customerData.analysis);
  
  //form text has been updated in modals, update modal displays
  Materialize.updateTextFields();
}

/**
 * Takes a string input and appends it to divName using DOM methods.
 * Used throughout for simple placement of loaded data into the DOM.
 */
function putContent(divName, content) {
  $(divName).append(document.createTextNode(content));
}

function constructStatusPage(customer, CRMToken) {
  if (customer.name === null || customer.name === undefined || customer.name === "") {
    customer.name = "Error - Name Missing";
  }
  putContent("#customerName", customer.name);
  if (customer.icon != "" && customer.icon != null) {
    $("#customerIcon").attr("src", customer.icon);
  }
  var step = customer.status.progress;
  var progressPercent = 100;
  if (step < 9) {
    progressPercent = (step/8) * 100;
  }
  putContent("#status-step", stepLabels[step]);
  $("#status-progress").css("width", progressPercent.toString() + "%");
  $("#status-progress").addClass(stepColors[step]);
  /* Disabled for sample
  if (customer.status.CRMID == 0) {
    putContent("#status-CRMID", "not set");
    putContent("#status-touchPoint", "CRM ID not set.");
    //if no CRM id, leave modal input blank to make entry easier
  } else {
    putContent("#status-CRMID", customer.status.CRMID.toString());
    loadAndConstructTouchPoint(CRMToken, customer, $("#status-touchPoint"));
    $("#status-CRMID-edit").val(customer.status.CRMID);
  }
  */
  // do this instead for sample
  putContent("#status-CRMID", customer.status.CRMID.toString());
  var dateStr = moment(customer.touchPoint.due_date, "YYYY-MM-DD").format("MMM D, YYYY");
  $("#status-touchPoint").text(customer.touchPoint.subject + " on " + dateStr);
  $("#status-CRMID-edit").val(customer.status.CRMID)
  //initialize delete customer button
  $("#status-delete").click(deleteCustomer);
  
  //initialize modal
  //get option element for current step and make it selected
  // use step-1 because step[0] is not a dropdown option
  $($("#status-progress-edit")[0].options[step-1]).prop("selected", true);
  $('select').material_select();
  $("#customerName-edit").val(customer.name);
  $("#customerIcon-edit").val(customer.icon);
  $("#status-submit").click(editStatus);
  $("#status-CRMID-submit").click(editCRMID);
}

function constructIntegrationPage(integration) {
  // See SECTION: ADDITIONAL CONSTRUCTION FOR INTEGRATION PAGE for more info.
  putContent("#integration-appID", window.appID.toString());
  constructSecretsSection(integration.secrets);
  constructVersionsList(integration.versions, integration.secrets);
}

function constructStakeholdersPage(stakeholders) {
  stakeholders.forEach(function (stakeholder) {
    var icon = $("<img>", {"class": "circle"});
    if (stakeholder.iconURL == null || stakeholder.iconURL == "") {
      icon.attr("src", "assets/img/brain.png");
    } else {
      icon.attr("src", stakeholder.iconURL);
    }
    var editButton = $("<a>", {"class": "secondary-content", "href": "#editStakeholderModal"});
    editButton.append($("<i>", {"class": "material-icons"}).text("mode_edit"));
    editButton.click(function() {
      selectStakeholder(stakeholder);
    });
    $("#stakeholders-list").append(
      $("<li>", {"class": "collection-item avatar"}).append(
        icon,
        $("<span>", {"class": "subtitle"}).text(stakeholder.name),
        $("<p>").text("Technical Stakeholder"),
        $("<p>").text(stakeholder.email),
        editButton
      )
    );
  });
  // need to initialize modal for editButton to work when clicked
  $('#editStakeholderModal').modal();
  
}

function constructContractPage(contract) {
  // Some customers don't have contract initialized yet.
  if (contract == null) return;
  putContent("#contract-type", contract.type);
  putContent("#contract-value", contract.value);
  putContent("#contract-formula", contract.formula);
  constructContractDateStuff(contract);
  
  //initialize edit modal
  $("#contract-type-edit").val(contract.type);
  $("#contract-duration-edit").val(contract.duration);
  $("#contract-value-edit").val(contract.value);
  $("#contract-formula-edit").val(contract.formula);
  //$("#contract-payment-edit").val("No payment stuff yet");
  $("#contract-submit").click(editContract);
}

function constructContractDateStuff(contract) {
  //warn user when less than this many days left in contract
  var WARNING_THRESHOLD = 30;
  var startDate = moment(contract.startDate);
  var endDate = moment(contract.startDate).add(contract.duration, "months");
  // D MMMM, YYYY matches format of modal date input field
  putContent("#contract-duration", contract.duration.toString() + " months");
  putContent("#contract-timeframe", startDate.format("D MMMM, YYYY") + " to " + endDate.format("D MMMM, YYYY"));
  $("#contract-startDate-edit").val(startDate.format("D MMMM, YYYY"));
  // initialize contract progress bar
  var nowUTC = moment().valueOf();
  var contractProgress = (nowUTC - startDate.valueOf()) / (endDate.valueOf() - startDate.valueOf()) * 100;
  $("#contract-progress").css("width", contractProgress.toString() + "%");
  
  var barColor = "green";
  if (moment().isAfter(endDate.subtract(WARNING_THRESHOLD, "days"))) {
    // note that the above call to subtract modifies endDate, but we don't use again.
    barColor = "red";
  }
  $("#contract-progress").addClass(barColor);
}

function constructHistoryPage(history) {
  if (history == undefined) return;
  // sort by date before anything else
  history.sort(compareHistoryItemsByTime);
  for (i = 0; i < history.length; i++) {
    var date = moment(history[i].timestamp);
    var person = getStakeholderFromHistoryItem(history[i]);
    var displayItemAs;
    switch(history[i].type) {
      case "customerLogin":
        displayItemAs = "Dashboard login";
        break;
      case "integrationStep":
        displayItemAs = stepLabels[history[i].step];
        break;
      default:
        displayItemAs = "Unknown event type: " + history[i].type;
    }
    $("#history-table").append(
      //give each item element an id that is the index of
      //its corresponding history item in the array.
      $("<tr>", {"id": i}).append(
        $("<td>").text(date.format("MMMM Do YYYY - h:mm a")),
        $("<td>").text(displayItemAs),
        $("<td>").text(person)
      )
    );
  }
  $("#sortHistory-name").click(function() {
    sortDivElements("history-table",
                    getHistoryItemFromElement,
                    compareHistoryItemsByStakeholder);
  });
  $("#sortHistory-time").click(function() {
    sortDivElements("history-table",
                    getHistoryItemFromElement,
                    compareHistoryItemsByTime);
  });
}

function constructAnalysisPage(analysis) {
  //TODO: do something with analysis.headline?
  drawChart(analysis.engagementGraphData, graphOptions, "analysis-engagementChart");
  //hide section *after* drawing graph
  $("#analysisDiv").addClass("hidden");
}
/************************************************************************************/


/************************************************************************************
 * SECTION: ADDITIONAL CONSTRUCTION FOR INTEGRATION PAGE
 * Moved out of construct customer page section for organization.
 */

/**
 * Adds information and action buttons for each secret to the integration page.
 */
function constructSecretsSection(secrets) {
  secrets.forEach(function (secret) {
    var toggleButton = $("<a>", {"class": "waves-effect waves-light btn", 
                                 "style": "margin-right: 4px;"});
    var secretAction;
    // if active, button should deactivate, vice versa
    if (secret.active) {
      toggleButton.addClass("red");
      secretAction = "Deactivate";
    } else {
      toggleButton.addClass("green");
      secretAction = "Activate";
    }
    toggleButton.text(secretAction);
    toggleButton.click(function() {
      editSecret(secret.secretType, secretAction);
    });
    
    var flushButton = $("<a>", {"class": "waves-effect waves-light btn blue",
                                "style": "margin-right: 4px;"});
    flushButton.text("Flush");
    flushButton.click(function() {
      editSecret(secret.secretType, "Flush");
    });
    
    $("#integration-secrets").append(
      $("<div>", {"class": "section"}).append(
        $("<span>", {"class": "subtitle"}).text(secret.secretType + " Secret: " + secret.value),
        $("</br>"),
        toggleButton,
        flushButton
      )
    );
  });
}

/**
 * Adds information about each version, as well as config buttons
 * and code snippet buttons, to the integration page.
 */
function constructVersionsList(versions, secrets) {
  //sort versions by date, most recent first
  versions.sort(function(a,b) {
    return moment(b.dateCreated).valueOf() - moment(a.dateCreated).valueOf();
  });
  versions.forEach(function (version) {
    var dateCreated = moment(version.dateCreated).format("MMM D, YYYY");
    // create version collapsible element and add content to it
    var versionCollapsible = $("<ul>", {"class":"collapsible","data-collapsible":"expandable"});
    var configButton = constructConfigButton(version, secrets);
    version.reinforcedActions.forEach(function (action) {
      // create list element for the action
      var actionBody = $("<div>", {"class":"collapsible-body"});
      action.rewardFunctions.forEach(function (reward) {
        actionBody.append(
          $("<span>").text(reward).append($("</br>"))
        );
      });
      // create code snippet button for the action
      var snippetButton = $("<a>", {"class": "waves-effect waves-light btn brown lighten-1 snippet-btn",
                                    "style":"float: right; margin-top: 4px;"});
      snippetButton.text("Snippet").append(
        $("<i>", {"class":"material-icons left"}).text("content_paste")
      );
      var snippetButton = constructSnippetButton(version.platform, action);
      // append the new action element to the version element
      versionCollapsible.append(
        $("<li>").append(
          $("<div>", {"class":"collapsible-header"}).text(action.name).append(
            $("<i>", {"class":"material-icons"}).text("arrow_drop_down"),
            snippetButton
          ),
          actionBody
        )
      );
    });
    // add version collapsible to DOM
    $("#integration-version").append(
      $("<div>", {"class": "card-panel brown lighten-5"}).append(
        $("<span>", {"class": "subtitle"}).text(version.name),
        configButton,
        /* TODO: Delete version functionality goes here
        $("<a>", {"class":"btn red waves-effect", "style":"float:right;"})
          .text("delete")
          .click(function () {
            deleteVersion();// something to identify version
          }),
        */
        $("</br>"),
        $("<span>").text("Created on " + dateCreated + " for " + version.platform).append($("</br>")),
        $("<span>", {"class": "subtitle"}).text("Actions: "),
        versionCollapsible
      )
    );
  });
  
  //initialize new collapsibles
  $('.collapsible').collapsible();
  // prevent copy code snippet buttons from triggering collapsible collapsing
  $(".snippet-btn").on("click", function(e) { e.stopPropagation(); });
  //initialize add version modal
  $("#addVersion-addAction").click(function() {
    addAction(true); // when adding new action, make isRemovable true
  });
  // add one un-removable action to start
  addAction(false);
  $("#addVersion-submit").click(submitVersion);
}

/**
 * Takes in a version and a list of secrets and returns a button element
 * that, when clicked, downloads a platform-specific config for the version.
 */
function constructConfigButton(version, secrets) {
  // create button element
  var configButton = $("<a>", {"class":"btn waves-effect waves-light brown lighten-1",
                               "style":"float:right;"});
  configButton.text("Config").append(
    $("<i>", {"class":"material-icons left"}).text("file_download")
  );
  
  // Proprietary information removed for sample version.
  configButton.click(function() {
    Materialize.toast("Download disabled for sample version.", 4000);
  });
  
  return configButton;
}

/**
 * Takes in a platform string and an action object and returns a button element
 * that, when clicked, copies to the clipboard a platform-specific code snippet
 * for the action.
 */
function constructSnippetButton(platform, action) {
  // \r\n used throughout instead of \n for maximum compatibility
  var snippet;
  switch (platform) {
    case "iOS":
      snippet = "Proprietary code snippets removed for sample version."
      break;
    case "Android":
      snippet = "Proprietary code snippets removed for sample version."
      break;
    case "Web":
      snippet = "Proprietary code snippets removed for sample version."
      break;
      
    default:
      console.log("Error constructing copy snippet button: unknown platform " + platform);
      break;
  }
  var snippetButton = $("<a>", {"class": "waves-effect waves-light btn brown lighten-1 snippet-btn",
                                "style":"float: right; margin-top: 4px;"});
  snippetButton.text("Snippet").append(
    $("<i>", {"class":"material-icons left"}).text("content_paste")
  );
  snippetButton.click(function() {
    Materialize.toast("Copied code snippet for action " + action.name, 3000);
  });
  // initialize copy to clipboard functionality for the button
  new Clipboard($(snippetButton)[0], {
    text: function(trigger) {return snippet;}
  });
  return snippetButton;
}
/************************************************************************************/


/************************************************************************************
 * SECTION: ADD VERSION FUNCTIONALITY
 * Contains functions for the action-reinforcement mapping interface
 * present in the add version modal.
 */

 /**
  * Adds form inputs for an action and a list of rewards to the
  * add version modal. isRemovable specifies whether a button will
  * be created with functionality to delete the action input from the DOM.
  */
function addAction(isRemovable) {
  var actionElement = $("<ul>", {"class":"collection with-header"});
  var removeButton = null;
  if (isRemovable) {
    removeButton = $("<a>", {"class":"btn waves-effect waves-light red",
                             "style":"margin-right: 4px;"});
    removeButton.text("Remove Action").click(function() {
      actionElement.remove();
    });
  }
  $("#addVersion-actions").append(
    actionElement.append(
      $("<li>", {"class":"collection-header"}).append(
        $("<span>", {"class":"subtitle"}).text("Action: "),
        $("<div>", {"class":"input-field inline"}).append(
          $("<input>", {"type":"text"})
        )
      ),
      $("<li>", {"class":"collection-item"}).append(
        $("<a>", {"class":"btn waves-effect waves-light blue", "style":"margin-right: 4px;"})
          .text("Add Reward")
          .click(function() {
            // any rewards added to the action will be removable
            addReward(actionElement, true);
          }),
        removeButton
      )
    )
  );
  // add one mandatory un-removable reward to start with
  addReward(actionElement, false);
}

/**
 * Adds an additional input field for a reward to a
 * passed in action input element. isRemovable specifies
 * whether a button will be created with functionality to
 * delete the reward input from the action.
 */
function addReward(actionElement, isRemovable) {
  var rewardElement = $("<li>", {"class":"collection-item"});
  var removeButton = null;
  if (isRemovable) {
    removeButton = $("<a>", {"class":"btn waves-effect waves-light red",
                    "style":"margin-top:8px; float:right;"}).text("Remove");
    removeButton.click(function() {
      rewardElement.remove();
    });
  }
  // last child of the unordered list is an li with some buttons,
  // insert the new reward input before that
  actionElement.children().last().before(
    rewardElement.append(
      $("<div>", {"class":"row", "style":"margin-bottom:0px;"}).append(
        $("<div>", {"class":"col s8"}).append(
          $("<input>", {"placeholder":"Reward", "type":"text"})
        ),
        $("<div>", {"class":"col s4"}).append(
          removeButton
        )
      )
    )
  );
}

/**
 * Triggered by the submit button on the add version modal.
 * Crawls through the DOM tree of the add version modal to
 * find all the inputs for actions and rewards, compiling their
 * values into an action-reward mapping object that is sent to the database.
 */
function submitVersion() {
  var payload = getBasePayload();
  payload.name = $("#addVersion-name").val().trim();
  if (payload.name == "") {
    Materialize.toast("Whoops! Give this version a name before submitting it.", 5000);
    return;
  }
  // check if this version name is taken
  var existingVersions = window.customerData.integration.versions;
  var foundVersion = existingVersions.find(function(version) {
    return payload.name === version.name;
  });
  if (foundVersion !== undefined) {
    Materialize.toast("Whoops! This version name is already in use. Please give this version a new unique name.", 6000);
    return;
  }
  payload.platform = $("#addVersion-platform").val();
  payload.dateCreated = moment().valueOf(); // current time
  var reinforcedActions = [];
  // for each action input element, validate the input
  var actionsAreValid = true;
  $("#addVersion-actions").find("ul").each(function() {
    var action = {};
    action.rewardFunctions = [];
    var rewardIsMissing = false;
    // for each reward input of this action element
    $(this).find(".collection-item").find("input").each(function() {
      var rewardName = $(this).val().trim();
      if (rewardName == "") {
        rewardIsMissing = true;
        return false; // stops execution of forEach reward
      }
      action.rewardFunctions.push(rewardName);
    });
    // check if any fields are missing
    action.name = $(this).find(".collection-header").find("input").val().trim();
    if (action.name == "" || rewardIsMissing) {
      actionsAreValid = false;
      Materialize.toast("Whoops! All actions and rewards must have an ID before you can submit the version.", 5000);
      return false; // stops execution of forEach action
    }
    // next, check for duplicate rewards
    if (hasDupes(action.rewardFunctions)) {
      Materialize.toast("Whoops! One of the actions has rewards with the same name. Give them different IDs before submitting.", 6000);
      actionsAreValid = false;
      return false; // stops execution of forEach action
    }
    // action is valid, add it to the list and continue
    reinforcedActions.push(action);
  });
  if (actionsAreValid) {
    // actions look good, last thing to do is make sure none
    // of them have duplicate names
    var actionNames = reinforcedActions.map(function(action) {return action.name;});
    if (hasDupes(actionNames)) {
      Materialize.toast("Whoops! One or more actions have the same ID. Give them different IDs before submitting.", 6000);
      return false;
    }
    // no problems, submit the version
    payload.reinforcedActions = JSON.stringify(reinforcedActions);
    sendPayload("API_ENDPOINT", payload, onSuccessfulEdit);
  }
}

/**
 * Simple, hacky function to check if an array has duplicate elements.
 * Probably not very efficient, but won't be used on big things.
 */
function hasDupes(arr) {
  var uniqueElems = new Set(arr);
  return arr.length != uniqueElems.size;
}

/************************************************************************************/


/************************************************************************************
 * SECTION: EDIT CUSTOMER DATA
 * Contains functions to be used to get input from forms in the DOM,
 * validate the input, and send post requests to edit data in the server
 * based on the input.
 */

/**
 * Triggered when user clicks submit button for edit status modal.
 * Gets values of input fields and updates status section + name/icon.
 */
function editStatus() {
  var payload = getBasePayload();
  payload.name =  $("#customerName-edit").val().trim();
  if (payload.name == "") {
    Materialize.toast("Please enter a customer name.", 3000);
    return;
  }
  payload.iconURL = $("#customerIcon-edit").val().trim();
  payload.newStatus = $("#status-progress-edit").val();
  sendPayload("API_ENDPOINT", payload, onSuccessfulEdit);
}

/**
 * Triggered when user clicks submit button for edit CRM ID modal.
 * Gets input field values from the edit CRM ID modal and 
 * sends a post request to change the CRM ID.
 */
function editCRMID() {
  var payload = getBasePayload();
  payload.CRMID = $("#status-CRMID-edit").val().trim();
  if (payload.CRMID == "") {
    payload.CRMID = "0";
  }
  sendPayload("API_ENDPOINT", payload, onSuccessfulEdit);
}

/**
 * Triple-confirms that you want to delete the customer, then does so.
 * Currently disabled.
 */
function deleteCustomer() {
  var payload = getBasePayload();
  if (confirm("Are you sure you want to delete this customer?")) {
    if (confirm("No, like really sure. This will remove " + window.customerData.name + " records from the database.")) {
      var response = prompt("Alright, you seem pretty determined. Type 'delete' to remove the customer permanently.");
      if (response === "delete") {
        sendPayload("API_ENDPOINT", payload, function(data) {
          window.location.assign(".");
        });
      }
    }
  }
}

/**
 * Confirms that you want to do whatever you're about to do to
 * the secret of the given type, then sends a post request to do it.
 *
 * Accepts:
 * secretType - which secret to modify, ex. "Production", "Development"
 * secretAction - how to modify this secret, ex. "Activate", "Flush"
 */
function editSecret(secretType, secretAction) {
  var payload = getBasePayload();
  payload.secretType = secretType;
  payload.secretAction = secretAction;
  var confirmed = false;
  if (confirm("Are you sure you want to " + secretAction.toLowerCase() + " this secret?")) {
    if (secretAction == "Flush") {
      var response = prompt("If you're really sure, enter \"flush\" and the secret will be flushed.");
      if (response == "flush") {
        confirmed = true;
      }
    } else {
      confirmed = true;
    }
  }
  if (confirmed) {
    sendPayload("API_ENDPOINT", payload, onSuccessfulEdit);
  }
}

/**
 * Triggered when user clicks edit button for a stakeholder,
 * accepts a stakeholder object and updates modal and modal submit
 * button handler accordingly.
 */
function selectStakeholder(stakeholder) {
  $("#editStakeholder-name").val(stakeholder.name);
  $("#editStakeholder-email").val(stakeholder.email);
  $("#editStakeholder-icon").val(stakeholder.iconURL);
  // get rid of existing click handlers on modal submit button
  $("#editStakeholder-submit").unbind("click");
  $("#editStakeholder-submit").click(function() {
    editStakeholder(stakeholder.id);
  });
  // update form labels so they don't overlap with the new text
  Materialize.updateTextFields();
}

/**
 * Triggered when user clicks submit button on edit stakeholder modal.
 * The submit button will send a different stakeholderID as a parameter
 * depending on the last call to selectStakeholder.
 */
function editStakeholder(stakeholderID) {
  var payload = getBasePayload();
  payload.name = $("#editStakeholder-name").val().trim();
  if (payload.name == "") {
    Materialize.toast("Please enter a stakeholder name.", 3000);
    return;
  }
  payload.email = $("#editStakeholder-email").val().trim();
  if (payload.email == "") {
    Materialize.toast("Please enter an email.", 3000);
    return;
  }
  payload.iconURL = $("#editStakeholder-icon").val().trim();
  payload.stakeholderID = stakeholderID;
  sendPayload("API_ENDPOINT", payload, onSuccessfulEdit);
}

/**
 * Triggered when user clicks submit button for edit contract modal.
 * Gets values of input fields, validates them, and updates contract.
 */
function editContract() {
  var payload = getBasePayload();
  payload.type = $("#contract-type-edit").val().trim();
  var startDate = moment($("#contract-startDate-edit").val(), "D MMMM, YYYY");
  if (isNaN(startDate.valueOf())) {
    alert("Contract start date invalid. Please select a new date and try again.");
    return;
  }
  payload.startDate = startDate.valueOf();
  payload.duration = $("#contract-duration-edit").val().trim();
  payload.value = $("#contract-value-edit").val().trim();
  payload.formula = $("#contract-formula-edit").val().trim();
  sendPayload("API_ENDPOINT", payload, onSuccessfulEdit);
}
/************************************************************************************/


/************************************************************************************
 * SECTION: MISCELLANEOUS
 */
 
//Initialize cosmetic javascript on document ready
$(document).ready(function(){
  //materialize functions to initialize visual elements
  $('.modal').modal();
  $('select').material_select();
  $(".button-collapse").sideNav();
  
  //set up sidenav tab switching system
  $(".sectionBtn").click(function() {
    //hide all divs, then unhide selected one
    $(".customerSection").each(function() {
      $(this).addClass("hidden");
    });
    $(".sectionBtn").each(function() {
      $(this).removeClass("active");
    });
    $(this).addClass("active");
    $('#'+$(this).attr('id') +'Div').removeClass("hidden");
  });

  //set up contract date picker
  $('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 15, // Creates a dropdown of 15 years to control year,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    closeOnSelect: false // Close upon selecting a date
  });
});

/**
 * Parses a url query string for a parameter with name and returns it.
 */
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Takes in a customer history item object and checks its stakeholderID
 * against those in the stakeholder list, which we've stored globally,
 * returning the name of the matching stakeholder if it finds one.
 */
function getStakeholderFromHistoryItem(historyItem) {
  var person = window.customerData.stakeholders.find(function (stakeholder) {
    return stakeholder.id == historyItem.stakeholderID;
  });
  return person == undefined ? "Unknown" : person.name;
}
/************************************************************************************/
