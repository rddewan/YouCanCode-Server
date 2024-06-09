## File naming convention

-   kebab-case

### Commands To Install Packages

-   npm i express
-   npm i -D typescript
-   npm i -D @types/express
-   npm i -D @types/nodemon
-   npm i -D @types/ts-node
-   npm i --save-dev --save-exact prettier
-   node --eval "fs.writeFileSync('.prettierrc','{}\n')"
-   npm install -D eslint @eslint/js typescript typescript-eslint
-   npm i dotenv
-   npm i -D @types/node
-   npm i mongodb
-   npm i mongoose
-   npm i bcryptjs
-   npm i -D @types/bcryptjs
-   npm i nodemailer nodemailer-sendgrid ejs
-   npm i -D @types/nodemailer @types/nodemailer-sendgrid @types/ejs
-   npm i validator
-   npm i -D @types/validator
-   npm i jsonwebtoken
-   npm i -D @types/jsonwebtoken
-   npm install cookie-parser
-   npm i --save-dev @types/cookie-parser
-   npm i firebase-admin
-   npm i cors
-   npm i --save-dev @types/cors
-   npm install @aws-sdk/client-s3
-   npm i @aws-sdk/s3-request-presigner
-   npm i multer
-   npm i --save-dev @types/multer
-   npm i --include=optional sharp

### Setup and configure TypeScript

-   npx tsc --init

### Commands To Run Server

-   npm run build
-   npm run dev

### Useful command

-   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

curl --location --request POST 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
"email": "richard@gmail.com",
"password": "sdfdsd3425gtewtw4234324",
"returnSecureToken": true
}'

## Docker Command

-   `docker docker images`
-   `docker build -t youcancode:v0.0.1-Dev .`
-   `docker build --platform linux/amd64 -t youcancode:v0.0.1-Dev .`
-   `docker run -p 3000:3000 youcancode:v0.0.1-Dev`
-   `docker ps -a` - list all the containers
-   `docker ps` - list the currently running container
-   `docker login` - login to docker hub account
-   `docker tag youcancode:v0.0.1-Dev rddewan/youcancode:v0.0.1-Dev`
-   `docker push rddewan/youcancode:v0.0.1-Dev`
