Notes on interweave.network project.

 [X] Set up a GitHub repo for the frontend.
  [X] Create a new local folder.
  [X] Go there in command line.
  [X] git init
  [X] Add a basic index.html.
  [X] Add a basic .gitignore (ignore ~ files from gedit...)
  [X] git add --all
  [X] git commit -m "some initial message"
  [X] Create a new repository in GitHub.
   - interweave.network
  [X] Associate with my local:
   - git remote add origin git@github.com:NoahWarnke/interweave.network.git
  [X] Push
   - git push -u origin master
  [X] In GitHub, activate GitHub Pages in Repository Settings (set to master branch).
  [X] Check out new page: https://noahwarnke.github.io/interweave.network/
   - Sweet, it's there!
   
 [X] Learn how to interface with MetaMask.
   [X] Sign into ropsten Metamask account.
   [ ] Add code to connect via the web3 (not Web3) global object.
  
 [X] Register interweave.network via Google Domains ($20/yr..)
 [X] Set up serving the GitHub page.
 - Go to https://domains.google.com/registrar?hl=en-US#chp=z,d&z=a&d=28252530,interweave.network
 - Under "custom resource records" add @ type A to 185.199.108.153
 - Go to https://github.com/NoahWarnke/interweave.network/settings
 - Under "Github Pages" set up accordingly (source = master branch, custom domain = interweave.network)
 - Get info on IP that the domain name is now resolving to: dig interweave.network +noall +answer
    
