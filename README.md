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

There's a predeploy hook to run `hugo` that will run automatically when you do this. See [firebase.json](./firebase.json).