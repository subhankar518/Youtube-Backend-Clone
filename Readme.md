# This is a Practice Project of Javascript based backend.
# Technology Used = Node.js, Express, MongoDb

# This is the Step By Step Guide and Important notes for remembering and for fature purpose

- At First "npm init" for setup of "package.json"

-------------------------------------

- For Git setup:
- 1. git init
- 2. git add .
- 3. git commit -m "message"

- crete a new repo in github

- 4. optional: if we want to change the name of master branch - git branch -M main
- 5. for seting remote origin(this we need to take from github): git remote add origin https://github.com/subhankar518/Youtube-Backend-Clone.git
- 6. for upstream and push for first time(remember what is your main branch name, it can be master or main or anything): git push -u origin main

-------------------------------------

# For installing and uninstalling dependencies command

# only for development environment
- npm i -D "Dependency Name"

# for uninstalling
- npm uninstall "Dependency Name"

-------------------------------------

- I will be using import statement for the entire project, that's why I have used 
"type": "module" in "package.json"

-------------------------------------

 For using experimental features we can use 
 "dev": `nodemon -r dotenv/config --experimental-json-modules src/index.js`
