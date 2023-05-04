## Buck Bukaty Personal Website

### Prerequisites:
- Firebase CLI Tools (requires Node)
- Hugo

Test changes locally with 
```
hugo serve
```

To deploy changes to the web, run
```
firebase deploy
```

or for a preview channel, run
```
firebase hosting:channel:deploy preview-channel
```

There's a predeploy hook to run `hugo` that will run automatically when you do this. See [firebase.json](./firebase.json).

Update: that predeploy hook now also runs the setup script for kanji-morph. This infrastructure is getting a bit fragile, but it works for now.