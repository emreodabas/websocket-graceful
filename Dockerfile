FROM node:lts-alpine
# make the 'app' folder the current working directory
WORKDIR /src
# copy both 'package.json' and 'package-lock.json' (if available)
COPY  ./ ./
# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .

USER nobody
# build app for production with minification
CMD ["npm", "run", "start" ]
EXPOSE 8085
 