# set the base image to create the docker image
FROM node:22-alpine as development

# create a user with permissions to run the app
# -S -> create a system user
# -G -> add the user to a group
# This is done to avoid running the app as root
# If the app is run as root, any vulnerability in the app can be exploited to gain access to the host system
# It's a good practice to run the app as a non-root user

# Step 1: Create the 'docker' group
RUN addgroup docker

# Step 2: Create the 'youcancode' user and Add user 'youcancode' to the 'docker' group
RUN adduser -S -G docker youcancode

# set the user to run the app
USER youcancode

# ARG: This instruction is used to define a build-time variable in Docker. 
# In this case, it defines a variable named NODE_ENV.
# NODE_ENV=development: This sets a default value for the NODE_ENV variable. 
# If no value is provided during the build process, it defaults to development.
ARG NODE_ENV=development

# ENV: This instruction is used to set environment variables in the Docker container.
# NODE_ENV=${NODE_ENV}: This sets the NODE_ENV environment variable in the container to the value of the NODE_ENV build-time variable defined earlier. 
# This ensures that the value of NODE_ENV used during the build process is carried over to the running container.
ENV NODE_ENV=${NODE_ENV}

# set the working directory to /usr/src/app
WORKDIR /usr/src/app

# copy package.json and package-lock.json to the working directory
# This is done before copying the rest of the files to take advantage of Docker’s cache
# If the package.json and package-lock.json files haven’t changed, Docker will use the cached dependencies
COPY package*.json .

# sometimes the ownership of the files in the working directory is changed to root
# and thus the app can't access the files and throws an error -> EACCES: permission denied
# to avoid this, change the ownership of the files to the root user
USER root

# change the ownership of the /usr/src/app directory to the youcancode user
# chown -R <user>:<group> <directory>
# chown is the command used to change the ownership of files and directories.
# -R specifies that the ownership change should be applied recursively to all files and directories within the current directory (.).
# youcancode:docker specifies the user and group you want to change the ownership to. Here, youcancode is the user, and docker is the group.
RUN chown -R youcancode:docker .

# change the user back to the app user
USER youcancode

# install dependencies
RUN npm install

# copy the rest of the files to the working directory
COPY . .

# expose port 3000 to tell Docker that the container listens on the specified network ports at runtime
EXPOSE 3000

# compile the typescript code
RUN npm run build

# command to run the app
# using JSON array syntax (CMD [ "npm", "run", "dev" ]) can be more efficient and secure 
# because it avoids potential issues with shell interpretation. 
# If you need shell features or want to take advantage of environment variable expansion, 
# you can use the form without JSON array syntax (CMD npm run dev).
CMD ["npm", "run", "dev"]

# set the base image to create the docker image
FROM node:22-alpine as production

# create a user with permissions to run the app
# -S -> create a system user
# -G -> add the user to a group
# This is done to avoid running the app as root
# If the app is run as root, any vulnerability in the app can be exploited to gain access to the host system
# It's a good practice to run the app as a non-root user

# Step 1: Create the 'docker' group
RUN addgroup docker

# Step 2: Create the 'youcancode' user and Add user 'youcancode' to the 'docker' group
RUN adduser -S -G docker youcancode

# set the user to run the app
USER youcancode

# ARG: This instruction is used to define a build-time variable in Docker. 
# In this case, it defines a variable named NODE_ENV.
# NODE_ENV=development: This sets a default value for the NODE_ENV variable. 
# If no value is provided during the build process, it defaults to development.
ARG NODE_ENV=production

# ENV: This instruction is used to set environment variables in the Docker container.
# NODE_ENV=${NODE_ENV}: This sets the NODE_ENV environment variable in the container to the value of the NODE_ENV build-time variable defined earlier. 
# This ensures that the value of NODE_ENV used during the build process is carried over to the running container.
ENV NODE_ENV=${NODE_ENV}

# set the working directory to /usr/src/app
WORKDIR /usr/src/app

# copy package.json and package-lock.json to the working directory
# This is done before copying the rest of the files to take advantage of Docker’s cache
# If the package.json and package-lock.json files haven’t changed, Docker will use the cached dependencies
COPY package*.json .

# sometimes the ownership of the files in the working directory is changed to root
# and thus the app can't access the files and throws an error -> EACCES: permission denied
# to avoid this, change the ownership of the files to the root user
USER root

# change the ownership of the /usr/src/app directory to the youcancode user
# chown -R <user>:<group> <directory>
# chown is the command used to change the ownership of files and directories.
# -R specifies that the ownership change should be applied recursively to all files and directories within the current directory (.).
# youcancode:docker specifies the user and group you want to change the ownership to. Here, youcancode is the user, and docker is the group.
RUN chown -R youcancode:docker .

# change the user back to the app user
USER youcancode

# install dependencies
RUN npm install --only=production

# copy the .env.production file to the working directory
COPY .env.production .

# copy the public directory to the working directory
COPY public ./public

# copy the dist directory from the build stage development to the working directory ./dist
COPY --from=development /usr/src/app/dist ./dist

# expose port 3000 to tell Docker that the container listens on the specified network ports at runtime
EXPOSE 2000

# command to run the app
# using JSON array syntax (CMD [ "npm", "run", "dev" ]) can be more efficient and secure 
# because it avoids potential issues with shell interpretation. 
# If you need shell features or want to take advantage of environment variable expansion, 
# you can use the form without JSON array syntax (CMD npm run dev).
CMD ["node", "dist/server.js"]
