var sampleDashData = {
  "status": 200,
  "CRMToken": "12345",
  "summary": [
    {
      "type": "Active Users",
      "data": [
        [
          "Day",
          "User Count"
        ],
        [
          "May 1",
          8
        ],
        [
          "May 2",
          9
        ],
        [
          "May 3",
          9
        ],
        [
          "May 4",
          10
        ],
        [
          "May 5",
          11
        ],
        [
          "May 6",
          10
        ]
      ]
    },
    {
      "type": "Revenue",
      "data": [
        [
          "Month",
          "Revenue"
        ],
        [
          "June",
          14
        ],
        [
          "July",
          12
        ],
        [
          "August",
          22
        ],
        [
          "September",
          21
        ],
        [
          "October",
          51
        ]
      ]
    }
  ],
  "apps": [
    {
      "name": "Education App",
      "appID": "0",
      "status": {
        "CRMID": 12345,
        "progress": 4
      },
      "icon": "assets/img/education.png",
      "touchPoint": {
        "done": false,
        "due_date": moment().add(7, "days").format("YYYY-MM-DD"), //So that the sample data never ages ;)
        "due_time": "16:00",
        "add_time": "2017-07-26 19:16:43",
        "subject": "Remind via email"
      }
    },
    {
      "name": "Fitness App",
      "appID": "4",
      "status": {
        "CRMID": 12345,
        "progress": 1
      },
      "icon": "assets/img/fitness.png",
    },
    {
      "name": "Productivity App",
      "appID": "5",
      "status": {
        "CRMID": 12345,
        "progress": 8
      },
      "icon": "assets/img/productivity.png",
    },
    {
      "name": "Health App",
      "appID": "1",
      "status": {
        "CRMID": 0,
        "progress": 9
      },
      "icon": "assets/img/health.png",
      "touchPoint": {
        "done": false,
        "due_date": moment().add(40, "days").format("YYYY-MM-DD"), //So that the sample data never ages ;)
        "due_time": "16:00",
        "add_time": "2017-07-26 19:16:43",
        "subject": "Check in with product team",
      }
    },
    {
      "name": "Social App",
      "appID": "2",
      "status": {
        "CRMID": 12345,
        "progress": 7
      },
      "icon": "assets/img/social.png"
    },
    {
      "name": "Savings App - Click Me!",
      "appID": "3",
      "status": {
        "CRMID": 0,
        "progress": 6
      },
      "icon": "assets/img/savings.png",
      "touchPoint": {
        "done": false,
        "due_date": moment().add(2, "days").format("YYYY-MM-DD"), //So that the sample data never ages ;)
        "due_time": "16:00",
        "add_time": "2017-07-26 19:16:43",
        "subject": "Help with integration",
      }
    }
    
  ]
};
var sampleCustomerData = {
  "status": 200,
  "CRMToken": "12345",
  "appData": {
    "name": "Savings App (Sample Customer Page)",
    "icon": "assets/img/savings.png",
    "status": {
      "progress": 6,
      "CRMID": 12345
    },
    "integration": {
      "secrets": [
        {
          "secretType": "Production",
          "active": false,
          "value": "1a2b3c4d5e"
        },
        {
          "secretType": "Development",
          "active": true,
          "value": "1a2b3c4d5e"
        }
      ],
      "versions": [
        {
          "name": "iOS version 1.1",
          "dateCreated": moment().subtract(27, "days").format(),
          "platform": "iOS",
          "reinforcedActions": [
            {
              "name": "open_app",
              "rewardFunctions": [
                "gif",
                "stars"
              ]
            },
            {
              "name": "friend_referral",
              "rewardFunctions": [
                "coins",
                "stars"
              ]
            },
            {
              "name": "task_completed",
              "rewardFunctions": [
                "coins"
              ]
            }
          ]
        },
        {
          "name": "iOS version 1.0",
          "dateCreated": moment().subtract(35, "days").format(),
          "platform": "iOS",
          "reinforcedActions": [
            {
              "name": "open_app",
              "rewardFunctions": [
                "gif"
              ]
            },
            {
              "name": "task_completed",
              "rewardFunctions": [
                "coins"
              ]
            }
          ]
        }
      ]
    },
    "stakeholders": [
      {
        "name": "John Smith",
        "email": "johnsmith@email.com",
        "id": "1",
        "iconURL": ""
      },
      {
        "name": "Jane Doe",
        "email": "janedoe@email.com",
        "id": "2",
        "iconURL": ""
      }
    ],
    "contract": {
      "type": "contract",
      "duration": 4,
      "startDate": moment().subtract(20, "days").format(),
      "value": "$20,000",
      "formula": "formula",
      "contractType": null
    },
    "history": [
      {
        "timestamp": "2017-08-08T19:27:51.083Z",
        "type": "customerLogin",
        "stakeholderID": "2"
      },
      {
        "timestamp": "2017-08-08T00:34:50.618Z",
        "type": "customerLogin",
        "stakeholderID": "2"
      },
      {
        "step": 6,
        "timestamp": "2017-07-27T21:59:02.317Z",
        "type": "integrationStep",
        "stakeholderID": "2"
      },
      {
        "timestamp": "2017-07-27T21:46:43.950Z",
        "type": "customerLogin",
        "stakeholderID": "2"
      },
      {
        "timestamp": "2017-07-27T19:56:40.677Z",
        "type": "customerLogin",
        "stakeholderID": "1"
      },
      {
        "step": 5,
        "timestamp": "2017-07-18T20:59:36.876Z",
        "type": "integrationStep",
        "stakeholderID": "1"
      },
      {
        "step": 4,
        "timestamp": "2017-07-18T20:59:36.876Z",
        "type": "integrationStep",
        "stakeholderID": "1"
      },
      {
        "step": 3,
        "timestamp": "2017-07-18T20:59:36.876Z",
        "type": "integrationStep",
        "stakeholderID": "2"
      },
      {
        "step": 2,
        "timestamp": "2017-07-18T20:59:36.876Z",
        "type": "integrationStep",
        "stakeholderID": "1"
      },
      {
        "step": 1,
        "timestamp": "2017-07-18T20:59:36.876Z",
        "type": "integrationStep",
        "stakeholderID": "1"
      }
    ],
    "analysis": {
      "engagementHeadline": 29,
      "engagementGraphData": [
        [
          "Day",
          "Control",
          "Active"
        ],
        [
          "May 1",
          1,
          1
        ],
        [
          "May 2",
          2,
          2
        ],
        [
          "May 3",
          3,
          3
        ],
        [
          "May 4",
          4,
          6
        ],
        [
          "May 5",
          5,
          10
        ],
        [
          "May 6",
          6,
          20
        ]
      ]
    },
    "touchPoint": {
        "done": false,
        "due_date": moment().add(2, "days").format("YYYY-MM-DD"), //So that the sample data never ages ;)
        "due_time": "16:00",
        "add_time": "2017-07-26 19:16:43",
        "subject": "Help with integration"
    }
  }
};